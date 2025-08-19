'use client';

import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useDataStream } from '@/components/data-stream-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

function get(obj: any, path: string): any {
	try {
		return path.split('.').reduce((o, k) => (o ? o[k] : undefined), obj);
	} catch {
		return undefined;
	}
}

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

	const { name, address, chain, imageUrl, externalUrl, openseaUrl } = useMemo(() => {
		const root = json?.collection ?? json ?? {};
		return {
			name: root.name ?? get(root, 'collection.name') ?? '—',
			address: root.address ?? get(root, 'primary_asset_contracts.0.address') ?? '—',
			chain: root.chain ?? root.chain_identifier ?? '—',
			imageUrl: root.image_url ?? root.imageUrl ?? undefined,
			externalUrl: root.external_url ?? root.externalUrl ?? undefined,
			openseaUrl: root.opensea_url ?? root.openseaUrl ?? undefined,
		};
	}, [json]);

	return (
		<Card>
			<CardHeader>
				<CardTitle>Found collection (stream)</CardTitle>
				<CardDescription>Live preview from the assistant. Saved on confirm.</CardDescription>
			</CardHeader>
			<CardContent>
				{json ? (
					<div className="flex flex-col gap-3">
						<div className="flex items-start gap-4">
							<div className="size-16 overflow-hidden rounded bg-muted">
								{imageUrl ? (
									<img src={imageUrl} alt={name} className="size-16 object-cover" />
								) : null}
							</div>
							<div className="flex-1">
								<div className="text-lg font-medium leading-none">{name}</div>
								<div className="text-sm text-muted-foreground">
									<span className="font-mono">{address}</span>
								</div>
								<div className="mt-1 text-xs text-muted-foreground">Chain: {chain}</div>
								<div className="mt-2 flex flex-wrap gap-2 text-xs">
									{externalUrl ? (
										<a className="text-primary underline" href={externalUrl} target="_blank" rel="noreferrer">
											Website
										</a>
									) : null}
									{openseaUrl ? (
										<a className="text-primary underline" href={openseaUrl} target="_blank" rel="noreferrer">
											OpenSea
										</a>
									) : null}
								</div>
							</div>
						</div>
						<pre className="mt-2 max-h-64 overflow-auto rounded bg-muted p-3 text-xs">
							{JSON.stringify(json, null, 2)}
						</pre>
					</div>
				) : (
					<div className="text-sm text-muted-foreground">No collection streamed yet.</div>
				)}
			</CardContent>
		</Card>
	);
} 