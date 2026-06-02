"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

export function DonationConfirm() {
  const searchParams = useSearchParams();
  const success = searchParams.get("success") === "1";
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (!success || !sessionId) return;
    void fetch("/api/orders/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    });
  }, [success, sessionId]);

  return null;
}
