import type { Metadata } from "next";
import { SectionFeed } from "@/components/SectionFeed";
import { getProductsBySection } from "@/lib/queries";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Jeux vidéo",
  description:
    "Bons plans Jeux vidéo : clés et jeux à prix réduit chez Eneba, Instant Gaming et Amazon. Sélection à la main.",
};

export default async function JeuxVideoPage() {
  const products = await getProductsBySection("jeux_video");
  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Bons plans Jeux vidéo</h1>
      <SectionFeed products={products} />
    </section>
  );
}
