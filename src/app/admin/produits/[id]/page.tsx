import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { ProductForm } from "@/components/admin/ProductForm";
import { getProductById } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Édition produit",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function ProductEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const isNew = id === "new";

  const product = isNew ? undefined : await getProductById(id);
  if (!isNew && !product) notFound();

  return (
    <AdminShell>
      <Link
        href="/admin"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-fg"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Retour aux produits
      </Link>
      <h1 className="mb-6 text-2xl font-bold">
        {isNew ? "Nouveau produit" : "Éditer le produit"}
      </h1>
      <ProductForm product={product ?? undefined} />
    </AdminShell>
  );
}
