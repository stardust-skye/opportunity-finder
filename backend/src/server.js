import { PrismaClient } from "@prisma/client";
import connectPgSimple from "connect-pg-simple";
import session from "express-session";
import pg from "pg";
import { createApp } from "./app.js";
import { loadConfig } from "./config.js";

const config = loadConfig();
const db = new PrismaClient();
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const PgStore = connectPgSimple(session);
const store = new PgStore({ pool, createTableIfMissing: false, errorLog: (error) => console.error("Session store error:", error) });
store.on("error", (error) => console.error("Session store error:", error));

try {
  await db.$connect();
  await pool.query('SELECT 1 FROM "session" LIMIT 1');
  const server = createApp({ db, store, config }).listen(config.port, () => console.log(`API listening on port ${config.port}`));
  async function shutdown() {
    server.close(async () => {
      store.close();
      await pool.end();
      await db.$disconnect();
    });
  }
  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);
} catch (error) {
  console.error("Could not start API:", error);
  store.close();
  await pool.end();
  await db.$disconnect();
  process.exitCode = 1;
}
