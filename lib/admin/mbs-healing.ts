export type AppUserRecord = {
  user_id: string;
  email: string;
  name: string | null;
  registered_at: string;
  last_active_at: string | null;
  last_login_at: string | null;
  active_pillar: string | null;
  has_mind_profile: number;
  registration_source: string;
};

export type AppUserListResponse = {
  total: number;
  users: AppUserRecord[];
};

export type AppUserStatsResponse = {
  total: number;
  new_this_week: number;
  active_this_week: number;
};

function mbsHealingConfig(): { apiUrl: string; staffKey: string } | { error: string } {
  const apiUrl = process.env.MBS_HEALING_API_URL?.replace(/\/$/, "");
  const staffKey = process.env.MBS_HEALING_STAFF_KEY;
  if (!apiUrl || !staffKey) {
    return {
      error:
        "Mobile app admin is not configured. Set MBS_HEALING_API_URL and MBS_HEALING_STAFF_KEY in the environment.",
    };
  }
  return { apiUrl, staffKey };
}

async function fetchMbsHealing<T>(path: string): Promise<{ data: T } | { error: string; status?: number }> {
  const config = mbsHealingConfig();
  if ("error" in config) return { error: config.error };

  try {
    const res = await fetch(`${config.apiUrl}${path}`, {
      headers: { Authorization: `Bearer ${config.staffKey}` },
      cache: "no-store",
    });
    const data = (await res.json()) as T & { error?: string };
    if (!res.ok) {
      return { error: data.error ?? `Mobile app API returned ${res.status}.`, status: res.status };
    }
    return { data };
  } catch {
    return { error: "Could not reach the mobile app API. Check MBS_HEALING_API_URL and that the API is running." };
  }
}

export async function listAppUsers(limit = 500, offset = 0) {
  return fetchMbsHealing<AppUserListResponse>(`/api/admin/app-users?limit=${limit}&offset=${offset}`);
}

export async function getAppUserStats() {
  return fetchMbsHealing<AppUserStatsResponse>("/api/admin/app-users/stats");
}
