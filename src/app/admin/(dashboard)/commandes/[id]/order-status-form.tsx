"use client";

import { useActionState } from "react";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/types";
import { updateOrder, type OrderActionState } from "../actions";

export function OrderStatusForm({ id, status, adminNote }: { id: string; status: OrderStatus; adminNote: string }) {
  const [state, action, pending] = useActionState<OrderActionState, FormData>(updateOrder, { status: "idle" });
  const locked = status === "cancelled";

  return (
    <form
      action={action}
      className="mt-4 space-y-4"
      onSubmit={(e) => {
        const next = new FormData(e.currentTarget).get("status");
        if (next === "cancelled" && status !== "cancelled") {
          if (!window.confirm("Annuler cette commande ? Le stock des articles sera rétabli. Cette action est définitive.")) {
            e.preventDefault();
          }
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <div>
        <label htmlFor="status" className="field-label">
          Statut
        </label>
        <select id="status" name="status" defaultValue={status} disabled={locked} className="field">
          {ORDER_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        {locked && <input type="hidden" name="status" value="cancelled" />}
        {locked && <p className="mt-1 text-xs text-muted">Une commande annulée ne peut plus changer de statut.</p>}
      </div>
      <div>
        <label htmlFor="admin_note" className="field-label">
          Note interne
        </label>
        <textarea id="admin_note" name="admin_note" rows={4} maxLength={2000} defaultValue={adminNote} className="field text-sm" />
      </div>
      <button type="submit" className="btn btn-primary w-full" disabled={pending}>
        {pending ? "Enregistrement…" : "Enregistrer"}
      </button>
      {state.message && (
        <p role="status" className={`text-sm ${state.status === "error" ? "text-danger" : "text-success"}`}>
          {state.message}
        </p>
      )}
    </form>
  );
}
