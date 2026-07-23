"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

/** Barre de recherche du header : soumet vers /recherche?q=… */
export function SearchBar() {
  const router = useRouter();
  const [q, setQ] = useState("");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const query = q.trim();
    if (query) router.push(`/recherche?q=${encodeURIComponent(query)}`);
  }

  return (
    <form
      onSubmit={onSubmit}
      role="search"
      className="relative hidden flex-1 sm:block"
    >
      <Search
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted"
        aria-hidden
      />
      <input
        type="search"
        name="q"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Rechercher un bon plan…"
        aria-label="Rechercher"
        className="h-10 w-full rounded-pill border border-border bg-surface-2 pl-9 pr-4 text-sm text-fg placeholder:text-muted focus:border-primary"
      />
    </form>
  );
}
