# GNS Spices Platform

Production-grade monorepo for D2C + B2B + Private Label spice commerce.

## Stack

- **Backend** — NestJS 10 · TypeScript · Prisma · PostgreSQL
- **Frontend** — Next.js 15 (App Router) · React 19 · Tailwind CSS
- **Auth** — Custom JWT (HTTP-only cookies) with rotating refresh tokens
- **DB** — PostgreSQL 16+ (any host; no extensions needed)

## Layout

```
apps/
  api/          NestJS service (REST, /v1)
  storefront/   Next.js 15 customer site
packages/
  shared-types/ (reserved for generated DTOs)
infra/
  docker-compose.yml  (local Postgres + Redis)
```

## Prerequisites

- Node.js 20+
- pnpm 9+  (`corepack enable && corepack prepare pnpm@9.12.0 --activate`)
- A Postgres URL in `.env` (the repo already has a hosted Prisma Postgres URL wired up)

## First-time setup

```bash
# from the repo root
pnpm install

# generate the Prisma client
pnpm --filter @gns/api prisma:generate

# push the schema to the hosted DB (creates the tables)
pnpm --filter @gns/api exec prisma db push

# seed sample catalog, pricing, regions, warehouses, and an admin user
pnpm db:seed
```

Admin user created by the seed:

```
email:    admin@gnsspices.test
password: ChangeMeNow!123
```

## Run

```bash
# terminal 1 — API on :4000
pnpm dev:api

# terminal 2 — storefront on :3000
pnpm dev:web
```

Then open http://localhost:3000.

## Key endpoints (API)

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/v1/auth/register` | Create customer account |
| `POST` | `/v1/auth/login` | Sign in (sets `gns_at` / `gns_rt` cookies) |
| `POST` | `/v1/auth/refresh` | Rotate refresh token |
| `POST` | `/v1/auth/logout` | Revoke refresh token |
| `GET`  | `/v1/products` | Product listing (`?region=&category=&q=&cursor=`) |
| `GET`  | `/v1/products/:slug` | Product detail (region-aware) |
| `GET`  | `/v1/pricing/variants/:id?qty=` | Resolved unit price + ladder |
| `GET`  | `/v1/cart` / `POST` `/v1/cart/items` | Shopping cart |
| `POST` | `/v1/orders` | Place order (transitions cart → `pending_payment`) |
| `GET`  | `/v1/orders` / `/v1/orders/:id` | Order list + detail |
| `GET`  | `/v1/healthz` | Liveness |

## Architecture highlights

- **Monorepo monolith** — one NestJS service, split by clear modules. No premature microservices.
- **Price resolution** — `PricingService.resolveOne` / `resolveMany` picks the right price list (`custom business → tier+region → retail+region`) then applies the highest-`minQty` matching `price_rule`.
- **Region-aware catalog** — `product_region_data` gates availability + localised content + certifications per region.
- **Transactional outbox** — `outbox_events` is written inside the same tx as orders, decoupling email / ERP / search side effects.
- **Refresh token rotation** — reuse detection invalidates the whole token family.
- **RFC 7807 errors** — every API failure returns `application/problem+json`.

## Next modules (not yet implemented)

- Payments (Stripe / Razorpay / Tap) + webhooks
- RFQ workflow endpoints
- Private-label workflow + S3 uploads
- Shipping / carrier adapters
- Admin dashboard (separate Next.js app)
- BullMQ outbox relay + search indexer

See the architecture doc in chat history for the full design.

## Scripts

```bash
pnpm dev               # run api + storefront in parallel
pnpm dev:api           # api only
pnpm dev:web           # storefront only
pnpm db:generate       # prisma generate
pnpm db:migrate        # prisma migrate dev
pnpm db:seed           # run prisma/seed.ts
pnpm infra:up          # start local postgres + redis via docker
```
