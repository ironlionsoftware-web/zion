# 2026-09-21 — Making the site sellable to other practitioners

## Why

Johari wants to sell the website, the practice app and the Mind Body Spirit
app to other holistic healers as a package: $500 setup plus a monthly fee, all
hosted by him. Nobody has asked to buy it yet, so the goal of this session was
a demo he can sell from — not a multi-tenant rewrite.

Plan: `~/.claude/plans/is-there-a-way-zesty-sedgewick.md`

## Decisions

**One codebase, deployed once per practice** — not multi-tenant SaaS. Each
practice gets its own Vercel projects and its own Neon database on Johari's
accounts. Data isolation comes from separate databases rather than a
`tenant_id` column, which is both safer for client health records and weeks
rather than months of work. Revisit real multi-tenancy past ~15 customers.

**v1 is the website and the practice app. Not the mobile app.** White-labelling
a React Native app means an Apple developer account and an App Store review per
customer, which does not fit inside the monthly price.

**Pricing moved** from $25–50 to $500 founding setup and $59 / $129 / $249, with
$129 as the tier to sell. The old number sat below every competitor while
offering more than any of them. AI is included and metered, which makes the
usage cap a required build item, not a nice-to-have.

## What changed in this repo

Method: stand up a second, invented practice ("Willow Creek Healing Arts") from
the same codebase. Every place it still said Iron Lion was a bug.

| | |
|---|---|
| `content/types.ts` | the shape of a practice's content |
| `tenants/<slug>/content.ts` | that practice's values |
| `tenants/<slug>/theme.css` | that practice's palette |
| `tenants/<slug>/public/` | that practice's images, copied over `public/` |
| `content/site.ts` | unchanged import surface — all 69 importers untouched |

Selection is a generated `tenants/active.ts` + `active.css`, written by
`scripts/select-tenant.mjs` before build, dev and test.

Things that turned out to be hard-coded and are now tenant content: the brand
emblem and its alt text; eleven brand strings across ten files; the Calendly
env-var map (three practitioner slugs); ~120 Austin ZIP codes and 23 Texas city
names driving free delivery; the `America/Chicago` booking timezone; three
brand colours written into `globals.css` as raw rgb; the legacy storefront
link; and two exports named after geography (`dominicaPhotos`,
`austinLandscapePhotos`).

## Gotchas worth remembering

- **Turbopack's `resolveAlias` only maps package names, not path prefixes.** An
  `@/tenant` alias silently did nothing and the build quietly served Iron Lion's
  content under the demo's name. A generated file is what resolves consistently
  across tsc, `node --test`, Turbopack and webpack.
- **tsconfig `paths` win over the bundler alias**, which is what made the failure
  look like a success.
- `\/` inside a JS template literal collapses to `/`, which silently broke the
  test loader's regex. The existing code writes `\.` for this reason.
- Iron Lion's `core.autocrlf=true` makes untouched files show as modified in
  `git status` with an empty `git diff`. Not lost work.

## Verification

- 79/79 tests pass; `tsc --noEmit` clean.
- Both tenants build 16 static pages.
- Willow Creek's rendered HTML contains zero occurrences of Iron Lion, Johari,
  Johnny, Lona, Pierre, Middleton, Austin, Dominica or the business phone.
- **Iron Lion is unchanged**: visible text and head metadata are identical on all
  16 pages versus a pre-refactor build of `main`, and every original colour value
  still ships.
- Delivery zones genuinely follow the tenant: Austin TX 78701 is free for
  iron-lion and charged for willow-creek; Asheville NC 28801 is the reverse.

## Not done yet

- **The branch is not pushed.** `zion` is a public repo and this branch contains
  the white-label strategy and a demo tenant. Johari's call whether it goes to a
  private repo instead.
- Iron Lion's photography still sits in `public/` rather than
  `tenants/iron-lion/public/`, so it ships in every tenant's deployment. Nothing
  references it, but it is fetchable. Move it before the first real customer.
- The practice app (`iron-lion-practice`) has not been touched. Its hard-coded
  practitioner roster is the equivalent blocker there.
- Stripe, email sender and DNS are per-deployment setup, not code — they need the
  runbook the plan calls for.
