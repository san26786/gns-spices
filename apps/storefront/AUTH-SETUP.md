# GNS Spices auth — one-time setup

Mirrors the B2B Growth Hub pattern: Prisma + Vercel Postgres + bcrypt password + Resend email-link verification + HMAC session cookies.

## 1 · Provision Vercel Postgres (Neon)

1. Vercel dashboard → this project → **Storage** → **Create Database** → **Postgres**.
2. Vercel will inject `POSTGRES_URL`, `POSTGRES_URL_NON_POOLING`, `POSTGRES_PRISMA_URL`, etc. into your project's env.
3. Under **Settings → Environment Variables**, add a new var:
   ```
   DATABASE_URL = ${POSTGRES_PRISMA_URL}
   ```
   (Referencing the pooled URL is what Prisma expects.)

## 2 · Set the other env vars

Under **Settings → Environment Variables**, add:

| Key | Value |
|---|---|
| `AUTH_SECRET` | 32+ char random hex — generate with `openssl rand -hex 32` |
| `RESEND_API_KEY` | From resend.com → API Keys |
| `NEXT_PUBLIC_SITE_URL` | `https://www.gnsspices.com` (or preview URL) |
| `MAIL_FROM` | `GNS Spices <no-reply@gnsspices.com>` |

Add each for all three environments (Production, Preview, Development).

## 3 · Set up Resend

1. Sign up at [resend.com](https://resend.com).
2. **Domains** → **Add** → `gnsspices.com`.
3. Copy the 3 DNS records Resend gives you (MX/TXT for SPF, TXT for DKIM, TXT for DMARC) into your DNS provider (Cloudflare / Namecheap / wherever gnsspices.com is managed).
4. Wait for propagation (usually 5–30 min). Resend will show ✅ once verified.
5. **API Keys** → **Create** → copy into `RESEND_API_KEY` env.

## 4 · Create the database tables

Once `DATABASE_URL` is in Vercel env AND locally in `apps/storefront/.env`:

```bash
cd apps/storefront
npm install
npm run db:push
```

This creates `users`, `sessions`, `verification_tokens`, `password_reset_tokens` from `prisma/schema.prisma`. You only need to do this once per environment. New columns added later? Re-run `npm run db:push`.

## 5 · Deploy

```bash
cd apps/storefront
vercel --prod --yes
```

The build runs `prisma generate` automatically (postinstall hook + build script). No extra flags needed.

## Endpoints reference

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/auth/signup` | `{email, password, firstName?, lastName?, phone?}` — creates account, logs in, emails verification link |
| POST | `/api/auth/login` | `{email, password}` — creates session cookie |
| POST | `/api/auth/logout` | Clears session |
| GET | `/api/auth/verify-email?token=…` | Verifies email, redirects to `/verify-email?status=ok` |
| POST | `/api/auth/resend-verification` | `{email}` — re-sends the verification link |
| POST | `/api/auth/request-password-reset` | `{email}` — sends a 1-hour reset link |
| POST | `/api/auth/reset-password` | `{token, password}` — sets new password + fresh session |
| GET | `/api/auth/me` | Returns current session user (or null) |

## UI pages

| Route | Purpose |
|---|---|
| `/register` | Signup form |
| `/login` | Login form |
| `/verify-email?status=ok|fail|missing` | Verification result screen |
| `/forgot-password` | Request a reset link |
| `/reset-password?token=…` | Choose a new password |
| `/account` | Signed-in landing (already existed) |

## Security notes

- Passwords hashed with bcrypt (cost 12).
- Sessions: HMAC-signed cookie holds a session id; the actual session row lives in the DB. Deleting the row = instant revocation. Cookie is httpOnly, secure (prod), SameSite=lax, 30-day TTL.
- Verification & reset tokens: 32-byte random, SHA-256 hashed at rest, one-shot (`usedAt` marker), expiring TTL (24 h / 1 h respectively).
- Signup + password-reset endpoints don't leak whether an email is registered (constant response either way).
- Login runs bcrypt.compare against a dummy hash for unknown emails to defeat timing-based user enumeration.

## Not yet wired

- WhatsApp OTP — B2B Growth Hub doesn't have it either. Deferred until you decide on a provider (Meta Cloud / Twilio / Gupshup / Interakt).
- `Register` buttons inside udaan.html / udyam.html — will link to `/register?next=/udaan.html` once you've confirmed the setup steps above are complete and the flow works end-to-end.
