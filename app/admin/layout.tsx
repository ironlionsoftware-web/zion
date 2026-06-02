import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[60vh] bg-[var(--background)]">
      <div className="border-b border-subtle bg-[var(--surface)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <p className="font-display text-lg font-medium text-[var(--foreground)]">Iron Lion Admin</p>
          <a
            href="/"
            className="nav-link inline-flex min-h-11 items-center text-sm text-muted hover:text-[var(--foreground)]"
          >
            ← Back to site
          </a>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</div>
    </div>
  );
}
