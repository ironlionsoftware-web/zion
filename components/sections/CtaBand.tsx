import Link from "next/link";
import { site } from "@/content/site";
import { Container } from "@/components/layout/Container";
import { NatureBackdrop } from "@/components/sections/NatureBackdrop";

export function CtaBand() {
  return (
    <NatureBackdrop src={site.home.ctaBackdrop} className="section-pad">
      <Container>
        <div className="mx-auto max-w-3xl border border-subtle bg-surface/90 px-5 py-10 text-center backdrop-blur-sm sm:px-14 sm:py-16">
          <h2 id="home-cta-heading" className="section-title">
            {site.home.ctaTitle}
          </h2>
          <p className="prose-content mx-auto mt-5 max-w-xl">{site.home.ctaBody}</p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:flex-wrap">
            <Link href="/contact" className="btn btn-primary">
              Contact us
            </Link>
            <Link href="/shop" className="btn btn-secondary">
              Shop plant medicine
            </Link>
          </div>
        </div>
      </Container>
    </NatureBackdrop>
  );
}
