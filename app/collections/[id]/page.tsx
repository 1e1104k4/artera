import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { DEFAULT_CHAT_MODEL } from '@/lib/ai/models';
import { auth } from '@/app/(auth)/auth';
import CollectionsChatShell from '@/components/collections/collections-chat-shell';
import { getCollectionById } from '@/lib/db/queries';
import CollectionDetails from '@/components/collections/collection-details';

export default async function CollectionDetailPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	const session = await auth();
	if (!session) {
		redirect('/api/auth/guest');
	}

	const cookieStore = await cookies();
	const modelIdFromCookie = cookieStore.get('chat-model');
	const initialModel = modelIdFromCookie?.value ?? DEFAULT_CHAT_MODEL;

	const row = await getCollectionById({ id });
	const data = row?.data ?? null;

	return (
		<CollectionsChatShell
			id={id}
			initialModel={initialModel}
			session={session}
			hideSidebar
			greetingProps={{ title: 'Finding Collections', subtitle: 'Looking for shared traits' }}
		>
			<div className="flex flex-col gap-6 p-6">
				{data ? (
					<CollectionDetails data={data} />
				) : (
					<div className="text-sm text-muted-foreground">No data found for this collection.</div>
				)}
			</div>
		</CollectionsChatShell>
	);
} 