import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { site } from "@/content/site";

/**
 * The header title/lead come straight from `site` (no async dependency), so it renders for real
 * here instead of as a skeleton — only the booking summary and participant cards below depend on
 * the database read in app/retreat/booking/[id]/page.tsx (`getRetreatBooking`), which talks to
 * Neon Postgres in production. That's the part worth covering while it's in flight.
 */
function SkeletonLine({ className = "" }: { className?: string }) {
  return (
    <div
      className={`h-4 animate-pulse rounded-sm bg-[var(--surface-muted)] motion-reduce:animate-none ${className}`}
    />
  );
}

export default function Loading() {
  return (
    <>
      <PageHeader title={site.retreat.booking.hubTitle} lead={site.retreat.booking.hubIntro} centered />
      <div className="section-pad pt-0" aria-busy="true" role="status">
        <Container className="max-w-3xl">
          <span className="sr-only">Loading your retreat booking…</span>
          <div className="card space-y-3 p-5" aria-hidden="true">
            <SkeletonLine className="w-1/2" />
            <SkeletonLine className="w-2/3" />
            <SkeletonLine className="w-1/3" />
          </div>
          <ul className="mt-6 grid gap-6" aria-hidden="true">
            {[0, 1].map((i) => (
              <li key={i} className="card space-y-3 p-5">
                <SkeletonLine className="w-1/3" />
                <SkeletonLine className="w-1/2" />
                <SkeletonLine className="w-full" />
                <SkeletonLine className="w-5/6" />
              </li>
            ))}
          </ul>
        </Container>
      </div>
    </>
  );
}
