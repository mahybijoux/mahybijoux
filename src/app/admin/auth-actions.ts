"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createSessionClient } from "@/lib/supabase/server";

export type LoginState = { error?: string };

const schema = z.object({
  email: z.email().max(254),
  password: z.string().min(1).max(200),
});

export async function signIn(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = schema.safeParse({
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
    password: String(formData.get("password") ?? ""),
  });
  if (!parsed.success) return { error: "Identifiants invalides." };

  const supabase = await createSessionClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  // Same message for every failure so accounts cannot be enumerated.
  if (error) return { error: "Identifiants invalides." };

  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (isAdmin !== true) {
    await supabase.auth.signOut();
    return { error: "Ce compte n'a pas accès à l'administration." };
  }

  redirect("/admin");
}

export async function signOut() {
  const supabase = await createSessionClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
