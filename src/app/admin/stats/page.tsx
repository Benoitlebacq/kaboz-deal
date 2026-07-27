import type { Metadata } from "next";
import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { TrendChart } from "@/components/admin/TrendChart";
import { getClickStats, getClickTrend } from "@/lib/stats";
import { getDb } from "@/db";
import { requireUser } from "@/lib/auth";
import { SECTION_LABELS, merchantLabel } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Statistiques",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function Kpi({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-card border border-border bg-surface p-4">
      <p className="text-[13px] text-muted">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}

function BarList({
  items,
}: {
  items: { key: string; label: string; clicks: number }[];
}) {
  if (items.length === 0)
    return <p className="text-sm text-muted">Aucune donnée.</p>;
  const max = Math.max(1, ...items.map((i) => i.clicks));
  return (
    <div className="flex flex-col gap-2">
      {items.map((i) => (
        <div key={i.key} className="flex items-center gap-3 text-sm">
          <span className="w-28 shrink-0 truncate">{i.label}</span>
          <div className="h-2 flex-1 rounded-pill bg-surface-2">
            <div
              className="h-2 rounded-pill [background-image:var(--primary-gradient)]"
              style={{ width: `${(i.clicks / max) * 100}%` }}
            />
          </div>
          <span className="w-10 shrink-0 text-right font-semibold">
            {i.clicks}
          </span>
        </div>
      ))}
    </div>
  );
}

export default async function StatsPage() {
  await requireUser();
  const dbReady = getDb() !== null;
  const [stats, week, month] = await Promise.all([
    getClickStats(),
    getClickTrend("week"),
    getClickTrend("month"),
  ]);

  return (
    <AdminShell>
      <h1 className="mb-6 text-2xl font-bold">Statistiques</h1>

      {!dbReady || !stats ? (
        <p className="rounded-card border border-border bg-surface-2 px-4 py-3 text-sm text-muted">
          Statistiques indisponibles (base non connectée).
        </p>
      ) : (
        <div className="flex flex-col gap-6">
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
              <h2 className="mb-3 font-bold">Clics par section</h2>
              <BarList
                items={stats.bySection.map((s) => ({
                  key: s.section,
                  label: SECTION_LABELS[s.section] ?? s.section,
                  clicks: s.clicks,
                }))}
              />
            </div>
            <div className="rounded-card border border-border bg-surface p-4">
              <h2 className="mb-3 font-bold">Clics par marchand</h2>
              <BarList
                items={stats.byMerchant.map((m) => ({
                  key: m.marchand,
                  label: merchantLabel(m.marchand),
                  clicks: m.clicks,
                }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-card border border-border bg-surface p-4">
              <h2 className="mb-3 font-bold">Effet « À la une »</h2>
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
              <h2 className="mb-3 font-bold">Top 5 deals</h2>
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
        </div>
      )}
    </AdminShell>
  );
}
