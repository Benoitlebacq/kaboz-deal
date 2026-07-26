"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme-provider";

const btnClass =
  "inline-flex size-10 items-center justify-center rounded-full border border-border bg-surface text-fg transition-colors hover:bg-surface-2";

/** Toggle clair/sombre (icône soleil/lune). Rendu stable avant montage. */
export function ThemeToggle() {
  const { theme, mounted, setTheme } = useTheme();

  // Avant le montage : rendu identique au serveur (évite le mismatch).
  if (!mounted) {
    return (
      <button type="button" aria-label="Changer de thème" className={btnClass}>
        <Sun className="size-5 opacity-0" />
      </button>
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      aria-label={isDark ? "Passer en clair" : "Passer en sombre"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={btnClass}
    >
      {isDark ? <Sun className="size-5" /> : <Moon className="size-5" />}
    </button>
  );
}
