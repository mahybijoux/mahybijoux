"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { ORDER_STATUSES } from "@/lib/types";

export type OrderActionState = { status: "idle" | "success" | "error"; message?: string };

const schema = z.object({
  id: z.uuid(),
  status: z.enum(ORDER_STATUSES.map((s) => s.value) as [string, ...string[]]),
  admin_note: z.string().trim().max(2000),
});

export async function updateOrder(_prev: OrderActionState, formData: FormData): Promise<OrderActionState> {
  const { supabase } = await requireAdmin();

  const parsed = schema.safeParse({
    id: formData.get("id"),
    status: formData.get("status"),
    admin_note: String(formData.get("admin_note") ?? ""),
  });
  if (!parsed.success) return { status: "error", message: "Données invalides." };

  const { id, status, admin_note } = parsed.data;
  const { error } = await supabase
    .from("orders")
    .update({ status, admin_note: admin_note || null })
    .eq("id", id);

  if (error) {
    return {
      status: "error",
      message: error.code === "P0001" ? error.message : "La mise à jour a échoué. Réessayez.",
    };
  }

  revalidatePath("/admin", "layout");
  // Cancelling restocks products, which changes public availability.
  if (status === "cancelled") revalidatePath("/", "layout");
  return { status: "success", message: "Commande mise à jour." };
}
