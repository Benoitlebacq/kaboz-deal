import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Exige une session Supabase valide ; redirige vers /admin/login sinon.
 * Utilisé côté Server Components (pages admin) ET server actions — défense en
 * profondeur, en plus du proxy `/admin` (ne pas dépendre du seul middleware).
 */
export async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  return user;
}
