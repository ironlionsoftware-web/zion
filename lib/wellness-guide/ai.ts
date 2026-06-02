import { wellnessCatalog } from "@/content/wellness-catalog";
import { getWellnessOffering } from "@/content/wellness-catalog";
import type { WellnessMatch } from "@/lib/wellness-guide/match";

type AiPick = {
  id: string;
  reason: string;
};

function catalogForPrompt(): string {
  return wellnessCatalog
    .map((o) => `- ${o.id}: ${o.title}: ${o.summary}`)
    .join("\n");
}

function picksFromArray(items: unknown[]): AiPick[] {
  const picks: AiPick[] = [];
  for (const item of items) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const id = typeof row.id === "string" ? row.id.trim() : "";
    const reason = typeof row.reason === "string" ? row.reason.trim() : "";
    if (id && getWellnessOffering(id)) {
      picks.push({ id, reason: reason || "Suggested based on what you shared." });
    }
  }
  return picks.slice(0, 5);
}

function parseAiResponse(text: string): AiPick[] {
  const trimmed = text.trim();
  try {
    const parsed = JSON.parse(trimmed) as unknown;
    if (Array.isArray(parsed)) return picksFromArray(parsed);
    if (parsed && typeof parsed === "object") {
      const obj = parsed as Record<string, unknown>;
      const list = obj.recommendations ?? obj.items ?? obj.picks;
      if (Array.isArray(list)) return picksFromArray(list);
    }
  } catch {
    /* fall through to bracket extraction */
  }

  const jsonStart = trimmed.indexOf("[");
  const jsonEnd = trimmed.lastIndexOf("]");
  if (jsonStart === -1 || jsonEnd === -1) return [];

  try {
    const parsed = JSON.parse(trimmed.slice(jsonStart, jsonEnd + 1)) as unknown;
    return Array.isArray(parsed) ? picksFromArray(parsed) : [];
  } catch {
    return [];
  }
}

export function isWellnessAiEnabled(): boolean {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

export type AiWellnessResult =
  | { ok: true; matches: WellnessMatch[] }
  | { ok: false; error: string };

export async function aiWellnessRecommendations(query: string): Promise<AiWellnessResult> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) return { ok: false, error: "missing_key" };

  const model = process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";

  const system = `You are a wellness guide for Iron Lion Fitness & Holistic Healing. The user describes conditions, goals, or what they want to heal. Recommend ONLY items from the catalog below (use exact id values). Return JSON with key "recommendations": an array of up to 5 objects, each with "id" (string, exact catalog id) and "reason" (1-2 friendly sentences). Never diagnose or claim to cure disease. Offerings complement licensed medical care. Prefer plant shop items for physical/nutritional goals, Reiki and frequency tuning for energy/stress, consultation when someone needs a plan or does not know where to start, ceremonies only when user signals deep spiritual/ceremonial work, fitness for movement goals, retreat for immersive reset.

Catalog:
${catalogForPrompt()}`;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.3,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: query },
      ],
    }),
  });

  if (!res.ok) {
    const errBody = await res.text().catch(() => "");
    if (process.env.NODE_ENV === "development") {
      console.error("[wellness-guide AI]", res.status, errBody.slice(0, 500));
    }
    let error = "api_error";
    try {
      const errJson = JSON.parse(errBody) as { error?: { code?: string; type?: string } };
      const code = errJson.error?.code ?? errJson.error?.type;
      if (code === "insufficient_quota") error = "insufficient_quota";
      else if (res.status === 401) error = "invalid_key";
    } catch {
      /* ignore */
    }
    return { ok: false, error };
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) return { ok: false, error: "empty_response" };

  const picks = parseAiResponse(content);
  if (picks.length === 0) return { ok: false, error: "parse_error" };

  return {
    ok: true,
    matches: picks.map((pick, index) => {
      const offering = getWellnessOffering(pick.id)!;
      return {
        offering,
        score: 100 - index,
        matchedTags: [pick.reason],
      };
    }),
  };
}
