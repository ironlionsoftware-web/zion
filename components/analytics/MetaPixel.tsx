"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * Meta (Facebook) Pixel.
 *
 * Why it exists: without it, paid traffic can only be billed and judged on
 * clicks. With it, Meta can optimise toward people who actually book, and the
 * visitors who looked and left can be retargeted — which for a $120 session is
 * usually where most of the revenue sits.
 *
 * Switched on by `NEXT_PUBLIC_META_PIXEL_ID`. With no value set this renders
 * nothing at all, so local dev and any tenant without an ad account are
 * untouched. See `docs/META-PIXEL.md` for where to find the id.
 *
 * This is deliberately separate from `PageViewTracker`, which feeds the admin
 * dashboard's own first-party analytics. The two do not replace each other:
 * one reports to Meta, one stays in our database.
 */

/** Meta pixel ids are numeric. Validated because the value is interpolated into an inline script. */
function readPixelId(): string {
  const raw = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim() ?? "";
  return /^\d{6,20}$/.test(raw) ? raw : "";
}

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export function MetaPixel() {
  const pixelId = readPixelId();
  const pathname = usePathname();
  // The inline snippet below fires the first PageView, so the effect must skip it
  // or the landing view is counted twice.
  const seededPath = useRef<string | null>(pathname);

  useEffect(() => {
    if (!pixelId) return;
    if (seededPath.current === pathname) return;
    seededPath.current = pathname;
    window.fbq?.("track", "PageView");
  }, [pixelId, pathname]);

  if (!pixelId) return null;

  return (
    <>
      <Script id="meta-pixel" strategy="afterInteractive">
        {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init','${pixelId}');
fbq('track','PageView');`}
      </Script>
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          alt=""
          src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
        />
      </noscript>
    </>
  );
}

/**
 * Report a conversion to Meta.
 *
 * Call on the thank-you/confirmation step rather than on button click, so the
 * number in Ads Manager means "money taken", not "someone was interested".
 */
export function trackMetaEvent(
  event: "Lead" | "Schedule" | "Purchase" | "CompleteRegistration",
  params?: Record<string, unknown>,
): void {
  if (typeof window === "undefined") return;
  window.fbq?.("track", event, params);
}
