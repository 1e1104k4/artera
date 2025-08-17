## PLAN: Multi-step NFT Collection Wizard (No Chat)

### Goal
Design and implement a multi-step wizard starting at `/collections/new` that:
- Finds an NFT collection via OpenSea (server-side integration)
- Persists collection details (name, picture, address, url, traits, stats)
- Helps users discover similar collections by traits and mark favorites
- Finds and stores owners for each selected collection

No user/account scoping yet (collections are global). No chat UI.


### High-level UX Flow
1) Step 1 — Find a collection
- Route: `app/collections/new/page.tsx`
- Search input for collection (by slug, name, or contract address)
- Server call to OpenSea to resolve the collection
- When selected, persist it via `POST /api/collections`
- Show collection header (image, name, address, links), enable Next

2) Step 2 — Find similar collections
- Server call(s) to propose similar collections based on trait overlaps
- UI displays candidate results; user can select “Favorite”
- Persist favorites referencing the original collection
- Next proceeds to Step 3

3) Step 3 — Find owners
- Server call to fetch owners for each selected collection
- Persist owners list as a snapshot; show results with pagination


### Data Model (Drizzle + SQL Migrations)
Add three new tables. Implement in `lib/db/schema.ts` and add a new SQL migration (e.g., `lib/db/migrations/0007_<name>.sql`).

- collections
  - id (pk, serial)
  - slug (string, unique, nullable)
  - chain (string, required)
  - name (string, required)
  - address (string, required, indexed)
  - imageUrl (text, nullable)
  - externalUrl (text, nullable)
  - openseaUrl (text, nullable)
  - description (text, nullable)
  - traits (jsonb, required, default {})
  - stats (jsonb, nullable)
  - createdAt (timestamp, default now)
  - unique on (address, chain)

- collection_favorites
  - id (pk, serial)
  - originalCollectionId (fk -> collections.id, cascade)
  - favoriteCollectionId (fk -> collections.id, cascade)
  - createdAt (timestamp, default now)
  - unique composite (originalCollectionId, favoriteCollectionId)

- collection_owners
  - id (pk, serial)
  - collectionId (fk -> collections.id, indexed)
  - ownerAddress (string, required)
  - tokenCount (int, default 0)
  - snapshotAt (timestamp, default now)
  - unique composite (collectionId, ownerAddress)

Notes:
- Consider adding a `chains` enum later; start with string.
- Store full `traits` and `stats` JSON unmodified. Be defensive when reading.


### APIs and Server Actions
Place new routes under `app/api/collections/*`. Follow existing patterns in `lib/db/queries.ts`.

- POST `/api/collections`
  - Body: `{ name, slug?, address, chain, imageUrl?, externalUrl?, openseaUrl?, description?, traits, stats? }`
  - Upsert by `(address, chain)` or by `slug` when available
  - Returns `{ collectionId, collection }`

- GET `/api/collections/[id]`
  - Returns full collection details

- POST `/api/collections/[id]/favorites`
  - Body: array of collection identifiers or full objects to upsert + link
  - Upsert any missing collections, then link in `collection_favorites`
  - Returns saved favorites

- GET `/api/collections/[id]/favorites`
  - Paginated list of favorites

- POST `/api/collections/[id]/owners/refresh`
  - Triggers fetch and persists owners snapshot

- GET `/api/collections/[id]/owners?cursor=...`
  - Paginated owners list


### OpenSea Integration (No Chat)
Use server routes/actions to call OpenSea. Option A: call OpenSea HTTP API directly. Option B: call via the existing MCP client if preferred.

- Configure `OPENSEA_API_KEY` in `.env.local`
- Add server utilities (e.g., `lib/opensea.ts`) to:
  - Resolve collection by slug/name/address
  - Fetch trait distributions and stats
  - Fetch owners (by contract address and chain)
- Use these utilities in the API routes above


### UI Components and Files
- `app/collections/new/page.tsx`
  - Hosts the wizard state and renders step content

- `components/collections/collection-wizard.tsx`
  - Props/state: `currentStep`, `selectedCollectionId`, `selectedFavorites`, `owners` (paginated)
  - Renders header (selected collection summary image/name/address/links)
  - Renders step controls (Back/Next)

- `components/collections/collection-search.tsx` (Step 1)
  - Search input + results list (server search)
  - On select, persist via `/api/collections`

- `components/collections/similar-collections.tsx` (Step 2)
  - Displays candidates; favorite toggles; save linkages

- `components/collections/owners.tsx` (Step 3)
  - Paginated owners list; “Refresh” triggers POST refresh route

State considerations:
- `selectedCollectionId`
- `selectedFavorites` (ids or addresses)
- `owners` (paginated list)


### Trait-based Similarity Strategy
- Primary signals: overlap on top traits (e.g., number of traits in common), trait rarity distribution, category/theme tags
- Server computes candidate list using OpenSea trait data
- Present top 5–10 candidates with concise details; user picks favorites


### Owners Fetching Strategy
- Server fetches owners by contract address and chain
- For large collections, batch/paginate and store snapshots with `snapshotAt`


### Env/Config
- `.env.local`: `OPENSEA_API_KEY=...`
- Optional: Wire up OpenSea MCP in `lib/ai/mcp-config.ts` if reusing MCP client server-side


### Testing Plan
- Unit tests
  - OpenSea utility functions: search, traits, owners
  - Schema validation and DB upsert for `/api/collections`
- API tests
  - POST `/api/collections`, POST `/api/collections/[id]/favorites`, owners refresh
- E2E tests (Playwright)
  - Step 1: search/select collection; persisted; Next enabled
  - Step 2: similar collections appear; favorites persist
  - Step 3: owners fetched and displayed with pagination


### Rollout Phases
- Phase 1: Foundation
  - Schema + migration for `collections`
  - `/api/collections` (upsert) route
  - Wizard page `app/collections/new/page.tsx` with Step 1 UI

- Phase 2: Similar + Favorites
  - Add `collection_favorites` table + routes
  - Step 2 UI: show candidates; allow favoriting; persist links

- Phase 3: Owners
  - Add `collection_owners` table + routes
  - Step 3 UI: owners list, refresh action, pagination

- Phase 4: Polish
  - Loading states, error banners, retries/backoff, simple logs
  - Basic analytics for conversion through the steps


### Risks and Mitigations
- OpenSea rate limits: cache responses, add backoff and retries, batch requests
- Trait shape variability: store as JSON and defensively parse; don’t block UI on parse errors
- Large owner lists: paginate and snapshot rather than loading all at once


### Success Criteria
- Users can discover a real collection via search and see it persisted
- Users can select similar collections and save favorites referencing the original
- Users can fetch and view owners for each selected collection with pagination
- All flows work without user accounts initially 