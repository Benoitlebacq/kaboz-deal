import type { Product } from "@/db/schema";
import { DealCard } from "@/components/DealCard";
import { EmptyState } from "@/components/EmptyState";

export function SectionFeed({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <EmptyState hint="Aucun produit actif dans cette section pour l'instant." />
    );
  }
  return (
    <div className="flex flex-col gap-4">
      {products.map((p) => (
        <DealCard key={p.id} product={p} />
      ))}
    </div>
  );
}
