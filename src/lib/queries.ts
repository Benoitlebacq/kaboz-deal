import { and, desc, eq, ilike, or } from "drizzle-orm";
import { getDb } from "@/db";
import { products, type Product, type Section } from "@/db/schema";

/**
 * Toutes les lectures passent par ici. Si la base n'est pas branchée
 * (DATABASE_URL absente), on renvoie un résultat vide plutôt que de planter
 * -> le site build et se déploie, puis s'allume dès que la BDD est connectée.
 */

export async function getFeaturedProducts(limit = 6): Promise<Product[]> {
  const db = getDb();
  if (!db) return [];
  return db
    .select()
    .from(products)
    .where(and(eq(products.actif, true), eq(products.misEnAvant, true)))
    .orderBy(desc(products.dateMaj))
    .limit(limit);
}

export async function getProductsBySection(section: Section): Promise<Product[]> {
  const db = getDb();
  if (!db) return [];
  return db
    .select()
    .from(products)
    .where(and(eq(products.actif, true), eq(products.section, section)))
    .orderBy(desc(products.dateMaj));
}

export async function getAllActiveProducts(): Promise<Product[]> {
  const db = getDb();
  if (!db) return [];
  return db
    .select()
    .from(products)
    .where(eq(products.actif, true))
    .orderBy(desc(products.dateMaj));
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const db = getDb();
  if (!db) return null;
  const rows = await db
    .select()
    .from(products)
    .where(eq(products.slug, slug))
    .limit(1);
  return rows[0] ?? null;
}

export async function getProductById(id: string): Promise<Product | null> {
  const db = getDb();
  if (!db) return null;
  const rows = await db
    .select()
    .from(products)
    .where(eq(products.id, id))
    .limit(1);
  return rows[0] ?? null;
}

/** Recherche par titre / description / sous-catégorie (produits actifs). */
export async function searchProducts(q: string): Promise<Product[]> {
  const db = getDb();
  if (!db) return [];
  const term = `%${q}%`;
  return db
    .select()
    .from(products)
    .where(
      and(
        eq(products.actif, true),
        or(
          ilike(products.titre, term),
          ilike(products.description, term),
          ilike(products.sousCategorie, term),
        ),
      ),
    )
    .orderBy(desc(products.dateMaj))
    .limit(50);
}

/** Admin : tous les produits, y compris inactifs. */
export async function getAllProductsAdmin(): Promise<Product[]> {
  const db = getDb();
  if (!db) return [];
  return db.select().from(products).orderBy(desc(products.createdAt));
}
