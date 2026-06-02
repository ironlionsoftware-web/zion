import { usesPostgres, withPostgres, withSqlite } from "./client";
import type { DbShopOrder, ShopOrderLine, ShopOrderStatus } from "./types";

export type InsertShopOrderInput = {
  stripeSessionId: string;
  fullName: string;
  email: string;
  phone: string;
  lineItems: ShopOrderLine[];
  fulfillmentNote: string | null;
  subtotalCents: number;
  paymentPlan: string;
  paidAt: string;
};

function parseLineItems(raw: unknown): ShopOrderLine[] {
  if (Array.isArray(raw)) return raw as ShopOrderLine[];
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw) as ShopOrderLine[];
    } catch {
      return [];
    }
  }
  return [];
}

function mapRow(row: Record<string, unknown>): DbShopOrder {
  return {
    id: Number(row.id),
    stripeSessionId: String(row.stripe_session_id ?? row.stripeSessionId),
    fullName: String(row.full_name ?? row.fullName),
    email: String(row.email),
    phone: String(row.phone),
    lineItems: parseLineItems(row.line_items ?? row.lineItems),
    fulfillmentNote: row.fulfillment_note != null ? String(row.fulfillment_note) : null,
    subtotalCents: Number(row.subtotal_cents ?? row.subtotalCents),
    paymentPlan: String(row.payment_plan ?? row.paymentPlan),
    paidAt: String(row.paid_at ?? row.paidAt),
    status: String(row.status) as ShopOrderStatus,
    internalNotes: row.internal_notes != null ? String(row.internal_notes) : null,
    fulfillmentUpdatedAt:
      row.fulfillment_updated_at != null ? String(row.fulfillment_updated_at) : null,
    createdAt: String(row.created_at ?? row.createdAt),
  };
}

export async function insertShopOrder(input: InsertShopOrderInput): Promise<DbShopOrder | null> {
  const lineItemsJson = JSON.stringify(input.lineItems);

  if (usesPostgres()) {
    try {
      const [row] = await withPostgres((sql) =>
        sql<Record<string, unknown>[]>`
          INSERT INTO shop_orders (
            stripe_session_id, full_name, email, phone, line_items,
            fulfillment_note, subtotal_cents, payment_plan, paid_at
          ) VALUES (
            ${input.stripeSessionId},
            ${input.fullName},
            ${input.email},
            ${input.phone},
            ${sql.json(input.lineItems)},
            ${input.fulfillmentNote},
            ${input.subtotalCents},
            ${input.paymentPlan},
            ${input.paidAt}
          )
          ON CONFLICT (stripe_session_id) DO NOTHING
          RETURNING *
        `,
      );
      return row ? mapRow(row) : null;
    } catch {
      return null;
    }
  }

  return withSqlite((db) => {
    try {
      const existing = db.prepare(`SELECT id FROM shop_orders WHERE stripe_session_id = ?`).get(input.stripeSessionId);
      if (existing) return null;

      const result = db
        .prepare(
          `INSERT INTO shop_orders (
            stripe_session_id, full_name, email, phone, line_items,
            fulfillment_note, subtotal_cents, payment_plan, paid_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .run(
          input.stripeSessionId,
          input.fullName,
          input.email,
          input.phone,
          lineItemsJson,
          input.fulfillmentNote,
          input.subtotalCents,
          input.paymentPlan,
          input.paidAt,
        );
      const row = db.prepare(`SELECT * FROM shop_orders WHERE id = ?`).get(result.lastInsertRowid) as Record<
        string,
        unknown
      >;
      return mapRow(row);
    } catch {
      return null;
    }
  });
}

export async function getShopOrderBySessionId(sessionId: string): Promise<DbShopOrder | null> {
  if (usesPostgres()) {
    const [row] = await withPostgres((sql) =>
      sql<Record<string, unknown>[]>`
        SELECT * FROM shop_orders WHERE stripe_session_id = ${sessionId}
      `,
    );
    return row ? mapRow(row) : null;
  }

  return withSqlite((db) => {
    const row = db
      .prepare(`SELECT * FROM shop_orders WHERE stripe_session_id = ?`)
      .get(sessionId) as Record<string, unknown> | undefined;
    return row ? mapRow(row) : null;
  });
}

export async function updateShopOrderStatus(
  id: number,
  update: { status?: ShopOrderStatus; internalNotes?: string | null },
): Promise<DbShopOrder | null> {
  const current = await getShopOrderById(id);
  if (!current) return null;

  const status = update.status ?? current.status;
  const internalNotes =
    update.internalNotes !== undefined ? update.internalNotes : current.internalNotes;
  const now = new Date().toISOString();

  if (usesPostgres()) {
    const [row] = await withPostgres((sql) =>
      sql<Record<string, unknown>[]>`
        UPDATE shop_orders SET
          status = ${status},
          internal_notes = ${internalNotes},
          fulfillment_updated_at = ${now}
        WHERE id = ${id}
        RETURNING *
      `,
    );
    return row ? mapRow(row) : null;
  }

  return withSqlite((db) => {
    db.prepare(
      `UPDATE shop_orders SET status = ?, internal_notes = ?, fulfillment_updated_at = ? WHERE id = ?`,
    ).run(status, internalNotes, now, id);
    const row = db.prepare(`SELECT * FROM shop_orders WHERE id = ?`).get(id) as Record<string, unknown>;
    return mapRow(row);
  });
}

async function getShopOrderById(id: number): Promise<DbShopOrder | null> {
  if (usesPostgres()) {
    const [row] = await withPostgres((sql) =>
      sql<Record<string, unknown>[]>`
        SELECT * FROM shop_orders WHERE id = ${id}
      `,
    );
    return row ? mapRow(row) : null;
  }

  return withSqlite((db) => {
    const row = db.prepare(`SELECT * FROM shop_orders WHERE id = ?`).get(id) as Record<string, unknown> | undefined;
    return row ? mapRow(row) : null;
  });
}

export type ListShopOrdersOptions = {
  search?: string;
  status?: ShopOrderStatus;
  limit?: number;
  offset?: number;
};

export async function listShopOrders(options: ListShopOrdersOptions = {}): Promise<DbShopOrder[]> {
  const limit = Math.min(options.limit ?? 500, 1000);
  const offset = options.offset ?? 0;
  const search = options.search?.trim().toLowerCase();
  const status = options.status;

  if (usesPostgres()) {
    if (search && status) {
      const pattern = `%${search}%`;
      const rows = await withPostgres((sql) =>
        sql<Record<string, unknown>[]>`
          SELECT * FROM shop_orders
          WHERE status = ${status}
            AND (LOWER(full_name) LIKE ${pattern} OR LOWER(email) LIKE ${pattern})
          ORDER BY paid_at DESC LIMIT ${limit} OFFSET ${offset}
        `,
      );
      return rows.map(mapRow);
    }
    if (status) {
      const rows = await withPostgres((sql) =>
        sql<Record<string, unknown>[]>`
          SELECT * FROM shop_orders WHERE status = ${status}
          ORDER BY paid_at DESC LIMIT ${limit} OFFSET ${offset}
        `,
      );
      return rows.map(mapRow);
    }
    if (search) {
      const pattern = `%${search}%`;
      const rows = await withPostgres((sql) =>
        sql<Record<string, unknown>[]>`
          SELECT * FROM shop_orders
          WHERE LOWER(full_name) LIKE ${pattern} OR LOWER(email) LIKE ${pattern}
          ORDER BY paid_at DESC LIMIT ${limit} OFFSET ${offset}
        `,
      );
      return rows.map(mapRow);
    }
    const rows = await withPostgres((sql) =>
      sql<Record<string, unknown>[]>`
        SELECT * FROM shop_orders ORDER BY paid_at DESC LIMIT ${limit} OFFSET ${offset}
      `,
    );
    return rows.map(mapRow);
  }

  return withSqlite((db) => {
    if (search && status) {
      const pattern = `%${search}%`;
      const rows = db
        .prepare(
          `SELECT * FROM shop_orders
           WHERE status = ? AND (LOWER(full_name) LIKE ? OR LOWER(email) LIKE ?)
           ORDER BY paid_at DESC LIMIT ? OFFSET ?`,
        )
        .all(status, pattern, pattern, limit, offset) as Record<string, unknown>[];
      return rows.map(mapRow);
    }
    if (status) {
      const rows = db
        .prepare(`SELECT * FROM shop_orders WHERE status = ? ORDER BY paid_at DESC LIMIT ? OFFSET ?`)
        .all(status, limit, offset) as Record<string, unknown>[];
      return rows.map(mapRow);
    }
    if (search) {
      const pattern = `%${search}%`;
      const rows = db
        .prepare(
          `SELECT * FROM shop_orders
           WHERE LOWER(full_name) LIKE ? OR LOWER(email) LIKE ?
           ORDER BY paid_at DESC LIMIT ? OFFSET ?`,
        )
        .all(pattern, pattern, limit, offset) as Record<string, unknown>[];
      return rows.map(mapRow);
    }
    const rows = db
      .prepare(`SELECT * FROM shop_orders ORDER BY paid_at DESC LIMIT ? OFFSET ?`)
      .all(limit, offset) as Record<string, unknown>[];
    return rows.map(mapRow);
  });
}
