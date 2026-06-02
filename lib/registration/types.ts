export type RegisterNext = "book" | "donation" | "shop" | "checkout" | "retreat" | "contact";

export type ClientRegistration = {
  fullName: string;
  email: string;
  phone: string;
  registeredAt: string;
};

export type RegistrationRecord = ClientRegistration & {
  marketingConsent: boolean;
  next: RegisterNext;
  service?: string;
  practitioner?: string;
  source: string;
};
