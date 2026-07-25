import type { Section, Marchand } from "@/db/schema";

/** Libellés & slugs d'URL des sections. */
export const SECTION_LABELS: Record<Section, string> = {
  tech: "Tech",
  jeux_video: "Jeux vidéo",
};

/** Enum base -> segment d'URL (jeux_video -> jeux-video). */
export function sectionToPath(section: Section): string {
  return section === "jeux_video" ? "jeux-video" : "tech";
}

/** Segment d'URL -> enum base (jeux-video -> jeux_video). Null si inconnu. */
export function pathToSection(path: string): Section | null {
  if (path === "tech") return "tech";
  if (path === "jeux-video") return "jeux_video";
  return null;
}

/** Libellés d'affichage des marchands par défaut. */
export const MERCHANT_LABELS: Record<string, string> = {
  amazon: "Amazon",
  eneba: "Eneba",
  instant_gaming: "Instant Gaming",
};

/** Libellé d'un marchand : joli label si connu, sinon la valeur telle quelle. */
export function merchantLabel(value: Marchand): string {
  return MERCHANT_LABELS[value] ?? value;
}

export const SECTIONS: { value: Section; label: string; path: string }[] = [
  { value: "tech", label: "Tech", path: "tech" },
  { value: "jeux_video", label: "Jeux vidéo", path: "jeux-video" },
];

export const MERCHANTS: { value: Marchand; label: string }[] = [
  { value: "amazon", label: "Amazon" },
  { value: "eneba", label: "Eneba" },
  { value: "instant_gaming", label: "Instant Gaming" },
];

/** Suffixe d'affiliation Instant Gaming, concaténé à l'URL à la publication. */
export const INSTANT_GAMING_AFFILIATE_URL = "?igr=gamer-353aecb";

/**
 * Ajoute le suffixe d'affiliation Instant Gaming à une URL.
 * - idempotent (n'ajoute pas deux fois),
 * - gère le cas où l'URL a déjà des paramètres (`?` -> `&`).
 */
export function withInstantGamingAffiliate(url: string): string {
  const param = INSTANT_GAMING_AFFILIATE_URL.replace(/^\?/, ""); // igr=gamer-353aecb
  if (url.includes(param)) return url;
  const separator = url.includes("?") ? "&" : "?";
  return url + INSTANT_GAMING_AFFILIATE_URL.replace(/^\?/, separator);
}
