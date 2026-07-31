@AGENTS.md

# Iron Lion — project guide for Claude

Read this first in every session. It is the map; the deep detail lives in `docs/`.

## What this is

The website for **Iron Lion Fitness & Holistic Healing LLC** — a real, live, revenue-taking
business run by **Johari Templin** out of **Austin, Texas**, with retreats in **Dominica**.

Live: https://www.ironlionfitnessandhealing.com · Repo: `ironlionsoftware-web/zion` (**public**)

This is not a toy project. Real customers book real sessions and pay real money through it. Bias
toward care on anything touching payments, bookings, or customer data.

## Who it serves

| Practitioner | Offers |
|---|---|
| Johari Templin | Healing + fitness training |
| Johnny Lona | Healing + fitness training |
| Pierre Middleton | Fitness training only |

Dual sessions (Johari + Johnny together) bill at 2× the base service price.

## What it sells

| Offering | Price |
|---|---|
| Reiki & frequency tuning | $120, add-ons +$45 each (Hape, Sananga, Soul Flower, Ayavine) |
| H.E.L.P. sessions | $120 |
| Plant medicine ceremonies | $120 |
| Consultation | $45 |
| Card readings / sliding scale | $45–$120 |
| Fitness — individual | $45–$120 sliding scale; weekly recurring option |
| Fitness — group | $40/person, 2–10 people |
| **Retreats (Dominica)** | **$2,500–$5,000**, $500 deposit + balance |
| Shop | Sea moss, herbs; local delivery fees |

Prices live in `content/site.ts`. **That file is the business source of truth** — change offerings
there, not in components.

## Stack (verified, not assumed)

- **Next.js 16.2.6** App Router · **React 19.2.4** · **TypeScript** · **Tailwind v4**
- **Stripe** checkout + webhook at `/api/stripe/webhook`
- **Neon Postgres** in production; `better-sqlite3` locally at `data/iron-lion.db`
- **Resend** email · **Calendly** scheduling · **OpenAI** for the "Find your path" guide
- **Vercel** hosting · **GitHub** source

> ⚠️ **This project does not use Supabase.** Johari sometimes says Supabase — he's thinking of the
> separate `diaspora-lingo` project. Don't act on that assumption here.

> ⚠️ `AGENTS.md` (imported above) warns that **Next.js 16 has breaking changes** versus older
> training data. Before writing Next-specific code, check `node_modules/next/dist/docs/`. Do not
> trust your memory of Next.js APIs on this repo.

## Layout

```
app/          routes (App Router) + /api routes
components/   UI, grouped by domain: booking, checkout, shop, retreat, fitness, sections, layout
lib/          business logic — db, stripe, booking, retreat, registration, notifications
content/      site.ts (all copy, prices, config) + wellness-catalog.ts
docs/         architecture, audit, research, history, journal  ← see below
data/         local sqlite + retreat JSON (gitignored)
```

Design tokens: Cormorant Garamond (`--font-display`) over Source Sans 3 (`--font-body`), defined
in `app/layout.tsx` and `app/globals.css`.

## The documentation rule — this is not optional

**Every substantive change gets written down in this repo.** Johari's standing instruction: never
lose context anywhere. Concretely:

1. **Build journal** — append to `docs/journal/YYYY-MM.md` for every work session: what was asked,
   what changed, why, and anything left open. A few lines is fine; skipping it is not.
2. **Decisions** — anything architectural or irreversible goes in `docs/decisions/` as a short
   numbered record: context, options, choice, consequences.
3. **Discoveries** — if you learn something non-obvious about the business or the system, add it
   to the relevant `docs/` file so the next session starts ahead of where this one did.

Existing documentation:

| File | What's in it |
|---|---|
| `docs/history/00-CLAUDE-KICKOFF-PROMPT.md` | Johari's founding brief, verbatim |
| `docs/history/CURSOR-HISTORY-BRIEF.md` | Digest of 75 Cursor sessions / 565 prompts |
| `docs/history/cursor-archive/` | Full Cursor transcripts (**gitignored — private**) |
| `docs/history/SIBLING-PROJECTS.md` | The other repos and their backup risk |
| `docs/audit/CODE-AUDIT.md` | Full code audit, ranked by impact |
| `docs/research/MARKET-RESEARCH.md` | Competitive/pricing/marketing research |
| `docs/PAYMENTS.md` | Stripe setup |
| `docs/ROADMAP.md` | What's planned and in what order |

## How to work here

**Johari is a practitioner and founder, not a full-time engineer.** He drives by voice, often from
his phone. So:

- Explain in terms of **revenue, risk, and time saved** — not technical elegance.
- Give **exact commands** to run, one per block. He asks "help me with step 1" constantly; meet
  that with real steps, not summaries.
- When something needs his action in an external dashboard (Stripe, Vercel, Neon, Resend), write
  the click-path out.
- **Opus architects, Sonnet implements.** Delegate bulk reading and mechanical work to parallel
  Sonnet subagents. He's on a $20/month plan — be economical, but never trade away correctness for
  token savings. His words: don't let token efficiency get in the way of world-class work.

## Guardrails

- **Never commit secrets.** The repo is public. `.env*` is gitignored — keep it that way.
- **The cursor-archive is gitignored on purpose** — it's private business history.
- **Money paths need proof, not vibes.** Anything touching `lib/stripe/`, `app/api/checkout/`, or
  the webhook: verify against Stripe's docs and consider `/codex` for a second opinion.
- **Compliance is real here.** Sea moss and plant medicine marketing is regulated. Never write
  copy claiming a product treats, cures, or prevents disease. See the compliance section of
  `docs/research/MARKET-RESEARCH.md` before touching product or ceremony copy.
- **Brand voice:** consent-led, inclusive, grounded, anti-hype. All ages, all fitness levels,
  neurodivergent- and injury-aware. Spiritual depth without fabrication. Johari calls the target
  "positive vibration messaging" — warm and uplifting, never pushy or fear-based.

## Useful commands

```bash
npm run dev
```

```bash
npm run build
```

```bash
npm run lint
```

```bash
npm run db:verify
```

```bash
npm run payments:verify
```

```bash
npm run stripe:listen
```

> `db:verify` currently fails: `better-sqlite3`'s native binding is built for the Node 20 ABI and
> Johari runs Node 24. Fix with `npm rebuild better-sqlite3` before relying on local DB tooling.
