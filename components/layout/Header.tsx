import Link from "next/link";
import { CartButton } from "@/components/cart/CartButton";
import { site } from "@/content/site";
import { Container } from "./Container";
import { MobileMenu } from "./MobileMenu";

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-subtle bg-[var(--cream)]/95 backdrop-blur-sm">
      <div className="symbol-band h-0.5" aria-hidden="true" />
      <Container className="flex items-center justify-between gap-2 py-3 sm:gap-6 sm:py-5">
        <Link
          href="/"
          className="group min-w-0 flex-1 flex-col justify-center pr-2 outline-none focus-visible:ring-2 focus-visible:ring-[var(--rasta-gold)] focus-visible:ring-offset-2 sm:max-w-xs sm:flex-none sm:pr-0"
        >
          <span className="font-display text-sm font-medium leading-snug text-[var(--foreground)] transition group-hover:text-[var(--rasta-green)] sm:text-base md:text-lg motion-reduce:transition-none lg:hidden">
            {site.shortName}
          </span>
          <span className="font-display hidden text-sm font-medium leading-snug break-words text-[var(--foreground)] transition group-hover:text-[var(--rasta-green)] lg:inline lg:text-base xl:text-lg motion-reduce:transition-none">
            {site.brandName}
          </span>
        </Link>

        <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Primary">
          {site.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-sm px-3 py-2 text-sm font-medium text-earth outline-none transition hover:text-[var(--rasta-green)] focus-visible:ring-2 focus-visible:ring-[var(--rasta-gold)] focus-visible:ring-offset-2 motion-reduce:transition-none"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <CartButton />
          <Link href="/contact" className="btn btn-primary hidden text-xs sm:inline-flex">
            Contact
          </Link>
          <MobileMenu nav={site.nav} />
        </div>
      </Container>
    </header>
  );
}
