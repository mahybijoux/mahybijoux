import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import type { Product } from "@/lib/types";
import { ProductForm } from "../product-form";

export const metadata = { title: "Modifier un bijou" };

export default async function EditProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ enregistre?: string; erreur?: string }>;
}) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { supabase } = await requireAdmin();
  const sp = await searchParams;

  const { data } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  const product = data as Product;

  return (
    <div className="space-y-6">
      <Link href="/admin/produits" className="text-sm text-muted hover:text-ink">
        ← Produits
      </Link>
      <h1 className="text-3xl">{product.name}</h1>
      {sp.enregistre && <p className="rounded-lg bg-success/10 p-3 text-sm text-success">Bijou enregistré.</p>}
      {sp.erreur === "suppression" && (
        <p className="rounded-lg bg-danger/10 p-3 text-sm text-danger">La suppression a échoué. Réessayez.</p>
      )}
      {/* key: remount the form with fresh values after each save */}
      <ProductForm key={product.updated_at} product={product} />
    </div>
  );
}
