const PATH_LABELS: Record<string, string> = {
  "/": "Home",
  "/shop": "Shop",
  "/shop/checkout": "Shop checkout",
  "/healing-services": "Healing Services & Classes",
  "/healing-services/classes": "Classes catalog",
  "/register": "Registration",
  "/retreat": "Retreat",
  "/retreat/book": "Retreat booking",
  "/find-your-path": "Find your path",
  "/fitness-training": "Fitness training",
  "/contact": "Contact",
  "/donation": "Sliding scale",
  "/services": "Services overview",
  "/reiki": "Reiki",
};

const INTENT_LABELS: Record<string, string> = {
  book: "Book a session",
  shop: "Shop",
  checkout: "Checkout",
  donation: "Sliding scale",
  retreat: "Retreat",
  contact: "Contact",
};

export function pathLabel(path: string): string {
  if (PATH_LABELS[path]) return PATH_LABELS[path];
  if (path.startsWith("/services/")) return `Service · ${path.replace("/services/", "").replace(/-/g, " ")}`;
  if (path.startsWith("/checkout/service")) return "Service checkout";
  if (path.startsWith("/retreat/booking/")) return "Retreat payment hub";
  return path;
}

export function intentLabel(intent: string): string {
  return INTENT_LABELS[intent] ?? intent;
}

export function normalizePath(path: string): string | null {
  const trimmed = path.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("/api") || trimmed.startsWith("/admin")) {
    return null;
  }
  const withoutQuery = trimmed.split("?")[0]?.split("#")[0] ?? trimmed;
  return withoutQuery.length > 200 ? withoutQuery.slice(0, 200) : withoutQuery;
}
