import Image from "next/image";
import Link from "next/link";
import { ExternalLink, ImageOff } from "lucide-react";
import type { Product } from "@/db/schema";
import { Badge } from "@/components/ui/Badge";
import { PriceBlock } from "@/components/PriceBlock";
import { buttonClasses } from "@/components/ui/Button";
import { MERCHANT_LABELS, sectionToPath } from "@/lib/constants";
import { timeAgo } from "@/lib/utils";

/**
 * Carte de deal (design-front §5.2).
 * Layout horizontal (image gauche), passe en vertical en mobile.
 * Toute la carte est cliquable -> fiche produit (stretched link sur le titre).
 * Le CTA "Voir l'offre" pointe vers /go/[id] et reste cliquable séparément.
 */
export function DealCard({ product }: { product: Product }) {
  const href = `/${sectionToPath(product.section)}/${product.slug}`;

  return (
    <article className="relative flex flex-col gap-4 rounded-card border border-border bg-surface p-4 shadow-[var(--shadow-card)] transition-transform hover:-translate-y-0.5 sm:flex-row">
      {/* Image */}
      <div className="relative h-40 w-full shrink-0 overflow-hidden rounded-card bg-surface-2 sm:h-32 sm:w-40">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.titre}
            fill
            sizes="(max-width: 640px) 100vw, 160px"
            className="object-contain p-2"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted">
            <ImageOff className="size-8" aria-hidden />
          </div>
        )}
      </div>

      {/* Contenu */}
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          {product.misEnAvant && <Badge variant="hot">À la une</Badge>}
          <span className="ml-auto whitespace-nowrap text-[13px] text-muted">
            Ajouté {timeAgo(product.createdAt)}
          </span>
        </div>

        <h3 className="text-lg font-bold leading-snug">
          <Link
            href={href}
            className="line-clamp-2 after:absolute after:inset-0 after:content-['']"
          >
            {product.titre}
          </Link>
        </h3>

        <PriceBlock
          prix={product.prix}
          prixBarre={product.prixBarre}
          devise={product.devise}
        />

        <p className="text-[13px] text-muted">
          Dispo. chez{" "}
          <span className="font-semibold text-fg">
            {MERCHANT_LABELS[product.marchand]}
          </span>
        </p>

        {product.description && (
          <p className="line-clamp-2 text-[15px] text-muted">
            {product.description}
          </p>
        )}

        <div className="mt-auto flex justify-end pt-2">
          <Link
            href={`/go/${product.id}`}
            className={buttonClasses("primary", "md", "relative z-10")}
            rel="nofollow sponsored"
          >
            Voir l&apos;offre
            <ExternalLink className="size-4" aria-hidden />
          </Link>
        </div>
      </div>
    </article>
  );
}
