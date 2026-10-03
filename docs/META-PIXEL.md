# Meta Pixel — setup

**Why this exists.** Without a pixel, a Facebook ad can only be billed and judged on *clicks*.
With one, Meta can optimise toward people who actually book, and the visitors who looked and left
can be retargeted. For a $120 session, retargeting warm visitors is usually where most of the
revenue sits.

**Status:** code is in place and verified. It stays dormant until the environment variable below is
set, so nothing changes on the live site until Johari adds his pixel id.

---

## What was built

| File | Role |
|---|---|
| `components/analytics/MetaPixel.tsx` | Loads the pixel, fires `PageView` on first load and on every client-side route change |
| `components/layout/RootShell.tsx` | Mounts it beside `PageViewTracker` (skipped on `/admin`) |

Two details worth knowing:

- **It is separate from `PageViewTracker`.** That one feeds the admin dashboard's own first-party
  analytics into Neon. This one reports to Meta. They do not replace each other.
- **The id is validated** (`/^\d{6,20}$/`) before it is interpolated into the inline script,
  because this repo is public and the value ends up inside a `<script>` tag. A non-numeric value
  renders nothing at all rather than injecting it.

`trackMetaEvent()` is exported from the same file for later, to report a real conversion:

```ts
import { trackMetaEvent } from "@/components/analytics/MetaPixel";

trackMetaEvent("Schedule");
```

Call it on a confirmation screen, never on a button click — so the number in Ads Manager means
"money taken", not "someone was interested". Not wired up yet; see Open threads below.

---

## Getting the pixel id

1. Go to **business.facebook.com/events_manager**
2. Left sidebar → **Data sources**
3. If there is no data source yet: **Connect data sources** → **Web** → **Meta Pixel** → **Connect**
   → name it `Iron Lion` → **Continue**
4. Click the pixel in the list. The **id is the number under its name** — 15 or 16 digits.
   Copy it.

## Switching it on

**Local** — add to `.env.local`:

```bash
NEXT_PUBLIC_META_PIXEL_ID=your_pixel_id_here
```

**Production** — Vercel → the `zion` project → **Settings** → **Environment Variables** → **Add**:

- Key: `NEXT_PUBLIC_META_PIXEL_ID`
- Value: the id from step 4
- Environments: **Production** (and Preview if you want to test there)

Then redeploy. `NEXT_PUBLIC_*` variables are baked in at **build time**, so the value does nothing
until a new build runs — setting it without redeploying looks like a broken pixel.

## Confirming it works

Install Meta's **Pixel Helper** Chrome extension, then load
`https://www.ironlionfitnessandhealing.com/offer/healing`. The extension should show one pixel and
one `PageView`. Events Manager also shows live activity under **Test events**.

If the Pixel Helper shows *two* PageViews on one load, the double-fire guard in `MetaPixel.tsx`
has regressed — the inline snippet fires the first view and the effect is meant to skip it.

---

## Privacy

`docs/OPEN-THREADS.md` and `app/legal/privacy/page.tsx` both still carry placeholder privacy
language. Adding a third-party tracker makes that a real gap rather than a cosmetic one: the
privacy page should name Meta as a recipient of visitor data before the pixel runs in production.
Texas has no state privacy law requiring a consent banner today, so this is a disclosure fix, not a
consent-gate build.

## Open threads from this work

- **No conversion events are reported yet.** `trackMetaEvent()` exists but nothing calls it. Until
  a `Schedule` or `Purchase` event fires on the booking confirmation, Meta can optimise for clicks
  only. This is the next meaningful step after the pixel is live.
- **Privacy page** — see above.
