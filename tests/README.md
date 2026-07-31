# Tests

```bash
npm test
```

66 tests, no dependencies. Node 24's built-in test runner and `node:assert` — nothing to install,
nothing to keep updated, no config file.

## What's covered, and why these things

Every test here guards something that costs money, leaks customer data, or was broken once
already. This is not coverage for its own sake.

| File | Guards |
|---|---|
| `money.test.ts` | Sliding-scale bounds, cart pricing from the catalogue (never from the client), retreat price integrity, delivery fees |
| `auth.test.ts` | Admin and registration cookies, Node↔Edge signature interop, retreat booking ownership, registration validation |
| `rate-limit.test.ts` | Per-IP throttling on the endpoints that spend money (Resend, OpenAI, database writes) |
| `retreat-storage.test.ts` | Retreat bookings persist in the database, and payments are claimed exactly once |

Two deserve explanation:

**Node↔Edge cookie interop.** Cookies are signed in the Node runtime and verified again in the
Edge runtime by two separate implementations (`lib/admin/session.ts` and
`lib/auth/edge-cookies.ts`), because `node:crypto` cannot load in Proxy. If those two ever
disagree, every visitor is silently signed out. The tests sign with one and verify with the other.

**Retreat storage.** These bookings were once written as JSON files on disk, which cannot work on
Vercel — the filesystem is read-only outside `/tmp` and each request may land on a different
instance. Retreats are the highest-value product on the site, so these tests exist partly to stop
anyone reintroducing file storage.

## These tests actually bite

Verified by mutation — breaking the code on purpose and confirming the suite notices:

| Reintroduced bug | Tests that failed |
|---|---|
| Proxy accepts any correctly-shaped cookie without checking the signature | 3 |
| Sliding scale drops its bounds check (customer could pay $1 for a $120 session) | 2 |
| Retreat payment claim stops being atomic | 2 |

If you change something here, break it on purpose once and make sure a test complains.

## Adding tests

Name the file `*.test.ts` in this directory and it is picked up. Use `describe`/`it` from
`node:test` and `assert` from `node:assert/strict`.

`tests/loader.mjs` handles the things Next.js normally does: resolving the `@/` alias, adding the
file extension TypeScript source omits, and stubbing `next/headers` (which only exists inside a
real request).

Tests touching the database run against the local SQLite file and clean up after themselves in an
`after()` hook. Never point them at a `DATABASE_URL` you care about.

## Not covered yet

Worth adding as the site grows:

- Stripe webhook signature rejection and end-to-end idempotency (needs a mocked Stripe event)
- Admin API routes returning 401 without a valid cookie (needs a request-level harness)
- SQLite/Postgres parity, so the two backends can't drift as columns are added — they have
  drifted once before, which is why `migrateServiceBookingCeremonyMedicine` exists
- A real end-to-end pass: register → book → Stripe test checkout → webhook → admin dashboard
