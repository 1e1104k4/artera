'use client';

import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useDataStream } from '@/components/data-stream-provider';

interface NormalizedTraitValue {
	traitType: string;
	value: string;
	count?: number;
	percentage?: number;
}

function normalizeTraitsFromJson(json: any): Array<NormalizedTraitValue> {
	if (!json) return [];
	const root: any = json?.collection ?? json;

	// Case 1: OpenSea-style object map: { traits: { trait_type: { value: count, ... }, ... } }
	const traitsObj = root?.traits ?? root?.collection?.traits;
	if (traitsObj && typeof traitsObj === 'object' && !Array.isArray(traitsObj)) {
		const items: Array<NormalizedTraitValue> = [];
		for (const [traitType, values] of Object.entries<any>(traitsObj)) {
			if (values && typeof values === 'object') {
				for (const [value, count] of Object.entries<any>(values)) {
					items.push({ traitType, value: String(value), count: typeof count === 'number' ? count : undefined });
				}
			}
		}
		return items
			.sort((a, b) => (b.count ?? 0) - (a.count ?? 0))
			.slice(0, 20);
	}

	// Case 2: Array of top traits: [{ traitType, value, count, percentage }]
	const topTraits = root?.topTraits ?? root?.top_traits ?? root?.popularTraits;
	if (Array.isArray(topTraits)) {
		return (topTraits as any[])
			.map((t) => ({
				traitType: String(t.traitType ?? t.type ?? t.name ?? 'trait'),
				value: String(t.value ?? t.val ?? t.label ?? '—'),
				count: typeof t.count === 'number' ? t.count : undefined,
				percentage: typeof t.percentage === 'number' ? t.percentage : undefined,
			}))
			.slice(0, 20);
	}

	// Case 3: Simple attributes array at collection level: [{ traitType, value }]
	const attributes = root?.attributes;
	if (Array.isArray(attributes)) {
		return (attributes as any[])
			.map((a) => ({
				traitType: String(a.traitType ?? a.type ?? a.name ?? 'trait'),
				value: String(a.value ?? a.val ?? a.label ?? '—'),
			}))
			.slice(0, 20);
	}

	return [];
}

export default function CollectionTraits() {
	const { dataStream } = useDataStream();
	const [json, setJson] = useState<any | null>(null);

	useEffect(() => {
		if (!dataStream || dataStream.length === 0) return;
		for (let i = dataStream.length - 1; i >= 0; i--) {
			const part = dataStream[i];
			if (part.type === 'data-collectionJson') {
				setJson(part.data.collections[0] as any);
				break;
			}
		}
	}, [dataStream,]);

	const traits = useMemo(() => normalizeTraitsFromJson(Array.isArray(json?.collections) ? json.collections[0] : json), [json]);
	console.log('traits', json);
	return (
		<div className="rounded border p-4">
			<div className="text-sm font-medium">Top Traits</div>
			{!json ? (
				<div className="mt-2 text-sm text-muted-foreground">No traits to display yet.</div>
			) : traits.length === 0 ? (
				<div className="mt-2 text-sm text-muted-foreground">No traits found in the collection data.</div>
			) : (
				<ul className="mt-3 space-y-2">
					{traits.map((t, idx) => (
						<li key={`${t.traitType}:${t.value}:${idx}`} className="flex items-center justify-between gap-3 text-sm">
							<div className="min-w-0 truncate">
								<span className="rounded border px-1.5 py-0.5 text-xs mr-2">{t.traitType}</span>
								<span className="font-medium break-all">{t.value}</span>
							</div>
							<div className="text-xs text-muted-foreground whitespace-nowrap">
								{typeof t.count === 'number' ? `${t.count} items` : null}
								{typeof t.percentage === 'number' ? ` (${new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(t.percentage)}%)` : null}
							</div>
						</li>
					))}
				</ul>
			)}
		</div>
	);
} 