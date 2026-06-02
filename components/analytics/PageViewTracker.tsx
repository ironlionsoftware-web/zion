"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { normalizePath } from "@/lib/analytics/path-labels";

const SESSION_KEY = "iron_lion_analytics_session";

function getSessionId(): string {
  try {
    const existing = localStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const id = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, id);
    return id;
  } catch {
    return crypto.randomUUID();
  }
}

export function PageViewTracker() {
  const pathname = usePathname();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    const path = normalizePath(pathname);
    if (!path || path === lastPath.current) return;
    lastPath.current = path;

    const payload = JSON.stringify({
      sessionId: getSessionId(),
      path,
      referrer: typeof document !== "undefined" ? document.referrer.slice(0, 500) : null,
    });

    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/analytics/pageview", new Blob([payload], { type: "application/json" }));
      return;
    }

    void fetch("/api/analytics/pageview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    });
  }, [pathname]);

  return null;
}
