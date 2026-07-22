"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { products, type Section, type Marchand } from "@/db/schema";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";
import { sectionToPath } from "@/lib/constants";

/** Garde-fou : exige une session Supabase (en plus du middleware). */
async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  return user;
}

export async function login(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(
      `/admin/login?error=${encodeURIComponent("Identifiants invalides.")}`,
    );
  }
  redirect("/admin");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export type FormState = { error?: string };

function revalidateAll(section: Section, slug: string) {
  revalidatePath("/");
  revalidatePath("/tech");
  revalidatePath("/jeux-video");
  revalidatePath(`/${sectionToPath(section)}/${slug}`);
}

export async function saveProduct(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireUser();
  const db = getDb();
  if (!db)
    return { error: "Base de données non configurée (DATABASE_URL manquante)." };

  const id = String(formData.get("id") ?? "").trim();
  const titre = String(formData.get("titre") ?? "").trim();
  const section = String(formData.get("section") ?? "") as Section;
  const marchand = String(formData.get("marchand") ?? "") as Marchand;
  const lienAffilie = String(formData.get("lienAffilie") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const sousCategorie =
    String(formData.get("sousCategorie") ?? "").trim() || null;
  const imageUrl = String(formData.get("imageUrl") ?? "").trim() || null;
  const description = String(formData.get("description") ?? "").trim() || null;
  const devise = String(formData.get("devise") ?? "EUR").trim() || "EUR";
  const prixRaw = String(formData.get("prix") ?? "").trim();
  const prixBarreRaw = String(formData.get("prixBarre") ?? "").trim();
  const dateFinRaw = String(formData.get("dateFin") ?? "").trim();
  const actif = formData.get("actif") === "on";
  const misEnAvant = formData.get("misEnAvant") === "on";

  // --- Validation ---
  if (!titre) return { error: "Le titre est obligatoire." };
  if (section !== "tech" && section !== "jeux_video")
    return { error: "Section invalide." };
  if (!["amazon", "eneba", "instant_gaming"].includes(marchand))
    return { error: "Marchand invalide." };
  if (!lienAffilie)
    return { error: "Le lien d'affiliation est obligatoire." };
  try {
    new URL(lienAffilie);
  } catch {
    return { error: "Le lien d'affiliation n'est pas une URL valide." };
  }
  if (imageUrl) {
    try {
      new URL(imageUrl);
    } catch {
      return { error: "L'URL de l'image n'est pas valide." };
    }
  }

  const slug = slugify(slugInput || titre);
  if (!slug) return { error: "Impossible de générer un slug depuis le titre." };

  const prix = prixRaw ? prixRaw.replace(",", ".") : null;
  const prixBarre = prixBarreRaw ? prixBarreRaw.replace(",", ".") : null;
  if (prix !== null && (isNaN(Number(prix)) || Number(prix) < 0))
    return { error: "Prix invalide." };
  if (prixBarre !== null && (isNaN(Number(prixBarre)) || Number(prixBarre) < 0))
    return { error: "Prix barré invalide." };

  const dateFin = dateFinRaw ? new Date(dateFinRaw) : null;

  const values = {
    slug,
    titre,
    section,
    marchand,
    lienAffilie,
    sousCategorie,
    imageUrl,
    description,
    devise,
    prix,
    prixBarre,
    dateFin,
    actif,
    misEnAvant,
    dateMaj: new Date(),
  };

  try {
    if (id && id !== "new") {
      await db.update(products).set(values).where(eq(products.id, id));
    } else {
      await db.insert(products).values(values);
    }
  } catch {
    return {
      error: "Erreur base de données. Le slug est peut-être déjà utilisé.",
    };
  }

  revalidateAll(section, slug);
  redirect("/admin");
}

/** Soft-delete par défaut (actif = false) — préféré à la suppression dure. */
export async function deleteProduct(formData: FormData) {
  await requireUser();
  const db = getDb();
  if (!db) redirect("/admin");

  const id = String(formData.get("id") ?? "");
  await db.update(products).set({ actif: false }).where(eq(products.id, id));

  revalidatePath("/");
  revalidatePath("/tech");
  revalidatePath("/jeux-video");
  redirect("/admin");
}
