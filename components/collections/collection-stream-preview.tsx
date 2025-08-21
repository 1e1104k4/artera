'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import { useDataStream } from '@/components/data-stream-provider';
import CollectionDetails from '@/components/collections/collection-details';

export default function CollectionStreamPreview() {
	const { dataStream } = useDataStream();
	const [json, setJson] = useState<any | null>(null);

	useEffect(() => {
		if (!dataStream || dataStream.length === 0) return;
		for (let i = dataStream.length - 1; i >= 0; i--) {
			const part = dataStream[i];
			if (part.type === 'data-collectionJson') {
				setJson(part.data as any);
				break;
			}
		}
	}, [dataStream]);

	if (!json) {
		return <div className="text-sm text-muted-foreground">No collection streamed yet.</div>;
	}

	const first = Array.isArray(json?.collections) ? json.collections[0] : json;
	if (!first) {
		return <div className="text-sm text-muted-foreground">No collection streamed yet.</div>;
	}

	return <CollectionDetails data={first} />;
} 