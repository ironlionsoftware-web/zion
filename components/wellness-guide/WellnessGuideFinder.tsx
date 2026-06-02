"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { wellnessGuidePrompts } from "@/content/wellness-catalog";

type Recommendation = {
  id: string;
  kind: string;
  title: string;
  summary: string;
  href: string;
  reason: string;
};

type GuideResponse = {
  mode?: "ai" | "search";
  aiAvailable?: boolean;
  aiIssue?: string;
  disclaimer?: string;
  recommendations?: Recommendation[];
  message?: string;
  error?: string;
};

const kindLabels: Record<string, string> = {
  "healing-service": "Healing service",
  fitness: "Fitness",
  "shop-product": "Plant medicine",
  retreat: "Retreat",
};

export function WellnessGuideFinder({ compact = false }: { compact?: boolean }) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GuideResponse | null>(null);
  const [aiEnabled, setAiEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/wellness-guide")
      .then((res) => res.json())
      .then((data: { aiEnabled?: boolean }) => setAiEnabled(Boolean(data.aiEnabled)))
      .catch(() => setAiEnabled(false));
  }, []);

  async function runSearch(text?: string) {
    const q = (text ?? query).trim();
    if (q.length < 3) {
      setError("Please share a little more about what you are looking for.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/wellness-guide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      });
      const data = (await res.json()) as GuideResponse;
      if (!res.ok) {
        setError(data.error ?? "Could not get recommendations. Please try again.");
        return;
      }
      setResult(data);
      if (text) setQuery(text);
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    void runSearch();
  }

  return (
    <div className={compact ? "" : "card p-6 sm:p-8"}>
      {!compact ? (
        <p className="eyebrow">Wellness guide</p>
      ) : null}
      <h2 className={compact ? "font-display text-xl font-medium text-[var(--foreground)]" : "section-title mt-2"}>
        {compact ? "Find your path" : "What are you hoping to heal or shift?"}
      </h2>
      <p className={compact ? "mt-2 text-sm text-muted" : "prose-content mt-3"}>
        Describe your conditions, goals, or how you are feeling. We will suggest the best-fit services and plant
        medicine from our offerings.
        {aiEnabled === true ? (
          <span className="mt-2 block text-xs font-medium text-[var(--rasta-green)]">AI guide is active on this site.</span>
        ) : null}
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="wellness-query" className="sr-only">
            Describe what you want support with
          </label>
          <textarea
            id="wellness-query"
            name="query"
            rows={compact ? 3 : 4}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Example: I want more energy and gentle support with movement or plant medicine…"
            className="form-control resize-y bg-[var(--cream)] placeholder:text-muted/70"
            maxLength={800}
            disabled={loading}
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button type="submit" className="btn btn-primary min-w-[10rem]" disabled={loading}>
            {loading ? "Finding matches…" : "Get recommendations"}
          </button>
          {result ? (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setResult(null);
                setError(null);
              }}
            >
              Clear
            </button>
          ) : null}
        </div>
      </form>

      <div className="mt-4 flex flex-wrap gap-2" aria-label="Example searches">
        {wellnessGuidePrompts.map((example) => (
          <button
            key={example}
            type="button"
            disabled={loading}
            onClick={() => void runSearch(example)}
            className="rounded-full border border-subtle bg-[var(--surface-muted)] px-3 py-1.5 text-xs font-medium text-earth transition hover:border-[var(--rasta-green)] hover:text-[var(--rasta-green)] disabled:opacity-50 motion-reduce:transition-none"
          >
            {example}
          </button>
        ))}
      </div>

      {error ? (
        <p className="mt-4 text-sm text-[var(--rasta-red)]" role="alert">
          {error}
        </p>
      ) : null}

      {result ? (
        <div className="mt-8" aria-live="polite">
          {result.recommendations && result.recommendations.length > 0 ? (
            <>
              <p className="text-sm text-muted">
                {result.mode === "ai"
                  ? "Personalized suggestions grounded in our offerings"
                  : "Top matches from our wellness catalog"}
              </p>
              {result.aiIssue ? (
                <p className="mt-2 text-sm text-[var(--rasta-gold)]" role="status">
                  {result.aiIssue}
                </p>
              ) : null}
              <ol className="mt-4 space-y-4">
                {result.recommendations.map((rec, index) => (
                  <li key={rec.id} className="card p-5">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <span className="text-xs font-semibold uppercase tracking-wide text-[var(--rasta-green)]">
                        {index + 1}. {kindLabels[rec.kind] ?? rec.kind}
                      </span>
                    </div>
                    <h3 className="mt-2 font-display text-lg font-medium text-[var(--foreground)]">{rec.title}</h3>
                    <p className="mt-2 text-sm text-muted">{rec.reason}</p>
                    <p className="mt-2 text-sm text-[var(--foreground)]">{rec.summary}</p>
                    <Link href={rec.href} className="btn btn-secondary mt-4 text-xs">
                      View &amp; next steps
                    </Link>
                  </li>
                ))}
              </ol>
            </>
          ) : (
            <p className="text-sm text-muted">{result.message}</p>
          )}

          {result.disclaimer ? (
            <p className="mt-6 border-t border-subtle pt-4 text-xs leading-relaxed text-muted">{result.disclaimer}</p>
          ) : null}

          <p className="mt-4 text-sm text-muted">
            Not sure yet?{" "}
            <Link href="/contact" className="link-accent font-medium">
              Contact us
            </Link>{" "}
            and we will help you choose.
          </p>
        </div>
      ) : null}
    </div>
  );
}
