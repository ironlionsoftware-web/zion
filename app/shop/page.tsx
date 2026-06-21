import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { ShopCatalog } from "@/components/shop/ShopCatalog";
import { ShopPageShell } from "@/components/shop/ShopPageShell";
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
      <div className="section-pad pt-0">
        <ShopPageShell>
          <Container className="max-w-6xl">
            <ShopCatalog />
          </Container>
        </ShopPageShell>
      </div>
    </>
  );
}
