import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { formatDateTime, formatPrice } from "@/lib/format";
import { statusLabel, type Order, type OrderEvent, type OrderItem } from "@/lib/types";
import { StatusBadge } from "@/components/admin/status-badge";
import { OrderStatusForm } from "./order-status-form";

export const metadata = { title: "Détail de commande" };

export default async function AdminOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { supabase } = await requireAdmin();

  const [{ data: order }, { data: items }, { data: events }] = await Promise.all([
    supabase.from("orders").select("*").eq("id", id).maybeSingle(),
    supabase.from("order_items").select("*").eq("order_id", id).order("id"),
    supabase.from("order_events").select("id, order_id, status, created_at").eq("order_id", id).order("created_at"),
  ]);
  if (!order) notFound();

  const o = order as Order;
  const lines = (items ?? []) as OrderItem[];
  const history = (events ?? []) as OrderEvent[];

  return (
    <div className="space-y-8">
      <Link href="/admin/commandes" className="text-sm text-muted hover:text-ink">
        ← Toutes les commandes
      </Link>
      <header className="flex flex-wrap items-center gap-4">
        <h1 className="font-mono text-2xl">{o.reference}</h1>
        <StatusBadge status={o.status} />
        <span className="text-sm text-muted">Passée le {formatDateTime(o.created_at)}</span>
      </header>

      <div className="grid gap-8 xl:grid-cols-[1fr_22rem]">
        <div className="space-y-8">
          <section className="rounded-(--radius-card) border border-line bg-white">
            <h2 className="border-b border-line px-5 py-4 text-xl">Articles</h2>
            <table className="w-full text-sm">
              <tbody className="divide-y divide-line">
                {lines.map((l) => (
                  <tr key={l.id}>
                    <td className="px-5 py-3">
                      {l.product_id ? (
                        <Link href={`/admin/produits/${l.product_id}`} className="underline-offset-4 hover:underline">
                          {l.product_name}
                        </Link>
                      ) : (
                        <span>{l.product_name} <span className="text-xs text-muted">(supprimé)</span></span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-muted">
                      {l.quantity} × {formatPrice(l.unit_price_cents)}
                    </td>
                    <td className="px-5 py-3 text-right font-medium">{formatPrice(l.line_total_cents)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t border-line text-sm">
                <tr>
                  <td colSpan={2} className="px-5 pt-3 text-muted">Sous-total</td>
                  <td className="px-5 pt-3 text-right">{formatPrice(o.subtotal_cents)}</td>
                </tr>
                <tr>
                  <td colSpan={2} className="px-5 py-1 text-muted">Livraison</td>
                  <td className="px-5 py-1 text-right">{o.shipping_cents === 0 ? "Offerte" : formatPrice(o.shipping_cents)}</td>
                </tr>
                <tr className="font-semibold">
                  <td colSpan={2} className="px-5 pt-1 pb-4">Total</td>
                  <td className="px-5 pt-1 pb-4 text-right">{formatPrice(o.total_cents)}</td>
                </tr>
              </tfoot>
            </table>
          </section>

          <section className="grid gap-6 rounded-(--radius-card) border border-line bg-white p-5 sm:grid-cols-2">
            <div>
              <h2 className="text-xl">Client</h2>
              <p className="mt-3 text-sm">
                {o.customer_first_name} {o.customer_last_name}
              </p>
              <p className="text-sm">
                <a href={`mailto:${o.email}?subject=Votre%20commande%20${o.reference}`} className="link-underline">
                  {o.email}
                </a>
              </p>
              {o.phone && (
                <p className="text-sm">
                  <a href={`tel:${o.phone.replace(/\s/g, "")}`} className="link-underline">
                    {o.phone}
                  </a>
                </p>
              )}
            </div>
            <div>
              <h2 className="text-xl">Livraison</h2>
              <address className="mt-3 text-sm not-italic">
                {o.address_line1}
                <br />
                {o.address_line2 && (
                  <>
                    {o.address_line2}
                    <br />
                  </>
                )}
                {o.postal_code} {o.city}
                <br />
                {o.country}
              </address>
            </div>
            {o.customer_note && (
              <div className="sm:col-span-2">
                <h2 className="text-xl">Message du client</h2>
                <p className="mt-2 rounded-lg bg-sand p-3 text-sm whitespace-pre-line">{o.customer_note}</p>
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-(--radius-card) border border-line bg-white p-5">
            <h2 className="text-xl">Suivi</h2>
            <OrderStatusForm id={o.id} status={o.status} adminNote={o.admin_note ?? ""} />
          </section>
          <section className="rounded-(--radius-card) border border-line bg-white p-5">
            <h2 className="text-xl">Historique</h2>
            <ol className="mt-4 space-y-3 border-l border-line pl-4 text-sm">
              {history.map((e) => (
                <li key={e.id}>
                  <p className="font-medium">{statusLabel(e.status)}</p>
                  <p className="text-xs text-muted">{formatDateTime(e.created_at)}</p>
                </li>
              ))}
            </ol>
          </section>
        </aside>
      </div>
    </div>
  );
}
