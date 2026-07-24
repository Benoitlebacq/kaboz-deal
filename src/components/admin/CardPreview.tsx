"use client";

import { ExternalLink, ImageOff } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { PriceBlock } from "@/components/PriceBlock";
import { buttonClasses } from "@/components/ui/Button";
import { merchantLabel } from "@/lib/constants";
import { plainExcerpt } from "@/lib/utils";
import type { Marchand } from "@/db/schema";

/** Aperçu en direct de la carte telle qu'elle s'affichera (design-front §6). */
export function CardPreview({
  titre,
  imageUrl,
  prix,
  prixBarre,
  devise,
  marchand,
  description,
  misEnAvant,
}: {
  titre: string;
  imageUrl: string;
  prix: string;
  prixBarre: string;
  devise: string;
  marchand: Marchand;
  description: string;
  misEnAvant: boolean;
}) {
  return (
    <article className="flex flex-col gap-4 rounded-card border border-border bg-surface p-4 shadow-[var(--shadow-card)] sm:flex-row">
      <div className="relative h-40 w-full shrink-0 overflow-hidden rounded-card bg-surface-2 sm:h-32 sm:w-40">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={titre || "Aperçu"}
            className="h-full w-full object-contain p-2"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted">
            <ImageOff className="size-8" aria-hidden />
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          {misEnAvant && <Badge variant="hot">À la une</Badge>}
          <span className="ml-auto whitespace-nowrap text-[13px] text-muted">
            Ajouté à l&apos;instant
          </span>
        </div>

        <h3 className="line-clamp-2 text-lg font-bold leading-snug">
          {titre || "Titre du produit"}
        </h3>

        <PriceBlock prix={prix || null} prixBarre={prixBarre || null} devise={devise} />

        <p className="text-[13px] text-muted">
          Dispo. chez{" "}
          <span className="font-semibold text-fg">
            {merchantLabel(marchand)}
          </span>
        </p>

        {plainExcerpt(description) && (
          <p className="line-clamp-2 text-[15px] text-muted">
            {plainExcerpt(description)}
          </p>
        )}

        <div className="mt-auto flex justify-end pt-2">
          <span className={buttonClasses("primary", "md")}>
            Voir l&apos;offre
            <ExternalLink className="size-4" aria-hidden />
          </span>
        </div>
      </div>
    </article>
  );
}
