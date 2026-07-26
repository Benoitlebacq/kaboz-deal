"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

type ThemeContextValue = {
  theme: Theme;
  mounted: boolean;
  setTheme: (t: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * Provider de thème maison (remplace next-themes) : clair/sombre via l'attribut
 * data-theme sur <html>, persisté en localStorage. Ne rend AUCUN <script>
 * (l'anti-flash est un script serveur dans le layout racine).
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const initial: Theme =
      stored === "light" || stored === "dark" ? stored : "dark";
    setThemeState(initial);
    document.documentElement.dataset.theme = initial;
    setMounted(true);
  }, []);

  function setTheme(t: Theme) {
    setThemeState(t);
    document.documentElement.dataset.theme = t;
    try {
      localStorage.setItem("theme", t);
    } catch {
      // localStorage indisponible : on ignore
    }
  }

  return (
    <ThemeContext.Provider value={{ theme, mounted, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme doit être utilisé dans <ThemeProvider>");
  return ctx;
}
