import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

function databaseUrl() {
  if (process.env.TURSO_DATABASE_URL) {
    if (!process.env.TURSO_AUTH_TOKEN) {
      throw new Error("TURSO_AUTH_TOKEN is required when TURSO_DATABASE_URL is set.");
    }
    return process.env.TURSO_DATABASE_URL;
  }

  const dbPath = resolve(process.env.DB_PATH ?? "data/journal.db");
  mkdirSync(dirname(dbPath), { recursive: true });
  return pathToFileURL(dbPath).href;
}

const client = createClient({
  url: databaseUrl(),
  authToken: process.env.TURSO_DATABASE_URL ? process.env.TURSO_AUTH_TOKEN : undefined,
});

export const db = drizzle(client, { schema });
export { schema };
