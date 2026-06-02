import { site } from "@/content/site";

type NotifyParams = {
  subject: string;
  text: string;
};

export async function notifyAdmin({ subject, text }: NotifyParams): Promise<void> {
  const to = process.env.ADMIN_NOTIFY_EMAIL?.trim() || site.contact.email;
  const from = process.env.RESEND_FROM?.trim() || "Iron Lion <onboarding@resend.dev>";
  const apiKey = process.env.RESEND_API_KEY?.trim();

  if (!apiKey) {
    if (process.env.NODE_ENV !== "production") {
      console.info(`[notify] To: ${to}\nSubject: ${subject}\n${text}`);
    }
    return;
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
      }),
    });
    if (!res.ok) {
      console.error("Resend notify failed:", await res.text());
    }
  } catch (error) {
    console.error("Resend notify error:", error);
  }
}
