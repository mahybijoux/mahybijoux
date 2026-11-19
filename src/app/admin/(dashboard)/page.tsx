import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { formatDateTime, formatPrice } from "@/lib/format";
import { ORDER_STATUSES, type Order, type OrderStatus, type Product } from "@/lib/types";
import { StatusBadge } from "@/components/admin/status-badge";

export const metadata = { title: "Tableau de bord" };

export default async function AdminDashboard() {
  const { supabase } = await requireAdmin();

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [statusCounts, recent, monthOrders, lowStock] = await Promise.all([
    Promise.all(
      ORDER_STATUSES.map(async (s) => {
        const { count } = await supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", s.value);
        return [s.value, count ?? 0] as const;
      }),
    ),
    supabase
      .from("orders")
      .select("id, reference, status, customer_first_name, customer_last_name, total_cents, created_at")
      .order("created_at", { ascending: false })
      .limit(8),
    supabase.from("orders").select("total_cents").neq("status", "cancelled").gte("created_at", monthStart.toISOString()),
    supabase
      .from("products")
      .select("id, name, stock, is_active")
      .eq("is_active", true)
      .lte("stock", 2)
      .order("stock", { ascending: true })
      .limit(8),
  ]);

  const counts = Object.fromEntries(statusCounts) as Record<OrderStatus, number>;
  const monthRevenue = (monthOrders.data ?? []).reduce((n, o) => n + (o.total_cents as number), 0);
  const recentOrders = (recent.data ?? []) as Pick<
    Order,
    "id" | "reference" | "status" | "customer_first_name" | "customer_last_name" | "total_cents" | "created_at"
  >[];
  const low = (lowStock.data ?? []) as Pick<Product, "id" | "name" | "stock">[];

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-3xl">Tableau de bord</h1>
        <p className="mt-1 text-sm text-muted">Vue d&apos;ensemble des commandes et du stock.</p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Indicateurs">
        <Stat label="À traiter" value={counts.pending} href="/admin/commandes?statut=pending" highlight={counts.pending > 0} />
        <Stat label="En préparation" value={counts.confirmed + counts.preparing} href="/admin/commandes?statut=preparing" />
        <Stat label="Expédiées" value={counts.shipped} href="/admin/commandes?statut=shipped" />
        <Stat label="Ventes du mois" value={formatPrice(monthRevenue)} />
      </section>

      <div className="grid gap-8 xl:grid-cols-[1fr_20rem]">
        <section className="rounded-(--radius-card) border border-line bg-white">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 className="text-xl">Dernières commandes</h2>
            <Link href="/admin/commandes" className="link-underline text-sm">
              Tout voir
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="p-5 text-sm text-muted">Aucune commande pour le moment.</p>
          ) : (
            <ul className="divide-y divide-line">
              {recentOrders.map((o) => (
                <li key={o.id}>
                  <Link href={`/admin/commandes/${o.id}`} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3 text-sm hover:bg-cream">
                    <span className="font-mono text-xs">{o.reference}</span>
                    <span className="flex-1">
                      {o.customer_first_name} {o.customer_last_name}
                    </span>
                    <StatusBadge status={o.status} />
                    <span className="w-20 text-right font-medium">{formatPrice(o.total_cents)}</span>
                    <span className="w-full text-xs text-muted sm:w-36 sm:text-right">{formatDateTime(o.created_at)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="h-fit rounded-(--radius-card) border border-line bg-white">
          <div className="border-b border-line px-5 py-4">
            <h2 className="text-xl">Stock faible</h2>
          </div>
          {low.length === 0 ? (
            <p className="p-5 text-sm text-muted">Aucun produit actif sous 3 unités.</p>
          ) : (
            <ul className="divide-y divide-line">
              {low.map((p) => (
                <li key={p.id}>
                  <Link href={`/admin/produits/${p.id}`} className="flex justify-between px-5 py-3 text-sm hover:bg-cream">
                    <span>{p.name}</span>
                    <span className={p.stock === 0 ? "font-medium text-danger" : "text-terracotta-deep"}>
                      {p.stock === 0 ? "Épuisé" : `${p.stock} restant${p.stock > 1 ? "s" : ""}`}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function Stat({ label, value, href, highlight }: { label: string; value: number | string; href?: string; highlight?: boolean }) {
  const body = (
    <>
      <p className="text-sm text-muted">{label}</p>
      <p className={`mt-2 font-serif text-3xl ${highlight ? "text-terracotta-deep" : ""}`}>{value}</p>
    </>
  );
  const cls = `block rounded-(--radius-card) border bg-white p-5 ${highlight ? "border-terracotta" : "border-line"}`;
  return href ? (
    <Link href={href} className={`${cls} transition hover:border-ink`}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}
