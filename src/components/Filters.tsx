"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { merchantLabel } from "@/lib/constants";

export type FilterState = {
  cat: string;
  marchand: string;
  tri: string;
  promo: boolean;
};

const TRI = [
  { value: "recents", label: "Récents" },
  { value: "prix-asc", label: "Prix croissant" },
  { value: "prix-desc", label: "Prix décroissant" },
  { value: "remise", label: "Meilleure remise" },
  { value: "populaires", label: "Populaires" },
];

const selectCls =
  "h-9 rounded-btn border border-border bg-surface-2 px-2 text-sm text-fg focus:border-primary";

export function Filters({
  subcategories,
  merchants,
  current,
}: {
  subcategories: string[];
  merchants: string[];
  current: FilterState;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  function apply(next: FilterState) {
    const p = new URLSearchParams();
    if (next.cat) p.set("cat", next.cat);
    if (next.marchand) p.set("marchand", next.marchand);
    if (next.tri && next.tri !== "recents") p.set("tri", next.tri);
    if (next.promo) p.set("promo", "1");
    const qs = p.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }
  const update = (patch: Partial<FilterState>) => apply({ ...current, ...patch });

  const chips: { key: "cat" | "marchand" | "promo"; label: string }[] = [];
  if (current.cat) chips.push({ key: "cat", label: current.cat });
  if (current.marchand)
    chips.push({ key: "marchand", label: merchantLabel(current.marchand) });
  if (current.promo) chips.push({ key: "promo", label: "≥ -50 %" });
  const hasActive = chips.length > 0 || current.tri !== "recents";

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex w-fit items-center gap-2 rounded-btn border border-border bg-surface px-3 py-1.5 text-sm sm:hidden"
      >
        <SlidersHorizontal className="size-4" aria-hidden />
        Filtrer
      </button>

      <div
        className={cn(
          "flex-wrap items-center gap-2 sm:flex",
          open ? "flex" : "hidden",
        )}
      >
        {subcategories.length > 0 && (
          <select
            className={selectCls}
            value={current.cat}
            onChange={(e) => update({ cat: e.target.value })}
            aria-label="Sous-catégorie"
          >
            <option value="">Toutes catégories</option>
            {subcategories.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        )}

        <select
          className={selectCls}
          value={current.marchand}
          onChange={(e) => update({ marchand: e.target.value })}
          aria-label="Marchand"
        >
          <option value="">Tous marchands</option>
          {merchants.map((m) => (
            <option key={m} value={m}>
              {merchantLabel(m)}
            </option>
          ))}
        </select>

        <select
          className={selectCls}
          value={current.tri}
          onChange={(e) => update({ tri: e.target.value })}
          aria-label="Trier"
        >
          {TRI.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => update({ promo: !current.promo })}
          aria-pressed={current.promo}
          className={cn(
            "h-9 rounded-btn border px-3 text-sm font-medium transition-colors",
            current.promo
              ? "border-success bg-success text-white"
              : "border-border bg-surface-2 text-fg hover:bg-surface",
          )}
        >
          ≥ -50 %
        </button>
      </div>

      {hasActive && (
        <div className="flex flex-wrap items-center gap-2">
          {chips.map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={() =>
                update(
                  c.key === "promo"
                    ? { promo: false }
                    : c.key === "cat"
                      ? { cat: "" }
                      : { marchand: "" },
                )
              }
              className="inline-flex items-center gap-1 rounded-pill bg-surface-2 px-2.5 py-1 text-xs font-medium hover:bg-surface"
            >
              {c.label}
              <X className="size-3" aria-hidden />
            </button>
          ))}
          <button
            type="button"
            onClick={() => router.push(pathname)}
            className="text-xs text-muted underline hover:text-fg"
          >
            Réinitialiser
          </button>
        </div>
      )}
    </div>
  );
}
