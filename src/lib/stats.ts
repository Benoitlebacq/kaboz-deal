import { sql, and, eq, desc } from "drizzle-orm";
import { getDb } from "@/db";
import { products, events, type Section } from "@/db/schema";

export type ClickStats = {
  totalClicks: number;
  activeCount: number;
  avgClicksPerActive: number;
  zeroClickActive: number;
  featuredAvg: number;
  normalAvg: number;
  bySection: { section: Section; clicks: number }[];
  byMerchant: { marchand: string; clicks: number }[];
  topDeals: {
    id: string;
    titre: string;
    slug: string;
    section: string;
    marchand: string;
    clicks: number;
  }[];
};

/** Stats de clics « all-time » (depuis le compteur products.clicks). */
export async function getClickStats(): Promise<ClickStats | null> {
  const db = getDb();
  if (!db) return null;

  const sumClicks = sql<number>`coalesce(sum(${products.clicks}), 0)::int`;

  const [totals] = await db
    .select({
      totalClicks: sumClicks,
      activeCount: sql<number>`count(*)::int`,
      avg: sql<number>`coalesce(avg(${products.clicks}), 0)::float`,
    })
    .from(products)
    .where(eq(products.actif, true));

  const [featured] = await db
    .select({
      featuredAvg: sql<number>`coalesce(avg(${products.clicks}) filter (where ${products.misEnAvant}), 0)::float`,
      normalAvg: sql<number>`coalesce(avg(${products.clicks}) filter (where not ${products.misEnAvant}), 0)::float`,
    })
    .from(products)
    .where(eq(products.actif, true));

  const [zero] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(products)
    .where(and(eq(products.actif, true), eq(products.clicks, 0)));

  const bySection = await db
    .select({ section: products.section, clicks: sumClicks })
    .from(products)
    .where(eq(products.actif, true))
    .groupBy(products.section)
    .orderBy(desc(sumClicks));

  const byMerchant = await db
    .select({ marchand: products.marchand, clicks: sumClicks })
    .from(products)
    .where(eq(products.actif, true))
    .groupBy(products.marchand)
    .orderBy(desc(sumClicks));

  const topDeals = await db
    .select({
      id: products.id,
      titre: products.titre,
      slug: products.slug,
      section: products.section,
      marchand: products.marchand,
      clicks: products.clicks,
    })
    .from(products)
    .where(eq(products.actif, true))
    .orderBy(desc(products.clicks))
    .limit(5);

  return {
    totalClicks: totals?.totalClicks ?? 0,
    activeCount: totals?.activeCount ?? 0,
    avgClicksPerActive: totals?.avg ?? 0,
    zeroClickActive: zero?.n ?? 0,
    featuredAvg: featured?.featuredAvg ?? 0,
    normalAvg: featured?.normalAvg ?? 0,
    bySection,
    byMerchant,
    topDeals,
  };
}

export type TrendBucket = { label: string; clicks: number };

/**
 * Tendance des clics par semaine ou par mois (depuis la table events).
 * Fenêtre : 8 dernières semaines ou 6 derniers mois.
 */
export async function getClickTrend(
  period: "week" | "month",
): Promise<TrendBucket[]> {
  const db = getDb();
  if (!db) return [];

  // Unité inlinée en littéral (valeur contrôlée) : Postgres ne sait pas inférer
  // le type d'un paramètre dans date_trunc(...).
  const unit = period === "week" ? sql.raw("'week'") : sql.raw("'month'");
  const interval =
    period === "week" ? sql`interval '8 weeks'` : sql`interval '6 months'`;
  const bucket = sql`date_trunc(${unit}, ${events.createdAt})`;

  const rows = await db
    .select({
      label: sql<string>`to_char(${bucket}, 'YYYY-MM-DD')`,
      clicks: sql<number>`count(*)::int`,
    })
    .from(events)
    .where(
      sql`${events.type} = 'click' and ${events.createdAt} >= now() - ${interval}`,
    )
    .groupBy(bucket)
    .orderBy(bucket);

  return rows;
}
