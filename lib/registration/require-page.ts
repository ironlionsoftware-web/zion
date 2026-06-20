import { redirect } from "next/navigation";
import { getRegistration } from "@/lib/registration/cookie";
import type { ClientRegistration } from "@/lib/registration/types";
import { buildRegisterPath, type RegistrationRedirectOptions } from "@/lib/registration/register-path";

export type { RegistrationRedirectOptions };

/** Redirect unregistered visitors to `/register` before checkout or payment pages. */
export async function requireClientRegistration(
  options: RegistrationRedirectOptions,
): Promise<ClientRegistration> {
  const registration = await getRegistration();
  if (registration) return registration;
  redirect(buildRegisterPath(options));
}
