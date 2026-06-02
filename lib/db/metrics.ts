import { intentLabel, pathLabel } from "@/lib/analytics/path-labels";
import type { AdminMetrics } from "@/lib/analytics/types";
import {
  countPageViews,
  countPageViewsForPath,
  countUniqueSessions,
  daysAgoIso,
  topPages,
} from "@/lib/db/page-views";
import { listRegistrations } from "@/lib/db/registrations";
import { listServiceBookings } from "@/lib/db/service-bookings";
import { listShopOrders } from "@/lib/db/shop-orders";

function since(iso: string, dateStr: string): boolean {
  return dateStr >= iso;
}

function topFromMap<T extends string>(
  map: Map<T, number>,
  limit: number,
): { key: T; count: number }[] {
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([key, count]) => ({ key, count }));
}

export async function getAdminMetrics(periodDays = 30): Promise<AdminMetrics> {
  const sincePeriod = daysAgoIso(periodDays);
  const sincePrevious = daysAgoIso(periodDays * 2);
  const since7 = daysAgoIso(7);
  const since30 = daysAgoIso(30);

  const [
    pageViews,
    pageViewsPrevious,
    uniqueVisitors,
    topPagesRaw,
    registrations,
    bookings,
    orders,
    shopPageViews,
    healingPageViews,
    retreatPageViews,
  ] = await Promise.all([
    countPageViews(sincePeriod),
    countPageViews(sincePrevious, sincePeriod),
    countUniqueSessions(sincePeriod),
    topPages(sincePeriod, 8),
    listRegistrations({ limit: 1000 }),
    listServiceBookings({ limit: 1000 }),
    listShopOrders({ limit: 1000 }),
    countPageViewsForPath(sincePeriod, "/shop"),
    countPageViewsForPath(sincePeriod, "/healing-services"),
    countPageViewsForPath(sincePeriod, "/retreat"),
  ]);

  const leadsLast7 = registrations.filter((r) => since(since7, r.registeredAt)).length;
  const leadsLast30 = registrations.filter((r) => since(since30, r.registeredAt)).length;

  const intentMap = new Map<string, number>();
  const sourceMap = new Map<string, number>();
  for (const r of registrations.filter((row) => since(sincePeriod, row.registeredAt))) {
    intentMap.set(r.next, (intentMap.get(r.next) ?? 0) + 1);
    sourceMap.set(r.source, (sourceMap.get(r.source) ?? 0) + 1);
  }

  const serviceMap = new Map<string, { label: string; bookings: number; revenueCents: number }>();
  const practitionerMap = new Map<string, { name: string; bookings: number; revenueCents: number }>();
  let serviceRevenueCents = 0;
  let bookingsLast30 = 0;

  for (const b of bookings) {
    serviceRevenueCents += b.amountCents;
    if (since(since30, b.paidAt)) bookingsLast30 += 1;

    const svc = serviceMap.get(b.serviceSlug) ?? {
      label: b.serviceLabel,
      bookings: 0,
      revenueCents: 0,
    };
    svc.bookings += 1;
    svc.revenueCents += b.amountCents;
    serviceMap.set(b.serviceSlug, svc);

    const prac = practitionerMap.get(b.practitionerSlug) ?? {
      name: b.practitionerName,
      bookings: 0,
      revenueCents: 0,
    };
    prac.bookings += 1;
    prac.revenueCents += b.amountCents;
    practitionerMap.set(b.practitionerSlug, prac);
  }

  const productMap = new Map<string, { name: string; quantity: number; revenueCents: number }>();
  let shopRevenueCents = 0;
  let ordersLast30 = 0;
  let pendingFulfillment = 0;
  let revenueLast30Cents = 0;

  for (const o of orders) {
    shopRevenueCents += o.subtotalCents;
    if (o.status === "pending") pendingFulfillment += 1;
    if (since(since30, o.paidAt)) {
      ordersLast30 += 1;
      revenueLast30Cents += o.subtotalCents;
    }
    for (const line of o.lineItems) {
      const p = productMap.get(line.slug) ?? { name: line.name, quantity: 0, revenueCents: 0 };
      p.quantity += line.quantity;
      p.revenueCents += line.priceCents * line.quantity;
      productMap.set(line.slug, p);
    }
  }

  for (const b of bookings.filter((row) => since(since30, row.paidAt))) {
    revenueLast30Cents += b.amountCents;
  }

  const shopRegistrations = registrations.filter(
    (r) => since(sincePeriod, r.registeredAt) && (r.next === "shop" || r.next === "checkout"),
  ).length;
  const healingRegistrations = registrations.filter(
    (r) => since(sincePeriod, r.registeredAt) && r.next === "book",
  ).length;
  const retreatRegistrations = registrations.filter(
    (r) => since(sincePeriod, r.registeredAt) && r.next === "retreat",
  ).length;
  const shopOrdersInPeriod = orders.filter((o) => since(sincePeriod, o.paidAt)).length;
  const serviceBookingsInPeriod = bookings.filter((b) => since(sincePeriod, b.paidAt)).length;

  const recentActivity: AdminMetrics["recentActivity"] = [
    ...registrations.slice(0, 5).map((r) => ({
      type: "registration" as const,
      label: r.fullName,
      detail: `${intentLabel(r.next)} · ${r.source}`,
      at: r.registeredAt,
    })),
    ...bookings.slice(0, 5).map((b) => ({
      type: "service_booking" as const,
      label: b.fullName,
      detail: `${b.serviceLabel} with ${b.practitionerName}`,
      at: b.paidAt,
    })),
    ...orders.slice(0, 5).map((o) => ({
      type: "shop_order" as const,
      label: o.fullName,
      detail: o.lineItems.map((l) => l.name).join(", "),
      at: o.paidAt,
    })),
  ]
    .sort((a, b) => (a.at < b.at ? 1 : -1))
    .slice(0, 8);

  return {
    generatedAt: new Date().toISOString(),
    periodDays,
    traffic: {
      pageViews,
      pageViewsPrevious,
      uniqueVisitors,
      topPages: topPagesRaw.map((p) => ({
        path: p.path,
        label: pathLabel(p.path),
        views: p.views,
      })),
    },
    leads: {
      total: registrations.length,
      last7Days: leadsLast7,
      last30Days: leadsLast30,
      byIntent: topFromMap(intentMap, 8).map(({ key, count }) => ({
        intent: key,
        label: intentLabel(key),
        count,
      })),
      bySource: topFromMap(sourceMap, 8).map(({ key, count }) => ({ source: key, count })),
    },
    revenue: {
      totalCents: serviceRevenueCents + shopRevenueCents,
      last30DaysCents: revenueLast30Cents,
      serviceCents: serviceRevenueCents,
      shopCents: shopRevenueCents,
    },
    services: {
      totalBookings: bookings.length,
      last30DaysBookings: bookingsLast30,
      topServices: [...serviceMap.entries()]
        .map(([slug, v]) => ({ slug, ...v }))
        .sort((a, b) => b.bookings - a.bookings)
        .slice(0, 6),
      topPractitioners: [...practitionerMap.entries()]
        .map(([slug, v]) => ({ slug, ...v }))
        .sort((a, b) => b.bookings - a.bookings)
        .slice(0, 4),
    },
    shop: {
      totalOrders: orders.length,
      last30DaysOrders: ordersLast30,
      pendingFulfillment,
      topProducts: [...productMap.entries()]
        .map(([slug, v]) => ({ slug, ...v }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 6),
    },
    funnel: {
      shopPageViews,
      shopRegistrations,
      shopOrders: shopOrdersInPeriod,
      healingPageViews,
      healingRegistrations,
      serviceBookings: serviceBookingsInPeriod,
      retreatPageViews,
      retreatRegistrations,
    },
    recentActivity,
  };
}
