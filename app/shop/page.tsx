import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { ShopCartBar } from "@/components/shop/ShopCartBar";
import { ShopCatalog } from "@/components/shop/ShopCatalog";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: site.shop.title,
  description: site.shop.intro,
};

export default function ShopPage() {
  const shop = site.shop;

  return (
    <>
      <PageHeader title={shop.title} lead={shop.intro} centered />
      <div className="section-pad pt-0 pb-28">
        <Container className="max-w-6xl">
          <ShopCatalog />
          <p className="card prose-content mt-12 max-w-3xl p-5 text-sm">{shop.disclaimer}</p>
          <ShopCartBar />
        </Container>
      </div>
    </>
  );
}
