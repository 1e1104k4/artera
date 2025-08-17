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

	// Build a concise starter query from the data, if available
	let starterQuery: string | undefined;
	if (data) {
		const root: any = (data as any).collection ?? data;
		const name = root?.name ?? 'this collection';
		const chain = root?.chain?.identifier ?? root?.chain?.name ?? root?.chain_identifier;
		const standard = root?.standard ?? root?.primary_asset_contracts?.[0]?.schema_name;
		const address = root?.address ?? root?.primary_asset_contracts?.[0]?.address;
		starterQuery = `Find other NFT collections with similar traits to ${name}${address ? ` (contract ${address})` : ''}${chain ? ` on ${chain}` : ''}${standard ? ` using ${standard}` : ''}.`;
	}

	return (
		<CollectionsChatShell
			id={id}
			initialModel={initialModel}
			session={session}
			hideSidebar
			greetingProps={{ title: 'Finding Collections', subtitle: 'Looking for shared traits' }}
			starterQuery={starterQuery}
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