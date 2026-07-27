/**
 * Allowlist des domaines d'images.
 * - DEFAULT_IMAGE_DOMAINS : liste de base en code (domaines actuels + Google +
 *   CDN/hébergeurs d'images sûrs). Toujours autorisée.
 * - Extras : domaines ajoutés depuis l'admin (table `allowed_domains`).
 * Un hôte est autorisé s'il correspond exactement à un domaine ou en est un
 * sous-domaine (ex. `m.media-amazon.com` couvert par `media-amazon.com`).
 */
export const DEFAULT_IMAGE_DOMAINS = [
  // Marchands déjà utilisés dans l'app
  "media-amazon.com",
  "ssl-images-amazon.com",
  "eneba.games",
  "eneba.com",
  "gaming-cdn.com",
  "dealabs.com",
  "nintendo.com",
  "nintendo.net",
  // Google
  "gstatic.com",
  "googleusercontent.com",
  "ggpht.com",
  // CDN / hébergeurs d'images sûrs
  "imgur.com",
  "cloudinary.com",
  "unsplash.com",
  "imgix.net",
  // Stockage Supabase (images uploadées)
  "supabase.co",
];

/**
 * L'hôte fait-il partie des domaines « optimisables » (= la liste par défaut,
 * qui alimente `remotePatterns` dans next.config) ? Les domaines ajoutés par
 * l'admin n'y sont pas -> ils seront rendus `unoptimized` (chargement direct).
 */
export function isOptimizableHost(host: string): boolean {
  const h = host.toLowerCase();
  return DEFAULT_IMAGE_DOMAINS.some((d) => h === d || h.endsWith(`.${d}`));
}

/** Faut-il rendre l'image sans l'optimiseur Next ? (domaine hors remotePatterns) */
export function imageUnoptimized(url: string | null | undefined): boolean {
  if (!url) return false;
  try {
    return !isOptimizableHost(new URL(url).hostname);
  } catch {
    return true;
  }
}

/** L'hôte est-il autorisé (exact ou sous-domaine) ? */
export function hostAllowed(host: string, extras: string[] = []): boolean {
  const h = host.toLowerCase();
  return [...DEFAULT_IMAGE_DOMAINS, ...extras].some(
    (d) => h === d || h.endsWith(`.${d}`),
  );
}

/** Une URL image est-elle sur un domaine autorisé ? (URL invalide -> false) */
export function urlAllowed(url: string, extras: string[] = []): boolean {
  try {
    return hostAllowed(new URL(url).hostname, extras);
  } catch {
    return false;
  }
}

/** Normalise une saisie admin (URL ou domaine nu) en domaine, ou null si invalide. */
export function normalizeDomain(input: string): string | null {
  let s = input.trim().toLowerCase();
  if (!s) return null;
  if (s.includes("://")) {
    try {
      s = new URL(s).hostname;
    } catch {
      return null;
    }
  }
  s = s
    .replace(/^www\./, "")
    .replace(/\/.*$/, "")
    .trim();
  if (!/^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(s)) return null;
  return s;
}
