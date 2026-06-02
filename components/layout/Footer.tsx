import Link from "next/link";
import { site } from "@/content/site";
import { Container } from "./Container";

const externalSuffix = (
  <span className="sr-only"> (opens in new tab)</span>
);

export function Footer() {
  return (
    <footer className="relative z-20 mt-auto border-t border-subtle bg-surface">
      <div className="symbol-band h-0.5" aria-hidden="true" />
      <Container className="py-14 sm:py-16">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="font-display text-xl font-medium break-words text-[var(--foreground)] sm:text-2xl">
              {site.brandName}
            </p>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">{site.tagline}</p>
            <p className="mt-6 flex gap-2 text-lg text-[var(--rasta-green)]/40" aria-hidden="true">
              <span>☀</span>
              <span>☥</span>
              <span>✦</span>
            </p>
          </div>
          <div>
            <p className="eyebrow" id="footer-explore-heading">
              Explore
            </p>
            <ul className="mt-4 space-y-2.5 text-sm" aria-labelledby="footer-explore-heading">
              {site.nav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="nav-link link-accent hover:underline">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="eyebrow" id="footer-contact-heading">
              Contact
            </p>
            <ul className="mt-4 space-y-2.5 text-sm text-muted" aria-labelledby="footer-contact-heading">
              <li>
                <a href={`mailto:${site.contact.email}`} className="nav-link link-accent inline-flex min-h-11 items-center hover:underline">
                  {site.contact.email}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${site.contact.phoneTel}`}
                  className="nav-link link-accent inline-flex min-h-11 items-center hover:underline"
                >
                  {site.contact.phoneDisplay}
                </a>
              </li>
              <li className="pt-2 leading-relaxed">{site.contact.serviceArea}</li>
            </ul>
            <p className="eyebrow mt-8" id="footer-connect-heading">
              Connect
            </p>
            <ul className="mt-4 flex flex-wrap gap-5 text-sm" aria-labelledby="footer-connect-heading">
              <li>
                <a
                  href={site.social.instagram}
                  className="nav-link link-accent hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Instagram
                  {externalSuffix}
                </a>
              </li>
              <li>
                <a
                  href={site.social.facebook}
                  className="nav-link link-accent hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Facebook
                  {externalSuffix}
                </a>
              </li>
              <li>
                <a
                  href={site.social.youtube}
                  className="nav-link link-accent hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  YouTube
                  {externalSuffix}
                </a>
              </li>
            </ul>
            <ul className="mt-8 flex flex-wrap gap-4 border-t border-subtle pt-6 text-xs text-muted">
              {site.footerNav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="nav-link hover:text-[var(--foreground)] hover:underline">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <p className="mt-12 text-xs text-muted/80">
          © {new Date().getFullYear()} {site.name}. All rights reserved.
        </p>
      </Container>
    </footer>
  );
}
