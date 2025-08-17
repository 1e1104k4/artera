import { tool, type UIMessageStreamWriter } from 'ai';
import { z } from 'zod';
import type { Session } from 'next-auth';
import type { ChatMessage } from '@/lib/types';
import { generateUUID } from '@/lib/utils';
import { saveCollectionJson } from '@/lib/db/queries';

interface SaveCollectionProps {
	session: Session;
	dataStream: UIMessageStreamWriter<ChatMessage>;
}

export const saveCollection = ({ session, dataStream }: SaveCollectionProps) =>
	tool({
		description:
			'Save a confirmed NFT collection to the database. Only call this after the user confirms the collection is correct.',
		inputSchema: z.object({
			collection_name_json: z.record(z.any()),
		}),
		execute: async ({ collection_name_json }) => {
			const id = generateUUID();

			await saveCollectionJson({ id, data: collection_name_json });

			// Stream entire JSON and the saved id back to the client
			dataStream.write({ type: 'data-collectionJson', data: collection_name_json, transient: true });
			dataStream.write({ type: 'data-id', data: id, transient: true });
			dataStream.write({ type: 'data-finish', data: null, transient: true });

			return { collectionId: id, saved: true };
		},
	}); 