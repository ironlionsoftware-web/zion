import Link from "next/link";
import { LionOfJudah } from "@/components/brand/LionOfJudah";
import { site } from "@/content/site";
import { Container } from "@/components/layout/Container";
import { NatureBackdrop } from "@/components/sections/NatureBackdrop";

export function Hero() {
  return (
    <NatureBackdrop
      src={site.home.heroBackdrop}
      className="border-b border-subtle bg-surface text-center"
    >
      <Container className="section-pad">
        <LionOfJudah className="mx-auto" />
        <p className="font-display mx-auto mt-8 max-w-full px-1 text-lg tracking-[0.12em] text-balance text-[var(--rasta-green)] sm:mt-10 sm:text-2xl sm:tracking-[0.28em] md:text-3xl md:tracking-[0.35em]">
          {site.home.heroMantra.join(" · ")}
        </p>
        <p className="eyebrow mt-6 sm:mt-8">{site.home.heroEyebrow}</p>
        <h1
          id="home-hero-heading"
          className="font-display mx-auto mt-4 max-w-3xl text-3xl font-medium leading-tight tracking-tight text-balance text-[var(--foreground)] sm:mt-5 sm:text-4xl md:text-5xl lg:text-6xl"
        >
          {site.home.heroTitle}
        </h1>
        <p className="prose-content mx-auto mt-8 max-w-2xl">{site.home.heroLead}</p>
        <div className="mt-12 flex w-full max-w-md flex-col items-stretch justify-center gap-3 sm:mx-auto sm:max-w-none sm:flex-row sm:items-center sm:gap-4">
          <Link href="/contact" className="btn btn-primary w-full sm:w-auto">
            Get in touch
          </Link>
          <Link href="/healing-services" className="btn btn-secondary w-full text-center sm:w-auto">
            Healing Services & Classes
          </Link>
        </div>
        <p className="mt-14 flex justify-center gap-4 text-xl text-[var(--rasta-gold)]/50" aria-hidden="true">
          <span>☀</span>
          <span>☥</span>
          <span>✦</span>
          <span>◇</span>
        </p>
      </Container>
    </NatureBackdrop>
  );
}
