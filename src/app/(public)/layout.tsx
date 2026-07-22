import Link from "next/link";
import { Header } from "@/components/Header";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-[1240px] px-4 py-6">{children}</main>
      <footer className="mt-8 border-t border-border">
        <div className="mx-auto w-full max-w-[1240px] px-4 py-8 text-[13px] text-muted">
          <p>
            <span className="font-bold text-fg">KabozDeal</span> — Bons plans
            Tech &amp; Jeux vidéo sélectionnés à la main.
          </p>
          <p className="mt-2">
            Certains liens sont affiliés : une commission peut être perçue sans
            surcoût pour toi. Les prix sont constatés à un instant donné et
            peuvent évoluer.
          </p>
          <p className="mt-2">
            <Link href="/admin" className="hover:text-fg">
              Espace admin
            </Link>
          </p>
        </div>
      </footer>
    </>
  );
}
