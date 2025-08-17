import {
	convertToModelMessages,
	createUIMessageStream,
	experimental_createMCPClient,
	JsonToSseTransformStream,
	smoothStream,
	stepCountIs,
	streamText,
} from 'ai';
import { auth, type UserType } from '@/app/(auth)/auth';
import { getChatById, getMessagesByChatId, saveChat, saveMessages } from '@/lib/db/queries';
import { convertToUIMessages, generateUUID } from '@/lib/utils';
import { DEFAULT_CHAT_MODEL } from '@/lib/ai/models';
import { myProvider } from '@/lib/ai/providers';
import { saveCollection } from '@/lib/ai/tools/save-collection';
import type { ChatMessage } from '@/lib/types';
import { postRequestBodySchema, type PostRequestBody } from '../../chat/schema';
import { ChatSDKError } from '@/lib/errors';
import { generateTitleFromUserMessage } from '../../../actions';
import { saveCollectionJson } from '@/lib/db/queries';

export const maxDuration = 60;

export async function POST(request: Request) {
	let requestBody: PostRequestBody;
	try {
		const json = await request.json();
		requestBody = postRequestBodySchema.parse(json);
	} catch (_) {
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
					model: myProvider.languageModel(selectedChatModel ?? DEFAULT_CHAT_MODEL),
					system: [
						'You are helping the user find an NFT collection using OpenSea MCP.',
						'1) Use MCP tools to search and identify a single best match (prefer verified official contract).',
						"2) Present the found collection's name, image URL, contract address, chain, OpenSea URL, website URL, and a short description.",
						'3) Ask the user: "Is this the correct collection?" and wait for a clear yes/confirm before proceeding.',
						'4) Only AFTER confirmation, call the tool saveCollection with the full collection fields to persist to the database.',
					].join('\n'),
					messages: convertToModelMessages(uiMessages),
					stopWhen: stepCountIs(30),
					experimental_transform: smoothStream({ chunking: 'word' }),
					tools: {
						...allTools,
						saveCollection: saveCollection({ session, dataStream }),
					},
					onStepFinish: async (step) => {
						try {
							// Attempt to capture the collection from a get_collection tool result
							// and persist it as raw JSON into the collections table.
							// This is complementary to the saveCollection tool and helps when
							// the model surfaces the JSON but does not call the tool.
							const content: any[] = (step as any)?.content ?? [];
							const collectionResult = content.find(
								(c) => c?.type === 'tool-result' && c?.toolName === 'get_collection',
							);
							if (collectionResult?.output?.content?.[0]?.text) {
								const jsonText = collectionResult.output.content[0].text as string;
								const parsed = JSON.parse(jsonText);
								const savedId = generateUUID();
								await saveCollectionJson({ id: savedId, data: parsed });
								dataStream.write({ type: 'data-id', data: savedId, transient: true });
								dataStream.write({ type: 'data-finish', data: null, transient: true });
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