import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { supabaseEnv } from "./env";

/** Session-aware client (admin area). Requests run as the signed-in user, under RLS. */
export async function createSessionClient() {
  const { url, anonKey } = supabaseEnv();
  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component: cookies are read-only there.
          // The proxy refreshes the session, so this can be ignored.
        }
      },
    },
  });
}
