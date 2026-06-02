"use client";

import type { AdminMetrics } from "@/lib/analytics/types";

type AdminMetricsPanelProps = {
  metrics: AdminMetrics | null;
  loading: boolean;
  periodDays: number;
  onPeriodChange: (days: number) => void;
};

function formatUsd(cents: number): string {
  return `$${(cents / 100).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function pctChange(current: number, previous: number): string | null {
  if (previous === 0) return current > 0 ? "+100%" : null;
  const change = Math.round(((current - previous) / previous) * 100);
  if (change === 0) return "0%";
  return change > 0 ? `+${change}%` : `${change}%`;
}

function StatCard({
  label,
  value,
  hint,
  trend,
}: {
  label: string;
  value: string;
  hint?: string;
  trend?: string | null;
}) {
  return (
    <div className="card p-5">
      <p className="eyebrow">{label}</p>
      <p className="mt-2 font-display text-3xl font-medium text-[var(--foreground)]">{value}</p>
      {trend ? (
        <p
          className={`mt-1 text-xs font-medium ${
            trend.startsWith("+")
              ? "text-[var(--rasta-green)]"
              : trend.startsWith("-")
                ? "text-[var(--rasta-red)]"
                : "text-muted"
          }`}
        >
          {trend} vs prior period
        </p>
      ) : null}
      {hint ? <p className="mt-2 text-xs text-muted">{hint}</p> : null}
    </div>
  );
}

function BarRow({ label, value, max }: { label: string; value: number; max: number }) {
  const width = max > 0 ? Math.max(4, Math.round((value / max) * 100)) : 0;
  return (
    <li className="space-y-1">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="min-w-0 truncate text-[var(--foreground)]">{label}</span>
        <span className="shrink-0 font-medium tabular-nums">{value.toLocaleString()}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-[var(--surface-muted)]">
        <div className="h-full rounded-full bg-[var(--rasta-green)]" style={{ width: `${width}%` }} />
      </div>
    </li>
  );
}

function FunnelStep({ label, value, nextValue }: { label: string; value: number; nextValue?: number }) {
  const rate =
    nextValue !== undefined && value > 0 ? `${Math.round((nextValue / value) * 100)}% continue` : null;
  return (
    <div className="card flex flex-col items-center p-4 text-center">
      <p className="text-2xl font-medium tabular-nums text-[var(--foreground)]">{value.toLocaleString()}</p>
      <p className="mt-1 text-xs text-muted">{label}</p>
      {rate ? <p className="mt-2 text-[10px] uppercase tracking-wide text-[var(--rasta-green)]">{rate}</p> : null}
    </div>
  );
}

export function AdminMetricsPanel({ metrics, loading, periodDays, onPeriodChange }: AdminMetricsPanelProps) {
  if (loading && !metrics) {
    return <p className="text-sm text-muted">Loading metrics…</p>;
  }
  if (!metrics) {
    return <p className="text-sm text-muted">No metrics available yet.</p>;
  }

  const viewsTrend = pctChange(metrics.traffic.pageViews, metrics.traffic.pageViewsPrevious);
  const topPageMax = metrics.traffic.topPages[0]?.views ?? 1;
  const topProductMax = metrics.shop.topProducts[0]?.quantity ?? 1;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-medium text-[var(--foreground)]">Overview</h2>
          <p className="mt-1 text-sm text-muted">
            Last {metrics.periodDays} days · updated {new Date(metrics.generatedAt).toLocaleString()}
          </p>
        </div>
        <select
          value={periodDays}
          onChange={(e) => onPeriodChange(Number(e.target.value))}
          className="rounded-sm border border-subtle bg-[var(--cream)] px-3 py-2 text-sm"
          aria-label="Metrics period"
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Page views"
          value={metrics.traffic.pageViews.toLocaleString()}
          hint={`${metrics.traffic.uniqueVisitors.toLocaleString()} unique visitors`}
          trend={viewsTrend}
        />
        <StatCard
          label="New registrations"
          value={metrics.leads.byIntent.reduce((s, i) => s + i.count, 0).toLocaleString()}
          hint={`${metrics.leads.last7Days} in last 7 days · ${metrics.leads.total} all time`}
        />
        <StatCard
          label="Revenue (30d)"
          value={formatUsd(metrics.revenue.last30DaysCents)}
          hint={`${formatUsd(metrics.revenue.totalCents)} all time`}
        />
        <StatCard
          label="Pending shop orders"
          value={metrics.shop.pendingFulfillment.toLocaleString()}
          hint={`${metrics.shop.last30DaysOrders} shop orders in 30 days`}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card p-6">
          <h3 className="font-display text-lg font-medium">Most visited pages</h3>
          <p className="mt-1 text-xs text-muted">Where people browse on the site</p>
          <ul className="mt-5 space-y-4">
            {metrics.traffic.topPages.length > 0 ? (
              metrics.traffic.topPages.map((p) => (
                <BarRow key={p.path} label={p.label} value={p.views} max={topPageMax} />
              ))
            ) : (
              <li className="text-sm text-muted">Page views will appear as visitors use the site.</li>
            )}
          </ul>
        </section>

        <section className="card p-6">
          <h3 className="font-display text-lg font-medium">Registration intent</h3>
          <p className="mt-1 text-xs text-muted">What visitors sign up to do</p>
          <ul className="mt-5 space-y-4">
            {metrics.leads.byIntent.length > 0 ? (
              metrics.leads.byIntent.map((i) => (
                <BarRow
                  key={i.intent}
                  label={i.label}
                  value={i.count}
                  max={metrics.leads.byIntent[0]?.count ?? 1}
                />
              ))
            ) : (
              <li className="text-sm text-muted">No registrations in this period.</li>
            )}
          </ul>
        </section>

        <section className="card p-6">
          <h3 className="font-display text-lg font-medium">Top services booked</h3>
          <p className="mt-1 text-xs text-muted">Paid healing sessions</p>
          <ul className="mt-5 space-y-3 text-sm">
            {metrics.services.topServices.length > 0 ? (
              metrics.services.topServices.map((s) => (
                <li key={s.slug} className="flex items-center justify-between gap-3">
                  <span className="min-w-0 truncate">{s.label}</span>
                  <span className="shrink-0 text-muted tabular-nums">
                    {s.bookings} · {formatUsd(s.revenueCents)}
                  </span>
                </li>
              ))
            ) : (
              <li className="text-muted">No paid bookings yet.</li>
            )}
          </ul>
          {metrics.services.topPractitioners.length > 0 ? (
            <>
              <h4 className="mt-6 text-xs font-semibold uppercase tracking-wide text-muted">By practitioner</h4>
              <ul className="mt-3 space-y-2 text-sm">
                {metrics.services.topPractitioners.map((p) => (
                  <li key={p.slug} className="flex justify-between gap-3">
                    <span>{p.name}</span>
                    <span className="text-muted tabular-nums">{p.bookings} sessions</span>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </section>

        <section className="card p-6">
          <h3 className="font-display text-lg font-medium">Top shop products</h3>
          <p className="mt-1 text-xs text-muted">Units sold (all time)</p>
          <ul className="mt-5 space-y-4">
            {metrics.shop.topProducts.length > 0 ? (
              metrics.shop.topProducts.map((p) => (
                <BarRow key={p.slug} label={p.name} value={p.quantity} max={topProductMax} />
              ))
            ) : (
              <li className="text-sm text-muted">No shop orders yet.</li>
            )}
          </ul>
        </section>
      </div>

      <section className="card p-6">
        <h3 className="font-display text-lg font-medium">Conversion funnels</h3>
        <p className="mt-1 text-xs text-muted">Views → sign ups → paid actions in the selected period</p>
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Shop</p>
            <div className="grid grid-cols-3 gap-2">
              <FunnelStep label="Shop views" value={metrics.funnel.shopPageViews} nextValue={metrics.funnel.shopRegistrations} />
              <FunnelStep label="Registrations" value={metrics.funnel.shopRegistrations} nextValue={metrics.funnel.shopOrders} />
              <FunnelStep label="Orders paid" value={metrics.funnel.shopOrders} />
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Healing services</p>
            <div className="grid grid-cols-3 gap-2">
              <FunnelStep label="Page views" value={metrics.funnel.healingPageViews} nextValue={metrics.funnel.healingRegistrations} />
              <FunnelStep label="Registrations" value={metrics.funnel.healingRegistrations} nextValue={metrics.funnel.serviceBookings} />
              <FunnelStep label="Paid bookings" value={metrics.funnel.serviceBookings} />
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Retreats</p>
            <div className="grid grid-cols-2 gap-2">
              <FunnelStep label="Retreat views" value={metrics.funnel.retreatPageViews} nextValue={metrics.funnel.retreatRegistrations} />
              <FunnelStep label="Registrations" value={metrics.funnel.retreatRegistrations} />
            </div>
          </div>
        </div>
      </section>

      <section className="card p-6">
        <h3 className="font-display text-lg font-medium">Recent activity</h3>
        <ul className="mt-4 divide-y divide-subtle">
          {metrics.recentActivity.length > 0 ? (
            metrics.recentActivity.map((item, i) => (
              <li key={`${item.type}-${item.at}-${i}`} className="flex flex-wrap items-start justify-between gap-2 py-3 text-sm">
                <div>
                  <p className="font-medium text-[var(--foreground)]">{item.label}</p>
                  <p className="text-muted">{item.detail}</p>
                </div>
                <time className="text-xs text-muted">{new Date(item.at).toLocaleString()}</time>
              </li>
            ))
          ) : (
            <li className="py-3 text-sm text-muted">No activity yet.</li>
          )}
        </ul>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="card p-5 text-sm">
          <p className="eyebrow">Revenue breakdown</p>
          <ul className="mt-3 space-y-2 text-muted">
            <li className="flex justify-between">
              <span>Services</span>
              <span className="font-medium text-[var(--foreground)]">{formatUsd(metrics.revenue.serviceCents)}</span>
            </li>
            <li className="flex justify-between">
              <span>Shop</span>
              <span className="font-medium text-[var(--foreground)]">{formatUsd(metrics.revenue.shopCents)}</span>
            </li>
          </ul>
        </div>
        <div className="card p-5 text-sm">
          <p className="eyebrow">Top signup sources</p>
          <ul className="mt-3 space-y-2 text-muted">
            {metrics.leads.bySource.length > 0 ? (
              metrics.leads.bySource.map((s) => (
                <li key={s.source} className="flex justify-between">
                  <span className="truncate">{s.source}</span>
                  <span className="font-medium text-[var(--foreground)] tabular-nums">{s.count}</span>
                </li>
              ))
            ) : (
              <li>No source data in this period.</li>
            )}
          </ul>
        </div>
      </section>
    </div>
  );
}
