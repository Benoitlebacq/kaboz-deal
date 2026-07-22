import Link from "next/link";
import { Search, Tag } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

/**
 * Header sticky, deux rangées (design-front §5.1).
 * NB (MVP) : la recherche et le bouton "Filtrer" sont présents visuellement
 * mais pas encore branchés (évolution future).
 */
export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface">
      <div className="mx-auto w-full max-w-[1240px] px-4">
        {/* Rangée 1 */}
        <div className="flex h-16 items-center gap-4">
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2 font-retro font-bold tracking-wide"
          >
            <span className="flex size-8 items-center justify-center rounded-xl text-on-primary shadow-[0_0_16px_-2px_var(--primary)] [background-image:var(--primary-gradient)]">
              <Tag className="size-5" aria-hidden />
            </span>
            <span className="text-base">
              <span className="text-fg">KABOZ</span>
              <span className="text-primary text-neon">DEAL</span>
            </span>
          </Link>

          <div className="relative hidden flex-1 sm:block">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted"
              aria-hidden
            />
            <input
              type="search"
              placeholder="Rechercher un bon plan…"
              aria-label="Rechercher"
              className="h-10 w-full rounded-pill border border-border bg-surface-2 pl-9 pr-4 text-sm text-fg placeholder:text-muted focus:border-primary"
            />
          </div>

          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/admin"
              className="hidden rounded-btn border border-border px-3 py-2 text-sm text-muted transition-colors hover:bg-surface-2 sm:inline-block"
            >
              Admin
            </Link>
          </div>
        </div>

        {/* Rangée 2 */}
        <nav className="flex h-12 items-center gap-1 text-sm font-semibold">
          <Link
            href="/tech"
            className="rounded-btn px-3 py-1.5 transition-colors hover:bg-surface-2"
          >
            Tech
          </Link>
          <Link
            href="/jeux-video"
            className="rounded-btn px-3 py-1.5 transition-colors hover:bg-surface-2"
          >
            Jeux vidéo
          </Link>
        </nav>
      </div>
    </header>
  );
}
