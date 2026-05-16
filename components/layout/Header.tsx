import Link from "next/link";
import { site } from "@/content/site";
import { Container } from "./Container";
import { MobileMenu } from "./MobileMenu";

export function Header() {
  return (
    <header className="border-b border-stone-800 bg-stone-950 text-stone-100">
      <Container className="flex items-center justify-between gap-4 py-4">
        <Link
          href="/"
          className="group flex min-h-11 flex-col justify-center outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-950"
        >
          <span className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300/90">
            {site.shortName}
          </span>
          <span className="text-xs text-stone-400 group-hover:text-stone-300 motion-reduce:transition-none">
            Fitness &amp; Healing
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {site.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-stone-200 outline-none hover:text-white focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-950"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <MobileMenu nav={site.nav} />
      </Container>
    </header>
  );
}
