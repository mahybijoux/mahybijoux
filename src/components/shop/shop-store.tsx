"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

/**
 * Cart + favorites, persisted in localStorage. Prices stored here are display
 * snapshots only — the database recomputes every price at order time.
 */
export type CartLine = {
  productId: string;
  slug: string;
  name: string;
  materialLabel: string;
  priceCents: number;
  image: string | null;
  category: string;
  quantity: number;
};

export type FavoriteItem = Omit<CartLine, "quantity">;

type ShopStore = {
  ready: boolean;
  cart: CartLine[];
  favorites: FavoriteItem[];
  cartCount: number;
  subtotalCents: number;
  addToCart: (item: FavoriteItem, quantity?: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  replaceCart: (lines: CartLine[]) => void;
  clearCart: () => void;
  toggleFavorite: (item: FavoriteItem) => void;
  isFavorite: (productId: string) => boolean;
};

const MAX_QTY = 20;
const CART_KEY = "mahy.cart.v1";
const FAV_KEY = "mahy.favorites.v1";

const StoreContext = createContext<ShopStore | null>(null);

function read<T>(key: string): T[] {
  try {
    const raw = window.localStorage.getItem(key);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function write(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable (private mode) — keep in memory only */
  }
}

function isValidLine(l: CartLine) {
  return (
    typeof l?.productId === "string" &&
    typeof l.name === "string" &&
    Number.isInteger(l.priceCents) &&
    Number.isInteger(l.quantity) &&
    l.quantity > 0
  );
}

export function ShopStoreProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  useEffect(() => {
    setCart(read<CartLine>(CART_KEY).filter(isValidLine));
    setFavorites(read<FavoriteItem>(FAV_KEY).filter((f) => typeof f?.productId === "string"));
    setReady(true);

    const onStorage = (e: StorageEvent) => {
      if (e.key === CART_KEY) setCart(read<CartLine>(CART_KEY).filter(isValidLine));
      if (e.key === FAV_KEY) setFavorites(read<FavoriteItem>(FAV_KEY));
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    if (ready) write(CART_KEY, cart);
  }, [cart, ready]);

  useEffect(() => {
    if (ready) write(FAV_KEY, favorites);
  }, [favorites, ready]);

  const addToCart = useCallback((item: FavoriteItem, quantity = 1) => {
    setCart((lines) => {
      const existing = lines.find((l) => l.productId === item.productId);
      if (existing) {
        return lines.map((l) =>
          l.productId === item.productId
            ? { ...l, ...item, quantity: Math.min(MAX_QTY, l.quantity + quantity) }
            : l,
        );
      }
      return [...lines, { ...item, quantity: Math.min(MAX_QTY, quantity) }];
    });
  }, []);

  const setQuantity = useCallback((productId: string, quantity: number) => {
    setCart((lines) =>
      quantity <= 0
        ? lines.filter((l) => l.productId !== productId)
        : lines.map((l) =>
            l.productId === productId ? { ...l, quantity: Math.min(MAX_QTY, Math.floor(quantity)) } : l,
          ),
    );
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart((lines) => lines.filter((l) => l.productId !== productId));
  }, []);

  const toggleFavorite = useCallback((item: FavoriteItem) => {
    setFavorites((favs) =>
      favs.some((f) => f.productId === item.productId)
        ? favs.filter((f) => f.productId !== item.productId)
        : [...favs, item],
    );
  }, []);

  const value = useMemo<ShopStore>(
    () => ({
      ready,
      cart,
      favorites,
      cartCount: cart.reduce((n, l) => n + l.quantity, 0),
      subtotalCents: cart.reduce((n, l) => n + l.priceCents * l.quantity, 0),
      addToCart,
      setQuantity,
      removeFromCart,
      replaceCart: setCart,
      clearCart: () => setCart([]),
      toggleFavorite,
      isFavorite: (id) => favorites.some((f) => f.productId === id),
    }),
    [ready, cart, favorites, addToCart, setQuantity, removeFromCart, toggleFavorite],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useShopStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useShopStore must be used inside <ShopStoreProvider>");
  return ctx;
}
