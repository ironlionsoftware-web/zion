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
