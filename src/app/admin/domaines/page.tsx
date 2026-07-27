import type { Metadata } from "next";
import { Plus, ShieldCheck, Trash2 } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/Button";
import { getAllowedDomains } from "@/lib/queries";
import { DEFAULT_IMAGE_DOMAINS } from "@/lib/domains";
import { requireUser } from "@/lib/auth";
import { addAllowedDomain, deleteAllowedDomain } from "@/app/admin/actions";

export const metadata: Metadata = {
  title: "Domaines d'images",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function DomainsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await requireUser();
  const { error } = await searchParams;
  const extras = await getAllowedDomains();

  return (
    <AdminShell>
      <h1 className="mb-2 text-2xl font-bold">Domaines d&apos;images autorisés</h1>
      <p className="mb-6 max-w-2xl text-sm text-muted">
        Seules les images hébergées sur ces domaines (ou leurs sous-domaines)
        peuvent être enregistrées pour un produit. Les autres sont refusées.
      </p>

      {error && (
        <p className="mb-4 rounded-badge border border-price/40 bg-price/10 px-3 py-2 text-sm text-price">
          {error}
        </p>
      )}

      <form
        action={addAllowedDomain}
        className="mb-8 flex flex-wrap items-end gap-2"
      >
        <label className="flex flex-col gap-1 text-sm font-medium">
          Ajouter un domaine
          <input
            name="domain"
            required
            placeholder="ex. cdn.exemple.com"
            className="h-10 w-72 rounded-btn border border-border bg-surface-2 px-3 text-fg focus:border-primary"
          />
        </label>
        <Button type="submit">
          <Plus className="size-4" aria-hidden />
          Ajouter
        </Button>
      </form>

      <h2 className="mb-2 font-bold">Ajoutés par toi</h2>
      {extras.length === 0 ? (
        <p className="mb-8 text-sm text-muted">Aucun domaine ajouté.</p>
      ) : (
        <ul className="mb-8 flex max-w-xl flex-col gap-2">
          {extras.map((d) => (
            <li
              key={d.id}
              className="flex items-center gap-3 rounded-btn border border-border bg-surface px-3 py-2 text-sm"
            >
              <span className="flex-1 font-medium">{d.domain}</span>
              <form action={deleteAllowedDomain}>
                <input type="hidden" name="id" value={d.id} />
                <button
                  type="submit"
                  className="inline-flex items-center gap-1 text-price hover:underline"
                >
                  <Trash2 className="size-4" aria-hidden />
                  Retirer
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}

      <h2 className="mb-2 flex items-center gap-2 font-bold">
        <ShieldCheck className="size-4 text-success" aria-hidden />
        Intégrés (non modifiables)
      </h2>
      <div className="flex flex-wrap gap-2">
        {DEFAULT_IMAGE_DOMAINS.map((d) => (
          <span
            key={d}
            className="rounded-pill bg-surface-2 px-2.5 py-1 text-xs text-muted"
          >
            {d}
          </span>
        ))}
      </div>
    </AdminShell>
  );
}
