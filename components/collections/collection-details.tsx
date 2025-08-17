'use client';

import * as React from 'react';

export default function CollectionDetails({ data }: { data: any }) {
	// Normalize a few common fields from various possible shapes
	const root: any = (data as any)?.collection ?? data ?? {};
	const name: string = root?.name ?? root?.collection?.name ?? '—';
	const address: string = root?.address ?? root?.primary_asset_contracts?.[0]?.address ?? '—';
	const chain: string = root?.chain?.name ?? root?.chain?.identifier ?? root?.chain_identifier ?? '—';
	const imageUrl: string | undefined = root?.imageUrl ?? root?.image_url ?? undefined;
	const bannerImageUrl: string | undefined = root?.bannerImageUrl ?? root?.banner_image_url ?? undefined;
	const description: string | undefined = root?.description ?? undefined;
	const externalUrl: string | undefined = root?.externalUrl ?? root?.external_url ?? undefined;

	// Metrics normalization
	const floorNativeUnit: number | undefined = root?.floorPrice?.pricePerItem?.native?.unit ?? root?.stats?.floor_price?.native?.unit;
	const floorNativeSymbol: string | undefined = root?.floorPrice?.pricePerItem?.native?.symbol ?? root?.stats?.floor_price?.native?.symbol;
	const floorUsd: number | undefined = root?.floorPrice?.pricePerItem?.usd ?? root?.stats?.floor_price?.usd;

	const volumeNativeUnit: number | undefined = root?.stats?.volume?.native?.unit ?? root?.total_volume?.native?.unit;
	const volumeNativeSymbol: string | undefined = root?.stats?.volume?.native?.symbol ?? root?.total_volume?.native?.symbol;
	const volumeUsd: number | undefined = root?.stats?.volume?.usd ?? root?.total_volume?.usd;

	const standard: string | undefined = root?.standard ?? root?.primary_asset_contracts?.[0]?.schema_name ?? root?.contract_type;

	const creatorFees: Array<{ recipient: string; feeBasisPoints: number }> = Array.isArray(root?.fees?.creatorFees)
		? root.fees.creatorFees
		: [];

	// Format helpers
	const format4 = (n: number | undefined) =>
		typeof n === 'number'
			? new Intl.NumberFormat('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 4 }).format(n)
			: undefined;
	const format2 = (n: number | undefined) =>
		typeof n === 'number'
			? new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)
			: undefined;

	return (
		<div className="flex flex-col gap-6">
			<div className="space-y-4">
				{bannerImageUrl ? (
					<div className="h-40 w-full overflow-hidden rounded-lg bg-muted">
						<img src={bannerImageUrl} alt={name} className="h-full w-full object-cover" />
					</div>
				) : null}
				<div className="flex items-start gap-4">
					<div className="h-20 w-20 overflow-hidden rounded bg-muted">
						{imageUrl ? <img src={imageUrl} alt={name} className="h-20 w-20 object-cover" /> : null}
					</div>
					<div className="flex-1 min-w-0">
						<h1 className="truncate text-2xl font-semibold tracking-tight">{name}</h1>
						<div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
							<span className="rounded border px-2 py-0.5 text-xs">{chain}</span>
							<span className="font-mono break-all">{address}</span>
						</div>
						{externalUrl ? (
							<div className="mt-2 text-sm">
								<a className="text-primary underline" href={externalUrl} target="_blank" rel="noreferrer">
									Website
								</a>
							</div>
						) : null}
					</div>
				</div>
				{description ? (
					<p className="text-sm text-muted-foreground whitespace-pre-line">{description}</p>
				) : null}
			</div>

			{/* Metrics */}
			<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
				<div className="rounded border p-4">
					<div className="text-sm text-muted-foreground">Floor price</div>
					<div className="mt-1 text-lg font-medium">
						{typeof floorNativeUnit === 'number' && floorNativeSymbol ? (
							<>
								{floorNativeUnit} {floorNativeSymbol}
							</>
						) : (
							<span>—</span>
						)}
					</div>
					{typeof floorUsd === 'number' ? (
						<div className="text-xs text-muted-foreground">${format2(floorUsd)}</div>
					) : null}
				</div>

				<div className="rounded border p-4">
					<div className="text-sm text-muted-foreground">Volume</div>
					<div className="mt-1 text-lg font-medium">
						{typeof volumeNativeUnit === 'number' && volumeNativeSymbol ? (
							<>
								{format4(volumeNativeUnit)} {volumeNativeSymbol}
							</>
						) : (
							<span>—</span>
						)}
					</div>
					{typeof volumeUsd === 'number' ? (
						<div className="text-xs text-muted-foreground">${format4(volumeUsd)}</div>
					) : null}
				</div>

				<div className="rounded border p-4">
					<div className="text-sm text-muted-foreground">Standard</div>
					<div className="mt-1 text-lg font-medium">{standard ?? '—'}</div>
				</div>
			</div>

			<div className="rounded border p-4">
				<div className="text-sm text-muted-foreground">Creator fees</div>
				{creatorFees.length > 0 ? (
					<ul className="mt-2 space-y-2">
						{creatorFees.map((fee, idx) => {
							const pct = typeof fee.feeBasisPoints === 'number' ? fee.feeBasisPoints / 100 : undefined;
							return (
								<li key={idx} className="flex flex-col">
									<span className="font-mono text-sm break-all">{fee.recipient}</span>
									<span className="text-xs text-muted-foreground">{pct !== undefined ? `${pct}%` : `${fee.feeBasisPoints} bps`}</span>
								</li>
							);
						})}
					</ul>
				) : (
					<div className="mt-2 text-sm">—</div>
				)}
			</div>
		</div>
	);
} 