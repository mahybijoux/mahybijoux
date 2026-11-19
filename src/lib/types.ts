export const CATEGORIES = [
  { value: "bagues", label: "Bagues", singular: "Bague" },
  { value: "colliers", label: "Colliers", singular: "Collier" },
  { value: "boucles-oreilles", label: "Boucles d'oreilles", singular: "Boucles d'oreilles" },
  { value: "bracelets", label: "Bracelets", singular: "Bracelet" },
] as const;

export const MATERIALS = [
  { value: "or-18k", label: "Or 18 carats" },
  { value: "argent-925", label: "Argent 925" },
  { value: "vermeil", label: "Vermeil" },
  { value: "perles", label: "Perles" },
  { value: "pierres-naturelles", label: "Pierres naturelles" },
] as const;

/** Extra "material" chip from the design that maps to the is_unique_piece flag. */
export const UNIQUE_PIECES_FILTER = { value: "pieces-uniques", label: "Pièces uniques" } as const;

export const ORDER_STATUSES = [
  { value: "pending", label: "En attente" },
  { value: "confirmed", label: "Confirmée" },
  { value: "preparing", label: "En préparation" },
  { value: "shipped", label: "Expédiée" },
  { value: "delivered", label: "Livrée" },
  { value: "cancelled", label: "Annulée" },
] as const;

export const BADGES = [
  { value: "nouveau", label: "Nouveau" },
  { value: "best-seller", label: "Best-seller" },
] as const;

export type Category = (typeof CATEGORIES)[number]["value"];
export type Material = (typeof MATERIALS)[number]["value"];
export type OrderStatus = (typeof ORDER_STATUSES)[number]["value"];
export type Badge = (typeof BADGES)[number]["value"];

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: Category;
  material: Material;
  material_label: string;
  description: string;
  details: string[];
  price_cents: number;
  images: string[];
  stock: number;
  is_active: boolean;
  is_featured: boolean;
  is_unique_piece: boolean;
  badge: Badge | null;
  created_at: string;
  updated_at: string;
};

export type Order = {
  id: string;
  reference: string;
  status: OrderStatus;
  customer_first_name: string;
  customer_last_name: string;
  email: string;
  phone: string | null;
  address_line1: string;
  address_line2: string | null;
  postal_code: string;
  city: string;
  country: string;
  customer_note: string | null;
  admin_note: string | null;
  subtotal_cents: number;
  shipping_cents: number;
  total_cents: number;
  created_at: string;
  updated_at: string;
};

export type OrderItem = {
  id: number;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_slug: string | null;
  unit_price_cents: number;
  quantity: number;
  line_total_cents: number;
};

export type OrderEvent = {
  id: number;
  order_id: string;
  status: OrderStatus;
  created_at: string;
};

export function categoryLabel(value: string) {
  return CATEGORIES.find((c) => c.value === value)?.label ?? value;
}
export function materialLabel(value: string) {
  return MATERIALS.find((m) => m.value === value)?.label ?? value;
}
export function statusLabel(value: string) {
  return ORDER_STATUSES.find((s) => s.value === value)?.label ?? value;
}
export function isCategory(value: string): value is Category {
  return CATEGORIES.some((c) => c.value === value);
}
export function isMaterial(value: string): value is Material {
  return MATERIALS.some((m) => m.value === value);
}
export function isOrderStatus(value: string): value is OrderStatus {
  return ORDER_STATUSES.some((s) => s.value === value);
}
