'use client';

import * as React from 'react';
import { DataStreamProvider } from '@/components/data-stream-provider';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { Chat } from '@/components/chat';
import { DataStreamHandler } from '@/components/data-stream-handler';
import type { Session } from 'next-auth';
import { useDataStream } from '@/components/data-stream-provider';

function RightPane({ children, hideUntilData }: { children: React.ReactNode; hideUntilData?: boolean }) {
	const { dataStream } = useDataStream();
	const hasCollectionJson = React.useMemo(() => {
		if (!dataStream || dataStream.length === 0) return false;
		for (let i = dataStream.length - 1; i >= 0; i--) {
			const part = dataStream[i];
			if (part.type === 'data-collectionJson') return true;
		}
		return false;
	}, [dataStream]);

	if (hideUntilData && !hasCollectionJson) return null;
	return <div className="w-full max-w-xl overflow-auto">{children}</div>;
}

export default function CollectionsChatShell({
	id,
	initialModel,
	session,
	children,
	hideSidebar = false,
	greetingProps,
	hideRightPaneUntilData,
}: {
	id: string;
	initialModel: string;
	session: Session;
	children: React.ReactNode;
	hideSidebar?: boolean;
	greetingProps?: { title?: string; subtitle?: string; hidden?: boolean };
	hideRightPaneUntilData?: boolean;
}) {
	return (
		<DataStreamProvider>
			<SidebarProvider defaultOpen>
				{!hideSidebar ? <AppSidebar user={session.user} /> : null}
				<SidebarInset>
					<div className="flex h-dvh">
						<div className="flex-1 min-w-0 border-r">
							<Chat
								key={id}
								id={id}
								initialMessages={[]}
								initialChatModel={initialModel}
								initialVisibilityType="private"
								isReadonly={false}
								session={session}
								autoResume={false}
								hideDeploy
								hideModelAndVisibility
								greetingProps={greetingProps}
								apiEndpoint="/api/collections/new"
								historyBasePath="/collections/new"
								disableHistoryRewrite
							/>
							<DataStreamHandler />
						</div>
						<RightPane hideUntilData={hideRightPaneUntilData}>{children}</RightPane>
					</div>
				</SidebarInset>
			</SidebarProvider>
		</DataStreamProvider>
	);
} 