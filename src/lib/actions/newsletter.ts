"use server";

import { z } from "zod";
import { createPublicClient } from "@/lib/supabase/public";

export type NewsletterState = { status: "idle" | "success" | "error"; message?: string };

const schema = z.object({ email: z.email().max(254) });

export async function subscribeNewsletter(_prev: NewsletterState, formData: FormData): Promise<NewsletterState> {
  // Honeypot: real visitors never fill this hidden field.
  if (formData.get("website")) return { status: "success", message: "Merci, c'est noté !" };

  const parsed = schema.safeParse({ email: String(formData.get("email") ?? "").trim().toLowerCase() });
  if (!parsed.success) return { status: "error", message: "Merci d'indiquer une adresse e-mail valide." };

  const { error } = await createPublicClient().from("newsletter_subscribers").insert({ email: parsed.data.email });

  // 23505 = already subscribed. Answer identically so the list can't be probed.
  if (error && error.code !== "23505") {
    console.error("[newsletter] insert failed", error);
    return { status: "error", message: "L'inscription n'a pas abouti. Réessayez dans un instant." };
  }
  return { status: "success", message: "Merci, vous faites désormais partie du cercle." };
}
