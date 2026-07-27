import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Images servies en direct (pas via l'optimiseur /_next/image) : cela ferme
    // le "proxy ouvert" (SSRF) et évite un allowlist statique de domaines.
    // Le contrôle des domaines se fait à l'enregistrement (allowlist en base,
    // gérée depuis /admin/domaines) — cf. src/lib/domains.ts.
    unoptimized: true,
  },
};

export default nextConfig;
