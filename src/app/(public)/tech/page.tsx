import type { Metadata } from "next";
import { SectionFeed } from "@/components/SectionFeed";
import { Filters } from "@/components/Filters";
import { getFilterOptions, getFilteredProducts } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Tech",
  description:
    "Bons plans Tech : écrans, composants PC, TV et périphériques. Prix et remises constatés, mis à jour à la main.",
};

type SP = Promise<{
  cat?: string;
  marchand?: string;
  tri?: string;
  promo?: string;
}>;

export default async function TechPage({
  searchParams,
}: {
  searchParams: SP;
}) {
  const sp = await searchParams;
  const current = {
    cat: sp.cat ?? "",
    marchand: sp.marchand ?? "",
    tri: sp.tri ?? "recents",
    promo: sp.promo === "1",
  };

  const [options, products] = await Promise.all([
    getFilterOptions("tech"),
    getFilteredProducts("tech", {
      cat: current.cat || undefined,
      marchand: current.marchand || undefined,
      tri: current.tri,
      promo: current.promo,
    }),
  ]);

  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Bons plans Tech</h1>
      <Filters
        subcategories={options.subcategories}
        merchants={options.merchants}
        current={current}
      />
      <SectionFeed products={products} />
    </section>
  );
}
