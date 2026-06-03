# Card payments (Stripe)

Iron Lion uses **Stripe Checkout** — customers pay on Stripe’s secure page, then return to your site. No card data is stored on your server.

## What accepts cards today

| Flow | Page | API |
|------|------|-----|
| Shop cart | `/shop/checkout` | `POST /api/checkout/shop` |
| Healing services & classes | `/checkout/service` | `POST /api/checkout/service` |
| Donations | `/donation` | `POST /api/checkout/donation` |
| Retreat deposit & balance | `/retreat/booking/...` | `POST /api/checkout/retreat-deposit`, `retreat-balance` |

Optional **installments** (Klarna, Affirm) appear when the customer chooses “Installments” and those methods are enabled in your Stripe Dashboard.

## 1. Stripe account & API keys

1. Create or sign in at [https://dashboard.stripe.com](https://dashboard.stripe.com).
2. **Developers → API keys**.
3. Copy the **Secret key** (starts with `sk_test_` for testing).

Add to `iron-lion/.env.local`:

```env
STRIPE_SECRET_KEY=sk_test_xxxxxxxx
REGISTRATION_SECRET=<long random string>
```

`REGISTRATION_SECRET` signs the “registered customer” cookie required before checkout. Generate one:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Restart the dev server after changing env vars:

```powershell
cd iron-lion
npm run dev
```

Verify:

```powershell
npm run payments:verify
```

## 2. Test a payment locally

1. Open the site (e.g. `http://localhost:3000/shop`), add items, go to **Checkout**.
2. Complete **registration** (name, email, phone).
3. Click **Pay** — you should redirect to Stripe Checkout.
4. Use Stripe test card: `4242 4242 4242 4242`, any future expiry, any CVC, any ZIP.

## 3. Webhooks (recommended)

Webhooks record paid orders in the database and send notifications.

### Local development (Stripe CLI)

1. Install [Stripe CLI](https://stripe.com/docs/stripe-cli).
2. `stripe login`
3. In one terminal:

   ```powershell
   npm run stripe:listen
   ```

4. Copy the printed `whsec_...` into `.env.local` as `STRIPE_WEBHOOK_SECRET`.
5. Restart `npm run dev`.

### Production (e.g. Vercel)

1. **Developers → Webhooks → Add endpoint**
2. URL: `https://YOUR-DOMAIN.com/api/stripe/webhook`
3. Event: **`checkout.session.completed`**
4. Copy the signing secret → `STRIPE_WEBHOOK_SECRET` in production env vars.
5. Also set `STRIPE_SECRET_KEY` (live `sk_live_...`), `REGISTRATION_SECRET`, and `DATABASE_URL` if using Postgres.

## 4. Go live

1. Complete Stripe account activation (business details, bank account).
2. Switch Dashboard to **Live** mode.
3. Replace test keys with **live** `sk_live_...` and a **live** webhook `whsec_...` on your host.
4. Enable **Klarna** / **Affirm** under **Settings → Payment methods** if you want installments.

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| “Card payments are not configured yet” | Add `STRIPE_SECRET_KEY` and restart dev server |
| Pay button missing on shop | Same as above; run `npm run payments:verify` |
| Redirect works but order not saved | Set `STRIPE_WEBHOOK_SECRET` and run `stripe listen` locally |
| “Please complete registration” | Fill the register form before paying |
