import { site } from "@/content/site";

type SendParams = {
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
};

type NotifyParams = {
  subject: string;
  text: string;
  replyTo?: string;
};

/** Resend's shared sandbox sender. It can only deliver to the Resend account owner. */
const SANDBOX_FROM = "Iron Lion <onboarding@resend.dev>";

function resolveFrom(): string {
  return process.env.RESEND_FROM?.trim() || SANDBOX_FROM;
}

/**
 * Sends one email through Resend.
 *
 * Returns false rather than throwing: email must never fail a Stripe webhook or a checkout.
 * A dropped confirmation is recoverable; a failed webhook loses the order record.
 */
export async function sendEmail({ to, subject, text, replyTo }: SendParams): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = resolveFrom();

  if (!apiKey) {
    if (process.env.NODE_ENV !== "production") {
      console.info(`[email] To: ${to}\nSubject: ${subject}\n${text}`);
      return true;
    }
    console.error(`[email] RESEND_API_KEY is not set — dropped "${subject}" to ${to}`);
    return false;
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
      console.error(`[email] Resend rejected "${subject}" to ${to}:`, await res.text());
      return false;
    }
    return true;
  } catch (error) {
    console.error(`[email] Resend error sending "${subject}" to ${to}:`, error);
    return false;
  }
}

/** Sends an internal notification to the business inbox. */
export async function notifyAdmin({ subject, text, replyTo }: NotifyParams): Promise<boolean> {
  const to = process.env.ADMIN_NOTIFY_EMAIL?.trim() || site.contact.email;
  return sendEmail({ to, subject, text, replyTo });
}

/**
 * Sends a transactional email to a customer.
 *
 * Guarded separately from `notifyAdmin` because the sandbox sender silently refuses to deliver to
 * anyone but the Resend account owner — which would look like "email works" in testing while no
 * customer ever receives anything. Requires a verified domain in `RESEND_FROM`.
 * See `docs/EMAIL-SETUP.md`.
 */
export async function sendCustomerEmail({ to, subject, text, replyTo }: SendParams): Promise<boolean> {
  const recipient = to.trim().toLowerCase();
  if (!recipient || !recipient.includes("@")) {
    console.error(`[email] Skipped customer email "${subject}" — no valid recipient address`);
    return false;
  }

  if (resolveFrom() === SANDBOX_FROM && process.env.RESEND_API_KEY?.trim()) {
    console.error(
      `[email] RESEND_FROM is not configured. Customer mail would be sent from the Resend ` +
        `sandbox sender, which only delivers to the Resend account owner — ${recipient} will ` +
        `not receive "${subject}". Set RESEND_FROM to a verified domain address.`,
    );
  }

  return sendEmail({
    to: recipient,
    subject,
    text,
    replyTo: replyTo ?? process.env.ADMIN_NOTIFY_EMAIL?.trim() ?? site.contact.email,
  });
}
