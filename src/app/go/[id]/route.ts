import { NextResponse, type NextRequest } from "next/server";
import { sql, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { products } from "@/db/schema";
import { getProductById } from "@/lib/queries";

/**
 * Redirection des liens affiliés (mise-en-place §5.6).
 * Les liens publics pointent vers /go/{id}, jamais directement vers le marchand.
 * Incrémente le compteur de clics puis redirige en 302 vers lien_affilie.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product || !product.actif) {
    return NextResponse.redirect(new URL("/", _request.url), 302);
  }

  // Incrément best-effort : ne doit jamais bloquer la redirection.
  try {
    const db = getDb();
    if (db) {
      await db
        .update(products)
        .set({ clicks: sql`${products.clicks} + 1` })
        .where(eq(products.id, id));
    }
  } catch {
    // on ignore et on redirige quand même
  }

  return NextResponse.redirect(product.lienAffilie, 302);
}
