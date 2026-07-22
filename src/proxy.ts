import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Convention "proxy" de Next.js 16 (remplace l'ancien "middleware").
 * Protège le backoffice ; le reste du site reste public.
 */
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: ["/admin/:path*"],
};
