const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type ContactFormInput = {
  fullName: string;
  email: string;
  phone: string;
  message: string;
};

export function validateContactInput(body: {
  fullName?: unknown;
  email?: unknown;
  phone?: unknown;
  message?: unknown;
  website?: unknown;
}): { ok: true; data: ContactFormInput } | { ok: false; error: string } {
  if (typeof body.website === "string" && body.website.trim()) {
    return { ok: false, error: "Could not send your message. Please try again." };
  }

  const fullName = typeof body.fullName === "string" ? body.fullName.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";

  if (fullName.length < 2) {
    return { ok: false, error: "Please enter your name." };
  }
  if (!EMAIL_RE.test(email)) {
    return { ok: false, error: "Please enter a valid email address." };
  }
  const phoneDigits = phone.replace(/\D/g, "");
  if (phoneDigits.length < 10) {
    return { ok: false, error: "Please enter a valid phone number (at least 10 digits)." };
  }
  if (message.length < 10) {
    return { ok: false, error: "Please enter a message (at least 10 characters)." };
  }
  if (message.length > 5000) {
    return { ok: false, error: "Your message is too long. Please shorten it and try again." };
  }

  return { ok: true, data: { fullName, email, phone, message } };
}
