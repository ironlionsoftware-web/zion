// Upper bound on a single cart line's quantity, enforced both client-side (input max) and
// server-side (checkout validation), so a crafted request can't force an absurd Stripe line item.
export const MAX_CART_QUANTITY = 25;

export type CartLine = {
  slug: string;
  variantId?: string;
  quantity: number;
};

export type CartLineWithProduct = CartLine & {
  key: string;
  name: string;
  priceCents: number;
  imageSrc: string;
  lineTotalCents: number;
};
