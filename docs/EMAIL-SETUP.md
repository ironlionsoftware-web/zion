# Email setup — Resend

**Status:** the code is done. Customers will receive confirmation emails as soon as you complete
the steps below. Until then, nothing is sent in production and the server logs an error.

Time needed: about 20 minutes, plus up to an hour of waiting for DNS.

---

## Why this matters

Before this change, every email the site sent went to **you**. Customers paid money and heard
nothing back. That's the single most common reason people email asking "did my booking go
through?" — and for a $500 retreat deposit, silence is alarming.

Now the site sends a confirmation to the customer for:

- a healing or fitness session booking
- a shop order
- a retreat deposit
- a retreat balance payment

## The one thing that will trip you up

Resend gives every new account a sandbox sender called `onboarding@resend.dev`. It **only
delivers to the email address that owns the Resend account** — which is you. So if you skip the
domain step, your testing will look like everything works while no customer ever receives
anything.

The code detects this and writes a loud error to your Vercel logs, but the fix is to do Step 2
properly.

---

## Step 1 — Create the Resend account

1. Go to **https://resend.com/signup** and sign up with `ironlionhealing@gmail.com`.
2. Free tier is 3,000 emails/month and 100/day. That is comfortably enough.

## Step 2 — Verify your domain (do not skip)

1. In Resend, go to **Domains → Add Domain**.
2. Enter `ironlionfitnessandhealing.com`.
3. Resend shows you DNS records to add — typically three: a `MX`, a `TXT` for SPF, and a `TXT`
   for DKIM.
4. Add those records wherever your domain's DNS lives. Your domain was moved off Wix, so this is
   most likely **Vercel → your project → Settings → Domains**, or your registrar's DNS panel.
5. Back in Resend, click **Verify**. It's usually a few minutes; it can take up to an hour.

Wait for the domain to show **Verified** before continuing.

> **Also add DMARC.** Once SPF and DKIM verify, add one more TXT record:
> name `_dmarc`, value `v=DMARC1; p=none; rua=mailto:ironlionhealing@gmail.com`.
> Gmail and Yahoo require it for bulk senders and it materially helps deliverability.

## Step 3 — Create an API key

1. In Resend: **API Keys → Create API Key**.
2. Name it `iron-lion-production`, permission **Sending access**.
3. Copy the key (starts with `re_`). You only see it once.

## Step 4 — Add the environment variables in Vercel

Go to **Vercel → your project → Settings → Environment Variables** and add these three for the
**Production** environment (and Preview, if you want test deploys to send):

| Name | Value |
|---|---|
| `RESEND_API_KEY` | the `re_...` key from Step 3 |
| `RESEND_FROM` | `Iron Lion <hello@ironlionfitnessandhealing.com>` |
| `ADMIN_NOTIFY_EMAIL` | `ironlionhealing@gmail.com` |

`RESEND_FROM` must use the domain you verified in Step 2. The mailbox part (`hello@`) does not
need to exist as a real inbox — replies are routed by the `reply_to` header, which the code sets
to your `ADMIN_NOTIFY_EMAIL` automatically.

Then **redeploy** — environment variables only take effect on a new deployment.

## Step 5 — Test it for real

1. Put Stripe in test mode.
2. Book any session on the live site using a **different** email address than your Resend account
   (borrow a friend's, or use a second address of your own).
3. Pay with Stripe's test card `4242 4242 4242 4242`, any future expiry, any CVC.
4. Confirm **two** emails arrive: one to that customer address, one to you.

If the customer email doesn't arrive:

- Check **Resend → Logs**. It shows every send attempt and why one failed.
- Check **Vercel → your project → Logs** for lines starting with `[email]`.
- Confirm the domain still shows Verified and that you redeployed after adding the variables.

## For local development

Add the same variables to `.env.local`. If you leave `RESEND_API_KEY` unset locally, emails are
printed to your terminal instead of being sent — which is usually what you want while building.

---

## What comes next (not built yet)

This covers **transactional** email — messages triggered by a specific action. The **marketing**
drip campaign is separate and still to do:

1. Create a Resend **Audience** (their contact list).
2. Push everyone who ticks the marketing consent box into that audience. The site already
   collects and stores this consent — it currently goes nowhere.
3. Build a welcome sequence. Research suggests three emails (day 0, day 1, day 3) rather than
   one; roughly a 90% lift in orders over a single welcome email.

One thing to fix when we get there: **retreat registration currently forces marketing consent** —
you cannot book a retreat without agreeing to marketing. That makes the consent legally weak,
adds friction to your highest-value product, and sits awkwardly with a consent-led brand. It
should be an optional checkbox like it is everywhere else on the site.
