import {
	convertToModelMessages,
	createUIMessageStream,
	experimental_createMCPClient,
	JsonToSseTransformStream,
	smoothStream,
	stepCountIs,
	streamText,
} from 'ai';
import { auth, } from '@/app/(auth)/auth';
import { getChatById, getMessagesByChatId, saveChat, saveMessages , } from '@/lib/db/queries';
import { convertToUIMessages, generateUUID } from '@/lib/utils';
import { openai } from '@ai-sdk/openai';
import type { ChatMessage } from '@/lib/types';
import { postRequestBodySchema, type PostRequestBody } from '@/app/(chat)/api/chat/schema';
import { ChatSDKError } from '@/lib/errors';
import { generateTitleFromUserMessage } from '@/app/(chat)/actions';
import { getCollectionsResponseSchema } from '@/lib/collections/schema';

export const maxDuration = 60;

export async function POST(request: Request) {
	let requestBody: PostRequestBody;
	try {
		const json = await request.json();
		requestBody = postRequestBodySchema.parse(json);
	} catch (_) {
		console.error('collections/new bad_request:api', _);
		return new ChatSDKError('bad_request:api').toResponse();
	}

	try {
		const { id, message, selectedChatModel, selectedVisibilityType } = requestBody;
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
					system: [
						'You are helping the user find an NFT collection using OpenSea MCP.',
						'1) Use MCP tools to search and identify a single best match (prefer verified official contract).',
						"2) Present the found collection's name, image URL, contract address, chain, OpenSea URL, website URL, and a short description.",
						'3) If this is the correct answer click the button in the top right, if not provide more details.',
						'4) When searching for collections ensure you fetch the traits for the collection.',
					].join('\n'),
					messages: convertToModelMessages(uiMessages),
					stopWhen: stepCountIs(30),
					experimental_transform: smoothStream({ chunking: 'word' }),
					tools: {
						...allTools,
					},
					onStepFinish: async (step) => {
						try {
							// Capture collections JSON from MCP get_collections results and persist
							const content: any[] = (step as any)?.content ?? [];
							const toolResult = content.find((c) => c?.type === 'tool-result');
							if (toolResult) {
								console.log('toolResult', {
									toolName: toolResult.toolName,
									input: toolResult.input,
									output: toolResult.output?.content,
								});
							}

							const toolName: string | undefined = toolResult?.toolName;
							if (toolName !== 'get_collections') return;
							const text: string | undefined = toolResult?.output?.content?.[0]?.text;
							if (!text) return;

							let normalized: any | null = null;
							try {
								const parsed = JSON.parse(text);
								const safe = getCollectionsResponseSchema.parse(parsed);
								normalized = { collections: safe.collections };
							} catch (e) {
								console.error('collections/new JSON parse/validate error', e);
							}

							if (normalized) {
								dataStream.write({ type: 'data-collectionJson', data: normalized, transient: true });
							}
						} catch (err) {
							console.error('collections/new onStepFinish error', err);
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
				console.error('collections/new error', error);
				return 'Oops, an error occurred!';
			},
		});

		return new Response(stream.pipeThrough(new JsonToSseTransformStream()));
	} catch (error) {
		console.error('collections/new fatal', error);
		if (error instanceof ChatSDKError) {
			return error.toResponse();
		}
		return new Response(JSON.stringify({ error: 'internal_server_error' }), { status: 500 });
	}
} 