# KabozDeal — Bons plans Tech & Jeux vidéo

Site vitrine de bons plans affiliés (Tech + Jeux vidéo), curé à la main.
Site public 100 % statique (SSG + ISR) pour le SEO et la perf, backoffice `/admin`
protégé par authentification.

## Stack

| Brique | Choix |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript, Turbopack) |
| Rendu | SSG + ISR on-demand (`revalidatePath`) |
| Base de données | Supabase (Postgres) via Drizzle ORM |
| Auth | Supabase Auth (protège `/admin` uniquement) |
| Style | Tailwind CSS v4 (tokens en variables CSS) |
| Thème | next-themes (clair/sombre, `data-theme`, sombre par défaut) |
| Icônes | lucide-react |
| Police | Inter (`next/font`) |
| Hébergement | Vercel |

## Démarrage

### 1. Variables d'environnement

Copie `.env.example` vers `.env.local` et remplis les valeurs :

```bash
cp .env.example .env.local
```

- `DATABASE_URL` — connection string du **pooler** Supabase (port 6543, mode transaction).
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — pour l'auth admin.
- `SUPABASE_SERVICE_ROLE_KEY` — côté serveur uniquement (optionnel pour le MVP).
- `NEXT_PUBLIC_SITE_URL` — URL de prod (sitemap, robots, OpenGraph).

> Le site build et se déploie **sans** ces variables : les pages affichent
> alors un état vide, et s'allument dès que la BDD est branchée.

### 2. Base de données

```bash
npm run db:generate   # génère le SQL depuis src/db/schema.ts (déjà fait : drizzle/)
npm run db:migrate    # applique la migration sur Supabase (nécessite DATABASE_URL)
npm run db:studio     # explorateur de données Drizzle (optionnel)
```

### 3. Utilisateur admin

Dans Supabase > Authentication > Users, crée **un seul** utilisateur
(email + mot de passe). C'est ce compte qui ouvre `/admin`.

### 4. Lancer en local

```bash
npm run dev           # http://localhost:3000
```

## Arborescence

```
src/
  app/
    (public)/                 groupe public (Header + footer)
      layout.tsx
      page.tsx                accueil (derniers deals + sidebar à la une)
      tech/page.tsx           listing section Tech
      jeux-video/page.tsx     listing section Jeux vidéo
      [section]/[slug]/       fiche produit (metadata + JSON-LD Product)
    admin/                    backoffice protégé
      login/page.tsx
      page.tsx                liste + CRUD produits
      produits/[id]/page.tsx  création (id="new") / édition
      actions.ts              server actions (auth + CRUD + revalidatePath)
    go/[id]/route.ts          redirection 302 des liens affiliés (+ compteur clics)
    sitemap.ts / robots.ts    SEO
  components/                 DealCard, Header, PriceBlock, Badge, Button, etc.
    admin/                    AdminShell, ProductForm, CardPreview
  db/                         schema.ts (table products) + index.ts (client Drizzle)
  lib/                        utils, constants, queries, clients Supabase
  proxy.ts                    protège /admin (convention Next 16, ex-"middleware")
drizzle/                      migrations SQL générées
```

## Design

- Tokens de couleur (clair/sombre) déclarés en variables CSS dans
  `src/app/globals.css`, exposés à Tailwind via `@theme`. **Aucune couleur en dur**
  dans les composants.
- Dark-first, bascule via le toggle du header (next-themes, `data-theme`).

## Déploiement Vercel

1. Pousser sur GitHub (repo `kaboz-deal`).
2. Sur Vercel : le projet est déjà relié au repo.
3. Renseigner les variables d'environnement (cf. `.env.example`) dans
   Vercel > Settings > Environment Variables.
4. Chaque `git push` redéploie automatiquement.
5. Domaine : acheter sur Cloudflare Registrar puis l'ajouter dans Vercel.

## Hors périmètre MVP (évolutions futures)

Descriptions auto par LLM, vérification quotidienne prix/dispo (cron + Amazon
Creators API / Keepa), table `price_history`, sous-catégories & filtres.
