import type { NextRequest } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { ChatSDKError } from '@/lib/errors';
import { generateUUID } from '@/lib/utils';
import { saveCollectionJson } from '@/lib/db/queries';
import { collectionSchema } from '@/lib/collections/schema';

export async function POST(request: NextRequest) {
	const session = await auth();
	if (!session?.user) {
		return new ChatSDKError('unauthorized:chat').toResponse();
	}
	try {
		const { data } = await request.json();
		console.log('collections/save data', data);
		// Validate and normalize
		const safe = collectionSchema.parse(data);
		const id = generateUUID();
		await saveCollectionJson({ id, data: safe });
		return Response.json({ id }, { status: 200 });
	} catch (error) {
		console.error('collections/save error', error);
		if (error instanceof ChatSDKError) {
			return error.toResponse();
		}
		return new Response(JSON.stringify({ error: 'bad_request:api' }), { status: 400 });
	}
} 