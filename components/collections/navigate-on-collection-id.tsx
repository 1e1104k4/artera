'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDataStream } from '@/components/data-stream-provider';
import { Button } from '@/components/ui/button';

export default function NavigateOnCollectionId() {
	const { dataStream } = useDataStream();
	const router = useRouter();
	const [collectionId, setCollectionId] = useState<string | null>(null);

	useEffect(() => {
		if (!dataStream || dataStream.length === 0) return;
		for (let i = dataStream.length - 1; i >= 0; i--) {
			const part = dataStream[i];
			if (part.type === 'data-id') {
				const id = String(part.data || '').trim();
				if (id) {
					setCollectionId(id);
					break;
				}
			}
		}
	}, [dataStream]);

	const onNext = React.useCallback(() => {
		if (collectionId) {
			router.push(`/collections/${collectionId}`);
		}
	}, [collectionId, router]);

	return (
		<div className="p-6">
			<div className="flex items-center justify-between gap-3">
				<div className="text-sm text-muted-foreground">
					{collectionId ? 'Collection found. Review and continue when ready.' : 'Waiting for a collection to be selected...'}
				</div>
				<Button onClick={onNext} disabled={!collectionId}>
					Next
				</Button>
			</div>
		</div>
	);
} 