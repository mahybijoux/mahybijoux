import "server-only";
import { createClient } from "@supabase/supabase-js";
import { supabaseEnv } from "./env";

/**
 * Cookie-less anonymous client for public catalog reads and order placement.
 * It never carries a user session, so it is safe to use in cached (ISR) pages
 * and every request is constrained by the `anon` RLS policies.
 */
export function createPublicClient() {
  const { url, anonKey } = supabaseEnv();
  return createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
