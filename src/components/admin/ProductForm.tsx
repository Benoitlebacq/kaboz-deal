"use client";

import {
  type ChangeEvent,
  useActionState,
  useEffect,
  useRef,
  useState,
} from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import type { Product, Marchand, Section } from "@/db/schema";
import { saveProduct, deleteProduct, type FormState } from "@/app/admin/actions";
import { Button } from "@/components/ui/Button";
import { CardPreview } from "@/components/admin/CardPreview";
import { Markdown } from "@/components/Markdown";
import { createClient } from "@/lib/supabase/client";
import { SECTIONS, MERCHANTS, merchantLabel } from "@/lib/constants";
import { slugify, discountPercent, cn } from "@/lib/utils";

function toLocalInput(d: Date | string | null): string {
  if (!d) return "";
  const date = new Date(d);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

const field =
  "h-10 rounded-btn border border-border bg-surface-2 px-3 text-fg focus:border-primary";
const labelCls = "flex flex-col gap-1 text-sm font-medium";

export function ProductForm({
  product,
  merchants = [],
}: {
  product?: Product;
  merchants?: string[];
}) {
  const isEdit = Boolean(product);
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    saveProduct,
    {},
  );

  const [titre, setTitre] = useState(product?.titre ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [section, setSection] = useState<Section>(product?.section ?? "tech");
  const [sousCategorie, setSousCategorie] = useState(product?.sousCategorie ?? "");
  const [marchand, setMarchand] = useState<Marchand>(product?.marchand ?? "amazon");
  const [merchantOptions, setMerchantOptions] = useState<string[]>(() => {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const m of [
      ...MERCHANTS.map((x) => x.value),
      ...merchants,
      ...(product?.marchand ? [product.marchand] : []),
    ]) {
      const key = m.toLowerCase();
      if (m && !seen.has(key)) {
        seen.add(key);
        out.push(m);
      }
    }
    return out;
  });
  const [newMerchant, setNewMerchant] = useState("");

  // Ajoute un marchand libre aux options et le sélectionne.
  function addMerchant() {
    const v = newMerchant.trim();
    if (!v) return;
    const existing = merchantOptions.find(
      (m) => m.toLowerCase() === v.toLowerCase(),
    );
    if (existing) {
      setMarchand(existing);
    } else {
      setMerchantOptions((o) => [...o, v]);
      setMarchand(v);
    }
    setNewMerchant("");
  }
  const [lienAffilie, setLienAffilie] = useState(product?.lienAffilie ?? "");
  const [imageUrl, setImageUrl] = useState(product?.imageUrl ?? "");
  const [prix, setPrix] = useState(product?.prix ?? "");
  const [prixBarre, setPrixBarre] = useState(product?.prixBarre ?? "");
  const [devise] = useState(product?.devise ?? "EUR");
  const [dateFin, setDateFin] = useState(toLocalInput(product?.dateFin ?? null));
  const [description, setDescription] = useState(product?.description ?? "");
  const [actif, setActif] = useState(product?.actif ?? true);
  const [misEnAvant, setMisEnAvant] = useState(product?.misEnAvant ?? false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const descRef = useRef<HTMLTextAreaElement>(null);

  // Slug auto tant que l'utilisateur ne l'a pas édité manuellement.
  useEffect(() => {
    if (!slugTouched) setSlug(slugify(titre));
  }, [titre, slugTouched]);

  const remise = discountPercent(prix, prixBarre);

  // Insère du texte à la position du curseur dans la description.
  function insertIntoDescription(text: string) {
    const ta = descRef.current;
    if (!ta) {
      setDescription((d) => d + text);
      return;
    }
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    setDescription((d) => d.slice(0, start) + text + d.slice(end));
    requestAnimationFrame(() => {
      ta.focus();
      const pos = start + text.length;
      ta.setSelectionRange(pos, pos);
    });
  }

  // Upload d'une image vers Supabase Storage puis insertion du Markdown.
  async function handleImageUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploadError(null);
    setUploading(true);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop() || "png";
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage
        .from("product-images")
        .upload(path, file, { cacheControl: "3600", upsert: false });
      if (error) throw error;
      const { data } = supabase.storage
        .from("product-images")
        .getPublicUrl(path);
      insertIntoDescription(`\n\n![capture](${data.publicUrl})\n\n`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "erreur inconnue";
      setUploadError(`Échec de l'upload : ${msg}`);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      {/* Formulaire */}
      <form action={formAction} className="flex flex-col gap-4">
        {isEdit && <input type="hidden" name="id" value={product!.id} />}

        {state.error && (
          <p className="rounded-badge border border-price/40 bg-price/10 px-3 py-2 text-sm text-price">
            {state.error}
          </p>
        )}

        <label className={labelCls}>
          Section *
          <select
            name="section"
            value={section}
            onChange={(e) => setSection(e.target.value as Section)}
            className={field}
          >
            {SECTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>

        <label className={labelCls}>
          Sous-catégorie
          <input
            name="sousCategorie"
            value={sousCategorie}
            onChange={(e) => setSousCategorie(e.target.value)}
            placeholder="écran, GPU, CPU…"
            className={field}
          />
        </label>

        <div className={labelCls}>
          <span>Marchand *</span>
          <select
            name="marchand"
            value={marchand}
            onChange={(e) => setMarchand(e.target.value)}
            className={field}
          >
            {merchantOptions.map((m) => (
              <option key={m} value={m}>
                {merchantLabel(m)}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <input
              type="text"
              value={newMerchant}
              onChange={(e) => setNewMerchant(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addMerchant();
                }
              }}
              placeholder="Ajouter un marchand (ex. Fnac)"
              className={cn(field, "flex-1")}
            />
            <Button type="button" variant="outline" onClick={addMerchant}>
              Ajouter
            </Button>
          </div>
        </div>

        <label className={labelCls}>
          Lien d&apos;affiliation *
          <input
            name="lienAffilie"
            value={lienAffilie}
            onChange={(e) => setLienAffilie(e.target.value)}
            placeholder="https://amzn.to/4pvTotA"
            className={field}
          />
        </label>

        <label className={labelCls}>
          Titre *
          <input
            name="titre"
            value={titre}
            onChange={(e) => setTitre(e.target.value)}
            required
            className={field}
          />
        </label>

        <label className={labelCls}>
          Slug (généré, éditable)
          <input
            name="slug"
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(e.target.value);
            }}
            className={field}
          />
        </label>

        <label className={labelCls}>
          URL de l&apos;image
          <input
            name="imageUrl"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://…/image.jpg"
            className={field}
          />
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className={labelCls}>
            Prix
            <input
              type="number"
              step="0.01"
              min="0"
              name="prix"
              value={prix}
              onChange={(e) => setPrix(e.target.value)}
              className={field}
            />
          </label>
          <label className={labelCls}>
            Prix barré
            <input
              type="number"
              step="0.01"
              min="0"
              name="prixBarre"
              value={prixBarre}
              onChange={(e) => setPrixBarre(e.target.value)}
              className={field}
            />
          </label>
        </div>
        <input type="hidden" name="devise" value={devise} />
        {remise !== null && (
          <p className="text-sm text-success">Remise calculée : -{remise}%</p>
        )}

        <label className={labelCls}>
          Date de fin (optionnelle)
          <input
            type="datetime-local"
            name="dateFin"
            value={dateFin}
            onChange={(e) => setDateFin(e.target.value)}
            className={field}
          />
        </label>

        <div className={labelCls}>
          <div className="flex items-center justify-between">
            <span>Description (Markdown)</span>
            <label
              className={cn(
                "inline-flex cursor-pointer items-center gap-1 text-sm font-semibold text-primary hover:underline",
                uploading && "pointer-events-none opacity-60",
              )}
            >
              <ImagePlus className="size-4" aria-hidden />
              {uploading ? "Upload…" : "Insérer une image"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
                disabled={uploading}
              />
            </label>
          </div>
          <textarea
            ref={descRef}
            name="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={6}
            placeholder="Markdown : **gras**, - listes, ![](url) pour une image…"
            className="rounded-btn border border-border bg-surface-2 p-3 text-fg focus:border-primary"
          />
          {uploadError && <p className="text-sm text-price">{uploadError}</p>}
        </div>

        {description && (
          <div className="rounded-btn border border-border bg-surface-2 p-3">
            <p className="mb-2 text-xs font-semibold text-muted">
              Aperçu de la description
            </p>
            <Markdown>{description}</Markdown>
          </div>
        )}

        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              name="actif"
              checked={actif}
              onChange={(e) => setActif(e.target.checked)}
            />
            Actif (visible)
          </label>
          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              name="misEnAvant"
              checked={misEnAvant}
              onChange={(e) => setMisEnAvant(e.target.checked)}
            />
            À la une
          </label>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <Button type="submit" size="lg" disabled={pending}>
            {pending ? "Enregistrement…" : "Enregistrer"}
          </Button>
        </div>
      </form>

      {/* Aperçu live + suppression */}
      <div className="flex flex-col gap-4 lg:sticky lg:top-6 lg:self-start">
        <p className="text-sm font-semibold text-muted">Aperçu de la carte</p>
        <CardPreview
          titre={titre}
          imageUrl={imageUrl}
          prix={prix}
          prixBarre={prixBarre}
          devise={devise}
          marchand={marchand}
          description={description}
          misEnAvant={misEnAvant}
        />

        {isEdit && (
          <form action={deleteProduct} className="mt-4">
            <input type="hidden" name="id" value={product!.id} />
            <Button type="submit" variant="danger" size="sm">
              <Trash2 className="size-4" aria-hidden />
              Masquer ce produit (soft-delete)
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
