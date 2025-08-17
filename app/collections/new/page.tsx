import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { DEFAULT_CHAT_MODEL } from "@/lib/ai/models";
import { generateUUID } from "@/lib/utils";
import { auth } from "@/app/(auth)/auth";
import StepOneForm from "@/components/collections/step-one-form";
import CollectionsChatShell from "@/components/collections/collections-chat-shell";
import NavigateOnCollectionId from "@/components/collections/navigate-on-collection-id";
import CollectionStreamPreview from "@/components/collections/collection-stream-preview";

export default async function NewCollectionPage() {
	const session = await auth();
	if (!session) {
		redirect('/api/auth/guest');
	}

	const id = generateUUID();
	const cookieStore = await cookies();
	const modelIdFromCookie = cookieStore.get('chat-model');
	const initialModel = modelIdFromCookie?.value ?? DEFAULT_CHAT_MODEL;

	return (
		<CollectionsChatShell
			id={id}
			initialModel={initialModel}
			session={session}
			hideSidebar
			hideRightPaneUntilData
			greetingProps={{ title: 'Expand your NFT collections network.', subtitle: 'what is the name of your collection?' }}
		>
			<NavigateOnCollectionId />
			<div className="flex flex-col gap-6 p-6">
				<CollectionStreamPreview />
				{/* <StepOneForm /> */}
			</div>
		</CollectionsChatShell>
	);
} 