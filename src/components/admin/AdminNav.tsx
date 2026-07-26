"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  {
    href: "/admin",
    label: "Produits",
    isActive: (p: string) => p === "/admin" || p.startsWith("/admin/produits"),
  },
  {
    href: "/admin/stats",
    label: "Statistiques",
    isActive: (p: string) => p.startsWith("/admin/stats"),
  },
];

/** Nav du backoffice avec surbrillance de la page active. */
export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-3 text-sm">
      {links.map((l) => {
        const active = l.isActive(pathname);
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "transition-colors",
              active
                ? "font-semibold text-primary text-neon"
                : "text-muted hover:text-fg",
            )}
          >
            {l.label}
          </Link>
        );
      })}
      <Link href="/" className="text-muted transition-colors hover:text-fg">
        Voir le site
      </Link>
    </nav>
  );
}
