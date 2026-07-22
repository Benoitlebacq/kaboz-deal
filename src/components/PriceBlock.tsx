import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { formatPrice, discountPercent, toNumber } from "@/lib/utils";

/**
 * Bloc prix (design-front §5.2/§5.5) :
 * prix (rouge, gras) + prix barré (muted) + badge -XX% (vert, calculé).
 * Affiche "Gratuit" si le prix vaut 0.
 */
export function PriceBlock({
  prix,
  prixBarre,
  devise = "EUR",
  size = "listing",
  className,
}: {
  prix: string | number | null;
  prixBarre: string | number | null;
  devise?: string;
  size?: "listing" | "detail";
  className?: string;
}) {
  const priceNum = toNumber(prix);
  const remise = discountPercent(prix, prixBarre);
  const isFree = priceNum === 0;

  const priceSize = size === "detail" ? "text-3xl" : "text-[22px]";

  return (
    <div className={cn("flex flex-wrap items-baseline gap-2", className)}>
      {isFree ? (
        <span className={cn("font-bold text-success", priceSize)}>Gratuit</span>
      ) : priceNum !== null ? (
        <span className={cn("font-bold text-price", priceSize)}>
          {formatPrice(prix, devise)}
        </span>
      ) : (
        <span className={cn("font-bold text-muted", priceSize)}>—</span>
      )}

      {prixBarre != null && toNumber(prixBarre) !== null && (
        <span className="text-[15px] text-muted line-through">
          {formatPrice(prixBarre, devise)}
        </span>
      )}

      {remise !== null && <Badge variant="discount">-{remise}%</Badge>}
    </div>
  );
}
