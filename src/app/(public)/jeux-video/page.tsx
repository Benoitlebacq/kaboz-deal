import type { Metadata } from "next";
import { SectionFeed } from "@/components/SectionFeed";
import { Filters } from "@/components/Filters";
import { getFilterOptions, getFilteredProducts } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Jeux vidéo",
  description:
    "Bons plans Jeux vidéo : clés et jeux à prix réduit chez Eneba, Instant Gaming et Amazon. Sélection à la main.",
};

type SP = Promise<{
  cat?: string;
  marchand?: string;
  tri?: string;
  promo?: string;
}>;

export default async function JeuxVideoPage({
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
    getFilterOptions("jeux_video"),
    getFilteredProducts("jeux_video", {
      cat: current.cat || undefined,
      marchand: current.marchand || undefined,
      tri: current.tri,
      promo: current.promo,
    }),
  ]);

  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Bons plans Jeux vidéo</h1>
      <Filters
        subcategories={options.subcategories}
        merchants={options.merchants}
        current={current}
      />
      <SectionFeed products={products} />
    </section>
  );
}
