import type { Metadata } from "next";
import { login } from "../actions";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Connexion admin",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="flex min-h-dvh items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-card border border-border bg-surface p-6">
        <h1 className="mb-1 text-xl font-bold">Espace admin</h1>
        <p className="mb-6 text-sm text-muted">
          Connecte-toi pour gérer les produits.
        </p>

        {error && (
          <p className="mb-4 rounded-badge border border-price/40 bg-price/10 px-3 py-2 text-sm text-price">
            {error}
          </p>
        )}

        <form action={login} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm font-medium">
            Email
            <input
              type="email"
              name="email"
              required
              autoComplete="email"
              className="h-10 rounded-btn border border-border bg-surface-2 px-3 text-fg focus:border-primary"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium">
            Mot de passe
            <input
              type="password"
              name="password"
              required
              autoComplete="current-password"
              className="h-10 rounded-btn border border-border bg-surface-2 px-3 text-fg focus:border-primary"
            />
          </label>
          <Button type="submit" size="lg">
            Se connecter
          </Button>
        </form>
      </div>
    </div>
  );
}
