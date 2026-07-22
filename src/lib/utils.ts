/** Concatène des classes conditionnelles (mini-clsx, sans dépendance). */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

/** numeric Drizzle -> number (ou null). */
export function toNumber(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

/** Formate un prix : 6.24 -> "6,24 €". */
export function formatPrice(
  value: string | number | null | undefined,
  devise = "EUR",
): string | null {
  const n = toNumber(value);
  if (n === null) return null;
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: devise,
  }).format(n);
}

/** % de remise arrondi à partir du prix et du prix barré. Null si non calculable. */
export function discountPercent(
  prix: string | number | null | undefined,
  prixBarre: string | number | null | undefined,
): number | null {
  const p = toNumber(prix);
  const ref = toNumber(prixBarre);
  if (p === null || ref === null || ref <= 0 || p >= ref) return null;
  return Math.round((1 - p / ref) * 100);
}

/** Slug SEO-friendly : minuscules, sans accents, tirets. */
export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // supprime les accents
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** "Ajouté il y a 2 heures" à partir d'une date. */
export function timeAgo(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
  const rtf = new Intl.RelativeTimeFormat("fr-FR", { numeric: "auto" });
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 31536000],
    ["month", 2592000],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];
  for (const [unit, secondsInUnit] of units) {
    if (Math.abs(seconds) >= secondsInUnit) {
      return rtf.format(-Math.floor(seconds / secondsInUnit), unit);
    }
  }
  return "à l'instant";
}

/** Date longue FR : "2 août 2026 à 23:59". */
export function formatDateLong(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

/** Date courte FR : "22 juillet 2026". */
export function formatDateShort(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}
