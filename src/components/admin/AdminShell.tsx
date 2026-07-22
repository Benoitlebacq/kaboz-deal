import Link from "next/link";
import { LayoutDashboard, LogOut } from "lucide-react";
import { logout } from "@/app/admin/actions";

/** Chrome du backoffice (barre + déconnexion) pour les pages authentifiées. */
export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex h-14 w-full max-w-[1240px] items-center gap-4 px-4">
          <Link href="/admin" className="flex items-center gap-2 font-bold">
            <LayoutDashboard className="size-5 text-primary" aria-hidden />
            Backoffice
          </Link>
          <Link
            href="/"
            className="text-sm text-muted transition-colors hover:text-fg"
          >
            Voir le site
          </Link>
          <form action={logout} className="ml-auto">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-btn border border-border px-3 py-1.5 text-sm transition-colors hover:bg-surface-2"
            >
              <LogOut className="size-4" aria-hidden />
              Déconnexion
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto w-full max-w-[1240px] px-4 py-6">{children}</main>
    </>
  );
}
