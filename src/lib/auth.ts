import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createSessionClient } from "@/lib/supabase/server";

/**
 * Verifies the session with the Supabase Auth server and checks admin membership.
 * Call at the top of every admin page AND every admin Server Action:
 * Server Actions are public HTTP endpoints, so layout checks alone are not enough.
 */
export const requireAdmin = cache(async () => {
  const supabase = await createSessionClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  const { data: isAdmin, error } = await supabase.rpc("is_admin");
  if (error || isAdmin !== true) {
    await supabase.auth.signOut();
    redirect("/admin/login?erreur=acces");
  }

  return { supabase, user };
});
