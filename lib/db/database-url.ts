/** Resolves Postgres URL from DATABASE_URL or Vercel Neon storage env names. */
export function resolveDatabaseUrl(): string | undefined {
  const direct = process.env.DATABASE_URL?.trim();
  if (direct) return direct;

  const candidates = [
    process.env.iron_lion_DATABASE_URL,
    process.env.iron_lion_POSTGRES_URL,
    process.env.POSTGRES_URL,
    process.env.iron_lion_POSTGRES_PRISMA_URL,
  ];

  for (const value of candidates) {
    const url = value?.trim();
    if (url) return url;
  }

  return undefined;
}
