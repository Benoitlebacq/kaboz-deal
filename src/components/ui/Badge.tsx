import type { ReactNode } from "react";
import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

type BadgeVariant = "discount" | "hot" | "free" | "neutral";

const variants: Record<BadgeVariant, string> = {
  discount: "bg-success text-white",
  hot: "bg-hot text-white",
  free: "bg-success text-white",
  neutral: "bg-surface-2 text-muted",
};

export function Badge({
  variant = "neutral",
  children,
  className,
}: {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-badge px-1.5 py-0.5 text-[13px] font-bold leading-none",
        variants[variant],
        className,
      )}
    >
      {variant === "hot" && <Flame className="size-3" aria-hidden />}
      {children}
    </span>
  );
}
