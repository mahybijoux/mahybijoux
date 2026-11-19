import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { ProductForm } from "../product-form";

export const metadata = { title: "Nouveau bijou" };

export default async function NewProductPage() {
  await requireAdmin();
  return (
    <div className="space-y-6">
      <Link href="/admin/produits" className="text-sm text-muted hover:text-ink">
        ← Produits
      </Link>
      <h1 className="text-3xl">Nouveau bijou</h1>
      <ProductForm />
    </div>
  );
}
