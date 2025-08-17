import { tool, type UIMessageStreamWriter } from 'ai';
import { z } from 'zod';
import type { Session } from 'next-auth';
import type { ChatMessage } from '@/lib/types';
import { saveDocument } from '@/lib/db/queries';
import { generateUUID } from '@/lib/utils';

interface SaveCollectionProps {
	session: Session;
	dataStream: UIMessageStreamWriter<ChatMessage>;
}

export const saveCollection = ({ session, dataStream }: SaveCollectionProps) =>
	tool({
		description:
			'Save a confirmed NFT collection to the database. Only call this after the user confirms the collection is correct.',
		inputSchema: z.object({
			name: z.string(),
			slug: z.string().optional(),
			address: z.string(),
			chain: z.string(),
			imageUrl: z.string().url().optional(),
			externalUrl: z.string().url().optional(),
			openseaUrl: z.string().url().optional(),
			description: z.string().optional(),
			traits: z.record(z.any()).default({}).optional(),
			stats: z.record(z.any()).optional(),
		}),
		execute: async (input) => {
			const id = generateUUID();

			const title = `Collection: ${input.name}`;
			const content = JSON.stringify({ id, ...input }, null, 2);

			await saveDocument({
				id,
				title,
				kind: 'text',
				content,
				userId: session.user.id,
			});

			dataStream.write({ type: 'data-title', data: title, transient: true });
			dataStream.write({ type: 'data-id', data: id, transient: true });
			dataStream.write({ type: 'data-finish', data: null, transient: true });

			return { collectionId: id, saved: true };
		},
	}); 