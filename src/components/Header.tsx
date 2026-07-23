import Link from "next/link";
import { Tag } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SectionNav } from "@/components/SectionNav";
import { SearchBar } from "@/components/SearchBar";
import { MobileSearch } from "@/components/MobileSearch";

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

          <SearchBar />

          <div className="ml-auto flex items-center gap-2">
            <MobileSearch />
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
        <SectionNav />
      </div>
    </header>
  );
}
