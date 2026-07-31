import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseSlidingScaleAmount } from "@/lib/booking/sliding-scale";
import { cartSubtotalCents, resolveCartLines } from "@/lib/cart/products";
import { MAX_CART_QUANTITY, type CartLine } from "@/lib/cart/types";
import { resolveRetreatPricing, retreatPricingForBooking } from "@/lib/retreat/pricing";
import { computeDeliveryFeeCents, isGreaterAustinArea } from "@/lib/shipping/delivery";
import type { RetreatBooking } from "@/lib/retreat/types";

/**
 * Everything here guards a path where a bug costs real money — a customer underpaying, a booking
 * priced from client-supplied input, or a delivery fee waived by accident.
 */

const scale = { minCents: 4500, maxCents: 12000, defaultCents: 7500 };

describe("sliding scale amounts", () => {
  it("accepts amounts inside the range, including both bounds", () => {
    assert.equal(parseSlidingScaleAmount(4500, scale), 4500);
    assert.equal(parseSlidingScaleAmount(7500, scale), 7500);
    assert.equal(parseSlidingScaleAmount(12000, scale), 12000);
  });

  it("rejects anything outside the range", () => {
    assert.equal(parseSlidingScaleAmount(4499, scale), null);
    assert.equal(parseSlidingScaleAmount(12001, scale), null);
    assert.equal(parseSlidingScaleAmount(0, scale), null);
    assert.equal(parseSlidingScaleAmount(-7500, scale), null);
  });

  it("rejects non-integers and junk, so a crafted request cannot underpay", () => {
    for (const value of [45.5, "abc", null, undefined, {}, [], NaN, Infinity, "45e3"]) {
      assert.equal(parseSlidingScaleAmount(value, scale), null, `expected ${String(value)} to be rejected`);
    }
  });

  it("accepts a numeric string, since form values arrive as strings", () => {
    assert.equal(parseSlidingScaleAmount("7500", scale), 7500);
  });
});

describe("cart pricing", () => {
  it("prices from the catalogue and ignores any client-supplied price", () => {
    const line = { slug: "nettle", quantity: 2, priceCents: 1 } as unknown as CartLine;
    const [resolved] = resolveCartLines([line]);
    assert.equal(resolved.priceCents, 2000, "must use the catalogue price, not the client's");
    assert.equal(resolved.lineTotalCents, 4000);
  });

  it("drops unknown products rather than charging zero", () => {
    assert.deepEqual(resolveCartLines([{ slug: "not-a-real-product", quantity: 1 }]), []);
  });

  it("drops a configurable product with no variant chosen", () => {
    assert.deepEqual(resolveCartLines([{ slug: "bottled-teas", quantity: 1 }]), []);
  });

  it("drops a configurable product with a bogus variant", () => {
    assert.deepEqual(resolveCartLines([{ slug: "bottled-teas", variantId: "nope|nope", quantity: 1 }]), []);
  });

  it("drops non-positive quantities", () => {
    assert.deepEqual(resolveCartLines([{ slug: "nettle", quantity: 0 }]), []);
    assert.deepEqual(resolveCartLines([{ slug: "nettle", quantity: -5 }]), []);
  });

  it("never produces NaN in a subtotal", () => {
    const lines = resolveCartLines([
      { slug: "nettle", quantity: 1 },
      { slug: "ghost-product", quantity: 3 },
    ]);
    const subtotal = cartSubtotalCents(lines);
    assert.ok(Number.isInteger(subtotal), `subtotal was ${subtotal}`);
    assert.equal(subtotal, 2000);
  });

  it("caps quantity so a typo cannot create a five-figure order", () => {
    assert.equal(MAX_CART_QUANTITY, 25);
  });
});

describe("retreat pricing", () => {
  it("prices each retreat type from the catalogue", () => {
    const couples = resolveRetreatPricing("couples-bonding-healing");
    assert.ok(couples.ok);
    assert.equal(couples.totalCents, 500_000);
    assert.equal(couples.depositCents, 50_000);
    assert.equal(couples.balanceCents, 450_000);
  });

  it("requires a duration for the fitness retreat and prices each one", () => {
    const missing = resolveRetreatPricing("holistic-fitness-vitality-weight-loss");
    assert.equal(missing.ok, false);

    const twoWeeks = resolveRetreatPricing("holistic-fitness-vitality-weight-loss", "2-weeks");
    assert.ok(twoWeeks.ok);
    assert.equal(twoWeeks.totalCents, 300_000);

    const oneMonth = resolveRetreatPricing("holistic-fitness-vitality-weight-loss", "1-month");
    assert.ok(oneMonth.ok);
    assert.equal(oneMonth.totalCents, 500_000);
  });

  it("rejects an unknown retreat type instead of falling back to a default price", () => {
    assert.equal(resolveRetreatPricing("free-retreat-please").ok, false);
  });

  it("deposit plus balance always equals the total", () => {
    for (const [slug, duration] of [
      ["couples-bonding-healing", undefined],
      ["group-couples-bonding", undefined],
      ["holistic-fitness-vitality-weight-loss", "2-weeks"],
      ["holistic-fitness-vitality-weight-loss", "1-month"],
    ] as const) {
      const quote = resolveRetreatPricing(slug, duration);
      assert.ok(quote.ok, `${slug} should price`);
      assert.equal(
        quote.depositCents + quote.balanceCents,
        quote.totalCents,
        `${slug} deposit + balance must equal total`,
      );
    }
  });

  it("bills a stored booking from its own locked-in price, not the current catalogue", () => {
    // A booking made before a price change must still be honoured at the agreed price.
    const booking = {
      id: "b1",
      createdAt: new Date().toISOString(),
      totalCents: 250_000,
      depositCents: 50_000,
      balanceCents: 200_000,
      participants: [],
    } as unknown as RetreatBooking;

    const quote = retreatPricingForBooking(booking);
    assert.equal(quote.totalCents, 250_000);
    assert.equal(quote.balanceCents, 200_000);
  });
});

describe("delivery fees", () => {
  it("waives the fee inside greater Austin", () => {
    assert.equal(computeDeliveryFeeCents({ line1: "1 Main", city: "Austin", state: "TX", postalCode: "78701" }), 0);
  });

  it("charges the fee outside greater Austin", () => {
    assert.equal(
      computeDeliveryFeeCents({ line1: "1 Main", city: "Dallas", state: "TX", postalCode: "75201" }),
      1000,
    );
  });

  it("never treats another state as local, whatever the city is called", () => {
    assert.equal(isGreaterAustinArea({ city: "Austin", state: "MN", postalCode: "55912" }), false);
  });

  it("tolerates casing and whitespace in the address", () => {
    assert.equal(isGreaterAustinArea({ city: "  austin ", state: " tx ", postalCode: " 78701 " }), true);
  });

  it("falls back to the city when the postcode is malformed", () => {
    assert.equal(isGreaterAustinArea({ city: "Austin", state: "TX", postalCode: "not-a-zip" }), true);
  });
});
