import { site } from "@/content/site";

type NotifyParams = {
  subject: string;
  text: string;
  replyTo?: string;
};

export async function notifyAdmin({ subject, text, replyTo }: NotifyParams): Promise<boolean> {
  const to = process.env.ADMIN_NOTIFY_EMAIL?.trim() || site.contact.email;
  const from = process.env.RESEND_FROM?.trim() || "Iron Lion <onboarding@resend.dev>";
  const apiKey = process.env.RESEND_API_KEY?.trim();

  if (!apiKey) {
    if (process.env.NODE_ENV !== "production") {
      console.info(`[notify] To: ${to}\nSubject: ${subject}\n${text}`);
    }
    return process.env.NODE_ENV !== "production";
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject,
        text,
        ...(replyTo ? { reply_to: replyTo } : {}),
      }),
    });
    if (!res.ok) {
      console.error("Resend notify failed:", await res.text());
      return false;
    }
    return true;
  } catch (error) {
    console.error("Resend notify error:", error);
    return false;
  }
}
