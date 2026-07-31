#!/usr/bin/env node
/**
 * Reconciles what Stripe actually collected against what this site recorded.
 *
 * Read-only: it never creates, modifies, or refunds anything.
 *
 * Usage — add your LIVE key to .env.local as STRIPE_LIVE_KEY, then:
 *
 *   node scripts/audit-stripe.mjs
 *
 * .env.local is gitignored, so the key stays on your machine. Remove the line afterwards if you
 * would rather not keep it there.
 *
 * Falls back to STRIPE_SECRET_KEY if STRIPE_LIVE_KEY is not set, so it can be pointed at test
 * mode too.
 */

import fs from "node:fs";
import path from "node:path";

function keyFromEnvFile(name) {
  const file = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(file)) return undefined;
  const match = fs.readFileSync(file, "utf8").match(new RegExp(`^\\s*${name}\\s*=\\s*(.+)$`, "m"));
  return match?.[1].trim().replace(/^["']|["']$/g, "");
}

const key =
  process.env.STRIPE_LIVE_KEY?.trim() ||
  keyFromEnvFile("STRIPE_LIVE_KEY") ||
  process.env.STRIPE_SECRET_KEY?.trim() ||
  keyFromEnvFile("STRIPE_SECRET_KEY");

if (!key) {
  console.error("No Stripe key found. Add STRIPE_LIVE_KEY=sk_live_... to .env.local and re-run.");
  process.exit(2);
}

const mode = key.startsWith("sk_live_") ? "LIVE" : key.startsWith("sk_test_") ? "TEST" : "UNKNOWN";

async function stripe(pathname) {
  const res = await fetch(`https://api.stripe.com/v1${pathname}`, {
    headers: { Authorization: `Bearer ${key}` },
  });
  const json = await res.json();
  if (json.error) throw new Error(json.error.message);
  return json;
}

/** Walks a list endpoint to the end rather than stopping at the first page. */
async function all(pathname, cap = 1000) {
  const out = [];
  let startingAfter;
  while (out.length < cap) {
    const qs = `${pathname}${pathname.includes("?") ? "&" : "?"}limit=100${
      startingAfter ? `&starting_after=${startingAfter}` : ""
    }`;
    const page = await stripe(qs);
    out.push(...page.data);
    if (!page.has_more || page.data.length === 0) break;
    startingAfter = page.data[page.data.length - 1].id;
  }
  return out;
}

const usd = (cents) => `$${(cents / 100).toFixed(2)}`;
const day = (unix) => new Date(unix * 1000).toISOString().slice(0, 10);

console.log(`\nStripe audit — ${mode} MODE`);
console.log("=".repeat(60));

const account = await stripe("/account");
console.log(`Account: ${account.business_profile?.name ?? account.id}`);
console.log(`Charges enabled: ${account.charges_enabled} | Payouts enabled: ${account.payouts_enabled}`);

const sessions = await all("/checkout/sessions");
const paid = sessions.filter((s) => s.payment_status === "paid" || s.status === "complete");

console.log(`\nCheckout sessions: ${sessions.length} total, ${paid.length} paid/complete`);

if (paid.length === 0) {
  console.log("\nNo completed checkouts in this mode.");
} else {
  const byType = {};
  let total = 0;
  for (const s of paid) {
    const type = s.metadata?.checkout_type || "(no type)";
    byType[type] ??= { count: 0, cents: 0 };
    byType[type].count += 1;
    byType[type].cents += s.amount_total ?? 0;
    total += s.amount_total ?? 0;
  }

  console.log("\nBy product:");
  for (const [type, v] of Object.entries(byType).sort((a, b) => b[1].cents - a[1].cents)) {
    console.log(`  ${type.padEnd(20)} ${String(v.count).padStart(4)} paid   ${usd(v.cents).padStart(12)}`);
  }
  console.log(`  ${"TOTAL".padEnd(20)} ${String(paid.length).padStart(4)} paid   ${usd(total).padStart(12)}`);

  const dates = paid.map((s) => s.created).sort((a, b) => a - b);
  console.log(`\nFirst payment: ${day(dates[0])}   Most recent: ${day(dates[dates.length - 1])}`);
}

// Retreat bookings were written to the local filesystem before 2026-07-29. Vercel's filesystem is
// read-only, so that write threw and the booking route returned a 500 — meaning a customer could
// not get a booking id, and so could not reach the payment step at all. If any retreat payment
// exists, something worked that we did not expect and it needs looking at by hand.
const retreat = paid.filter((s) => String(s.metadata?.checkout_type ?? "").startsWith("retreat"));

console.log("\n" + "=".repeat(60));
console.log("RETREAT CHECK");
if (retreat.length === 0) {
  console.log("  No retreat payments found.");
  console.log("  Consistent with online retreat booking having been broken in production.");
} else {
  console.log(`  ${retreat.length} retreat payment(s) found — these need manual reconciliation:\n`);
  for (const s of retreat) {
    console.log(`  ${day(s.created)}  ${usd(s.amount_total ?? 0).padStart(10)}  ${s.metadata.checkout_type}`);
    console.log(`     email:      ${s.customer_email ?? s.customer_details?.email ?? "unknown"}`);
    console.log(`     name:       ${s.customer_details?.name ?? "unknown"}`);
    console.log(`     retreat:    ${s.metadata.retreat_type_label || s.metadata.retreat_type_slug || "unknown"}`);
    console.log(`     booking id: ${s.metadata.booking_id ?? "none"} (participant ${s.metadata.participant_index ?? "?"})`);
    console.log(`     session:    ${s.id}\n`);
  }
  console.log("  Contact each of these people to confirm their retreat details by hand —");
  console.log("  their booking record may never have been saved.");
}

// Subscriptions renewed weekly but were only ever emailed, never stored, before 2026-07-30.
const subs = await all("/subscriptions?status=all");
console.log("\n" + "=".repeat(60));
console.log(`SUBSCRIPTIONS: ${subs.length}`);
for (const s of subs) {
  console.log(`  ${s.id}  ${s.status.padEnd(10)}  since ${day(s.created)}  ${s.metadata?.service_label ?? ""}`);
}
if (subs.length === 0) console.log("  None.");

console.log("");
