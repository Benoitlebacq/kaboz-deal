import { DealCard } from "@/components/DealCard";
import { FeaturedSidebar } from "@/components/FeaturedSidebar";
import { EmptyState } from "@/components/EmptyState";
import { getAllActiveProducts, getFeaturedProducts } from "@/lib/queries";

// ISR : régénéré au moins toutes les heures, et à la demande via revalidatePath
// après une modif dans le backoffice.
export const revalidate = 3600;

export default async function HomePage() {
  const [products, featured] = await Promise.all([
    getAllActiveProducts(),
    getFeaturedProducts(),
  ]);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
      <section className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold">Derniers bons plans</h1>
        {products.length === 0 ? (
          <EmptyState hint="Ajoute ton premier produit depuis l'espace admin pour le voir apparaître ici." />
        ) : (
          <div className="flex flex-col gap-4">
            {products.map((p) => (
              <DealCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      <div className="lg:sticky lg:top-32 lg:self-start">
        <FeaturedSidebar products={featured} />
      </div>
    </div>
  );
}
