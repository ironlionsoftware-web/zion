# Tenants

One codebase, one deployment per practice.

Each directory here is a business that runs on this platform. `content.ts`
holds everything that makes the site *theirs* — name, contact details,
practitioners, services, prices, shop catalogue, retreat copy, photography.
No code changes are needed to add one.

| Tenant | What it is |
|---|---|
| `iron-lion` | Iron Lion Fitness & Holistic Healing — the live business |
| `willow-creek` | A fictional practice used for demos and for catching hard-coded values |

## Running a different tenant

```bash
TENANT=willow-creek npm run dev
TENANT=willow-creek npm run build
```

`TENANT` defaults to `iron-lion`, so the live site is unaffected by anything
here. On Vercel, set `TENANT` as an environment variable on that practice's
project.

## How the switch works

`scripts/select-tenant.mjs` runs before `build`, `dev` and `test` and writes
`tenants/active.ts`, a one-line re-export of the chosen tenant. Everything
else imports `@/content/site`, which reads from that file.

It is a generated file rather than a bundler alias because Turbopack's
`resolveAlias` only maps package names, not path prefixes. A real file
resolves the same way for TypeScript, the test runner, Turbopack and webpack,
and it means `TENANT=...` can never silently fail to apply — the build prints
which tenant it used.

`tenants/active.ts` is generated and git-ignored. Do not edit or commit it.

## Before you deploy a change

```bash
npm run build:all
```

Builds every practice in turn and refuses to pass if any of them breaks. One
codebase serving everyone is the point — a fix reaches all of them at once —
but the same property means a change that works for the practice you were
testing can break another. Almost always because new platform code reads a
config field only that one tenant happens to have.

It catches two things:

- **A build failure** in any practice, naming the missing field.
- **A leak**: one practice's name, email domain or location appearing in
  another's rendered pages. That means a value is written into platform code
  instead of tenant content.

Nothing is deployed either way. It exits non-zero, so CI can gate on it.

## Adding a practice

1. `cp -r tenants/willow-creek tenants/their-slug`
2. Edit `content.ts` — work top to bottom; every value is theirs.
3. Put their images in `public/images/` and point `brand.emblem` at their mark.
4. `TENANT=their-slug npm run build`
5. Check nothing of yours leaked into theirs:

   ```bash
   grep -rliE 'iron.?lion|johari|austin|dominica' .next/server/app --include=*.html
   ```

   Anything this prints is a value still written into code instead of living
   here. That is a bug in the platform, not in their content — fix it by
   moving the value into `content.ts` for every tenant.

## What is deliberately *not* here

Secrets. Stripe keys, the database URL, email credentials and Calendly tokens
are environment variables on that practice's own deployment, so one practice
can never read another's. Per-practitioner Calendly links can be overridden
with `CALENDLY_URL_<SLUG>` — for example `CALENDLY_URL_ROSA_DELGADO`.
