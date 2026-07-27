"use client";

import { useState } from "react";
import type { TrendBucket } from "@/lib/stats";
import { cn } from "@/lib/utils";

export function TrendChart({
  week,
  month,
  title = "Clics dans le temps",
  unit = "clic",
}: {
  week: TrendBucket[];
  month: TrendBucket[];
  title?: string;
  unit?: string;
}) {
  const [period, setPeriod] = useState<"week" | "month">("week");
  const data = period === "week" ? week : month;
  const max = Math.max(1, ...data.map((d) => d.clicks));

  function fmt(label: string) {
    const d = new Date(`${label}T00:00:00`);
    return new Intl.DateTimeFormat("fr-FR", {
      day: period === "week" ? "2-digit" : undefined,
      month: period === "week" ? "2-digit" : "short",
    }).format(d);
  }

  return (
    <div className="rounded-card border border-border bg-surface p-4">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="font-bold">{title}</h2>
        <div className="inline-flex rounded-pill border border-border p-0.5 text-sm">
          {(["week", "month"] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={cn(
                "rounded-pill px-3 py-1 transition-colors",
                period === p
                  ? "bg-primary text-on-primary"
                  : "text-muted hover:text-fg",
              )}
            >
              {p === "week" ? "Semaine" : "Mois"}
            </button>
          ))}
        </div>
      </div>

      {data.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted">
          Pas encore de données — enregistrées à partir de maintenant.
        </p>
      ) : (
        <>
          <div className="flex h-40 items-end gap-2">
            {data.map((d) => (
              <div
                key={d.label}
                title={`${d.clicks} ${unit}${d.clicks > 1 ? "s" : ""}`}
                className="flex-1 rounded-t [background-image:var(--primary-gradient)]"
                style={{ height: `${Math.max(2, (d.clicks / max) * 100)}%` }}
              />
            ))}
          </div>
          <div className="mt-1 flex gap-2">
            {data.map((d) => (
              <div
                key={d.label}
                className="flex-1 text-center text-[11px] text-muted"
              >
                {fmt(d.label)}
                <div className="font-semibold text-fg">{d.clicks}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
