import Link from "next/link";
import { Container } from "@/components/layout/Container";

export default function NotFound() {
  return (
    <div className="py-20 sm:py-28">
      <Container className="max-w-xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-800">404</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-stone-950">Page not found</h1>
        <p className="mt-4 text-stone-600">That link may be old, or the page moved as we launch the new site.</p>
        <Link
          href="/"
          className="mt-8 inline-flex min-h-11 items-center justify-center rounded-md bg-stone-950 px-5 text-sm font-semibold text-amber-50 outline-none transition hover:bg-stone-800 focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-50 motion-reduce:transition-none"
        >
          Back to home
        </Link>
      </Container>
    </div>
  );
}
