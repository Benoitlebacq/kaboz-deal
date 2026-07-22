import Link from "next/link";
import { buttonClasses } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-5xl font-extrabold text-primary">404</p>
      <h1 className="text-xl font-bold">Page introuvable</h1>
      <p className="text-muted">
        Ce bon plan n&apos;existe pas ou n&apos;est plus disponible.
      </p>
      <Link href="/" className={buttonClasses("primary")}>
        Retour à l&apos;accueil
      </Link>
    </div>
  );
}
