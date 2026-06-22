import { createClient } from "@libsql/client";

interface Activity {
  id: number;
  title: string;
  description: string | null;
  date: Date;
  createdAt: Date;
  userCode: string;
  locationId: string | null;
}

interface BusinessTrip {
  id: number;
  title: string;
  city: string;
  startDate: Date;
  endDate: Date;
  notes: string | null;
  createdAt: Date;
  userCode: string;
  locationId: string | null;
}

function mapActivityRow(row: Record<string, unknown>): Activity {
  return {
    id: row.id as number,
    title: row.title as string,
    description: row.description as string | null,
    date: new Date(row.date as string),
    createdAt: new Date(row.createdAt as string),
    userCode: row.userCode as string,
    locationId: (row.location_id as string | null | undefined) ?? null,
  };
}

function mapBusinessTripRow(row: Record<string, unknown>): BusinessTrip {
  return {
    id: row.id as number,
    title: row.title as string,
    city: row.city as string,
    startDate: new Date(row.startDate as string),
    endDate: new Date(row.endDate as string),
    notes: row.notes as string | null,
    createdAt: new Date(row.createdAt as string),
    userCode: row.userCode as string,
    locationId: (row.location_id as string | null | undefined) ?? null,
  };
}

const client = createClient({
  url: process.env.DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

let dbInitialized = false;

async function ensureColumnExists(table: string, column: string, definition: string) {
  const result = await client.execute({ sql: `PRAGMA table_info(${table})` });
  const hasColumn = result.rows.some((row: any) => row.name === column);
  if (!hasColumn) {
    try {
      await client.execute({ sql: `ALTER TABLE ${table} ADD COLUMN ${column} ${definition}` });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (!message.toLowerCase().includes("duplicate column")) {
        throw error;
      }
    }
  }
}

// Initialize tables on first connection
async function ensureTablesExist() {
  if (dbInitialized) return;

  try {
    await client.execute(`
      CREATE TABLE IF NOT EXISTS Activity (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        date DATETIME NOT NULL,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        userCode TEXT NOT NULL
      )
    `);

    await client.execute(`
      CREATE TABLE IF NOT EXISTS BusinessTrip (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        city TEXT NOT NULL,
        notes TEXT,
        startDate DATETIME NOT NULL,
        endDate DATETIME NOT NULL,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        userCode TEXT NOT NULL
      )
    `);

    await ensureColumnExists("Activity", "userCode", "TEXT NOT NULL DEFAULT ''");
    await ensureColumnExists("BusinessTrip", "userCode", "TEXT NOT NULL DEFAULT ''");
    await ensureColumnExists("Activity", "location_id", "TEXT");
    await ensureColumnExists("BusinessTrip", "location_id", "TEXT");

    await client.execute(`
      CREATE TABLE IF NOT EXISTS locations (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        lat REAL NOT NULL,
        lng REAL NOT NULL,
        created_at INTEGER NOT NULL
      )
    `);

    await client.execute(`
      CREATE TABLE IF NOT EXISTS location_fields (
        id TEXT PRIMARY KEY,
        location_id TEXT NOT NULL,
        field_name TEXT NOT NULL,
        field_value TEXT,
        FOREIGN KEY(location_id) REFERENCES locations(id)
      )
    `);

    await client.execute(`
      CREATE INDEX IF NOT EXISTS idx_location_fields_location_id
      ON location_fields(location_id)
    `);

    dbInitialized = true;
  } catch (error) {
    console.error("Failed to initialize tables:", error);
    throw error;
  }
}

export const db = {
  activity: {
    async create(data: {
      title: string;
      description: string | null;
      date: Date;
      userCode: string;
      locationId?: string | null;
    }) {
      await ensureTablesExist();
      const result = await client.execute({
        sql: `INSERT INTO Activity (title, description, date, createdAt, userCode, location_id) VALUES (?, ?, ?, ?, ?, ?)`,
        args: [
          data.title,
          data.description,
          data.date.toISOString(),
          new Date().toISOString(),
          data.userCode,
          data.locationId ?? null,
        ],
      });
      return { id: Number(result.lastInsertRowid) };
    },

    async update(id: number, data: { title?: string; description?: string | null; date?: Date; userCode?: string; locationId?: string | null }) {
      await ensureTablesExist();
      const updates: string[] = [];
      const args: any[] = [];

      if (data.title !== undefined) {
        updates.push("title = ?");
        args.push(data.title);
      }
      if (data.description !== undefined) {
        updates.push("description = ?");
        args.push(data.description);
      }
      if (data.date !== undefined) {
        updates.push("date = ?");
        args.push(data.date.toISOString());
      }
      if (data.locationId !== undefined) {
        updates.push("location_id = ?");
        args.push(data.locationId);
      }

      if (updates.length === 0) return;

      args.push(id);
      if (data.userCode) {
        args.push(data.userCode);
        await client.execute({
          sql: `UPDATE Activity SET ${updates.join(", ")} WHERE id = ? AND userCode = ?`,
          args,
        });
      } else {
        await client.execute({
          sql: `UPDATE Activity SET ${updates.join(", ")} WHERE id = ?`,
          args,
        });
      }
    },

    async delete(id: number, userCode?: string) {
      await ensureTablesExist();
      if (userCode) {
        await client.execute({
          sql: `DELETE FROM Activity WHERE id = ? AND userCode = ?`,
          args: [id, userCode],
        });
      } else {
        await client.execute({
          sql: `DELETE FROM Activity WHERE id = ?`,
          args: [id],
        });
      }
    },

    async findMany(options?: { orderBy?: Record<string, string>; where?: any }) {
      await ensureTablesExist();
      let sql = "SELECT * FROM Activity";
      const args: any[] = [];
      let orderClause = "";

      if (options?.where?.userCode) {
        sql += " WHERE userCode = ?";
        args.push(options.where.userCode);
      }

      if (options?.orderBy) {
        const orderBy = options.orderBy;
        if ("date" in orderBy) {
          orderClause = ` ORDER BY date ${orderBy.date === "asc" ? "ASC" : "DESC"}`;
        }
      }

      const result = await client.execute({ sql: sql + orderClause, args });
      return result.rows.map((row) => mapActivityRow(row as Record<string, unknown>));
    },

    async findMany2(options?: { orderBy?: any; where?: any }) {
      await ensureTablesExist();
      let sql = "SELECT * FROM Activity";
      const args: any[] = [];

      if (options?.where) {
        if (options.where.date) {
          const { gte, lte } = options.where.date;
          if (gte && lte) {
            sql += " WHERE date >= ? AND date <= ?";
            args.push(gte.toISOString(), lte.toISOString());
          }
        }

        if (options.where.userCode) {
          if (args.length > 0) {
            sql += " AND userCode = ?";
          } else {
            sql += " WHERE userCode = ?";
          }
          args.push(options.where.userCode);
        }
      }

      if (options?.orderBy) {
        const orderByArray = Array.isArray(options.orderBy) ? options.orderBy : [options.orderBy];
        const orderClauses = orderByArray
          .map((o: any) => {
            if (o.date) return `date ${o.date === "asc" ? "ASC" : "DESC"}`;
            if (o.createdAt) return `createdAt ${o.createdAt === "asc" ? "ASC" : "DESC"}`;
            return "";
          })
          .filter(Boolean);
        if (orderClauses.length) {
          sql += " ORDER BY " + orderClauses.join(", ");
        }
      }

      const result = await client.execute({
        sql,
        args,
      });

      return result.rows.map((row) => mapActivityRow(row as Record<string, unknown>));
    },
  },

  businessTrip: {
    async create(data: {
      title: string;
      city: string;
      notes: string | null;
      startDate: Date;
      endDate: Date;
      userCode: string;
      locationId?: string | null;
    }) {
      await ensureTablesExist();
      const result = await client.execute({
        sql: `INSERT INTO BusinessTrip (title, city, notes, startDate, endDate, createdAt, userCode, location_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          data.title,
          data.city,
          data.notes,
          data.startDate.toISOString(),
          data.endDate.toISOString(),
          new Date().toISOString(),
          data.userCode,
          data.locationId ?? null,
        ],
      });
      return { id: Number(result.lastInsertRowid) };
    },

    async update(
      id: number,
      data: {
        title?: string;
        city?: string;
        notes?: string | null;
        startDate?: Date;
        endDate?: Date;
        userCode?: string;
        locationId?: string | null;
      }
    ) {
      await ensureTablesExist();
      const updates: string[] = [];
      const args: any[] = [];

      if (data.title !== undefined) {
        updates.push("title = ?");
        args.push(data.title);
      }
      if (data.city !== undefined) {
        updates.push("city = ?");
        args.push(data.city);
      }
      if (data.notes !== undefined) {
        updates.push("notes = ?");
        args.push(data.notes);
      }
      if (data.startDate !== undefined) {
        updates.push("startDate = ?");
        args.push(data.startDate.toISOString());
      }
      if (data.endDate !== undefined) {
        updates.push("endDate = ?");
        args.push(data.endDate.toISOString());
      }
      if (data.locationId !== undefined) {
        updates.push("location_id = ?");
        args.push(data.locationId);
      }

      if (updates.length === 0) return;

      args.push(id);
      if (data.userCode) {
        args.push(data.userCode);
        await client.execute({
          sql: `UPDATE BusinessTrip SET ${updates.join(", ")} WHERE id = ? AND userCode = ?`,
          args,
        });
      } else {
        await client.execute({
          sql: `UPDATE BusinessTrip SET ${updates.join(", ")} WHERE id = ?`,
          args,
        });
      }
    },

    async delete(id: number, userCode?: string) {
      await ensureTablesExist();
      if (userCode) {
        await client.execute({
          sql: `DELETE FROM BusinessTrip WHERE id = ? AND userCode = ?`,
          args: [id, userCode],
        });
      } else {
        await client.execute({
          sql: `DELETE FROM BusinessTrip WHERE id = ?`,
          args: [id],
        });
      }
    },

    async findMany(options?: { orderBy?: Record<string, string>; where?: any }) {
      await ensureTablesExist();
      let sql = "SELECT * FROM BusinessTrip";
      const args: any[] = [];
      let orderClause = "";

      if (options?.where?.userCode) {
        sql += " WHERE userCode = ?";
        args.push(options.where.userCode);
      }

      if (options?.orderBy) {
        const orderBy = options.orderBy;
        if ("startDate" in orderBy) {
          orderClause = ` ORDER BY startDate ${orderBy.startDate === "asc" ? "ASC" : "DESC"}`;
        }
      }

      const result = await client.execute({ sql: sql + orderClause, args });
      return result.rows.map((row) => mapBusinessTripRow(row as Record<string, unknown>));
    },

    async findFirst(options?: { where?: any; orderBy?: Record<string, string> }) {
      await ensureTablesExist();
      let sql = "SELECT * FROM BusinessTrip";
      const args: any[] = [];
      const conditions: string[] = [];

      if (options?.where) {
        if (options.where.startDate?.lte) {
          conditions.push("startDate <= ?");
          args.push(options.where.startDate.lte.toISOString());
        }
        if (options.where.endDate?.gte) {
          conditions.push("endDate >= ?");
          args.push(options.where.endDate.gte.toISOString());
        }
        if (options.where.userCode) {
          conditions.push("userCode = ?");
          args.push(options.where.userCode);
        }
      }

      if (conditions.length) {
        sql += " WHERE " + conditions.join(" AND ");
      }

      if (options?.orderBy) {
        const orderBy = options.orderBy;
        if ("startDate" in orderBy) {
          sql += ` ORDER BY startDate ${orderBy.startDate === "asc" ? "ASC" : "DESC"}`;
        }
      }

      sql += " LIMIT 1";

      const result = await client.execute({ sql, args });
      if (result.rows.length === 0) return null;

      const row = result.rows[0];
      return mapBusinessTripRow(row as Record<string, unknown>);
    },

    async findMany2(options?: { where?: any; orderBy?: Record<string, string> }) {
      await ensureTablesExist();
      let sql = "SELECT * FROM BusinessTrip";
      const args: any[] = [];
      const conditions: string[] = [];

      if (options?.where) {
        if (options.where.startDate?.lte) {
          conditions.push("startDate <= ?");
          args.push(options.where.startDate.lte.toISOString());
        }
        if (options.where.endDate?.gte) {
          conditions.push("endDate >= ?");
          args.push(options.where.endDate.gte.toISOString());
        }
        if (options.where.userCode) {
          conditions.push("userCode = ?");
          args.push(options.where.userCode);
        }
      }

      if (conditions.length) {
        sql += " WHERE " + conditions.join(" AND ");
      }

      if (options?.orderBy) {
        const orderBy = options.orderBy;
        if ("startDate" in orderBy) {
          sql += ` ORDER BY startDate ${orderBy.startDate === "asc" ? "ASC" : "DESC"}`;
        }
      }

      const result = await client.execute({ sql, args });
      return result.rows.map((row) => mapBusinessTripRow(row as Record<string, unknown>));
    },
  },
};

export async function ensureDbReady() {
  await ensureTablesExist();
}

// Export types
export type { Activity, BusinessTrip };
