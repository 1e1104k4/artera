import {
	convertToModelMessages,
	createUIMessageStream,
	experimental_createMCPClient,
	JsonToSseTransformStream,
	smoothStream,
	stepCountIs,
	streamText,
} from 'ai';
import { auth } from '@/app/(auth)/auth';
import { getChatById, getMessagesByChatId, saveChat, saveMessages, getCollectionById, saveCollectionJson } from '@/lib/db/queries';
import { convertToUIMessages, generateUUID } from '@/lib/utils';
import { DEFAULT_CHAT_MODEL } from '@/lib/ai/models';
import { openai } from '@ai-sdk/openai';
import type { ChatMessage } from '@/lib/types';
import { postRequestBodySchema, type PostRequestBody } from '@/app/(chat)/api/chat/schema';
import { ChatSDKError } from '@/lib/errors';
import { generateTitleFromUserMessage } from '@/app/(chat)/actions';

export const maxDuration = 60;

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
	let requestBody: PostRequestBody;
	try {
		const json = await request.json();
		requestBody = postRequestBodySchema.parse(json);
	} catch (_) {
		console.error('collections/[id] bad_request:api', _);
		return new ChatSDKError('bad_request:api').toResponse();
	}

	try {
		const { id, message, selectedChatModel, selectedVisibilityType } = requestBody;
		const { id: collectionId } = await params;

		const session = await auth();
		if (!session?.user) {
			return new ChatSDKError('unauthorized:chat').toResponse();
		}

		const chat = await getChatById({ id });
		if (!chat) {
			const title = await generateTitleFromUserMessage({ message });
			await saveChat({ id, userId: session.user.id, title, visibility: selectedVisibilityType });
		}

		await saveMessages({
			messages: [
				{
					chatId: id,
					id: message.id,
					role: 'user',
					parts: message.parts,
					attachments: [],
					createdAt: new Date(),
				},
			],
		});

		const messagesFromDb = await getMessagesByChatId({ id });
		const uiMessages = [...convertToUIMessages(messagesFromDb), message] as ChatMessage[];

		const row = await getCollectionById({ id: collectionId });
		const collectionData: any = row?.data ?? null;

		const system = [
			'You are helping the user analyze an NFT collection and find similar collections.',
			'Given the context below, respond concisely and helpfully. Prioritize verified, official data.',
			'If suggesting similar collections, provide name, chain, contract address, and a one-line reason.',
			'Ask a brief follow-up to refine the search if needed.',
			collectionData ? `Context: ${JSON.stringify(collectionData).slice(0, 4000)}` : '',
		].filter(Boolean).join('\n');

		const openSeaClient = await experimental_createMCPClient({
			transport: {
				onclose: console.log,
				onerror: console.log,
				onmessage: console.log,
				type: 'sse',
				url: 'https://mcp.opensea.io/sse',
				headers: {
					Authorization: 'Bearer jRCXEr3mobnxTzGa83X1p2jWtH0RX3IBlEk0ALq8Xw',
				},
			},
		});
		const allTools = await openSeaClient.tools();
		const stream = createUIMessageStream({
			execute: ({ writer: dataStream }) => {
				const result = streamText({
					model: openai('gpt-5'),
					system,
					messages: convertToModelMessages(uiMessages as any),
					stopWhen: stepCountIs(20),
					experimental_transform: smoothStream({ chunking: 'word' }),
					tools: {
						...allTools,
					},
					onStepFinish: async (step) => {
						console.log('onStepFinish', step);
						// Attempt to capture collections JSON from MCP tool results and persist
						const content: any[] = (step as any)?.content ?? [];
						const toolResult = content.find((c) => c?.type === 'tool-result');
						if (toolResult) {
							console.log('toolResult', {
								toolName: toolResult.toolName,
								input: toolResult.input,
								output: toolResult.output?.content,
							});
						}
					},
				});

				result.consumeStream();
				dataStream.merge(result.toUIMessageStream({ sendReasoning: true }));
			},
			generateId: generateUUID,
			onFinish: async ({ messages }) => {
				await saveMessages({
					messages: messages.map((m) => ({
						id: m.id,
						role: m.role,
						parts: m.parts,
						createdAt: new Date(),
						attachments: [],
						chatId: id,
					})),
				});
			},
			onError: (error) => {
				console.error('collections/[id] error', error);
				return 'Oops, an error occurred!';
			},
		});

		return new Response(stream.pipeThrough(new JsonToSseTransformStream()));
	} catch (error) {
		console.error('collections/[id] fatal', error);
		if (error instanceof ChatSDKError) {
			return error.toResponse();
		}
		return new Response(JSON.stringify({ error: 'internal_server_error' }), { status: 500 });
	}
} 