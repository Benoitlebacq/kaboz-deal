import type { Metadata } from "next";
import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { Badge } from "@/components/ui/Badge";
import { buttonClasses } from "@/components/ui/Button";
import { getAllProductsAdmin } from "@/lib/queries";
import { getDb } from "@/db";
import { merchantLabel, SECTION_LABELS } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Produits",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const dbReady = getDb() !== null;
  const products = await getAllProductsAdmin();

  return (
    <AdminShell>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Produits</h1>
        <Link href="/admin/produits/new" className={buttonClasses("primary")}>
          <Plus className="size-4" aria-hidden />
          Nouveau produit
        </Link>
      </div>

      {!dbReady && (
        <p className="mb-4 rounded-card border border-border bg-surface-2 px-4 py-3 text-sm text-muted">
          Base de données non connectée. Renseigne <code>DATABASE_URL</code>{" "}
          dans <code>.env.local</code> (puis sur Vercel) pour gérer des produits.
        </p>
      )}

      {products.length === 0 ? (
        <p className="rounded-card border border-dashed border-border bg-surface px-6 py-12 text-center text-muted">
          Aucun produit. Clique sur « Nouveau produit » pour commencer.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-card border border-border">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead className="bg-surface-2 text-left text-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">Titre</th>
                <th className="px-4 py-3 font-semibold">Section</th>
                <th className="px-4 py-3 font-semibold">Marchand</th>
                <th className="px-4 py-3 font-semibold">Prix</th>
                <th className="px-4 py-3 font-semibold">État</th>
                <th className="px-4 py-3 font-semibold">Clics</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-t border-border bg-surface">
                  <td className="px-4 py-3 font-medium">{p.titre}</td>
                  <td className="px-4 py-3 text-muted">
                    {SECTION_LABELS[p.section]}
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {merchantLabel(p.marchand)}
                  </td>
                  <td className="px-4 py-3">
                    {formatPrice(p.prix, p.devise) ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex flex-wrap gap-1">
                      {p.actif ? (
                        <Badge variant="discount">Actif</Badge>
                      ) : (
                        <Badge variant="neutral">Masqué</Badge>
                      )}
                      {p.misEnAvant && <Badge variant="hot">À la une</Badge>}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted">{p.clicks}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/produits/${p.id}`}
                      className="inline-flex items-center gap-1 text-primary hover:underline"
                    >
                      <Pencil className="size-4" aria-hidden />
                      Éditer
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminShell>
  );
}
