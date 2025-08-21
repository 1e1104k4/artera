import { z } from 'zod';

// Common price structures
const tokenAmountSchema = z.object({
	unit: z.number(),
	symbol: z.string(),
});

const pricePerItemSchema = z.object({
	token: tokenAmountSchema.optional(),
	usd: z.number().optional(),
	native: tokenAmountSchema.optional(),
});

export const floorPriceSchema = z.object({
	pricePerItem: pricePerItemSchema,
}).nullable();

export const volumeSchema = z.object({
	native: tokenAmountSchema.optional(),
	usd: z.number().optional(),
});

export const timeWindowStatsSchema = z.object({
	sales: z.number().optional(),
	volume: volumeSchema.optional(),
	floorPriceChange: z.number().nullable().optional(),
});

export const statsSchema = z.object({
	totalSupply: z.number().optional(),
	ownerCount: z.number().optional(),
	volume: volumeSchema.optional(),
	sales: z.number().optional(),
	oneDay: timeWindowStatsSchema.optional(),
	sevenDays: timeWindowStatsSchema.optional(),
});

export const chainSchema = z.object({
	identifier: z.string().optional(),
	name: z.string().optional(),
});

export const creatorFeeSchema = z.object({
	recipient: z.string(),
	feeBasisPoints: z.number(),
});

export const feesSchema = z.object({
	creatorFees: z.array(creatorFeeSchema).optional(),
});

export const raritySchema = z.object({
	rank: z.number().optional(),
	rankPercentage: z.number().optional(),
	totalSupply: z.number().optional(),
});

export const attributeSchema = z.object({
	traitType: z.string(),
	value: z.string(),
});

export const ownerSchema = z.object({
	address: z.string().optional(),
	displayName: z.string().nullable().optional(),
});

export const marketplaceSchema = z.object({
	identifier: z.string().optional(),
});

export const listingSchema = z.object({
	pricePerItem: pricePerItemSchema.optional(),
	marketplace: marketplaceSchema.optional(),
});

export const sampleItemSchema = z.object({
	tokenId: z.string(),
	name: z.string().nullable().optional(),
	description: z.string().nullable().optional(),
	imageUrl: z.string().nullable().optional(),
	animationUrl: z.string().nullable().optional(),
	contractAddress: z.string().optional(),
	standard: z.string().optional(),
	createdAt: z.string().optional(),
	lastTransferAt: z.string().nullable().optional(),
	lastSaleAt: z.string().nullable().optional(),
	collection: z
		.object({ slug: z.string().optional(), name: z.string().optional() })
		.optional(),
	chain: chainSchema.optional(),
	bestListing: listingSchema.nullable().optional(),
	bestOffer: listingSchema.nullable().optional(),
	owner: ownerSchema.optional(),
	attributes: z.array(attributeSchema).optional(),
	rarity: raritySchema.optional(),
});

export const collectionSchema = z.object({
	__typename: z.literal('Collection').optional(),
	slug: z.string(),
	name: z.string().optional(),
	description: z.string().nullable().optional(),
	imageUrl: z.string().nullable().optional(),
	bannerImageUrl: z.string().nullable().optional(),
	createdAt: z.string().optional(),
	address: z.string().optional(),
	standard: z.string().optional(),
	twitterUsername: z.string().nullable().optional(),
	instagramUsername: z.string().nullable().optional(),
	mediumUsername: z.string().nullable().optional(),
	chatUrl: z.string().nullable().optional(),
	telegramUrl: z.string().nullable().optional(),
	wikiUrl: z.string().nullable().optional(),
	discordUrl: z.string().nullable().optional(),
	discordGuildName: z.string().nullable().optional(),
	externalUrl: z.string().nullable().optional(),
	fees: feesSchema.optional(),
	stats: statsSchema.optional(),
	floorPrice: floorPriceSchema.optional().nullable(),
	chain: chainSchema.optional(),
	sampleItems: z.array(sampleItemSchema).optional(),
	attributes: z.array(attributeSchema).optional(),
});

export const getCollectionsResponseSchema = z.object({
	collections: z.array(collectionSchema),
});

export type GetCollectionsResponse = z.infer<typeof getCollectionsResponseSchema>;
export type Collection = z.infer<typeof collectionSchema>; 