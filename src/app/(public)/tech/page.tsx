import type { Metadata } from "next";
import { SectionFeed } from "@/components/SectionFeed";
import { getProductsBySection } from "@/lib/queries";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Tech",
  description:
    "Bons plans Tech : écrans, composants PC, TV et périphériques. Prix et remises constatés, mis à jour à la main.",
};

export default async function TechPage() {
  const products = await getProductsBySection("tech");
  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Bons plans Tech</h1>
      <SectionFeed products={products} />
    </section>
  );
}
