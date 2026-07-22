import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

/**
 * Client Drizzle paresseux.
 *
 * On n'initialise la connexion Postgres que lorsqu'elle est réellement
 * utilisée, et on renvoie `null` si `DATABASE_URL` est absente. Ainsi le site
 * se build et se déploie sur Vercel AVANT même que la base soit branchée :
 * les pages affichent simplement un état vide (voir src/lib/queries.ts).
 *
 * `prepare: false` est requis par le pooler Supabase en mode transaction.
 */
type DrizzleClient = ReturnType<typeof drizzle<typeof schema>>;

let cached: DrizzleClient | null = null;

export function getDb(): DrizzleClient | null {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  if (!cached) {
    const client = postgres(url, { prepare: false });
    cached = drizzle(client, { schema });
  }
  return cached;
}
