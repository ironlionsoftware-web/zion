import { usesPostgres, withPostgres, withSqlite } from "./client";

const NOTIFIED_DDL_POSTGRES = `
CREATE TABLE IF NOT EXISTS checkout_notifications (
  stripe_session_id TEXT PRIMARY KEY,
  checkout_type TEXT NOT NULL,
  notified_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
`;

const NOTIFIED_DDL_SQLITE = `
CREATE TABLE IF NOT EXISTS checkout_notifications (
  stripe_session_id TEXT PRIMARY KEY,
  checkout_type TEXT NOT NULL,
  notified_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`;

async function ensureNotificationsTable(): Promise<void> {
  if (usesPostgres()) {
    await withPostgres((sql) => sql.unsafe(NOTIFIED_DDL_POSTGRES));
  } else {
    await withSqlite((db) => {
      db.exec(NOTIFIED_DDL_SQLITE);
    });
  }
}

/** Returns true if this session has not been notified yet (and marks it now). */
export async function markCheckoutNotified(sessionId: string, checkoutType: string): Promise<boolean> {
  await ensureNotificationsTable();

  if (usesPostgres()) {
    const rows = await withPostgres((sql) =>
      sql<{ stripe_session_id: string }[]>`
        INSERT INTO checkout_notifications (stripe_session_id, checkout_type)
        VALUES (${sessionId}, ${checkoutType})
        ON CONFLICT (stripe_session_id) DO NOTHING
        RETURNING stripe_session_id
      `,
    );
    return rows.length > 0;
  }

  return withSqlite((db) => {
    const result = db
      .prepare(
        `INSERT OR IGNORE INTO checkout_notifications (stripe_session_id, checkout_type) VALUES (?, ?)`,
      )
      .run(sessionId, checkoutType);
    return result.changes > 0;
  });
}
