# Shadow Garden

Dark anime bot community hub — economy, card collecting, Pokémon, gambling and more for Discord & WhatsApp.

## Run & Operate

- Frontend: `pnpm --filter @workspace/shadow-garden run dev` (port 23536)
- API: `pnpm --filter @workspace/api-server run dev` (port 8080)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind CSS v4 + shadcn/ui
- API: Express 5
- DB: Supabase (PostgreSQL)
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)
- Auth: JWT in localStorage (`sg_token`), `setAuthTokenGetter` wired in AuthContext

## Where things live

- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth for API shape)
- `lib/api-client-react/src/` — generated hooks + custom-fetch with auth token getter
- `artifacts/shadow-garden/src/` — React frontend
  - `pages/` — home, leaderboard, cards, chat, profile, login, register
  - `context/AuthContext.tsx` — JWT auth context
  - `components/Navbar.tsx`, `ParticleBackground.tsx` — shared UI
- `artifacts/api-server/src/routes/` — Express route handlers (auth, profile, leaderboard, cards, chat, stats, anime, pokemon)
- `artifacts/api-server/src/lib/supabase.ts` — Supabase client (service role key)
- `artifacts/api-server/src/lib/auth.ts` — JWT sign/verify + requireAuth/optionalAuth middleware
- `schema.sql` — **Run this in Supabase SQL Editor to create tables!**

## Architecture decisions

- Contract-first: all route shapes defined in OpenAPI spec, code-generated into typed React Query hooks + Zod schemas
- JWT stored in localStorage (`sg_token`), passed via `setAuthTokenGetter` from the `@workspace/api-client-react` custom-fetch module
- Supabase used as the database — routes return empty data gracefully when tables don't exist yet
- Realtime chat via Supabase postgres_changes subscription (requires Realtime enabled on `sg_chat_messages` table)
- Anime data from Anilist GraphQL API; Pokémon data from PokéAPI — both fetched by the API server, not client-side

## Product

- **Landing page** — hero with animated particle background, stats counter, bot carousel, features grid, anime showcase, leaderboard preview, community links (WhatsApp/Discord), live chat preview
- **Leaderboard** — sortable by balance/XP/cards/Pokémon, ranked with medals
- **Card Gallery** — filterable by rarity + search, paginated, 20+ seeded anime cards
- **Live Chat** — real-time via Supabase subscriptions, requires login to send
- **User Profile** — stats, card deck, achievements, editable bio/title
- **Auth** — register (username + optional WhatsApp number), login (username or WhatsApp number)

## ⚠️ REQUIRED: Set up Supabase tables

Run `schema.sql` in your Supabase SQL Editor:
1. Open your Supabase project dashboard
2. Go to **SQL Editor** → New Query
3. Paste the contents of `schema.sql` and click **Run**
4. Enable **Realtime** on the `sg_chat_messages` table (Table Editor → sg_chat_messages → Edit → Enable Realtime)

Until the tables are created, auth/cards/chat/leaderboard return empty data gracefully — everything else still works.

## Community Links

- WhatsApp Group 1: https://chat.whatsapp.com/JNej9puksowC2tDwyS1kta
- Discord: Coming Soon
- WhatsApp Group 2: Coming Soon

## User preferences

- Dark theme: `#0a0a0a` black bg, `#dc2626` red primary, `#991b1b` dark red secondary
- Fonts: Inter only (no Syne) — normal round-edged style
- Design: glassmorphism cards (`.glass-card`), red neon glow (`.glow-text`, `.neon-border`), red gradient buttons (`.btn-primary`)
- Red particles in ParticleBackground (#dc2626, #ef4444, #b91c1c, #991b1b, #fca5a5)

## Groq Vision API

Card image analysis via Groq llama-4-scout-17b:
- `POST /api/cards/analyze` — authenticated, full analysis with tags
- `POST /api/cards/analyze-public` — no auth required, quick analysis
- Body: `{ image_url: string }`
- Returns: `{ character_name, anime_series, description, rarity_hint, tags }`

## Shoob.gg Scraper

Located at `scripts/src/scrape-shoob.ts`:
```
pnpm --filter @workspace/scripts run scrape-shoob
pnpm --filter @workspace/scripts run scrape-shoob -- --dry-run
pnpm --filter @workspace/scripts run scrape-shoob -- --tier T1
```
Requires: `SUPABASE_URL`, `SUPABASE_SERVICE_KEY` env vars.
Optional: `SHOOB_TOKEN` (your shoob.gg bearer token from DevTools → Network tab) for authenticated access to all 40,000+ cards.
Shoob tiers: T1=common, T2=uncommon, T3=rare, T4=epic, T5=legendary, T6=god.

## Gotchas

- Do NOT remove `@workspace/db` thinking it's needed — it was removed; api-server uses Supabase directly
- The `pnpm-workspace.yaml` catalog must be checked before adding new dependencies
- Supabase `exec_sql` rpc does NOT exist by default — use the SQL Editor for migrations
- `setAuthTokenGetter` must be called at login/logout to keep the API client in sync
- Chat realtime uses Supabase channels (`sg-chat`), requires the Supabase Realtime feature to be enabled

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
