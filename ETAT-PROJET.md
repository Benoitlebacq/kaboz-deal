# KabozDeal — État du projet

> **Rôle de ce fichier.** Point d'entrée et mémoire du projet. Il est chargé
> automatiquement au début de chaque session (importé depuis `CLAUDE.md`).
> **À lire en premier**, et **à mettre à jour à chaque avancée** (surtout la
> section « État actuel » et le « Journal des avancées » en bas).
>
> _Dernière mise à jour : 2026-07-22._

---

## 1. En bref

Site vitrine de **bons plans affiliés**, curé à la main, en deux sections :
**Tech** (écrans, composants PC, TV…) et **Jeux vidéo** (Eneba, Instant Gaming,
Amazon). Site public 100 % statique (SEO + perf), backoffice `/admin` protégé.

Hors périmètre du MVP : scraping, comparaison Keepa, descriptions auto par LLM.

## 2. Où vit le projet

| | |
|---|---|
| Dossier local | `C:\Users\blebacq\Desktop\my-deal` |
| Repo GitHub | https://github.com/Benoitlebacq/kaboz-deal.git (branche `main`) |
| Hébergement | Vercel (relié au repo, déploiement auto à chaque push) |
| BDD / Auth | Supabase — projet `mcunotccghypxummfdci` (région eu-west-1) ✅ branché |
| Domaine | Cloudflare Registrar (prévu, pas encore acheté) |

## 3. Stack (décisions verrouillées)

- **Next.js 16** (App Router, TypeScript, Turbopack) — ⚠️ version à breaking
  changes, cf. `AGENTS.md`.
- **Tailwind CSS v4** — config CSS-first (`@theme` dans `globals.css`), tokens
  en variables CSS.
- **next-themes** — clair/sombre via `data-theme`, **sombre par défaut**.
- **Drizzle ORM** + **postgres-js** — accès BDD typé.
- **Supabase Auth** + **@supabase/ssr** — protège `/admin` uniquement.
- **lucide-react** (icônes), **Inter** (`next/font`).

Choix structurants :
- Images = **URL externes collées** (pas de storage). `next.config.ts` autorise
  tout hôte HTTPS.
- **Écritures admin via Drizzle** (`DATABASE_URL`), pas via la clé service_role.
- Protection de `/admin` via **`src/proxy.ts`** (convention Next 16 ; l'ancien
  `middleware` est déprécié).
- **Dégradation gracieuse** : sans `DATABASE_URL`, les requêtes renvoient vide
  → le site build et se déploie quand même (états vides).

## 4. Modèle de données — table `products`

Enums : `section` (`tech` | `jeux_video`), `marchand` (`amazon` | `eneba` |
`instant_gaming`).

Champs : `id` (uuid), `slug` (unique), `titre`, `description`, `section`,
`sous_categorie`, `marchand`, `lien_affilie`, `image_url`, `prix`, `prix_barre`,
`devise` (déf. EUR), `date_fin` (nullable, bandeau d'expiration), `date_maj`,
`actif` (déf. true), `mis_en_avant` (déf. false), `clicks` (déf. 0),
`created_at`.

Schéma : `src/db/schema.ts` · Migration générée : `drizzle/0000_*.sql`.
Évolutions prévues : table `price_history`, `categories`.

## 5. Arborescence

```
src/
  app/
    (public)/                 chrome public (Header + footer)
      page.tsx                accueil (derniers deals + sidebar à la une)
      tech/ · jeux-video/     listings par section
      [section]/[slug]/       fiche produit (metadata unique + JSON-LD Product)
    admin/                    backoffice protégé
      login/ · page.tsx       (liste) · produits/[id]/ (new = création)
      actions.ts              server actions : auth + CRUD + revalidatePath
    go/[id]/route.ts          redirection 302 lien affilié (+ compteur clics)
    sitemap.ts · robots.ts    SEO
  components/                 DealCard, Header, PriceBlock, Badge, Button,
                              FeaturedSidebar, ThemeToggle, SectionFeed…
    admin/                    AdminShell, ProductForm, CardPreview
  db/                         schema.ts + index.ts (client Drizzle paresseux)
  lib/                        utils, constants, queries, supabase/{client,server,middleware}
  proxy.ts                    protège /admin
drizzle/                      migrations SQL
```

Détail des URLs : `/tech`, `/jeux-video`, `/{section}/{slug}` (la section en
base `jeux_video` s'écrit `jeux-video` dans l'URL — voir `lib/constants.ts`).

## 6. Design (résumé)

Tokens couleur clair/sombre dans `src/app/globals.css`, mappés sur Tailwind via
`@theme`. **Aucune couleur en dur** dans les composants (`bg-surface`, `text-fg`,
`text-muted`, `bg-primary`, `text-price`, `bg-success`, `bg-hot`, `rounded-card`…).
Réf. complète : `Downloads/design-front.md` (DA inspirée de Dealabs, éditoriale).

## 7. Commandes utiles

```bash
npm run dev            # dev local (http://localhost:3000)
npm run build          # build de prod (type-check inclus)
npm run db:generate    # génère le SQL depuis le schéma
npm run db:migrate     # applique la migration sur Supabase (nécessite DATABASE_URL)
npm run db:studio      # explorateur Drizzle
```

## 8. Variables d'environnement

Fichier `.env.local` (local, non versionné) — modèle dans `.env.example` :
`DATABASE_URL` (pooler Supabase :6543), `NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (optionnel MVP),
`NEXT_PUBLIC_SITE_URL`. **Les mêmes clés doivent être renseignées sur Vercel.**

---

## 9. État actuel

### ✅ Fait
- Architecture complète scaffoldée, build OK, vérifiée au navigateur.
- Poussée sur GitHub `main` → Vercel déploie automatiquement.
- Design system clair/sombre, composants, routes publiques + fiche produit SEO,
  `/go/[id]`, sitemap/robots, backoffice `/admin` (login + CRUD + aperçu live).
- **Supabase branché en local** : `.env.local` rempli (DATABASE_URL pooler 6543,
  URL, clé publishable), migration appliquée (table `products` créée), utilisateur
  admin créé dans Supabase Auth. Circuit vérifié : home lit la base, `/admin`
  protégé (redirige vers login).

### ⏳ À faire (pour rendre le site fonctionnel)
1. Renseigner les **variables d'env sur Vercel** (DATABASE_URL, NEXT_PUBLIC_SUPABASE_URL,
   NEXT_PUBLIC_SUPABASE_ANON_KEY = clé publishable, NEXT_PUBLIC_SITE_URL) + redeploy.
   ⚠️ Tant que ce n'est pas fait, `/admin` du site déployé n'est pas protégé.
2. Ajouter les premiers produits via `/admin`.
3. Pousser les fichiers de doc + `drizzle.config.ts` (chargement `.env.local`) sur GitHub.

### 🔭 Plus tard (hors MVP)
Descriptions auto par LLM · cron vérif prix/dispo (Amazon Creators API, Keepa) ·
table `price_history` + graphes · sous-catégories & filtres · recherche (barre du
header non branchée pour l'instant) · domaine Cloudflare.

---

## 10. Journal des avancées

> Ajouter une entrée datée à chaque session marquante (plus récent en haut).

### 2026-07-22 — Branchement Supabase (local)
- Projet Supabase créé (`mcunotccghypxummfdci`, eu-west-1).
- `.env.local` rempli ; `drizzle.config.ts` charge désormais `.env.local`.
- `npm run db:migrate` OK → table `products` + enums créés.
- Utilisateur admin créé dans Supabase Auth.
- Vérifié au navigateur : home lit la base (0 produit), `/admin` redirige vers login.
- Reste : variables d'env sur Vercel + 1ers produits.

### 2026-07-22 — Mise en place initiale
- Init Next.js 16 + Tailwind v4 + Drizzle + Supabase + next-themes + lucide.
- Schéma `products` + migration `0000` générée (non encore appliquée).
- Design system (tokens clair/sombre), composants, toutes les routes publiques,
  fiche produit (JSON-LD), `/go/[id]`, SEO, backoffice `/admin` complet.
- Migration `middleware` → `proxy` (Next 16). Groupe de routes `(public)`.
- Build validé, rendu vérifié (thème, slug auto, aperçu live).
- 1er commit poussé sur GitHub `main` ; déploiement Vercel déclenché.
