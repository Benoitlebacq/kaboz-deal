import { sql, and, eq, desc } from "drizzle-orm";
import { getDb } from "@/db";
import { products, events, type Section } from "@/db/schema";

// ============================ Catalogue & qualité ============================

export type CatalogStats = {
  total: number;
  actifs: number;
  masques: number;
  alaune: number;
  remiseMoyenne: number;
  sansImage: number;
  sansDescription: number;
  sansPrix: number;
  parSection: { section: Section; n: number }[];
  parMarchand: { marchand: string; n: number }[];
};

export async function getCatalogStats(): Promise<CatalogStats | null> {
  const db = getDb();
  if (!db) return null;

  const [c] = await db
    .select({
      total: sql<number>`count(*)::int`,
      actifs: sql<number>`count(*) filter (where ${products.actif})::int`,
      masques: sql<number>`count(*) filter (where not ${products.actif})::int`,
      alaune: sql<number>`count(*) filter (where ${products.actif} and ${products.misEnAvant})::int`,
      sansImage: sql<number>`count(*) filter (where ${products.actif} and (${products.imageUrl} is null or ${products.imageUrl} = ''))::int`,
      sansDescription: sql<number>`count(*) filter (where ${products.actif} and (${products.description} is null or ${products.description} = ''))::int`,
      sansPrix: sql<number>`count(*) filter (where ${products.actif} and ${products.prix} is null)::int`,
      remiseMoyenne: sql<number>`coalesce(avg((1 - ${products.prix} / ${products.prixBarre}) * 100) filter (where ${products.actif} and ${products.prixBarre} is not null and ${products.prix} is not null and ${products.prixBarre} > 0), 0)::float`,
    })
    .from(products);

  const parSection = await db
    .select({ section: products.section, n: sql<number>`count(*)::int` })
    .from(products)
    .where(eq(products.actif, true))
    .groupBy(products.section)
    .orderBy(desc(sql`count(*)`));

  const parMarchand = await db
    .select({ marchand: products.marchand, n: sql<number>`count(*)::int` })
    .from(products)
    .where(eq(products.actif, true))
    .groupBy(products.marchand)
    .orderBy(desc(sql`count(*)`));

  return {
    total: c?.total ?? 0,
    actifs: c?.actifs ?? 0,
    masques: c?.masques ?? 0,
    alaune: c?.alaune ?? 0,
    remiseMoyenne: c?.remiseMoyenne ?? 0,
    sansImage: c?.sansImage ?? 0,
    sansDescription: c?.sansDescription ?? 0,
    sansPrix: c?.sansPrix ?? 0,
    parSection,
    parMarchand,
  };
}

// ================================ Alertes ===================================

export type AlertItem = {
  id: string;
  titre: string;
  dateFin: Date | null;
  clicks: number;
};

export type Alerts = {
  expireBientot: AlertItem[];
  expireMaisActif: AlertItem[];
  zeroClics: AlertItem[];
};

export async function getAlerts(): Promise<Alerts | null> {
  const db = getDb();
  if (!db) return null;
  const cols = {
    id: products.id,
    titre: products.titre,
    dateFin: products.dateFin,
    clicks: products.clicks,
  };

  const [expireBientot, expireMaisActif, zeroClics] = await Promise.all([
    db
      .select(cols)
      .from(products)
      .where(
        sql`${products.actif} and ${products.dateFin} is not null and ${products.dateFin} between now() and now() + interval '3 days'`,
      )
      .orderBy(sql`${products.dateFin} asc`)
      .limit(20),
    db
      .select(cols)
      .from(products)
      .where(
        sql`${products.actif} and ${products.dateFin} is not null and ${products.dateFin} < now()`,
      )
      .orderBy(sql`${products.dateFin} desc`)
      .limit(20),
    db
      .select(cols)
      .from(products)
      .where(and(eq(products.actif, true), eq(products.clicks, 0)))
      .orderBy(desc(products.createdAt))
      .limit(20),
  ]);

  return { expireBientot, expireMaisActif, zeroClics };
}

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

// ================================ Audience ==================================

export type ViewStats = {
  totalViews: number;
  mobile: number;
  desktop: number;
  topPages: { path: string; n: number }[];
  topSearches: { q: string; n: number }[];
};

export async function getViewStats(): Promise<ViewStats | null> {
  const db = getDb();
  if (!db) return null;

  const [t] = await db
    .select({
      totalViews: sql<number>`count(*) filter (where ${events.type} = 'view')::int`,
      mobile: sql<number>`count(*) filter (where ${events.type} = 'view' and ${events.device} = 'mobile')::int`,
      desktop: sql<number>`count(*) filter (where ${events.type} = 'view' and ${events.device} = 'desktop')::int`,
    })
    .from(events);

  const topPages = await db
    .select({ path: events.label, n: sql<number>`count(*)::int` })
    .from(events)
    .where(sql`${events.type} = 'view' and ${events.label} is not null`)
    .groupBy(events.label)
    .orderBy(desc(sql`count(*)`))
    .limit(8);

  const topSearches = await db
    .select({ q: events.label, n: sql<number>`count(*)::int` })
    .from(events)
    .where(sql`${events.type} = 'search' and ${events.label} is not null`)
    .groupBy(events.label)
    .orderBy(desc(sql`count(*)`))
    .limit(8);

  return {
    totalViews: t?.totalViews ?? 0,
    mobile: t?.mobile ?? 0,
    desktop: t?.desktop ?? 0,
    topPages: topPages.map((r) => ({ path: r.path ?? "", n: r.n })),
    topSearches: topSearches.map((r) => ({ q: r.q ?? "", n: r.n })),
  };
}

/** Tendance des vues par semaine ou par mois (table events, type='view'). */
export async function getViewTrend(
  period: "week" | "month",
): Promise<TrendBucket[]> {
  const db = getDb();
  if (!db) return [];
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
      sql`${events.type} = 'view' and ${events.createdAt} >= now() - ${interval}`,
    )
    .groupBy(bucket)
    .orderBy(bucket);

  return rows;
}
