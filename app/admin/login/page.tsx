import { AdminLoginForm } from "@/components/admin/AdminLoginForm";

type PageProps = {
  searchParams: Promise<{ from?: string }>;
};

export default async function AdminLoginPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const from = params.from?.startsWith("/admin") ? params.from : "/admin";

  return (
    <div className="mx-auto max-w-md">
      <h1 className="font-display text-2xl font-medium text-[var(--foreground)]">Sign in</h1>
      <p className="mt-2 text-sm text-muted">Enter your admin password to view registrations, bookings, and orders.</p>
      <AdminLoginForm redirectTo={from} />
    </div>
  );
}
