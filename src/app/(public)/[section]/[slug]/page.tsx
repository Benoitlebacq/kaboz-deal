import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Clock, ExternalLink, ImageOff, Info } from "lucide-react";
import { PriceBlock } from "@/components/PriceBlock";
import { buttonClasses } from "@/components/ui/Button";
import { getAllActiveProducts, getProductBySlug } from "@/lib/queries";
import {
  MERCHANT_LABELS,
  SECTION_LABELS,
  pathToSection,
  sectionToPath,
} from "@/lib/constants";
import { formatDateLong, formatDateShort, timeAgo, toNumber } from "@/lib/utils";

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  const products = await getAllActiveProducts();
  return products.map((p) => ({
    section: sectionToPath(p.section),
    slug: p.slug,
  }));
}

type Params = Promise<{ section: string; slug: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Produit introuvable" };

  const description =
    product.description?.slice(0, 160) ??
    `${product.titre} — bon plan chez ${MERCHANT_LABELS[product.marchand]}.`;

  return {
    title: product.titre,
    description,
    openGraph: {
      title: product.titre,
      description,
      images: product.imageUrl ? [product.imageUrl] : undefined,
    },
  };
}

export default async function ProductPage({ params }: { params: Params }) {
  const { section, slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product || !product.actif) notFound();

  // URL canonique : la section du chemin doit correspondre à celle du produit.
  const expectedSection = pathToSection(section);
  if (expectedSection !== product.section) {
    redirect(`/${sectionToPath(product.section)}/${product.slug}`);
  }

  const isExpired = product.dateFin ? new Date(product.dateFin) < new Date() : false;
  const priceNum = toNumber(product.prix);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.titre,
    description: product.description ?? undefined,
    image: product.imageUrl ?? undefined,
    offers: {
      "@type": "Offer",
      price: priceNum ?? undefined,
      priceCurrency: product.devise,
      availability: isExpired
        ? "https://schema.org/Discontinued"
        : "https://schema.org/InStock",
      url: `/${sectionToPath(product.section)}/${product.slug}`,
    },
  };

  return (
    <article className="mx-auto max-w-3xl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Fil d'ariane léger */}
      <p className="mb-4 text-[13px] text-muted">
        <Link href="/" className="hover:text-fg">
          Accueil
        </Link>{" "}
        /{" "}
        <Link
          href={`/${sectionToPath(product.section)}`}
          className="hover:text-fg"
        >
          {SECTION_LABELS[product.section]}
        </Link>
      </p>

      {/* Bandeau d'expiration */}
      {product.dateFin && (
        <div className="mb-4 flex items-center gap-2 rounded-card border border-border bg-surface-2 px-4 py-3 text-sm">
          <Clock className="size-4 shrink-0 text-hot" aria-hidden />
          {isExpired ? (
            <span>Cette offre a expiré le {formatDateLong(product.dateFin)}.</span>
          ) : (
            <span>
              Cette offre expire le{" "}
              <strong>{formatDateLong(product.dateFin)}</strong>.
            </span>
          )}
        </div>
      )}

      <div className="flex flex-col gap-6 rounded-card border border-border bg-surface p-5 sm:flex-row">
        <div className="relative h-64 w-full shrink-0 overflow-hidden rounded-card bg-surface-2 sm:h-56 sm:w-64">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.titre}
              fill
              sizes="(max-width: 640px) 100vw, 256px"
              className="object-contain p-3"
              priority
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted">
              <ImageOff className="size-10" aria-hidden />
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <p className="text-[13px] text-muted">Ajouté {timeAgo(product.createdAt)}</p>
          <h1 className="text-2xl font-bold sm:text-[28px]">{product.titre}</h1>

          <PriceBlock
            prix={product.prix}
            prixBarre={product.prixBarre}
            devise={product.devise}
            size="detail"
          />

          <p className="text-sm text-muted">
            Dispo. chez{" "}
            <span className="font-semibold text-fg">
              {MERCHANT_LABELS[product.marchand]}
            </span>
          </p>

          <div className="mt-2">
            <Link
              href={`/go/${product.id}`}
              className={buttonClasses("primary", "lg", "w-full sm:w-auto")}
              rel="nofollow sponsored"
            >
              Voir l&apos;offre
              <ExternalLink className="size-5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>

      {/* À propos */}
      <section className="mt-6 rounded-card border border-border bg-surface p-5">
        <h2 className="mb-3 text-lg font-bold">À propos de ce bon plan</h2>
        {product.description ? (
          <p className="whitespace-pre-line text-[15px] leading-relaxed">
            {product.description}
          </p>
        ) : (
          <p className="text-[15px] text-muted">Description à venir.</p>
        )}

        <p className="mt-4 flex items-start gap-2 border-t border-border pt-4 text-[13px] text-muted">
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
          <span>
            Prix constaté le {formatDateShort(product.dateMaj)} — susceptible
            d&apos;avoir changé depuis. Vérifie le prix final chez le marchand.
          </span>
        </p>
      </section>
    </article>
  );
}
