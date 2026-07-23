import type { Metadata } from "next";
import { DealCard } from "@/components/DealCard";
import { EmptyState } from "@/components/EmptyState";
import { searchProducts } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Recherche",
  robots: { index: false, follow: true },
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();
  const results = query ? await searchProducts(query) : [];

  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Recherche</h1>

      {!query ? (
        <p className="text-muted">Tape un mot-clé pour trouver un bon plan.</p>
      ) : (
        <>
          <p className="text-muted">
            {results.length} résultat{results.length > 1 ? "s" : ""} pour «{" "}
            <span className="font-semibold text-fg">{query}</span> »
          </p>
          {results.length > 0 ? (
            <div className="flex flex-col gap-4">
              {results.map((p) => (
                <DealCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="Aucun résultat"
              hint={`Rien trouvé pour « ${query} ». Essaie un autre mot-clé.`}
            />
          )}
        </>
      )}
    </section>
  );
}
