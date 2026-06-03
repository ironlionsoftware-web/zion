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
          <div className="mt-10 flex w-full max-w-md flex-col items-stretch gap-3 sm:mx-auto sm:max-w-none sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-4">
            <Link href="/contact" className="btn btn-primary w-full sm:w-auto">
              Contact us
            </Link>
            <Link href="/shop" className="btn btn-secondary w-full sm:w-auto">
              Shop plant medicine
            </Link>
          </div>
        </div>
      </Container>
    </NatureBackdrop>
  );
}
