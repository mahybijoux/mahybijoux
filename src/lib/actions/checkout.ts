"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { getProductsByIds } from "@/lib/catalog";
import { createPublicClient } from "@/lib/supabase/public";

export type CartSnapshot = {
  id: string;
  slug: string;
  name: string;
  material_label: string;
  price_cents: number;
  stock: number;
  image: string | null;
  category: string;
};

/** Returns current public data for the products in a browser cart. */
export async function refreshCartProducts(ids: string[]): Promise<CartSnapshot[] | null> {
  if (!Array.isArray(ids)) return [];
  try {
    const products = await getProductsByIds(ids.filter((i) => typeof i === "string"));
    return products.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      material_label: p.material_label,
      price_cents: p.price_cents,
      stock: p.stock,
      image: p.images[0] ?? null,
      category: p.category,
    }));
  } catch (error) {
    console.error("[checkout] refreshCartProducts failed", error);
    return null; // null = "could not verify", the UI keeps the local cart
  }
}

export type CheckoutState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: Partial<Record<string, string>>;
  /** Echo of submitted fields so the form can be re-filled after React resets it. */
  values?: Record<string, string>;
};

const ECHO_FIELDS = [
  "first_name", "last_name", "email", "phone", "address_line1", "address_line2",
  "postal_code", "city", "country", "note", "accept_terms",
] as const;

export async function placeOrder(prev: CheckoutState, formData: FormData): Promise<CheckoutState> {
  const result = await submitOrder(prev, formData);
  const values = Object.fromEntries(ECHO_FIELDS.map((k) => [k, String(formData.get(k) ?? "").slice(0, 1000)]));
  return { ...result, values };
}

const trimmed = (max: number) => z.string().trim().max(max);

const customerSchema = z.object({
  first_name: trimmed(80).min(1, "Indiquez votre prénom."),
  last_name: trimmed(80).min(1, "Indiquez votre nom."),
  email: z.email("Adresse e-mail invalide.").max(254),
  phone: trimmed(30).regex(/^[0-9+().\s-]*$/, "Numéro invalide.").optional(),
  address_line1: trimmed(160).min(3, "Indiquez votre adresse."),
  address_line2: trimmed(160).optional(),
  postal_code: trimmed(12).regex(/^[A-Za-z0-9\s-]{2,12}$/, "Code postal invalide."),
  city: trimmed(100).min(1, "Indiquez votre ville."),
  country: z.enum(["MA", "FR", "BE", "LU", "CH", "MC"], "Pays non desservi."),
  note: trimmed(1000).optional(),
});

const cartSchema = z
  .array(z.object({ product_id: z.uuid(), quantity: z.number().int().min(1).max(20) }))
  .min(1, "Votre panier est vide.")
  .max(20);

async function submitOrder(_prev: CheckoutState, formData: FormData): Promise<CheckoutState> {
  // Honeypot against bots.
  if (formData.get("company_website")) {
    return { status: "error", message: "Votre commande n'a pas pu être envoyée." };
  }

  if (formData.get("accept_terms") !== "on") {
    return {
      status: "error",
      message: "Merci d'accepter les conditions générales de vente.",
      fieldErrors: { accept_terms: "Requis pour passer commande." },
    };
  }

  const raw = Object.fromEntries(
    ["first_name", "last_name", "email", "phone", "address_line1", "address_line2", "postal_code", "city", "country", "note"].map(
      (k) => [k, String(formData.get(k) ?? "")],
    ),
  );
  const customer = customerSchema.safeParse({ ...raw, email: raw.email?.trim().toLowerCase() });
  if (!customer.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of customer.error.issues) {
      const key = String(issue.path[0]);
      fieldErrors[key] ??= issue.message;
    }
    return { status: "error", message: "Certains champs sont à vérifier.", fieldErrors };
  }

  let cartInput: unknown;
  try {
    cartInput = JSON.parse(String(formData.get("cart") ?? "[]"));
  } catch {
    cartInput = null;
  }
  const cart = cartSchema.safeParse(cartInput);
  if (!cart.success) {
    return { status: "error", message: "Votre panier est vide ou invalide. Rechargez la page." };
  }

  // Prices, stock and totals are computed inside the database function.
  const { data, error } = await createPublicClient().rpc("place_order", {
    customer: customer.data,
    items: cart.data,
  });

  if (error) {
    const msg = error.message ?? "";
    if (msg.startsWith("OUT_OF_STOCK:")) {
      return {
        status: "error",
        message: `« ${msg.slice("OUT_OF_STOCK:".length)} » n'est plus disponible dans la quantité demandée. Ajustez votre panier.`,
      };
    }
    if (msg.includes("PRODUCT_UNAVAILABLE")) {
      return { status: "error", message: "Un bijou de votre panier n'est plus disponible. Retirez-le pour continuer." };
    }
    console.error("[checkout] place_order failed", error);
    return { status: "error", message: "La commande n'a pas pu être enregistrée. Vérifiez vos informations et réessayez." };
  }

  const reference = (data as { reference?: string } | null)?.reference;
  if (!reference) {
    return { status: "error", message: "La commande n'a pas pu être confirmée. Réessayez." };
  }

  redirect(`/commande/confirmee/${encodeURIComponent(reference)}`);
}
