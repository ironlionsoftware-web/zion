import { site } from "@/content/site";
import { activeProvider, providerNames } from "./providers";

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

/**
 * The address mail is sent from. Must be on a domain verified with whichever provider is active,
 * or messages are rejected outright.
 */
function resolveFrom(): string {
  return process.env.EMAIL_FROM?.trim() || process.env.RESEND_FROM?.trim() || SANDBOX_FROM;
}

/**
 * Sends one email through whichever provider is configured — see `providers.ts`.
 *
 * Returns false rather than throwing: email must never fail a Stripe webhook or a checkout.
 * A dropped confirmation is recoverable; a failed webhook loses the order record.
 */
export async function sendEmail({ to, subject, text, replyTo }: SendParams): Promise<boolean> {
  const active = activeProvider();
  const from = resolveFrom();

  if (!active) {
    if (process.env.NODE_ENV !== "production") {
      console.info(`[email] To: ${to}\nSubject: ${subject}\n${text}`);
      return true;
    }
    console.error(
      `[email] No email provider configured — dropped "${subject}" to ${to}. ` +
        `Set one of: ${providerNames().map((n) => n.toUpperCase() + "_API_KEY").join(", ")}. ` +
        `See docs/EMAIL-SETUP.md`,
    );
    return false;
  }

  const { provider, key } = active;

  try {
    const { url, init } = provider.request(key, { from, to, subject, text, replyTo });
    const res = await fetch(url, init);
    if (!res.ok) {
      console.error(`[email] ${provider.name} rejected "${subject}" to ${to}:`, await res.text());
      return false;
    }
    return true;
  } catch (error) {
    console.error(`[email] ${provider.name} error sending "${subject}" to ${to}:`, error);
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
 * customer ever receives anything. Requires a verified domain in `EMAIL_FROM`.
 * See `docs/EMAIL-SETUP.md`.
 */
export async function sendCustomerEmail({ to, subject, text, replyTo }: SendParams): Promise<boolean> {
  const recipient = to.trim().toLowerCase();
  if (!recipient || !recipient.includes("@")) {
    console.error(`[email] Skipped customer email "${subject}" — no valid recipient address`);
    return false;
  }

  // Every provider rejects (or silently swallows) mail from an unverified sender. Left unset, this
  // looks like success in testing while no customer receives anything — so say so loudly.
  if (resolveFrom() === SANDBOX_FROM && activeProvider()) {
    console.error(
      `[email] EMAIL_FROM is not configured, so mail would be sent from a sandbox sender that ` +
        `only delivers to the account owner — ${recipient} will not receive "${subject}". ` +
        `Set EMAIL_FROM to an address on your verified domain.`,
    );
  }

  return sendEmail({
    to: recipient,
    subject,
    text,
    replyTo: replyTo ?? process.env.ADMIN_NOTIFY_EMAIL?.trim() ?? site.contact.email,
  });
}
