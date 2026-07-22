import Image from "next/image";
import Link from "next/link";
import { ImageOff } from "lucide-react";
import type { Product } from "@/db/schema";
import { formatPrice, toNumber } from "@/lib/utils";
import { sectionToPath } from "@/lib/constants";

/**
 * Sidebar "Bons plans à la une" (design-front §5.4).
 * Format compact : miniature + titre court + prix. Masquée / déplacée en mobile.
 */
export function FeaturedSidebar({ products }: { products: Product[] }) {
  if (products.length === 0) return null;

  return (
    <aside className="rounded-card border border-border bg-surface p-4">
      <h2 className="mb-3 text-base font-bold">🔥 Bons plans à la une</h2>
      <ul className="flex flex-col gap-3">
        {products.map((p) => {
          const href = `/${sectionToPath(p.section)}/${p.slug}`;
          const isFree = toNumber(p.prix) === 0;
          return (
            <li key={p.id}>
              <Link
                href={href}
                className="flex items-center gap-3 rounded-badge p-1 transition-colors hover:bg-surface-2"
              >
                <div className="relative size-12 shrink-0 overflow-hidden rounded-badge bg-surface-2">
                  {p.imageUrl ? (
                    <Image
                      src={p.imageUrl}
                      alt={p.titre}
                      fill
                      sizes="48px"
                      className="object-contain p-1"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted">
                      <ImageOff className="size-4" aria-hidden />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-[13px] font-medium">
                    {p.titre}
                  </p>
                  <p className="text-sm font-bold text-price">
                    {isFree ? "Gratuit" : (formatPrice(p.prix, p.devise) ?? "")}
                  </p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
