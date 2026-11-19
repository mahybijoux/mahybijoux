"use client";

import { useEffect, useRef, useState } from "react";
import { CheckIcon, HeartIcon } from "@/components/icons";
import { useShopStore, type FavoriteItem } from "./shop-store";

export function AddToCartButton({
  item,
  stock,
  className = "",
  quantity = 1,
}: {
  item: FavoriteItem;
  stock: number;
  className?: string;
  quantity?: number;
}) {
  const { addToCart, cart } = useShopStore();
  const [added, setAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const inCart = cart.find((l) => l.productId === item.productId)?.quantity ?? 0;
  const soldOut = stock <= 0;
  const maxReached = inCart + quantity > stock;

  return (
    <button
      type="button"
      className={`btn btn-primary w-full ${className}`}
      disabled={soldOut || maxReached}
      onClick={() => {
        addToCart(item, quantity);
        setAdded(true);
        clearTimeout(timer.current);
        timer.current = setTimeout(() => setAdded(false), 1800);
      }}
    >
      <span aria-live="polite" className="inline-flex items-center gap-2">
        {soldOut ? (
          "Épuisé"
        ) : added ? (
          <>
            <CheckIcon size={16} /> Ajouté au panier
          </>
        ) : maxReached ? (
          "Stock maximum atteint"
        ) : (
          "Ajouter au panier"
        )}
      </span>
    </button>
  );
}

export function FavoriteButton({ item, className = "" }: { item: FavoriteItem; className?: string }) {
  const { isFavorite, toggleFavorite, ready } = useShopStore();
  const active = ready && isFavorite(item.productId);
  return (
    <button
      type="button"
      onClick={() => toggleFavorite(item)}
      aria-pressed={active}
      aria-label={active ? `Retirer ${item.name} des favoris` : `Ajouter ${item.name} aux favoris`}
      className={`flex size-9 items-center justify-center rounded-full bg-cream/95 text-ink shadow-sm transition hover:scale-105 hover:text-terracotta ${className}`}
    >
      <HeartIcon size={16} filled={active} className={active ? "text-terracotta" : ""} />
    </button>
  );
}
