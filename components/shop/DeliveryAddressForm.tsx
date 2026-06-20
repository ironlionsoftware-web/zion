"use client";

import {
  computeDeliveryFeeCents,
  DELIVERY_FEE_CENTS,
  formatDeliveryAddressInline,
  isGreaterAustinArea,
  parseDeliveryAddress,
  type DeliveryAddressInput,
} from "@/lib/shipping/delivery";
import { formatUsd } from "@/lib/cart/products";

export type DeliveryAddressFormValue = Required<{
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
}>;

type DeliveryAddressFormProps = {
  value: DeliveryAddressFormValue;
  onChange: (value: DeliveryAddressFormValue) => void;
  disabled?: boolean;
};

export function emptyDeliveryAddress(): DeliveryAddressFormValue {
  return { line1: "", line2: "", city: "", state: "TX", postalCode: "" };
}

export function deliveryAddressInputFromValue(value: DeliveryAddressFormValue): DeliveryAddressInput {
  return value;
}

export function deliveryFeePreview(value: DeliveryAddressFormValue): {
  feeCents: number | null;
  freeDelivery: boolean | null;
  valid: boolean;
} {
  const parsed = parseDeliveryAddress(value);
  if (!parsed) {
    return { feeCents: null, freeDelivery: null, valid: false };
  }
  const feeCents = computeDeliveryFeeCents(parsed);
  return {
    feeCents,
    freeDelivery: feeCents === 0,
    valid: true,
  };
}

export function DeliveryAddressForm({ value, onChange, disabled }: DeliveryAddressFormProps) {
  const preview = deliveryFeePreview(value);
  const parsed = preview.valid ? parseDeliveryAddress(value)! : null;

  function update(field: keyof DeliveryAddressFormValue, next: string) {
    onChange({ ...value, [field]: next });
  }

  return (
    <fieldset className="mt-4 space-y-5" disabled={disabled} aria-label="Delivery address fields">
      <p className="text-sm text-muted">
        All orders are delivered. Delivery is free within the Greater Austin area; outside Austin, a{" "}
        {formatUsd(DELIVERY_FEE_CENTS)} delivery fee applies.
      </p>

      <div>
        <label htmlFor="delivery-line1" className="block text-sm font-semibold text-[var(--foreground)]">
          Street address <span className="text-[var(--rasta-red)]">*</span>
        </label>
        <input
          id="delivery-line1"
          name="deliveryLine1"
          type="text"
          autoComplete="shipping address-line1"
          required
          value={value.line1}
          onChange={(e) => update("line1", e.target.value)}
          className="form-control mt-2 max-w-xl"
        />
      </div>

      <div>
        <label htmlFor="delivery-line2" className="block text-sm font-semibold text-[var(--foreground)]">
          Apartment, suite, etc. <span className="font-normal text-muted">(optional)</span>
        </label>
        <input
          id="delivery-line2"
          name="deliveryLine2"
          type="text"
          autoComplete="shipping address-line2"
          value={value.line2}
          onChange={(e) => update("line2", e.target.value)}
          className="form-control mt-2 max-w-xl"
        />
      </div>

      <div className="grid max-w-xl gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="delivery-city" className="block text-sm font-semibold text-[var(--foreground)]">
            City <span className="text-[var(--rasta-red)]">*</span>
          </label>
          <input
            id="delivery-city"
            name="deliveryCity"
            type="text"
            autoComplete="shipping address-level2"
            required
            value={value.city}
            onChange={(e) => update("city", e.target.value)}
            className="form-control mt-2"
          />
        </div>
        <div>
          <label htmlFor="delivery-state" className="block text-sm font-semibold text-[var(--foreground)]">
            State <span className="text-[var(--rasta-red)]">*</span>
          </label>
          <input
            id="delivery-state"
            name="deliveryState"
            type="text"
            autoComplete="shipping address-level1"
            required
            maxLength={2}
            value={value.state}
            onChange={(e) => update("state", e.target.value.toUpperCase())}
            className="form-control mt-2 uppercase"
          />
        </div>
        <div>
          <label htmlFor="delivery-postal" className="block text-sm font-semibold text-[var(--foreground)]">
            ZIP code <span className="text-[var(--rasta-red)]">*</span>
          </label>
          <input
            id="delivery-postal"
            name="deliveryPostalCode"
            type="text"
            inputMode="numeric"
            autoComplete="shipping postal-code"
            required
            maxLength={10}
            value={value.postalCode}
            onChange={(e) => update("postalCode", e.target.value)}
            className="form-control mt-2"
          />
        </div>
      </div>

      {parsed ? (
        <p className="text-sm text-[var(--foreground)]" role="status">
          {preview.freeDelivery ? (
            <>
              <span className="font-medium text-[var(--rasta-green)]">Free delivery</span> — your address is in the
              Greater Austin area ({formatDeliveryAddressInline(parsed)}).
            </>
          ) : (
            <>
              Delivery to {parsed.city}, {parsed.state}:{" "}
              <span className="font-medium">{formatUsd(DELIVERY_FEE_CENTS)}</span>
              {!isGreaterAustinArea(parsed) && parsed.state === "TX" ? (
                <span className="text-muted"> (outside Greater Austin)</span>
              ) : null}
            </>
          )}
        </p>
      ) : value.line1 || value.city || value.postalCode ? (
        <p className="text-sm text-muted">Enter a complete delivery address to see shipping cost.</p>
      ) : null}
    </fieldset>
  );
}
