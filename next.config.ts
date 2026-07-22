import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Les images sont des URL externes collées à la main dans le backoffice
    // (Amazon, Eneba, Instant Gaming, CDN divers). On autorise tout hôte HTTPS.
    // À resserrer plus tard si tu veux limiter à des domaines précis.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
