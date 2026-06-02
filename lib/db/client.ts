import { mkdirSync } from "fs";
import { readFile } from "fs/promises";
import path from "path";
import postgres from "postgres";
import type { RegisterNext } from "@/lib/registration/types";

type SqliteDatabase = import("better-sqlite3").Database;

let pgSql: ReturnType<typeof postgres> | null = null;
let sqliteDb: SqliteDatabase | null = null;
let schemaReady: Promise<void> | null = null;

export function usesPostgres(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}

function getPostgres() {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) return null;
  if (!pgSql) {
    pgSql = postgres(url, { max: 10 });
  }
  return pgSql;
}

function getSqlite(): SqliteDatabase {
  if (sqliteDb) return sqliteDb;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Database = require("better-sqlite3") as typeof import("better-sqlite3");
  const dir = path.join(process.cwd(), "data");
  mkdirSync(dir, { recursive: true });
  sqliteDb = new Database(path.join(dir, "iron-lion.db"));
  sqliteDb.pragma("journal_mode = WAL");
  return sqliteDb;
}

const POSTGRES_SCHEMA = `
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

CREATE INDEX IF NOT EXISTS idx_registrations_email ON registrations (email);
CREATE INDEX IF NOT EXISTS idx_registrations_registered_at ON registrations (registered_at DESC);

CREATE TABLE IF NOT EXISTS service_bookings (
  id SERIAL PRIMARY KEY,
  stripe_session_id TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  service_slug TEXT NOT NULL,
  service_label TEXT NOT NULL,
  practitioner_slug TEXT NOT NULL,
  practitioner_name TEXT NOT NULL,
  amount_cents INTEGER NOT NULL,
  payment_plan TEXT NOT NULL,
  paid_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_service_bookings_paid_at ON service_bookings (paid_at DESC);

CREATE TABLE IF NOT EXISTS shop_orders (
  id SERIAL PRIMARY KEY,
  stripe_session_id TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  line_items JSONB NOT NULL,
  fulfillment_note TEXT,
  subtotal_cents INTEGER NOT NULL,
  payment_plan TEXT NOT NULL,
  paid_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  internal_notes TEXT,
  fulfillment_updated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shop_orders_status ON shop_orders (status);
CREATE INDEX IF NOT EXISTS idx_shop_orders_paid_at ON shop_orders (paid_at DESC);

CREATE TABLE IF NOT EXISTS schema_migrations (
  id TEXT PRIMARY KEY,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS page_views (
  id SERIAL PRIMARY KEY,
  session_id TEXT NOT NULL,
  path TEXT NOT NULL,
  referrer TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON page_views (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_views_path ON page_views (path);
CREATE INDEX IF NOT EXISTS idx_page_views_session ON page_views (session_id);
`;

const SQLITE_SCHEMA = `
CREATE TABLE IF NOT EXISTS registrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  registered_at TEXT NOT NULL,
  marketing_consent INTEGER NOT NULL DEFAULT 0,
  next_step TEXT NOT NULL,
  service TEXT,
  practitioner TEXT,
  source TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_registrations_email ON registrations (email);
CREATE INDEX IF NOT EXISTS idx_registrations_registered_at ON registrations (registered_at DESC);

CREATE TABLE IF NOT EXISTS service_bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  stripe_session_id TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  service_slug TEXT NOT NULL,
  service_label TEXT NOT NULL,
  practitioner_slug TEXT NOT NULL,
  practitioner_name TEXT NOT NULL,
  amount_cents INTEGER NOT NULL,
  payment_plan TEXT NOT NULL,
  paid_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_service_bookings_paid_at ON service_bookings (paid_at DESC);

CREATE TABLE IF NOT EXISTS shop_orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  stripe_session_id TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  line_items TEXT NOT NULL,
  fulfillment_note TEXT,
  subtotal_cents INTEGER NOT NULL,
  payment_plan TEXT NOT NULL,
  paid_at TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  internal_notes TEXT,
  fulfillment_updated_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_shop_orders_status ON shop_orders (status);
CREATE INDEX IF NOT EXISTS idx_shop_orders_paid_at ON shop_orders (paid_at DESC);

CREATE TABLE IF NOT EXISTS schema_migrations (
  id TEXT PRIMARY KEY,
  applied_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS page_views (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  path TEXT NOT NULL,
  referrer TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON page_views (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_views_path ON page_views (path);
CREATE INDEX IF NOT EXISTS idx_page_views_session ON page_views (session_id);
`;

async function migrateJsonlRegistrations(): Promise<void> {
  const filePath = path.join(process.cwd(), "data", "registrations.jsonl");
  let raw: string;
  try {
    raw = await readFile(filePath, "utf8");
  } catch {
    return;
  }

  const lines = raw.split("\n").filter((line) => line.trim());
  if (lines.length === 0) return;

  const hasRows = await registrationCount();
  if (hasRows > 0) return;

  const { insertRegistration } = await import("./registrations");

  for (const line of lines) {
    try {
      const row = JSON.parse(line) as {
        fullName: string;
        email: string;
        phone: string;
        registeredAt: string;
        marketingConsent: boolean;
        next: string;
        service?: string;
        practitioner?: string;
        source: string;
      };
      await insertRegistration({
        fullName: row.fullName,
        email: row.email,
        phone: row.phone,
        registeredAt: row.registeredAt,
        marketingConsent: row.marketingConsent,
        next: row.next as RegisterNext,
        service: row.service,
        practitioner: row.practitioner,
        source: row.source,
      });
    } catch {
      /* skip malformed lines */
    }
  }

  if (usesPostgres()) {
    const sql = getPostgres()!;
    await sql`INSERT INTO schema_migrations (id) VALUES ('jsonl_registrations') ON CONFLICT DO NOTHING`;
  } else {
    const db = getSqlite();
    db.prepare(`INSERT OR IGNORE INTO schema_migrations (id) VALUES (?)`).run("jsonl_registrations");
  }
}

async function registrationCount(): Promise<number> {
  if (usesPostgres()) {
    const sql = getPostgres()!;
    const [row] = await sql<{ count: string }[]>`SELECT COUNT(*)::text AS count FROM registrations`;
    return Number(row?.count ?? 0);
  }
  const db = getSqlite();
  const row = db.prepare(`SELECT COUNT(*) AS count FROM registrations`).get() as { count: number };
  return Number(row.count);
}

async function migrateServiceBookingCeremonyMedicine(): Promise<void> {
  const migrationId = "service_bookings_ceremony_medicine";

  if (usesPostgres()) {
    const sql = getPostgres()!;
    const [applied] = await sql<{ id: string }[]>`
      SELECT id FROM schema_migrations WHERE id = ${migrationId}
    `;
    if (applied) return;

    await sql.unsafe(`
      ALTER TABLE service_bookings ADD COLUMN IF NOT EXISTS ceremony_medicine_slug TEXT;
      ALTER TABLE service_bookings ADD COLUMN IF NOT EXISTS ceremony_medicine_label TEXT;
    `);
    await sql`INSERT INTO schema_migrations (id) VALUES (${migrationId}) ON CONFLICT DO NOTHING`;
    return;
  }

  const db = getSqlite();
  const applied = db.prepare(`SELECT id FROM schema_migrations WHERE id = ?`).get(migrationId);
  if (applied) return;

  const columns = db.prepare(`PRAGMA table_info(service_bookings)`).all() as { name: string }[];
  const names = new Set(columns.map((column) => column.name));
  if (!names.has("ceremony_medicine_slug")) {
    db.exec(`ALTER TABLE service_bookings ADD COLUMN ceremony_medicine_slug TEXT`);
  }
  if (!names.has("ceremony_medicine_label")) {
    db.exec(`ALTER TABLE service_bookings ADD COLUMN ceremony_medicine_label TEXT`);
  }
  db.prepare(`INSERT OR IGNORE INTO schema_migrations (id) VALUES (?)`).run(migrationId);
}

async function initSchema(): Promise<void> {
  if (usesPostgres()) {
    const sql = getPostgres()!;
    await sql.unsafe(POSTGRES_SCHEMA);
  } else {
    const db = getSqlite();
    db.exec(SQLITE_SCHEMA);
  }
  await migrateJsonlRegistrations();
  await migrateServiceBookingCeremonyMedicine();
}

export async function ensureDb(): Promise<void> {
  if (!schemaReady) {
    schemaReady = initSchema();
  }
  await schemaReady;
}

export async function withPostgres<T>(fn: (sql: ReturnType<typeof postgres>) => Promise<T>): Promise<T> {
  await ensureDb();
  const sql = getPostgres();
  if (!sql) throw new Error("DATABASE_URL is not configured.");
  return fn(sql);
}

export async function withSqlite<T>(fn: (db: SqliteDatabase) => T | Promise<T>): Promise<T> {
  await ensureDb();
  return fn(getSqlite());
}

export async function withDb<T>(fn: (ctx: { postgres: boolean }) => Promise<T>): Promise<T> {
  await ensureDb();
  return fn({ postgres: usesPostgres() });
}
