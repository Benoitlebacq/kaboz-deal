"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { track } from "@/lib/track";

/** Logge une vue à chaque page publique (montage + changement d'URL). */
export function Tracker() {
  const pathname = usePathname();
  useEffect(() => {
    track({ type: "view", path: pathname });
  }, [pathname]);
  return null;
}
