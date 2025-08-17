'use client';

import * as React from "react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function StepOneForm() {
	const router = useRouter();
	const [searchQuery, setSearchQuery] = useState("");

	const [name, setName] = useState("");
	const [slug, setSlug] = useState("");
	const [address, setAddress] = useState("");
	const [chain, setChain] = useState("ethereum");
	const [imageUrl, setImageUrl] = useState("");
	const [externalUrl, setExternalUrl] = useState("");
	const [openseaUrl, setOpenseaUrl] = useState("");
	const [description, setDescription] = useState("");

	const canProceed = useMemo(() => {
		return name.trim().length > 0 && address.trim().length > 0 && chain.trim().length > 0;
	}, [name, address, chain]);

	function handleFakeSearchSubmit(e: React.FormEvent) {
		e.preventDefault();
		// Placeholder for future OpenSea search integration
	}

	async function handleNext() {
		// Placeholder for future persist via /api/collections, then navigate to Step 2
	}

	return (
		<div className="flex h-dvh flex-col gap-6 p-6">
			<div>
				<h1 className="text-2xl font-semibold tracking-tight">New Collection</h1>
				<p className="text-sm text-muted-foreground">Step 1 of 3 — Find a collection</p>
			</div>

			{/* Selected Collection Preview */}
			<Card>
				<CardHeader>
					<CardTitle>Selected collection</CardTitle>
					<CardDescription>Preview will update as you enter details.</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex items-start gap-4">
						<div className="h-16 w-16 overflow-hidden rounded bg-muted">
							{imageUrl ? (
								<Image
									src={imageUrl}
									alt={name || "Collection image"}
									width={64}
									height={64}
									className="size-16 object-cover"
								/>
							) : null}
						</div>
						<div className="flex-1">
							<div className="text-lg font-medium leading-none">{name || "—"}</div>
							<div className="text-sm text-muted-foreground">
								{address ? (
									<span className="font-mono">{address}</span>
								) : (
									<span>Contract address</span>
								)}
							</div>
							<div className="mt-1 text-xs text-muted-foreground">Chain: {chain || "—"}</div>
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
				</CardContent>
			</Card>

			<div className="grid gap-6 md:grid-cols-2">
				{/* Search Area */}
				<Card>
					<CardHeader>
						<CardTitle>Search on OpenSea</CardTitle>
						<CardDescription>Find by slug, name, or contract address.</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleFakeSearchSubmit} className="flex items-center gap-2">
							<Input
								placeholder="e.g. boredapeyachtclub or 0x..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
							/>
							<Button type="submit" variant="secondary" disabled>
								Search (coming soon)
							</Button>
						</form>
					</CardContent>
				</Card>

				{/* Manual Entry */}
				<Card>
					<CardHeader>
						<CardTitle>Enter details manually</CardTitle>
						<CardDescription>Paste the official contract address to avoid lookups.</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="grid gap-4">
							<div className="grid gap-2">
								<Label htmlFor="name">Name</Label>
								<Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Collection name" />
							</div>
							<div className="grid gap-2">
								<Label htmlFor="slug">Slug (optional)</Label>
								<Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="opensea slug" />
							</div>
							<div className="grid gap-2">
								<Label htmlFor="address">Contract address</Label>
								<Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="0x..." />
							</div>
							<div className="grid gap-2">
								<Label htmlFor="chain">Chain</Label>
								<select
									id="chain"
									className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm"
									value={chain}
									onChange={(e) => setChain(e.target.value)}
								>
									<option value="ethereum">Ethereum</option>
									<option value="polygon">Polygon</option>
									<option value="arbitrum">Arbitrum</option>
									<option value="optimism">Optimism</option>
								</select>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="imageUrl">Image URL (optional)</Label>
								<Input id="imageUrl" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." />
							</div>
							<div className="grid gap-2">
								<Label htmlFor="externalUrl">Website URL (optional)</Label>
								<Input id="externalUrl" value={externalUrl} onChange={(e) => setExternalUrl(e.target.value)} placeholder="https://..." />
							</div>
							<div className="grid gap-2">
								<Label htmlFor="openseaUrl">OpenSea URL (optional)</Label>
								<Input id="openseaUrl" value={openseaUrl} onChange={(e) => setOpenseaUrl(e.target.value)} placeholder="https://opensea.io/collection/..." />
							</div>
							<div className="grid gap-2">
								<Label htmlFor="description">Description (optional)</Label>
								<textarea
									id="description"
									className="min-h-[96px] rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm"
									value={description}
									onChange={(e) => setDescription(e.target.value)}
									placeholder="Short summary"
								/>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			<div className="flex items-center justify-end gap-2">
				<Button variant="outline" onClick={() => router.back()}>Cancel</Button>
				<Button onClick={handleNext} disabled={!canProceed}>Next</Button>
			</div>
		</div>
	);
} 