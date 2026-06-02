import { usesPostgres, withPostgres, withSqlite } from "./client";
import type { PageViewInput } from "@/lib/analytics/types";

function daysAgoIso(days: number): string {
  return new Date(Date.now() - days * 86_400_000).toISOString();
}

export async function recordPageView(input: PageViewInput): Promise<void> {
  const referrer = input.referrer?.trim().slice(0, 500) || null;

  if (usesPostgres()) {
    await withPostgres((sql) =>
      sql`
        INSERT INTO page_views (session_id, path, referrer)
        VALUES (${input.sessionId}, ${input.path}, ${referrer})
      `,
    );
    return;
  }

  await withSqlite((db) => {
    db.prepare(`INSERT INTO page_views (session_id, path, referrer) VALUES (?, ?, ?)`).run(
      input.sessionId,
      input.path,
      referrer,
    );
  });
}

export async function countPageViews(since: string, until?: string): Promise<number> {
  if (usesPostgres()) {
    if (until) {
      const [row] = await withPostgres((sql) =>
        sql<{ count: string }[]>`
          SELECT COUNT(*)::text AS count FROM page_views
          WHERE created_at >= ${since} AND created_at < ${until}
        `,
      );
      return Number(row?.count ?? 0);
    }
    const [row] = await withPostgres((sql) =>
      sql<{ count: string }[]>`
        SELECT COUNT(*)::text AS count FROM page_views WHERE created_at >= ${since}
      `,
    );
    return Number(row?.count ?? 0);
  }

  return withSqlite((db) => {
    if (until) {
      const row = db
        .prepare(`SELECT COUNT(*) AS count FROM page_views WHERE created_at >= ? AND created_at < ?`)
        .get(since, until) as { count: number };
      return Number(row.count);
    }
    const row = db
      .prepare(`SELECT COUNT(*) AS count FROM page_views WHERE created_at >= ?`)
      .get(since) as { count: number };
    return Number(row.count);
  });
}

export async function countUniqueSessions(since: string): Promise<number> {
  if (usesPostgres()) {
    const [row] = await withPostgres((sql) =>
      sql<{ count: string }[]>`
        SELECT COUNT(DISTINCT session_id)::text AS count FROM page_views WHERE created_at >= ${since}
      `,
    );
    return Number(row?.count ?? 0);
  }

  return withSqlite((db) => {
    const row = db
      .prepare(`SELECT COUNT(DISTINCT session_id) AS count FROM page_views WHERE created_at >= ?`)
      .get(since) as { count: number };
    return Number(row.count);
  });
}

export async function topPages(
  since: string,
  limit = 10,
): Promise<{ path: string; views: number }[]> {
  if (usesPostgres()) {
    const rows = await withPostgres((sql) =>
      sql<{ path: string; views: string }[]>`
        SELECT path, COUNT(*)::text AS views FROM page_views
        WHERE created_at >= ${since}
        GROUP BY path
        ORDER BY COUNT(*) DESC
        LIMIT ${limit}
      `,
    );
    return rows.map((r) => ({ path: r.path, views: Number(r.views) }));
  }

  return withSqlite((db) => {
    const rows = db
      .prepare(
        `SELECT path, COUNT(*) AS views FROM page_views
         WHERE created_at >= ?
         GROUP BY path
         ORDER BY views DESC
         LIMIT ?`,
      )
      .all(since, limit) as { path: string; views: number }[];
    return rows.map((r) => ({ path: r.path, views: Number(r.views) }));
  });
}

export async function countPageViewsForPath(since: string, pathPrefix: string): Promise<number> {
  if (usesPostgres()) {
    const pattern = `${pathPrefix}%`;
    const [row] = await withPostgres((sql) =>
      sql<{ count: string }[]>`
        SELECT COUNT(*)::text AS count FROM page_views
        WHERE created_at >= ${since} AND path LIKE ${pattern}
      `,
    );
    return Number(row?.count ?? 0);
  }

  return withSqlite((db) => {
    const row = db
      .prepare(`SELECT COUNT(*) AS count FROM page_views WHERE created_at >= ? AND path LIKE ?`)
      .get(since, `${pathPrefix}%`) as { count: number };
    return Number(row.count);
  });
}

export { daysAgoIso };
