# /partner-strategy/portal — Private Partner Strategy Portal

A **private, confidential, access-controlled** business planning portal.

The initial working case is the proposed Kamdhenu India distribution
opportunity. Kamdhenu is treated as a **confidential project — working
business case**, not a confirmed partner or commercial agreement.

## Deliberate design decisions

- **Obscure URL.** The route lives at `/partner-strategy/portal`, is not
  linked from the public site, and is disallowed in `robots.ts`. The public
  header/footer are hidden on any `/partner-strategy/*` route.
- **Server-gated.** Access requires a partner-specific code exchanged for a
  server-signed HMAC cookie. No content is rendered before authentication.
- **20-minute session.** Cookie TTL is 20 minutes. When it expires an
  overlay appears and the partner must re-enter the same code for a fresh
  session.
- **`noindex, nofollow, nocache`** metadata on the gate and the portal.
- **Per-partner local persistence.** All editable planning inputs are
  saved to browser localStorage keyed by partner code, so each partner's
  working set is isolated and never transmitted anywhere.
- **Illustrative-first.** Every commercial number is labelled
  *illustrative* / *planning* / *subject to agreement*. Kamdhenu is never
  presented as a confirmed relationship.

## Access flow

1. Owner shares a per-partner code out-of-band (Signal, email, phone).
2. Partner opens `/partner-strategy/portal`, enters the code.
3. Portal renders 11 dashboard sections; each partner's inputs autosave
   locally.
4. At `00:00` an expiry overlay appears; re-entering the same code opens
   a fresh 20-minute session.

## Configuration

Set these two env vars for the storefront app
(`apps/storefront/.env` or your deployment secret store):

```bash
# Comma-separated partnerName:code pairs. Each partner distinct.
GNS_STRATEGY_CODES="internal:GNS-INT-2026-XXXX,kamdhenu-review:KMD-2026-YYYY"

# Strong random secret used to sign the session cookie. Rotating this
# invalidates every active session immediately.
GNS_STRATEGY_SECRET="paste-a-64-char-random-string-here"
```

If `GNS_STRATEGY_CODES` is unset, a dev fallback code
(`GNS-STRATEGY-2026` → `internal-review`) is enabled so the portal is
testable out-of-box. **Remove or override this in production.**

## Security — do not overstate

This module implements a solid **first line of defence**:

- HMAC-signed httpOnly cookie
- Short TTL (20 min)
- Per-partner code registry
- `noindex` + robots disallow

It does **not** implement, and you should add before production
distribution:

- **Rate limiting** on `/api/partner-strategy/unlock` (Cloudflare rule,
  Vercel Edge middleware, or an in-process limiter). A leaked code
  otherwise remains valid until you rotate it, and unlimited attempts
  make guessing tractable if a code is short.
- **Audit logging** — record successful unlocks (partner, timestamp, IP)
  to a secure log if you need traceability of who accessed what.
- **TLS in production.** The cookie is set `secure: true` in production;
  ensure the deployment is HTTPS-only.
- **CSP** on the portal route to reduce third-party asset risk.
- **Real authentication.** If codes are shared beyond a trusted circle,
  move to per-user login (email link, SSO) rather than a shared code.

A password field in the browser does not by itself constitute security —
the protections above must live at the network / edge layer.

## Files

```
src/app/partner-strategy/portal/
  session.ts              HMAC cookie + per-partner code registry
  page.tsx                Server gate (cookie → gate or portal)
  UnlockGate.tsx          Confidential-style access-code entry
  SessionBar.tsx          Sticky top bar · countdown · expiry overlay
  PlanningPortal.tsx      Shell with left nav + section switcher
  store.ts                Zustand store + per-partner localStorage sync
  ui.tsx                  Reusable primitives (Panel, KPI, Field, Badge)
  sections/
    Overview.tsx
    Territories.tsx       (India table + territory scoring engine)
    Jaunpur.tsx           (21-block editable table)
    Distributors.tsx      (architecture + scoring + pipeline)
    Retailers.tsx         (6-tier profitability engine)
    Profitability.tsx     (distributor + GNS + retailer network sim)
    NationalScale.tsx     (national sim + 5-year roadmap)
    WorkingCapital.tsx    (net WC + cash-conversion + threshold alert)
    Risks.tsx             (living risk register)
    DecisionCentre.tsx    (executive figures + committee actions)
    Notes.tsx             (per-workstream notepad)

src/app/api/partner-strategy/
  unlock/route.ts         POST { code } → sets session cookie
  logout/route.ts         POST → clears cookie

src/app/robots.ts         Disallows /partner-strategy for all crawlers
```

## Content note

Every number in this portal is a **planning input**, not a fact, unless
verified. The words *Illustrative*, *Planning*, *Subject to agreement* and
*Confidential — Working Business Case* are load-bearing — do not remove
them without commercial sign-off.
