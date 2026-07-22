"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/tech", label: "Tech" },
  { href: "/jeux-video", label: "Jeux vidéo" },
];

/** Onglets de sections avec état actif (surligne Tech / Jeux vidéo selon l'URL). */
export function SectionNav() {
  const pathname = usePathname();

  return (
    <nav className="flex h-12 items-center gap-1 text-sm font-semibold">
      {links.map((l) => {
        const active = pathname === l.href || pathname.startsWith(`${l.href}/`);
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "rounded-btn px-3 py-1.5 transition-colors",
              active
                ? "bg-surface-2 text-primary text-neon"
                : "text-fg hover:bg-surface-2",
            )}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
