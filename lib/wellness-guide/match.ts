import { wellnessCatalog, type WellnessOffering } from "@/content/wellness-catalog";

export type WellnessMatch = {
  offering: WellnessOffering;
  score: number;
  matchedTags: string[];
};

const STOP_WORDS = new Set([
  "a",
  "an",
  "the",
  "and",
  "or",
  "but",
  "for",
  "to",
  "of",
  "in",
  "on",
  "at",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "being",
  "have",
  "has",
  "had",
  "do",
  "does",
  "did",
  "will",
  "would",
  "could",
  "should",
  "may",
  "might",
  "must",
  "i",
  "me",
  "my",
  "we",
  "our",
  "you",
  "your",
  "they",
  "them",
  "their",
  "it",
  "its",
  "this",
  "that",
  "these",
  "those",
  "with",
  "from",
  "about",
  "into",
  "through",
  "during",
  "before",
  "after",
  "above",
  "below",
  "up",
  "down",
  "out",
  "off",
  "over",
  "under",
  "again",
  "further",
  "then",
  "once",
  "here",
  "there",
  "when",
  "where",
  "why",
  "how",
  "all",
  "each",
  "few",
  "more",
  "most",
  "other",
  "some",
  "such",
  "no",
  "nor",
  "not",
  "only",
  "own",
  "same",
  "so",
  "than",
  "too",
  "very",
  "can",
  "just",
  "don",
  "now",
  "want",
  "wanting",
  "need",
  "needs",
  "looking",
  "help",
  "heal",
  "healing",
  "feel",
  "feeling",
]);

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/['']/g, "'")
    .replace(/[^a-z0-9\s'-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Tokenize while keeping multi-word tags in the catalog matchable via substring. */
export function tokenizeQuery(query: string): string[] {
  const normalized = normalize(query);
  if (!normalized) return [];

  const words = normalized.split(" ").filter((w) => w.length > 1 && !STOP_WORDS.has(w));
  const phrases: string[] = [normalized];

  for (let i = 0; i < words.length - 1; i++) {
    phrases.push(`${words[i]} ${words[i + 1]}`);
    if (i < words.length - 2) {
      phrases.push(`${words[i]} ${words[i + 1]} ${words[i + 2]}`);
    }
  }

  return [...new Set([...words, ...phrases])];
}

function tagMatches(tokens: string[], tag: string): boolean {
  const normalizedTag = normalize(tag);
  if (!normalizedTag) return false;

  if (tokens.includes(normalizedTag)) return true;

  return tokens.some(
    (token) =>
      token.length >= 3 &&
      (normalizedTag.includes(token) || token.includes(normalizedTag)),
  );
}

export function matchWellnessOfferings(query: string, limit = 5): WellnessMatch[] {
  const tokens = tokenizeQuery(query);
  if (tokens.length === 0) return [];

  const results: WellnessMatch[] = [];

  for (const offering of wellnessCatalog) {
    const matchedTags: string[] = [];
    let score = 0;

    for (const tag of offering.tags) {
      if (tagMatches(tokens, tag)) {
        matchedTags.push(tag);
        const weight = normalize(tag).includes(" ") ? 3 : 2;
        score += weight;
      }
    }

    const titleNorm = normalize(offering.title);
    if (tokens.some((t) => titleNorm.includes(t))) {
      score += 4;
      matchedTags.push("(title)");
    }

    if (score > 0) {
      results.push({ offering, score, matchedTags });
    }
  }

  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
