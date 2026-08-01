# Email setup

**Status:** the code is finished and tested. Customers get confirmation emails the moment a
provider is connected. Until then production sends nothing and logs an error.

Time needed: about 20 minutes, plus up to an hour waiting for DNS.

---

## Why this matters

Before this work, every email the site sent went to **you**. Customers paid real money and heard
nothing back. For a $500 retreat deposit, silence is alarming.

The site now emails the customer for:

- a healing or fitness session booking
- a shop order
- a retreat deposit
- a retreat balance payment

## Why not Resend

Resend was the original plan. It requires an **MX record on a `send.` subdomain** for bounce
handling, and **Wix DNS cannot create MX records on subdomains**. Wix also offers no way to change
nameservers for a domain registered with it — the ⋯ menu has no such option — so moving DNS to
Vercel or Cloudflare is closed off too while the domain stays at Wix.

So the code supports **three** providers and picks whichever has an API key set:

| Provider | DNS needed | Free tier | Works with Wix? |
|---|---|---|---|
| **Postmark** | 1 TXT + 1 CNAME | 100/month | ✅ likely — only the TXT has an underscore |
| **SendGrid** | 3 CNAME + 1 TXT | 100/day | ⚠️ maybe — needs underscores in *CNAME* names |
| **Resend** | 1 MX + 2 TXT | 3,000/month | ❌ no — subdomain MX |

The wrinkle is that Wix is unreliable about **underscores in CNAME hostnames**. SendGrid needs
`s1._domainkey` as a CNAME; Postmark only needs an underscore in a TXT record, which Wix handles.
Try SendGrid first for the free tier — if Wix rejects those records, switch to Postmark. The code
change is one environment variable.

**When the domain eventually moves off Wix, switch to Resend.** Nothing outside
`lib/notifications/providers.ts` needs to change.

---

## Step 1 — create an account

**SendGrid:** https://signup.sendgrid.com — free tier is 100 emails/day forever.
**Postmark:** https://account.postmarkapp.com/sign_up — 100/month free, then about $15/month.

Sign up with `ironlionhealing@gmail.com`.

## Step 2 — authenticate the domain

**SendGrid:** Settings → Sender Authentication → Authenticate Your Domain. DNS host "Other".
Domain `ironlionfitnessandhealing.com`. Leave **Automated Security ON** — that gives CNAME records
rather than an MX one.

**Postmark:** Sending → Domains → Add Domain. Enter `ironlionfitnessandhealing.com`. It shows a
DKIM TXT record and a Return-Path CNAME pointing at `pm.mtasv.net`.

Either way you end up with a short list of records to add.

## Step 3 — add the records in Wix

DNS lives at Wix — nameservers are `ns10.wixdns.net` / `ns11.wixdns.net`. Vercel does **not** serve
DNS for this domain, so adding records there does nothing.

1. https://www.wix.com/my-account/domains
2. Click **ironlionfitnessandhealing.com** — the **Primary domain** in the top card, *not*
   `ironlionfitandhealing.com` under "Unassigned domains". The names are nearly identical.
3. ⋯ → **Manage DNS records**
4. Add each record under its matching type heading (CNAME, TXT)

> **Never click "Try Again"** on the red *"Your domain is set to point away from Wix"* banner. That
> banner is expected — the domain points at Vercel deliberately. Clicking it reconnects the domain
> to Wix and takes the site down.

**On the Name/Host field:** if the provider gives `s1._domainkey.ironlionfitnessandhealing.com`,
Wix usually wants just `s1._domainkey`. If Wix refuses a CNAME with an underscore, that is the
known SendGrid problem — switch to Postmark.

Then click Verify in the provider's dashboard. Usually minutes; can take an hour.

## Step 4 — environment variables in Vercel

**Vercel → project → Settings → Environment Variables.** Add, with **Production** ticked:

| Name | Value |
|---|---|
| `SENDGRID_API_KEY` *or* `POSTMARK_SERVER_TOKEN` | the key from your provider |
| `EMAIL_FROM` | `Iron Lion <hello@ironlionfitnessandhealing.com>` |
| `ADMIN_NOTIFY_EMAIL` | `ironlionhealing@gmail.com` |

`EMAIL_FROM` must use the domain you verified in step 2. The mailbox (`hello@`) does not need to
exist as a real inbox — replies are routed by the reply-to header, which the code sets to
`ADMIN_NOTIFY_EMAIL` automatically.

Set `EMAIL_PROVIDER` only if more than one key is present and you need to force a choice.

Then **redeploy** — environment variables only take effect on a new build.

## Step 5 — test it properly

1. Stripe in test mode
2. Book any session on the live site using an email address that is **not** your provider account's
3. Pay with test card `4242 4242 4242 4242`, any future expiry, any CVC
4. Confirm **two** emails arrive: one to that address, one to you

If the customer email doesn't arrive: check the provider's activity/log page, then Vercel → Logs
for lines starting with `[email]`. Confirm the domain still shows Verified and that you redeployed.

## Local development

Leave the keys unset locally and emails print to your terminal instead of sending — usually what
you want while building.

---

## Still to do

This covers **transactional** email. The **marketing** drip is separate:

1. Create an audience/list with the provider
2. Push everyone who ticks the marketing consent box into it — the site already records this
   consent and currently does nothing with it
3. Build a welcome sequence. Three emails (day 0, 1, 3) rather than one; roughly a 90% lift in
   orders over a single welcome email.

Also worth doing: move the domain off Wix. Wix will block business email, Twilio, and anything else
needing real DNS control. Transferring to Cloudflare or Porkbun costs roughly $10–15/year, usually
less than the Wix renewal.
