"use client";

import Link from "next/link";
import { useState } from "react";
import { MinusIcon, PlusIcon } from "@/components/icons";
import { AddToCartButton } from "./cart-buttons";
import { useShopStore, type FavoriteItem } from "./shop-store";

export function ProductPurchase({ item, stock }: { item: FavoriteItem; stock: number }) {
  const [qty, setQty] = useState(1);
  const { cart } = useShopStore();
  const inCart = cart.find((l) => l.productId === item.productId)?.quantity ?? 0;
  const max = Math.max(1, Math.min(20, stock - inCart));

  return (
    <div className="mt-8">
      <p className="text-sm">
        {stock <= 0 ? (
          <span className="text-danger">Épuisé pour le moment</span>
        ) : stock <= 2 ? (
          <span className="text-terracotta-deep">Plus que {stock} disponible{stock > 1 ? "s" : ""}</span>
        ) : (
          <span className="text-success">En stock</span>
        )}
      </p>
      <div className="mt-4 flex gap-3">
        {stock > 1 && (
          <div className="flex items-center rounded-lg border border-line" role="group" aria-label="Quantité">
            <button
              type="button"
              className="flex size-11 items-center justify-center disabled:opacity-40"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              disabled={qty <= 1}
              aria-label="Diminuer la quantité"
            >
              <MinusIcon size={16} />
            </button>
            <span className="w-8 text-center text-sm tabular-nums" aria-live="polite">
              {qty}
            </span>
            <button
              type="button"
              className="flex size-11 items-center justify-center disabled:opacity-40"
              onClick={() => setQty((q) => Math.min(max, q + 1))}
              disabled={qty >= max}
              aria-label="Augmenter la quantité"
            >
              <PlusIcon size={16} />
            </button>
          </div>
        )}
        <AddToCartButton item={item} stock={stock} quantity={qty} className="flex-1 py-3.5" />
      </div>
      {inCart > 0 && (
        <p className="mt-3 text-sm">
          {inCart} dans votre panier ·{" "}
          <Link href="/panier" className="link-underline">
            Voir le panier
          </Link>
        </p>
      )}
    </div>
  );
}
