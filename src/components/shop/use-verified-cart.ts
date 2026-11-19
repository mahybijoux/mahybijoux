"use client";

import { useEffect, useRef, useState } from "react";
import { refreshCartProducts } from "@/lib/actions/checkout";
import { useShopStore, type CartLine } from "./shop-store";

/**
 * Re-syncs the browser cart with live catalog data once per mount:
 * updates prices, removes unavailable pieces and clamps quantities to stock.
 */
export function useVerifiedCart() {
  const store = useShopStore();
  const [verified, setVerified] = useState(false);
  const [notices, setNotices] = useState<string[]>([]);
  const [stockById, setStockById] = useState<Record<string, number>>({});
  const done = useRef(false);

  useEffect(() => {
    if (!store.ready || done.current) return;
    done.current = true;

    const lines = store.cart;
    if (lines.length === 0) {
      setVerified(true);
      return;
    }

    refreshCartProducts(lines.map((l) => l.productId)).then((fresh) => {
      if (!fresh) {
        setVerified(true);
        return;
      }
      const byId = new Map(fresh.map((p) => [p.id, p]));
      const messages: string[] = [];
      const next: CartLine[] = [];

      for (const line of lines) {
        const p = byId.get(line.productId);
        if (!p || p.stock <= 0) {
          messages.push(`« ${line.name} » n'est plus disponible et a été retiré de votre panier.`);
          continue;
        }
        let quantity = line.quantity;
        if (quantity > p.stock) {
          quantity = p.stock;
          messages.push(`Quantité de « ${p.name} » ajustée au stock disponible (${p.stock}).`);
        }
        if (p.price_cents !== line.priceCents) {
          messages.push(`Le prix de « ${p.name} » a été mis à jour.`);
        }
        next.push({
          productId: p.id,
          slug: p.slug,
          name: p.name,
          materialLabel: p.material_label,
          priceCents: p.price_cents,
          image: p.image,
          category: p.category,
          quantity,
        });
      }

      setStockById(Object.fromEntries(fresh.map((p) => [p.id, p.stock])));
      store.replaceCart(next);
      setNotices(messages);
      setVerified(true);
    });
  }, [store.ready, store.cart, store.replaceCart]);

  return { ...store, verified, notices, stockById };
}
