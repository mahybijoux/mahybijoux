import Image from "next/image";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { formatPrice } from "@/lib/format";
import { productImageUrl } from "@/lib/storage";
import { CATEGORIES, categoryLabel, isCategory, type Product } from "@/lib/types";
import { ProductArt } from "@/components/shop/product-art";

export const metadata = { title: "Produits" };

export default async function AdminProductsPage({ searchParams }: { searchParams: Promise<{ categorie?: string }> }) {
  const { supabase } = await requireAdmin();
  const { categorie } = await searchParams;
  const category = categorie && isCategory(categorie) ? categorie : undefined;

  let query = supabase
    .from("products")
    .select("id, slug, name, category, material, material_label, price_cents, stock, images, is_active, is_featured, badge")
    .order("created_at", { ascending: false });
  if (category) query = query.eq("category", category);
  const { data, error } = await query;
  const products = (data ?? []) as Product[];

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl">Produits</h1>
          <p className="mt-1 text-sm text-muted">{products.length} bijou(x)</p>
        </div>
        <Link href="/admin/produits/nouveau" className="btn btn-primary">
          + Ajouter un bijou
        </Link>
      </header>

      <nav aria-label="Filtrer par catégorie">
        <ul className="flex flex-wrap gap-2">
          <li>
            <Link href="/admin/produits" className="chip text-xs" aria-current={!category ? "true" : undefined}>
              Toutes
            </Link>
          </li>
          {CATEGORIES.map((c) => (
            <li key={c.value}>
              <Link
                href={`/admin/produits?categorie=${c.value}`}
                className="chip text-xs"
                aria-current={category === c.value ? "true" : undefined}
              >
                {c.label}
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
              <th className="px-4 py-3 font-medium">Bijou</th>
              <th className="px-4 py-3 font-medium">Catégorie</th>
              <th className="px-4 py-3 font-medium">Prix</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-cream">
                <td className="px-4 py-3">
                  <Link href={`/admin/produits/${p.id}`} className="flex items-center gap-3">
                    <span className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md bg-sand">
                      {p.images[0] ? (
                        <Image src={productImageUrl(p.images[0])} alt="" fill sizes="48px" className="object-cover" />
                      ) : (
                        <ProductArt category={p.category} material={p.material} slug={p.slug} className="w-3/4" />
                      )}
                    </span>
                    <span>
                      <span className="block font-medium hover:underline">{p.name}</span>
                      <span className="block text-xs text-muted">/{p.slug}</span>
                    </span>
                  </Link>
                </td>
                <td className="px-4 py-3">{categoryLabel(p.category)}</td>
                <td className="px-4 py-3">{formatPrice(p.price_cents)}</td>
                <td className={`px-4 py-3 ${p.stock === 0 ? "font-medium text-danger" : p.stock <= 2 ? "text-terracotta-deep" : ""}`}>
                  {p.stock}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs ${p.is_active ? "text-success" : "text-muted"}`}>
                    {p.is_active ? "En ligne" : "Masqué"}
                  </span>
                  {p.is_featured && <span className="ml-2 text-xs text-terracotta-deep">★ Favori</span>}
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-muted">
                  Aucun produit.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
