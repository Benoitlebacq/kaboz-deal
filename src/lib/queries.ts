import { and, desc, eq, ilike, or, sql, type SQL } from "drizzle-orm";
import { getDb } from "@/db";
import {
  products,
  allowedDomains,
  type Product,
  type Section,
  type AllowedDomain,
} from "@/db/schema";

export type ProductFilters = {
  cat?: string;
  marchand?: string;
  promo?: boolean;
  tri?: string;
};

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

/** Liste des marchands distincts déjà utilisés (pour peupler le select admin). */
export async function getMerchants(): Promise<string[]> {
  const db = getDb();
  if (!db) return [];
  const rows = await db
    .selectDistinct({ marchand: products.marchand })
    .from(products);
  return rows.map((r) => r.marchand).filter(Boolean);
}

/** Options de filtres (sous-catégories + marchands) actives dans une section. */
export async function getFilterOptions(
  section: Section,
): Promise<{ subcategories: string[]; merchants: string[] }> {
  const db = getDb();
  if (!db) return { subcategories: [], merchants: [] };
  const where = and(eq(products.actif, true), eq(products.section, section));

  const [subRows, merchRows] = await Promise.all([
    db.selectDistinct({ v: products.sousCategorie }).from(products).where(where),
    db.selectDistinct({ v: products.marchand }).from(products).where(where),
  ]);

  const clean = (rows: { v: string | null }[]) =>
    rows
      .map((r) => r.v)
      .filter((v): v is string => Boolean(v))
      .sort((a, b) => a.localeCompare(b, "fr"));

  return { subcategories: clean(subRows), merchants: clean(merchRows) };
}

/** Sous-catégories distinctes (toutes sections) — pour l'autocomplétion admin. */
export async function getSubcategories(): Promise<string[]> {
  const db = getDb();
  if (!db) return [];
  const rows = await db
    .selectDistinct({ v: products.sousCategorie })
    .from(products);
  return rows
    .map((r) => r.v)
    .filter((v): v is string => Boolean(v))
    .sort((a, b) => a.localeCompare(b, "fr"));
}

/** Produits d'une section, filtrés et triés (pour /tech et /jeux-video). */
export async function getFilteredProducts(
  section: Section,
  filters: ProductFilters,
): Promise<Product[]> {
  const db = getDb();
  if (!db) return [];

  const conditions: SQL[] = [
    eq(products.actif, true),
    eq(products.section, section),
  ];
  if (filters.cat) conditions.push(eq(products.sousCategorie, filters.cat));
  if (filters.marchand)
    conditions.push(eq(products.marchand, filters.marchand));
  // Promo : remise ≥ 50 % (prix ≤ prix_barré / 2).
  if (filters.promo) {
    conditions.push(
      sql`${products.prixBarre} is not null and ${products.prix} is not null and ${products.prix} <= ${products.prixBarre} * 0.5`,
    );
  }

  const discount = sql`case when ${products.prixBarre} is not null and ${products.prix} is not null and ${products.prixBarre} > 0 then (1 - ${products.prix} / ${products.prixBarre}) else 0 end`;
  let orderBy: SQL;
  switch (filters.tri) {
    case "prix-asc":
      orderBy = sql`${products.prix} asc nulls last`;
      break;
    case "prix-desc":
      orderBy = sql`${products.prix} desc nulls last`;
      break;
    case "remise":
      orderBy = sql`${discount} desc`;
      break;
    case "populaires":
      orderBy = sql`${products.clicks} desc`;
      break;
    default:
      orderBy = sql`${products.dateMaj} desc`;
      break;
  }

  return db
    .select()
    .from(products)
    .where(and(...conditions))
    .orderBy(orderBy);
}

/** Domaines d'images ajoutés depuis l'admin (extras, en plus des défauts code). */
export async function getAllowedDomains(): Promise<AllowedDomain[]> {
  const db = getDb();
  if (!db) return [];
  return db.select().from(allowedDomains).orderBy(allowedDomains.domain);
}

/** Admin : tous les produits, y compris inactifs. */
export async function getAllProductsAdmin(): Promise<Product[]> {
  const db = getDb();
  if (!db) return [];
  return db.select().from(products).orderBy(desc(products.createdAt));
}
