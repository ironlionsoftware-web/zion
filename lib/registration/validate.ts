const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateRegistrationInput(body: {
  fullName?: unknown;
  email?: unknown;
  phone?: unknown;
  marketingConsent?: unknown;
}): { ok: true; fullName: string; email: string; phone: string; marketingConsent: boolean } | { ok: false; error: string } {
  const fullName = typeof body.fullName === "string" ? body.fullName.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const marketingConsent = body.marketingConsent === true;

  if (fullName.length < 2) {
    return { ok: false, error: "Please enter your full name." };
  }
  if (!EMAIL_RE.test(email)) {
    return { ok: false, error: "Please enter a valid email address." };
  }
  const phoneDigits = phone.replace(/\D/g, "");
  if (phoneDigits.length < 10) {
    return { ok: false, error: "Please enter a valid phone number (at least 10 digits)." };
  }
  if (!marketingConsent) {
    return { ok: false, error: "Please agree to receive updates so we can stay in touch." };
  }

  return { ok: true, fullName, email, phone, marketingConsent };
}
