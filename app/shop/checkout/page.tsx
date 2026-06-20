import type { Metadata } from "next";
import { Suspense } from "react";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { CheckoutFlow } from "@/components/shop/CheckoutFlow";
import { site } from "@/content/site";
import { requireClientRegistration } from "@/lib/registration/require-page";

export const metadata: Metadata = {
  title: "Checkout",
  description: site.shop.checkoutIntro,
};

export default async function ShopCheckoutPage() {
  const registration = await requireClientRegistration({ next: "checkout" });
  const paymentsReady = Boolean(process.env.STRIPE_SECRET_KEY);

  return (
    <>
      <PageHeader title={site.shop.checkoutTitle} lead={site.shop.checkoutIntro} centered />
      <div className="section-pad pt-0">
        <Container className="max-w-3xl">
          <Suspense fallback={<p className="prose-content text-muted">Loading checkout…</p>}>
            <CheckoutFlow registration={registration} paymentsReady={paymentsReady} />
          </Suspense>
        </Container>
      </div>
    </>
  );
}
