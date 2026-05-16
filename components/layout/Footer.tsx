import Link from "next/link";
import { site } from "@/content/site";
import { Container } from "./Container";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-stone-200 bg-stone-100 text-stone-800">
      <Container className="py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-800">
              {site.shortName}
            </p>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-stone-600">
              {site.tagline}
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-stone-900">Explore</p>
            <ul className="mt-3 space-y-2 text-sm">
              {site.nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-stone-700 underline-offset-4 outline-none hover:text-stone-950 hover:underline focus-visible:rounded focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-100"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold text-stone-900">Social</p>
            <ul className="mt-3 flex flex-wrap gap-4 text-sm">
              <li>
                <a
                  href={site.social.instagram}
                  className="text-stone-700 underline-offset-4 outline-none hover:text-stone-950 hover:underline focus-visible:rounded focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-100"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Instagram
                </a>
              </li>
              <li>
                <a
                  href={site.social.facebook}
                  className="text-stone-700 underline-offset-4 outline-none hover:text-stone-950 hover:underline focus-visible:rounded focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-100"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Facebook
                </a>
              </li>
              <li>
                <a
                  href={site.social.youtube}
                  className="text-stone-700 underline-offset-4 outline-none hover:text-stone-950 hover:underline focus-visible:rounded focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-100"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  YouTube
                </a>
              </li>
            </ul>
            <ul className="mt-6 space-y-2 border-t border-stone-200 pt-6 text-sm">
              {site.footerNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-stone-700 underline-offset-4 outline-none hover:text-stone-950 hover:underline focus-visible:rounded focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-100"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <p className="mt-10 text-xs text-stone-500">
          © {new Date().getFullYear()} {site.name}. All rights reserved.
        </p>
      </Container>
    </footer>
  );
}
