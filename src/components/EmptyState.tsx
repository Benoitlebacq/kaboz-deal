import { PackageOpen } from "lucide-react";

export function EmptyState({
  title = "Aucun bon plan pour le moment",
  hint,
}: {
  title?: string;
  hint?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-card border border-dashed border-border bg-surface px-6 py-16 text-center">
      <PackageOpen className="size-10 text-muted" aria-hidden />
      <p className="font-semibold">{title}</p>
      {hint && <p className="max-w-md text-sm text-muted">{hint}</p>}
    </div>
  );
}
