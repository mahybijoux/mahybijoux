"use client";

import { useEffect } from "react";
import { useShopStore } from "@/components/shop/shop-store";

export function ClearCart() {
  const { ready, clearCart } = useShopStore();
  useEffect(() => {
    if (ready) clearCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);
  return null;
}
