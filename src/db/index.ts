import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

/**
 * Neon Database + Drizzle ORM Connection Client
 * 
 * Serverless HTTP Driver:
 * Neon HTTP driver serverless environments (Vercel Edge & Serverless Functions) ke liye
 * best hai kyunki ye TCP connection pool exhaust hone se bachata hai.
 * 
 * Saath me `schema` pass karne se `db.query.users.findMany()` jaise type-safe relational queries milti hain.
 */
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set in environment variables");
}

const sql = neon(process.env.DATABASE_URL);

export const db = drizzle(sql, { schema });

export default db;
