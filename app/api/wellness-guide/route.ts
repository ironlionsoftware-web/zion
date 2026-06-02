import { NextResponse } from "next/server";
import { wellnessDisclaimer } from "@/content/wellness-catalog";
import { aiWellnessRecommendations, isWellnessAiEnabled } from "@/lib/wellness-guide/ai";
import { matchWellnessOfferings } from "@/lib/wellness-guide/match";

const MAX_QUERY_LENGTH = 800;
const MIN_QUERY_LENGTH = 3;

/** Quick check: is OPENAI_API_KEY loaded? (restart dev server after editing .env.local) */
export async function GET() {
  const enabled = isWellnessAiEnabled();
  return NextResponse.json({
    aiEnabled: enabled,
    model: process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini",
    hint: enabled
      ? "POST a query to this endpoint or use /find-your-path — responses should show mode: ai"
      : "Set OPENAI_API_KEY in .env.local (local) or hosting env vars (production), then restart the server.",
  });
}

export async function POST(request: Request) {
  let body: { query?: string };
  try {
    body = (await request.json()) as { query?: string };
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const query = typeof body.query === "string" ? body.query.trim() : "";
  if (query.length < MIN_QUERY_LENGTH) {
    return NextResponse.json(
      { error: "Please describe what you are working with in a few words or more." },
      { status: 400 },
    );
  }
  if (query.length > MAX_QUERY_LENGTH) {
    return NextResponse.json({ error: "Please shorten your description." }, { status: 400 });
  }

  const aiResult = await aiWellnessRecommendations(query);
  let matches = aiResult.ok ? aiResult.matches : matchWellnessOfferings(query, 5);
  let mode: "ai" | "search" = aiResult.ok ? "ai" : "search";
  const aiIssue =
    !aiResult.ok && isWellnessAiEnabled()
      ? aiResult.error === "insufficient_quota"
        ? "OpenAI billing or credits are needed before AI suggestions can run. Catalog search is used meanwhile."
        : aiResult.error === "invalid_key"
          ? "The OpenAI API key was rejected. Check OPENAI_API_KEY and restart the server."
          : undefined
      : undefined;

  if (matches.length === 0) {
    return NextResponse.json({
      mode,
      aiAvailable: isWellnessAiEnabled(),
      aiIssue,
      disclaimer: wellnessDisclaimer,
      recommendations: [],
      message:
        "We could not match that description yet. Try different words (e.g. stress, sleep, energy, digestion, spiritual clarity) or contact us directly.",
    });
  }

  return NextResponse.json({
    mode,
    aiAvailable: isWellnessAiEnabled(),
    aiIssue,
    disclaimer: wellnessDisclaimer,
    recommendations: matches.map((m) => ({
      id: m.offering.id,
      kind: m.offering.kind,
      title: m.offering.title,
      summary: m.offering.summary,
      href: m.offering.href,
      reason:
        mode === "ai" && m.matchedTags[0] && !m.matchedTags[0].startsWith("(")
          ? m.matchedTags[0]
          : m.matchedTags.length > 0
            ? `Matched themes: ${m.matchedTags.filter((t) => !t.startsWith("(")).slice(0, 3).join(", ")}`
            : m.offering.summary,
    })),
  });
}
