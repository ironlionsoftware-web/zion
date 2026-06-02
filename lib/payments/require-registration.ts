import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { decodeRegistrationCookie, REGISTRATION_COOKIE } from "@/lib/registration/cookie";
import type { ClientRegistration } from "@/lib/registration/types";

export async function requireRegistration():
  Promise<{ registration: ClientRegistration } | NextResponse> {
  const cookieStore = await cookies();
  const registration = decodeRegistrationCookie(cookieStore.get(REGISTRATION_COOKIE)?.value);
  if (!registration) {
    return NextResponse.json(
      { error: "Please complete registration before checkout.", code: "registration_required" },
      { status: 401 },
    );
  }
  return { registration };
}
