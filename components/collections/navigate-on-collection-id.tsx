'use client';

import * as React from 'react';
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useDataStream } from '@/components/data-stream-provider';

export default function NavigateOnCollectionId() {
	const { dataStream } = useDataStream();
	const router = useRouter();
	const hasNavigatedRef = useRef(false);

	useEffect(() => {
		if (hasNavigatedRef.current) return;
		if (!dataStream || dataStream.length === 0) return;

		// Find the most recent data-id emitted by tools (e.g., saveCollection)
		for (let i = dataStream.length - 1; i >= 0; i--) {
			const part = dataStream[i];
			if (part.type === 'data-id') {
				const id = String(part.data || '').trim();
				if (id) {
					hasNavigatedRef.current = true;
					// Replace to avoid adding an extra history entry
					router.replace(`/collections/${id}`);
					break;
				}
			}
		}
	}, [dataStream, router]);

	return null;
} 