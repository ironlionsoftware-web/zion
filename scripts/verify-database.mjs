/**
 * Verifies DATABASE_URL and runs schema init (same as production first request).
 * Usage: node --env-file=.env.local scripts/verify-database.mjs
 */
import postgres from "postgres";

const url =
  process.env.DATABASE_URL?.trim() ||
  process.env.iron_lion_DATABASE_URL?.trim() ||
  process.env.iron_lion_POSTGRES_URL?.trim() ||
  process.env.POSTGRES_URL?.trim();
if (!url) {
  console.error(
    "No database URL found. Set DATABASE_URL or iron_lion_DATABASE_URL in .env.local.",
  );
  process.exit(1);
}

const sql = postgres(url, { max: 1 });

try {
  const [{ ok }] = await sql`SELECT 1 AS ok`;
  if (ok !== 1) throw new Error("Unexpected query result");

  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS registrations (
      id SERIAL PRIMARY KEY,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      registered_at TIMESTAMPTZ NOT NULL,
      marketing_consent BOOLEAN NOT NULL DEFAULT FALSE,
      next_step TEXT NOT NULL,
      service TEXT,
      practitioner TEXT,
      source TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  const tables = await sql`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    ORDER BY table_name
  `;

  console.log("Database connection OK.");
  console.log("Tables in public schema:", tables.map((r) => r.table_name).join(", ") || "(none yet — first app request creates the rest)");
} catch (err) {
  console.error("Database check failed:", err.message ?? err);
  process.exit(1);
} finally {
  await sql.end({ timeout: 5 });
}
