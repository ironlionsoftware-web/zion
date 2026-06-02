export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-sm focus:bg-[var(--rasta-gold)] focus:px-4 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-[var(--earth)] focus:outline-none focus:ring-2 focus:ring-[var(--rasta-green)] focus:ring-offset-2"
    >
      Skip to main content
    </a>
  );
}
