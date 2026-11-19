"use client";

import Link from "next/link";
import { formatPrice } from "@/lib/format";
import { HeartIcon } from "@/components/icons";
import { LineThumb } from "@/components/shop/line-thumb";
import { useShopStore } from "@/components/shop/shop-store";

export function FavoritesView() {
  const { ready, favorites, toggleFavorite } = useShopStore();

  if (!ready) return <p className="mt-10 text-muted">Chargement…</p>;

  if (favorites.length === 0) {
    return (
      <div className="mt-10 rounded-(--radius-card) border border-line p-12 text-center">
        <HeartIcon size={28} className="mx-auto text-terracotta" />
        <p className="mt-4 font-serif text-2xl">Aucun favori pour l&apos;instant.</p>
        <p className="mt-2 text-sm text-muted">Touchez le cœur d&apos;un bijou pour le retrouver ici.</p>
        <Link href="/collections" className="btn btn-primary mt-6">
          Parcourir les bijoux
        </Link>
      </div>
    );
  }

  return (
    <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {favorites.map((f) => (
        <li key={f.productId} className="flex items-center gap-4 rounded-(--radius-card) border border-line p-3">
          <Link href={`/produits/${f.slug}`}>
            <LineThumb line={f} size="size-24" />
          </Link>
          <div className="flex-1">
            <Link href={`/produits/${f.slug}`} className="font-serif text-lg hover:text-terracotta-deep">
              {f.name}
            </Link>
            <p className="text-xs text-muted">{f.materialLabel}</p>
            <p className="mt-1 text-sm">{formatPrice(f.priceCents)}</p>
            <button type="button" onClick={() => toggleFavorite(f)} className="link-underline mt-2 text-xs text-muted">
              Retirer
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
