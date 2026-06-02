"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminMetricsPanel } from "@/components/admin/AdminMetricsPanel";
import type { AdminMetrics } from "@/lib/analytics/types";
import type { DbRegistration } from "@/lib/db/types";
import type { DbServiceBooking } from "@/lib/db/types";
import type { DbShopOrder } from "@/lib/db/types";

type Tab = "overview" | "registrations" | "bookings" | "orders";

export function AdminDashboard() {
  const [tab, setTab] = useState<Tab>("overview");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [periodDays, setPeriodDays] = useState(30);
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [registrations, setRegistrations] = useState<DbRegistration[]>([]);
  const [bookings, setBookings] = useState<DbServiceBooking[]>([]);
  const [orders, setOrders] = useState<DbShopOrder[]>([]);
  const [orderStatusFilter, setOrderStatusFilter] = useState<"" | "pending" | "fulfilled">("");

  const loadMetrics = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/metrics?days=${periodDays}`);
      const data = (await res.json()) as { metrics?: AdminMetrics; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Failed to load metrics");
      setMetrics(data.metrics ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load metrics.");
    } finally {
      setLoading(false);
    }
  }, [periodDays]);

  const load = useCallback(async () => {
    if (tab === "overview") {
      await loadMetrics();
      return;
    }

    setLoading(true);
    setError("");
    try {
      const q = search.trim() ? `?search=${encodeURIComponent(search.trim())}` : "";
      if (tab === "registrations") {
        const res = await fetch(`/api/admin/registrations${q}`);
        const data = (await res.json()) as { registrations?: DbRegistration[]; error?: string };
        if (!res.ok) throw new Error(data.error ?? "Failed to load");
        setRegistrations(data.registrations ?? []);
      } else if (tab === "bookings") {
        const res = await fetch(`/api/admin/service-bookings${q}`);
        const data = (await res.json()) as { bookings?: DbServiceBooking[]; error?: string };
        if (!res.ok) throw new Error(data.error ?? "Failed to load");
        setBookings(data.bookings ?? []);
      } else {
        const params = new URLSearchParams();
        if (search.trim()) params.set("search", search.trim());
        if (orderStatusFilter) params.set("status", orderStatusFilter);
        const res = await fetch(`/api/admin/shop-orders?${params.toString()}`);
        const data = (await res.json()) as { orders?: DbShopOrder[]; error?: string };
        if (!res.ok) throw new Error(data.error ?? "Failed to load");
        setOrders(data.orders ?? []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data.");
    } finally {
      setLoading(false);
    }
  }, [tab, search, orderStatusFilter, loadMetrics]);

  useEffect(() => {
    void load();
  }, [load]);

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  async function markFulfilled(order: DbShopOrder) {
    const res = await fetch("/api/admin/shop-orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: order.id, status: "fulfilled" }),
    });
    if (res.ok) void load();
  }

  async function saveNotes(order: DbShopOrder, internalNotes: string) {
    const res = await fetch("/api/admin/shop-orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: order.id, internalNotes }),
    });
    if (res.ok) void load();
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "registrations", label: "Registrations" },
    { id: "bookings", label: "Service bookings" },
    { id: "orders", label: "Shop orders" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`rounded-sm px-4 py-2 text-sm font-medium transition ${
                tab === t.id
                  ? "bg-[var(--rasta-green)] text-white"
                  : "border border-subtle bg-[var(--surface)] text-[var(--foreground)] hover:bg-[var(--surface-muted)]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <button type="button" onClick={() => void logout()} className="text-sm text-muted hover:underline">
          Sign out
        </button>
      </div>

      {tab === "overview" ? (
        <div className="flex justify-end">
          <button type="button" onClick={() => void loadMetrics()} className="btn btn-primary text-sm" disabled={loading}>
            {loading ? "Loading…" : "Refresh metrics"}
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap items-end gap-4">
          <div className="min-w-[200px] flex-1">
            <label htmlFor="admin-search" className="eyebrow">
              Search
            </label>
            <input
              id="admin-search"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Name, email, service…"
              className="mt-2 w-full rounded-sm border border-subtle bg-[var(--cream)] px-4 py-2 text-sm"
            />
          </div>
          {tab === "orders" ? (
            <div>
              <label htmlFor="order-status" className="eyebrow">
                Status
              </label>
              <select
                id="order-status"
                value={orderStatusFilter}
                onChange={(e) => setOrderStatusFilter(e.target.value as typeof orderStatusFilter)}
                className="mt-2 block rounded-sm border border-subtle bg-[var(--cream)] px-3 py-2 text-sm"
              >
                <option value="">All</option>
                <option value="pending">Pending</option>
                <option value="fulfilled">Fulfilled</option>
              </select>
            </div>
          ) : null}
          <button type="button" onClick={() => void load()} className="btn btn-primary" disabled={loading}>
            {loading ? "Loading…" : "Refresh"}
          </button>
          {tab === "registrations" ? (
            <a
              href={`/api/admin/registrations?format=csv${search.trim() ? `&search=${encodeURIComponent(search.trim())}` : ""}`}
              className="btn border border-subtle bg-[var(--surface)] text-sm"
            >
              Export CSV
            </a>
          ) : null}
        </div>
      )}

      {error ? (
        <p className="text-sm text-[var(--rasta-red)]" role="alert">
          {error}
        </p>
      ) : null}

      {tab === "overview" ? (
        <AdminMetricsPanel
          metrics={metrics}
          loading={loading}
          periodDays={periodDays}
          onPeriodChange={setPeriodDays}
        />
      ) : null}

      {tab === "registrations" ? (
        <div className="overflow-x-auto rounded-sm border border-subtle">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-[var(--surface-muted)] text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Next</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Registered</th>
              </tr>
            </thead>
            <tbody>
              {registrations.map((r) => (
                <tr key={r.id} className="border-t border-subtle">
                  <td className="px-4 py-3 font-medium">{r.fullName}</td>
                  <td className="px-4 py-3">{r.email}</td>
                  <td className="px-4 py-3">{r.phone}</td>
                  <td className="px-4 py-3">{r.next}</td>
                  <td className="px-4 py-3">{r.source}</td>
                  <td className="px-4 py-3 text-muted">{new Date(r.registeredAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {registrations.length === 0 && !loading ? (
            <p className="p-6 text-sm text-muted">No registrations yet.</p>
          ) : null}
        </div>
      ) : null}

      {tab === "bookings" ? (
        <div className="overflow-x-auto rounded-sm border border-subtle">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-[var(--surface-muted)] text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Service</th>
                <th className="px-4 py-3">Ceremony</th>
                <th className="px-4 py-3">Practitioner</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Paid</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} className="border-t border-subtle">
                  <td className="px-4 py-3">
                    <p className="font-medium">{b.fullName}</p>
                    <p className="text-muted">{b.email}</p>
                  </td>
                  <td className="px-4 py-3">{b.serviceLabel}</td>
                  <td className="px-4 py-3 text-muted">{b.ceremonyMedicineLabel ?? "None"}</td>
                  <td className="px-4 py-3">{b.practitionerName}</td>
                  <td className="px-4 py-3">${(b.amountCents / 100).toFixed(2)}</td>
                  <td className="px-4 py-3 text-muted">{new Date(b.paidAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {bookings.length === 0 && !loading ? (
            <p className="p-6 text-sm text-muted">No paid service bookings yet.</p>
          ) : null}
        </div>
      ) : null}

      {tab === "orders" ? (
        <ul className="space-y-4">
          {orders.map((o) => (
            <li key={o.id} className="card p-5 text-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-[var(--foreground)]">
                    {o.fullName} · {o.email}
                  </p>
                  <p className="mt-1 text-muted">
                    {o.lineItems.map((l) => `${l.name} ×${l.quantity}`).join(", ")} · $
                    {(o.subtotalCents / 100).toFixed(2)}
                  </p>
                  {o.fulfillmentNote ? (
                    <p className="mt-2">
                      <span className="font-medium">Fulfillment:</span> {o.fulfillmentNote}
                    </p>
                  ) : null}
                  <p className="mt-1 text-xs text-muted">Paid {new Date(o.paidAt).toLocaleString()}</p>
                </div>
                <span
                  className={`rounded-sm px-2 py-1 text-xs font-medium ${
                    o.status === "fulfilled"
                      ? "bg-[var(--rasta-green)]/15 text-[var(--rasta-green)]"
                      : "bg-[var(--rasta-gold)]/20 text-[var(--foreground)]"
                  }`}
                >
                  {o.status}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                {o.status === "pending" ? (
                  <button type="button" className="btn btn-primary text-xs" onClick={() => void markFulfilled(o)}>
                    Mark fulfilled
                  </button>
                ) : null}
                <label className="flex min-w-[200px] flex-1 flex-col gap-1 text-xs">
                  Internal notes
                  <input
                    type="text"
                    defaultValue={o.internalNotes ?? ""}
                    onBlur={(e) => {
                      if (e.target.value !== (o.internalNotes ?? "")) {
                        void saveNotes(o, e.target.value);
                      }
                    }}
                    className="rounded-sm border border-subtle bg-[var(--cream)] px-3 py-2"
                  />
                </label>
              </div>
            </li>
          ))}
          {orders.length === 0 && !loading ? (
            <p className="text-sm text-muted">No shop orders yet.</p>
          ) : null}
        </ul>
      ) : null}
    </div>
  );
}
