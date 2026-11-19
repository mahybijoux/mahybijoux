"use client";

import Link from "next/link";
import { BagIcon, HeartIcon } from "@/components/icons";
import { useShopStore } from "./shop-store";

export function HeaderActions({ compact = false }: { compact?: boolean }) {
  const { cartCount, favorites, ready } = useShopStore();
  const count = ready ? cartCount : 0;
  const favCount = ready ? favorites.length : 0;

  const item = "flex flex-col items-center gap-1 text-[0.6875rem] transition-colors hover:text-terracotta-deep";

  return (
    <div className={`flex items-center ${compact ? "gap-3" : "gap-6"}`}>
      <Link href="/favoris" className={item} aria-label={`Favoris (${favCount})`}>
        <HeartIcon size={compact ? 20 : 18} />
        {!compact && <span>Favoris{favCount > 0 ? ` (${favCount})` : ""}</span>}
      </Link>
      <Link href="/panier" className={`${item} relative`} aria-label={`Panier (${count} article${count > 1 ? "s" : ""})`}>
        <BagIcon size={compact ? 20 : 18} />
        {compact ? (
          count > 0 && (
            <span className="absolute -top-1.5 -right-2 flex size-4 items-center justify-center rounded-full bg-terracotta text-[0.625rem] font-semibold text-ink">
              {count}
            </span>
          )
        ) : (
          <span>Panier ({count})</span>
        )}
      </Link>
    </div>
  );
}
