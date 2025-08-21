'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDataStream } from '@/components/data-stream-provider';
import { Button } from '@/components/ui/button';

export default function NavigateOnCollectionId() {
	const { dataStream } = useDataStream();
	const router = useRouter();
	const [collectionJson, setCollectionJson] = useState<any | null>(null);
	const [isSaving, setIsSaving] = useState(false);

	useEffect(() => {
		if (!dataStream || dataStream.length === 0) return;
		for (let i = dataStream.length - 1; i >= 0; i--) {
			const part = dataStream[i];
			if (part.type === 'data-collectionJson') {
				setCollectionJson(part.data as any);
				break;
			}
		}
	}, [dataStream]);

	const onNext = React.useCallback(async () => {
		if (!collectionJson || isSaving) return;
		// TODO need better way to ensure this is the correct collection
		// We need to prob expose a tool to the llm that chooses the correct collection and we can listen for that tool call
		const collection = collectionJson.collections[0];
		setIsSaving(true);
		try {
			const response = await fetch('/api/collections/save', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ data: collection }),
			});
			if (!response.ok) throw new Error('Failed to save collection');
			const { id } = await response.json();
			router.push(`/collections/${id}`);
		} catch (e) {
			console.error(e);
		} finally {
			setIsSaving(false);
		}
	}, [collectionJson, isSaving, router]);

	return (
		<div className="p-6">
			<div className="flex items-center justify-between gap-3">
				<div className="text-sm text-muted-foreground">
					{collectionJson ? 'Collection found. Review and continue when ready.' : 'Waiting for a collection to be selected...'}
				</div>
				<Button onClick={onNext} disabled={!collectionJson || isSaving}>
					{isSaving ? 'Saving...' : 'Next'}
				</Button>
			</div>
		</div>
	);
} 