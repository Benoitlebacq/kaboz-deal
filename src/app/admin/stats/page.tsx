import type { Metadata } from "next";
import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { TrendChart } from "@/components/admin/TrendChart";
import {
  getClickStats,
  getClickTrend,
  getCatalogStats,
  getAlerts,
  type AlertItem,
} from "@/lib/stats";
import { getDb } from "@/db";
import { requireUser } from "@/lib/auth";
import { SECTION_LABELS, merchantLabel } from "@/lib/constants";
import { formatDateShort } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Statistiques",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function Kpi({
  label,
  value,
  warn,
}: {
  label: string;
  value: string | number;
  warn?: boolean;
}) {
  return (
    <div className="rounded-card border border-border bg-surface p-4">
      <p className="text-[13px] text-muted">{label}</p>
      <p
        className={`mt-1 text-2xl font-bold ${warn && value !== 0 ? "text-hot" : ""}`}
      >
        {value}
      </p>
    </div>
  );
}

function BarList({
  items,
}: {
  items: { key: string; label: string; value: number }[];
}) {
  if (items.length === 0)
    return <p className="text-sm text-muted">Aucune donnée.</p>;
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <div className="flex flex-col gap-2">
      {items.map((i) => (
        <div key={i.key} className="flex items-center gap-3 text-sm">
          <span className="w-28 shrink-0 truncate">{i.label}</span>
          <div className="h-2 flex-1 rounded-pill bg-surface-2">
            <div
              className="h-2 rounded-pill [background-image:var(--primary-gradient)]"
              style={{ width: `${(i.value / max) * 100}%` }}
            />
          </div>
          <span className="w-10 shrink-0 text-right font-semibold">
            {i.value}
          </span>
        </div>
      ))}
    </div>
  );
}

function AlertList({
  title,
  items,
  meta,
  empty,
}: {
  title: string;
  items: AlertItem[];
  meta: (i: AlertItem) => string;
  empty: string;
}) {
  return (
    <div className="rounded-card border border-border bg-surface p-4">
      <h3 className="mb-3 flex items-center gap-2 font-bold">
        {title}
        <span className="rounded-pill bg-surface-2 px-2 py-0.5 text-xs text-muted">
          {items.length}
        </span>
      </h3>
      {items.length === 0 ? (
        <p className="text-sm text-muted">{empty}</p>
      ) : (
        <ul className="flex flex-col gap-2 text-sm">
          {items.map((i) => (
            <li key={i.id} className="flex items-center gap-2">
              <Link
                href={`/admin/produits/${i.id}`}
                className="flex-1 truncate hover:text-primary"
              >
                {i.titre}
              </Link>
              <span className="shrink-0 text-xs text-muted">{meta(i)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-2 border-b border-border pb-1 text-lg font-bold">
      {children}
    </h2>
  );
}

export default async function StatsPage() {
  await requireUser();
  const dbReady = getDb() !== null;
  const [stats, week, month, catalog, alerts] = await Promise.all([
    getClickStats(),
    getClickTrend("week"),
    getClickTrend("month"),
    getCatalogStats(),
    getAlerts(),
  ]);

  if (!dbReady || !stats || !catalog || !alerts) {
    return (
      <AdminShell>
        <h1 className="mb-6 text-2xl font-bold">Statistiques</h1>
        <p className="rounded-card border border-border bg-surface-2 px-4 py-3 text-sm text-muted">
          Statistiques indisponibles (base non connectée).
        </p>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <h1 className="mb-6 text-2xl font-bold">Statistiques</h1>
      <div className="flex flex-col gap-6">
        {/* ============================ Clics ============================ */}
        <SectionTitle>Performance (clics)</SectionTitle>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Kpi label="Clics totaux" value={stats.totalClicks} />
          <Kpi label="Deals actifs" value={stats.activeCount} />
          <Kpi
            label="Clics moy. / deal"
            value={stats.avgClicksPerActive.toFixed(1)}
          />
          <Kpi label="Deals à 0 clic" value={stats.zeroClickActive} />
        </div>

        <TrendChart week={week} month={month} />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-card border border-border bg-surface p-4">
            <h3 className="mb-3 font-bold">Clics par section</h3>
            <BarList
              items={stats.bySection.map((s) => ({
                key: s.section,
                label: SECTION_LABELS[s.section] ?? s.section,
                value: s.clicks,
              }))}
            />
          </div>
          <div className="rounded-card border border-border bg-surface p-4">
            <h3 className="mb-3 font-bold">Clics par marchand</h3>
            <BarList
              items={stats.byMerchant.map((m) => ({
                key: m.marchand,
                label: merchantLabel(m.marchand),
                value: m.clicks,
              }))}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-card border border-border bg-surface p-4">
            <h3 className="mb-3 font-bold">Effet « À la une »</h3>
            <div className="flex gap-8">
              <div>
                <p className="text-[13px] text-muted">À la une</p>
                <p className="text-2xl font-bold text-primary">
                  {stats.featuredAvg.toFixed(1)}
                </p>
                <p className="text-[11px] text-muted">clics moy. / deal</p>
              </div>
              <div>
                <p className="text-[13px] text-muted">Normaux</p>
                <p className="text-2xl font-bold">
                  {stats.normalAvg.toFixed(1)}
                </p>
                <p className="text-[11px] text-muted">clics moy. / deal</p>
              </div>
            </div>
          </div>

          <div className="rounded-card border border-border bg-surface p-4">
            <h3 className="mb-3 font-bold">Top 5 deals</h3>
            {stats.topDeals.length === 0 ? (
              <p className="text-sm text-muted">Aucun deal.</p>
            ) : (
              <ol className="flex flex-col gap-2 text-sm">
                {stats.topDeals.map((d, i) => (
                  <li key={d.id} className="flex items-center gap-2">
                    <span className="w-4 text-muted">{i + 1}</span>
                    <Link
                      href={`/admin/produits/${d.id}`}
                      className="flex-1 truncate hover:text-primary"
                    >
                      {d.titre}
                    </Link>
                    <span className="font-semibold">{d.clicks}</span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>

        {/* ==================== Catalogue & qualité ==================== */}
        <SectionTitle>Catalogue &amp; qualité</SectionTitle>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Kpi label="Total deals" value={catalog.total} />
          <Kpi label="Actifs" value={catalog.actifs} />
          <Kpi label="Masqués" value={catalog.masques} />
          <Kpi label="À la une" value={catalog.alaune} />
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Kpi
            label="Remise moyenne"
            value={`${catalog.remiseMoyenne.toFixed(0)} %`}
          />
          <Kpi label="Sans image" value={catalog.sansImage} warn />
          <Kpi label="Sans description" value={catalog.sansDescription} warn />
          <Kpi label="Sans prix" value={catalog.sansPrix} warn />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-card border border-border bg-surface p-4">
            <h3 className="mb-3 font-bold">Deals par section</h3>
            <BarList
              items={catalog.parSection.map((s) => ({
                key: s.section,
                label: SECTION_LABELS[s.section] ?? s.section,
                value: s.n,
              }))}
            />
          </div>
          <div className="rounded-card border border-border bg-surface p-4">
            <h3 className="mb-3 font-bold">Deals par marchand</h3>
            <BarList
              items={catalog.parMarchand.map((m) => ({
                key: m.marchand,
                label: merchantLabel(m.marchand),
                value: m.n,
              }))}
            />
          </div>
        </div>

        {/* ========================== Alertes ========================== */}
        <SectionTitle>Alertes</SectionTitle>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <AlertList
            title="⏳ Expire bientôt (< 3j)"
            items={alerts.expireBientot}
            meta={(i) => formatDateShort(i.dateFin)}
            empty="Rien à signaler ✅"
          />
          <AlertList
            title="⚠️ Expiré mais actif"
            items={alerts.expireMaisActif}
            meta={(i) => `expiré le ${formatDateShort(i.dateFin)}`}
            empty="Rien à signaler ✅"
          />
          <AlertList
            title="💤 À 0 clic"
            items={alerts.zeroClics}
            meta={() => "0 clic"}
            empty="Aucun ✅"
          />
        </div>
      </div>
    </AdminShell>
  );
}
