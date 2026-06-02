import type { RegistrationRecord } from "@/lib/registration/types";
import { usesPostgres, withPostgres, withSqlite } from "./client";
import type { DbRegistration } from "./types";

export type InsertRegistrationInput = RegistrationRecord;

function mapRow(row: Record<string, unknown>): DbRegistration {
  return {
    id: Number(row.id),
    fullName: String(row.full_name ?? row.fullName),
    email: String(row.email),
    phone: String(row.phone),
    registeredAt: String(row.registered_at ?? row.registeredAt),
    marketingConsent: Boolean(row.marketing_consent ?? row.marketingConsent),
    next: String(row.next_step ?? row.next) as DbRegistration["next"],
    service: row.service != null ? String(row.service) : null,
    practitioner: row.practitioner != null ? String(row.practitioner) : null,
    source: String(row.source),
    createdAt: String(row.created_at ?? row.createdAt),
  };
}

export async function insertRegistration(record: InsertRegistrationInput): Promise<DbRegistration> {
  if (usesPostgres()) {
    const [row] = await withPostgres((sql) =>
      sql<Record<string, unknown>[]>`
        INSERT INTO registrations (
          full_name, email, phone, registered_at, marketing_consent,
          next_step, service, practitioner, source
        ) VALUES (
          ${record.fullName},
          ${record.email},
          ${record.phone},
          ${record.registeredAt},
          ${record.marketingConsent},
          ${record.next},
          ${record.service ?? null},
          ${record.practitioner ?? null},
          ${record.source}
        )
        RETURNING *
      `,
    );
    return mapRow(row);
  }

  return withSqlite((db) => {
    const result = db
      .prepare(
        `INSERT INTO registrations (
          full_name, email, phone, registered_at, marketing_consent,
          next_step, service, practitioner, source
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        record.fullName,
        record.email,
        record.phone,
        record.registeredAt,
        record.marketingConsent ? 1 : 0,
        record.next,
        record.service ?? null,
        record.practitioner ?? null,
        record.source,
      );
    const row = db.prepare(`SELECT * FROM registrations WHERE id = ?`).get(result.lastInsertRowid) as Record<
      string,
      unknown
    >;
    return mapRow(row);
  });
}

export type ListRegistrationsOptions = {
  search?: string;
  limit?: number;
  offset?: number;
};

export async function listRegistrations(options: ListRegistrationsOptions = {}): Promise<DbRegistration[]> {
  const limit = Math.min(options.limit ?? 500, 1000);
  const offset = options.offset ?? 0;
  const search = options.search?.trim().toLowerCase();

  if (usesPostgres()) {
    if (search) {
      const pattern = `%${search}%`;
      const rows = await withPostgres((sql) =>
        sql<Record<string, unknown>[]>`
          SELECT * FROM registrations
          WHERE LOWER(full_name) LIKE ${pattern}
             OR LOWER(email) LIKE ${pattern}
             OR LOWER(phone) LIKE ${pattern}
             OR LOWER(source) LIKE ${pattern}
             OR LOWER(COALESCE(service, '')) LIKE ${pattern}
          ORDER BY registered_at DESC
          LIMIT ${limit} OFFSET ${offset}
        `,
      );
      return rows.map(mapRow);
    }
    const rows = await withPostgres((sql) =>
      sql<Record<string, unknown>[]>`
        SELECT * FROM registrations
        ORDER BY registered_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `,
    );
    return rows.map(mapRow);
  }

  return withSqlite((db) => {
    if (search) {
      const pattern = `%${search}%`;
      const rows = db
        .prepare(
          `SELECT * FROM registrations
           WHERE LOWER(full_name) LIKE ?
              OR LOWER(email) LIKE ?
              OR LOWER(phone) LIKE ?
              OR LOWER(source) LIKE ?
              OR LOWER(COALESCE(service, '')) LIKE ?
           ORDER BY registered_at DESC
           LIMIT ? OFFSET ?`,
        )
        .all(pattern, pattern, pattern, pattern, pattern, limit, offset) as Record<string, unknown>[];
      return rows.map(mapRow);
    }
    const rows = db
      .prepare(`SELECT * FROM registrations ORDER BY registered_at DESC LIMIT ? OFFSET ?`)
      .all(limit, offset) as Record<string, unknown>[];
    return rows.map(mapRow);
  });
}

export function registrationsToCsv(rows: DbRegistration[]): string {
  const header = [
    "id",
    "full_name",
    "email",
    "phone",
    "registered_at",
    "marketing_consent",
    "next",
    "service",
    "practitioner",
    "source",
    "created_at",
  ];
  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const lines = [
    header.join(","),
    ...rows.map((r) =>
      [
        r.id,
        r.fullName,
        r.email,
        r.phone,
        r.registeredAt,
        r.marketingConsent ? "yes" : "no",
        r.next,
        r.service ?? "",
        r.practitioner ?? "",
        r.source,
        r.createdAt,
      ]
        .map(String)
        .map(escape)
        .join(","),
    ),
  ];
  return lines.join("\n");
}
