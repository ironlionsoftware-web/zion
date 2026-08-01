/**
 * Email delivery providers.
 *
 * There are three here for a specific reason: the domain's DNS is managed by Wix, which cannot
 * create MX records on a subdomain (ruling out Resend) and is unreliable with underscores in
 * CNAME hostnames (which may rule out SendGrid). Rather than gamble on which one Wix will accept,
 * all three speak the same interface and the active one is chosen by whichever API key is set.
 *
 * Once the domain moves off Wix, Resend is the intended destination — it has the nicest API of the
 * three. Nothing outside this file needs to change to get there.
 */

export type SendArgs = {
  from: string;
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
};

export type ProviderName = "resend" | "sendgrid" | "postmark";

type Provider = {
  name: ProviderName;
  /** Env var holding the API key. Presence of this key selects the provider. */
  keyEnv: string;
  /** Builds the HTTP request for this provider. */
  request: (key: string, args: SendArgs) => { url: string; init: RequestInit };
};

/**
 * `from` arrives as either "Name <address@domain>" or a bare address. Postmark and SendGrid both
 * accept the full form, but SendGrid wants it split into fields.
 */
function splitFrom(from: string): { email: string; name?: string } {
  const match = from.match(/^\s*(.*?)\s*<([^>]+)>\s*$/);
  if (match) return { name: match[1] || undefined, email: match[2].trim() };
  return { email: from.trim() };
}

const PROVIDERS: Provider[] = [
  {
    name: "resend",
    keyEnv: "RESEND_API_KEY",
    request: (key, { from, to, subject, text, replyTo }) => ({
      url: "https://api.resend.com/emails",
      init: {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from, to: [to], subject, text, ...(replyTo ? { reply_to: replyTo } : {}) }),
      },
    }),
  },
  {
    name: "sendgrid",
    keyEnv: "SENDGRID_API_KEY",
    request: (key, { from, to, subject, text, replyTo }) => {
      const sender = splitFrom(from);
      return {
        url: "https://api.sendgrid.com/v3/mail/send",
        init: {
          method: "POST",
          headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            personalizations: [{ to: [{ email: to }] }],
            from: sender,
            subject,
            content: [{ type: "text/plain", value: text }],
            ...(replyTo ? { reply_to: { email: replyTo } } : {}),
          }),
        },
      };
    },
  },
  {
    name: "postmark",
    keyEnv: "POSTMARK_SERVER_TOKEN",
    request: (key, { from, to, subject, text, replyTo }) => ({
      url: "https://api.postmarkapp.com/email",
      init: {
        method: "POST",
        headers: {
          "X-Postmark-Server-Token": key,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          From: from,
          To: to,
          Subject: subject,
          TextBody: text,
          MessageStream: "outbound",
          ...(replyTo ? { ReplyTo: replyTo } : {}),
        }),
      },
    }),
  },
];

/**
 * Returns the provider to send with, or null when none is configured.
 *
 * `EMAIL_PROVIDER` forces a choice when more than one key is present; otherwise the first
 * provider with a key wins, in the order above.
 */
export function activeProvider(): { provider: Provider; key: string } | null {
  const forced = process.env.EMAIL_PROVIDER?.trim().toLowerCase();
  const candidates = forced ? PROVIDERS.filter((p) => p.name === forced) : PROVIDERS;

  for (const provider of candidates) {
    const key = process.env[provider.keyEnv]?.trim();
    if (key) return { provider, key };
  }
  return null;
}

export function providerNames(): ProviderName[] {
  return PROVIDERS.map((p) => p.name);
}
