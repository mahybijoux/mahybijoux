import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { formatDateTime, formatPrice } from "@/lib/format";
import { ORDER_STATUSES, isOrderStatus, type Order } from "@/lib/types";
import { StatusBadge } from "@/components/admin/status-badge";

export const metadata = { title: "Commandes" };

const PAGE_SIZE = 30;

type Search = { statut?: string; q?: string; page?: string };

export default async function AdminOrdersPage({ searchParams }: { searchParams: Promise<Search> }) {
  const { supabase } = await requireAdmin();
  const sp = await searchParams;
  const status = sp.statut && isOrderStatus(sp.statut) ? sp.statut : undefined;
  const q = (sp.q ?? "").trim().slice(0, 80);
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);

  let query = supabase
    .from("orders")
    .select("id, reference, status, customer_first_name, customer_last_name, email, city, total_cents, created_at", {
      count: "exact",
    })
    .order("created_at", { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  if (status) query = query.eq("status", status);
  if (q) {
    // Only letters, digits, @ . - _ and spaces reach the PostgREST filter string.
    const safe = q.replace(/[^\p{L}\p{N}@.\-_ ]/gu, "").replace(/[%_]/g, "\\$&");
    if (safe) query = query.or(`reference.ilike.%${safe}%,email.ilike.%${safe}%,customer_last_name.ilike.%${safe}%`);
  }

  const { data, count, error } = await query;
  const orders = (data ?? []) as Pick<
    Order,
    "id" | "reference" | "status" | "customer_first_name" | "customer_last_name" | "email" | "city" | "total_cents" | "created_at"
  >[];
  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

  const link = (next: Partial<Search>) => {
    const params = new URLSearchParams();
    const s = "statut" in next ? next.statut : status;
    if (s) params.set("statut", s);
    if (q) params.set("q", q);
    if (next.page && next.page !== "1") params.set("page", next.page);
    const str = params.toString();
    return `/admin/commandes${str ? `?${str}` : ""}`;
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl">Commandes</h1>
          <p className="mt-1 text-sm text-muted">{count ?? 0} commande(s)</p>
        </div>
        <form className="flex gap-2" action="/admin/commandes">
          {status && <input type="hidden" name="statut" value={status} />}
          <label htmlFor="order-search" className="sr-only">
            Rechercher
          </label>
          <input id="order-search" name="q" defaultValue={q} placeholder="Référence, e-mail, nom…" className="field w-64 py-2" />
          <button className="btn btn-primary py-2">Rechercher</button>
        </form>
      </header>

      <nav aria-label="Filtrer par statut">
        <ul className="flex flex-wrap gap-2">
          <li>
            <Link href={link({ statut: undefined })} className="chip text-xs" aria-current={!status ? "true" : undefined}>
              Toutes
            </Link>
          </li>
          {ORDER_STATUSES.map((s) => (
            <li key={s.value}>
              <Link href={link({ statut: s.value })} className="chip text-xs" aria-current={status === s.value ? "true" : undefined}>
                {s.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {error && <p className="text-sm text-danger">Erreur de chargement : {error.message}</p>}

      <div className="overflow-x-auto rounded-(--radius-card) border border-line bg-white">
        <table className="w-full min-w-[46rem] text-sm">
          <thead className="border-b border-line text-left text-xs text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Référence</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Client</th>
              <th className="px-4 py-3 font-medium">Ville</th>
              <th className="px-4 py-3 font-medium">Statut</th>
              <th className="px-4 py-3 text-right font-medium">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {orders.map((o) => (
              <tr key={o.id} className="hover:bg-cream">
                <td className="px-4 py-3">
                  <Link href={`/admin/commandes/${o.id}`} className="font-mono text-xs underline-offset-4 hover:underline">
                    {o.reference}
                  </Link>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-muted">{formatDateTime(o.created_at)}</td>
                <td className="px-4 py-3">
                  <p>
                    {o.customer_first_name} {o.customer_last_name}
                  </p>
                  <p className="text-xs text-muted">{o.email}</p>
                </td>
                <td className="px-4 py-3">{o.city}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={o.status} />
                </td>
                <td className="px-4 py-3 text-right font-medium">{formatPrice(o.total_cents)}</td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted">
                  Aucune commande.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <nav aria-label="Pagination" className="flex items-center justify-between text-sm">
          {page > 1 ? (
            <Link href={link({ page: String(page - 1) })} className="link-underline">
              ← Précédent
            </Link>
          ) : (
            <span />
          )}
          <span className="text-muted">
            Page {page} / {totalPages}
          </span>
          {page < totalPages ? (
            <Link href={link({ page: String(page + 1) })} className="link-underline">
              Suivant →
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </div>
  );
}
