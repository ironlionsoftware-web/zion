export type CartLine = {
  slug: string;
  quantity: number;
};

export type CartLineWithProduct = CartLine & {
  name: string;
  priceCents: number;
  imageSrc: string;
  lineTotalCents: number;
};
