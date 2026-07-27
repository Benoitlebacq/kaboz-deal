import type { NextConfig } from "next";
import { DEFAULT_IMAGE_DOMAINS } from "./src/lib/domains";

const nextConfig: NextConfig = {
  images: {
    // Optimisation ré-activée mais restreinte aux domaines connus (proxy fermé,
    // plus de `**`). Les domaines ajoutés depuis l'admin (hors liste) sont rendus
    // `unoptimized` côté composant (imageUnoptimized) -> toujours sans proxy.
    remotePatterns: DEFAULT_IMAGE_DOMAINS.flatMap((d) => [
      { protocol: "https" as const, hostname: d },
      { protocol: "https" as const, hostname: `**.${d}` },
    ]),
  },
};

export default nextConfig;
