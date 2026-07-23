"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";

/**
 * Recherche mobile : bouton loupe (visible < sm) qui déplie un champ pleine
 * largeur sous le header. Soumet vers /recherche?q=… (comme la barre desktop).
 */
export function MobileSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const query = q.trim();
    if (query) {
      setOpen(false);
      router.push(`/recherche?q=${encodeURIComponent(query)}`);
    }
  }

  return (
    <div className="sm:hidden">
      <button
        type="button"
        aria-label="Rechercher"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="inline-flex size-10 items-center justify-center rounded-full border border-border bg-surface text-fg transition-colors hover:bg-surface-2"
      >
        {open ? <X className="size-5" /> : <Search className="size-5" />}
      </button>

      {open && (
        <div className="absolute inset-x-0 top-full border-b border-border bg-surface p-3">
          <form
            onSubmit={onSubmit}
            role="search"
            className="mx-auto w-full max-w-[1240px]"
          >
            <input
              autoFocus
              type="search"
              name="q"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Rechercher un bon plan…"
              aria-label="Rechercher"
              className="h-10 w-full rounded-pill border border-border bg-surface-2 px-4 text-sm text-fg placeholder:text-muted focus:border-primary"
            />
          </form>
        </div>
      )}
    </div>
  );
}
