export type AdminMetrics = {
  generatedAt: string;
  periodDays: number;
  traffic: {
    pageViews: number;
    pageViewsPrevious: number;
    uniqueVisitors: number;
    topPages: { path: string; label: string; views: number }[];
  };
  leads: {
    total: number;
    last7Days: number;
    last30Days: number;
    byIntent: { intent: string; label: string; count: number }[];
    bySource: { source: string; count: number }[];
  };
  revenue: {
    totalCents: number;
    last30DaysCents: number;
    serviceCents: number;
    shopCents: number;
  };
  services: {
    totalBookings: number;
    last30DaysBookings: number;
    topServices: { slug: string; label: string; bookings: number; revenueCents: number }[];
    topPractitioners: { slug: string; name: string; bookings: number; revenueCents: number }[];
  };
  shop: {
    totalOrders: number;
    last30DaysOrders: number;
    pendingFulfillment: number;
    topProducts: { slug: string; name: string; quantity: number; revenueCents: number }[];
  };
  funnel: {
    shopPageViews: number;
    shopRegistrations: number;
    shopOrders: number;
    healingPageViews: number;
    healingRegistrations: number;
    serviceBookings: number;
    retreatPageViews: number;
    retreatRegistrations: number;
  };
  recentActivity: {
    type: "registration" | "service_booking" | "shop_order";
    label: string;
    detail: string;
    at: string;
  }[];
};

export type PageViewInput = {
  sessionId: string;
  path: string;
  referrer?: string | null;
};
