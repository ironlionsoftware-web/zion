import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Contact",
  description: site.contact.intro,
};

export default function ContactPage() {
  const mailto = `mailto:${site.contact.email}?subject=${encodeURIComponent("Iron Lion — inquiry")}`;

  return (
    <div className="py-14 sm:py-20">
      <Container className="max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-tight text-stone-950 sm:text-4xl">Contact</h1>
        <p className="mt-4 text-lg leading-relaxed text-stone-700">{site.contact.intro}</p>

        <ul className="mt-10 space-y-6 text-base">
          <li>
            <span className="block text-sm font-semibold uppercase tracking-wide text-stone-500">Email</span>
            <a
              href={mailto}
              className="mt-1 inline-flex min-h-11 items-center text-lg font-medium text-amber-900 underline underline-offset-4 outline-none hover:text-amber-950 focus-visible:rounded focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-50"
            >
              {site.contact.email}
            </a>
          </li>
          <li>
            <span className="block text-sm font-semibold uppercase tracking-wide text-stone-500">Phone</span>
            <a
              href={`tel:${site.contact.phoneTel}`}
              className="mt-1 inline-flex min-h-11 items-center text-lg font-medium text-amber-900 underline underline-offset-4 outline-none hover:text-amber-950 focus-visible:rounded focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-50"
            >
              {site.contact.phoneDisplay}
            </a>
          </li>
          <li>
            <span className="block text-sm font-semibold uppercase tracking-wide text-stone-500">Service area</span>
            <p className="mt-1 text-stone-800">{site.contact.serviceArea}</p>
          </li>
        </ul>

        <p className="mt-10 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-950">
          <strong className="font-semibold">Note:</strong> Replace the email and phone in <code className="rounded bg-amber-100 px-1 py-0.5 text-xs">content/site.ts</code>{" "}
          before launch. Social links in the footer should point to your real profiles.
        </p>
      </Container>
    </div>
  );
}
