import { PrismaClient, type Prisma } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const logLevels: Prisma.LogLevel[] =
  process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"];

function createPrismaClient(): PrismaClient {
  const url = process.env.DATABASE_URL;

  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }

  if (url.startsWith("libsql:")) {
    const authToken = process.env.TURSO_AUTH_TOKEN;
    if (!authToken) {
      throw new Error(
        "TURSO_AUTH_TOKEN is required when DATABASE_URL uses libsql://",
      );
    }
    const adapter = new PrismaLibSQL({ url, authToken });
    return new PrismaClient({ adapter, log: logLevels });
  }

  if (!url.startsWith("file:")) {
    throw new Error(
      'DATABASE_URL must start with "file:" (local SQLite) or "libsql:" (Turso)',
    );
  }

  return new PrismaClient({ log: logLevels });
}

function getPrismaClient(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }
  return globalForPrisma.prisma;
}

/** Lazy client — Turso env vars are not read until the first query. */
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrismaClient();
    const value = Reflect.get(client, prop, client);
    return typeof value === "function"
      ? (value as (...args: unknown[]) => unknown).bind(client)
      : value;
  },
});
