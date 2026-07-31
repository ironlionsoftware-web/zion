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
  // Marketing consent is recorded but never required. Consent that is a condition of buying is not
  // freely given, so it is worth little legally and nothing ethically — and gating registration on
  // it turned away anyone unwilling to join a mailing list, including retreat clients spending
  // thousands. The value is captured either way: `marketingConsent` still gates who may be added
  // to a mailing audience later.
  return { ok: true, fullName, email, phone, marketingConsent };
}
