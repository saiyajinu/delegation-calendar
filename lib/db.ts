import { createClient } from "@libsql/client";

interface Activity {
  id: number;
  title: string;
  description: string | null;
  date: Date;
  createdAt: Date;
}

interface BusinessTrip {
  id: number;
  title: string;
  city: string;
  startDate: Date;
  endDate: Date;
  notes: string | null;
  createdAt: Date;
}

const client = createClient({
  url: process.env.DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

let dbInitialized = false;

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
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.execute(`
      CREATE TABLE IF NOT EXISTS BusinessTrip (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        city TEXT NOT NULL,
        startDate DATETIME NOT NULL,
        endDate DATETIME NOT NULL,
        notes TEXT,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    dbInitialized = true;
  } catch (error) {
    console.error("Failed to initialize tables:", error);
    throw error;
  }
}

export const db = {
  activity: {
    async create(data: { title: string; description: string | null; date: Date }) {
      await ensureTablesExist();
      const result = await client.execute({
        sql: `INSERT INTO Activity (title, description, date, createdAt) VALUES (?, ?, ?, ?)`,
        args: [data.title, data.description, data.date.toISOString(), new Date().toISOString()],
      });
      return { id: Number(result.lastInsertRowid) };
    },

    async findMany(options?: { orderBy?: Record<string, string>; where?: any }) {
      await ensureTablesExist();
      let sql = "SELECT * FROM Activity";
      let orderClause = "";

      if (options?.orderBy) {
        const orderBy = options.orderBy;
        if ("date" in orderBy) {
          orderClause = ` ORDER BY date ${orderBy.date === "asc" ? "ASC" : "DESC"}`;
        }
      }

      const result = await client.execute(sql + orderClause);
      return result.rows.map((row) => ({
        id: row.id as number,
        title: row.title as string,
        description: row.description as string | null,
        date: new Date(row.date as string),
        createdAt: new Date(row.createdAt as string),
      })) as Activity[];
    },

    async findMany2(options?: { orderBy?: any; where?: any }) {
      await ensureTablesExist();
      let sql = "SELECT * FROM Activity";
      const args: any[] = [];

      if (options?.where?.date) {
        const { gte, lte } = options.where.date;
        if (gte && lte) {
          sql += " WHERE date >= ? AND date <= ?";
          args.push(gte.toISOString(), lte.toISOString());
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

      return result.rows.map((row) => ({
        id: row.id as number,
        title: row.title as string,
        description: row.description as string | null,
        date: new Date(row.date as string),
        createdAt: new Date(row.createdAt as string),
      })) as Activity[];
    },
  },

  businessTrip: {
    async create(data: {
      title: string;
      city: string;
      notes: string | null;
      startDate: Date;
      endDate: Date;
    }) {
      await ensureTablesExist();
      const result = await client.execute({
        sql: `INSERT INTO BusinessTrip (title, city, notes, startDate, endDate, createdAt) VALUES (?, ?, ?, ?, ?, ?)`,
        args: [
          data.title,
          data.city,
          data.notes,
          data.startDate.toISOString(),
          data.endDate.toISOString(),
          new Date().toISOString(),
        ],
      });
      return { id: Number(result.lastInsertRowid) };
    },

    async findMany(options?: { orderBy?: Record<string, string>; where?: any }) {
      await ensureTablesExist();
      let sql = "SELECT * FROM BusinessTrip";
      let orderClause = "";

      if (options?.orderBy) {
        const orderBy = options.orderBy;
        if ("startDate" in orderBy) {
          orderClause = ` ORDER BY startDate ${orderBy.startDate === "asc" ? "ASC" : "DESC"}`;
        }
      }

      const result = await client.execute(sql + orderClause);
      return result.rows.map((row) => ({
        id: row.id as number,
        title: row.title as string,
        city: row.city as string,
        startDate: new Date(row.startDate as string),
        endDate: new Date(row.endDate as string),
        notes: row.notes as string | null,
        createdAt: new Date(row.createdAt as string),
      })) as BusinessTrip[];
    },

    async findFirst(options?: { where?: any; orderBy?: Record<string, string> }) {
      await ensureTablesExist();
      let sql = "SELECT * FROM BusinessTrip";
      const args: any[] = [];

      if (options?.where) {
        const conditions = [];
        if (options.where.startDate?.lte) {
          conditions.push("startDate <= ?");
          args.push(options.where.startDate.lte.toISOString());
        }
        if (options.where.endDate?.gte) {
          conditions.push("endDate >= ?");
          args.push(options.where.endDate.gte.toISOString());
        }
        if (conditions.length) {
          sql += " WHERE " + conditions.join(" AND ");
        }
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
      return {
        id: row.id as number,
        title: row.title as string,
        city: row.city as string,
        startDate: new Date(row.startDate as string),
        endDate: new Date(row.endDate as string),
        notes: row.notes as string | null,
        createdAt: new Date(row.createdAt as string),
      } as BusinessTrip;
    },

    async findMany2(options?: { where?: any; orderBy?: Record<string, string> }) {
      await ensureTablesExist();
      let sql = "SELECT * FROM BusinessTrip";
      const args: any[] = [];

      if (options?.where) {
        const conditions = [];
        if (options.where.startDate?.lte) {
          conditions.push("startDate <= ?");
          args.push(options.where.startDate.lte.toISOString());
        }
        if (options.where.endDate?.gte) {
          conditions.push("endDate >= ?");
          args.push(options.where.endDate.gte.toISOString());
        }
        if (conditions.length) {
          sql += " WHERE " + conditions.join(" AND ");
        }
      }

      if (options?.orderBy) {
        const orderBy = options.orderBy;
        if ("startDate" in orderBy) {
          sql += ` ORDER BY startDate ${orderBy.startDate === "asc" ? "ASC" : "DESC"}`;
        }
      }

      const result = await client.execute({ sql, args });
      return result.rows.map((row) => ({
        id: row.id as number,
        title: row.title as string,
        city: row.city as string,
        startDate: new Date(row.startDate as string),
        endDate: new Date(row.endDate as string),
        notes: row.notes as string | null,
        createdAt: new Date(row.createdAt as string),
      })) as BusinessTrip[];
    },
  },
};

// Export types
export type { Activity, BusinessTrip };
