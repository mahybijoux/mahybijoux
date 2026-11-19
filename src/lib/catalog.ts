import "server-only";
import { createPublicClient } from "@/lib/supabase/public";
import type { Category, Material, Product } from "@/lib/types";

const PRODUCT_COLUMNS =
  "id, slug, name, category, material, material_label, description, details, price_cents, images, stock, is_active, is_featured, is_unique_piece, badge, created_at, updated_at";

export type CatalogSort = "nouveautes" | "prix-croissant" | "prix-decroissant";

export type CatalogFilters = {
  category?: Category;
  material?: Material;
  uniqueOnly?: boolean;
  search?: string;
  sort?: CatalogSort;
};

function escapeLike(value: string) {
  return value.replace(/[\\%_]/g, (m) => `\\${m}`);
}

/**
 * Public catalog reads. RLS guarantees only active products are visible to `anon`;
 * the explicit is_active filter keeps the intent obvious.
 * Errors are logged and degrade to empty results so a transient outage never
 * breaks static generation of the whole site.
 */
export async function listProducts(filters: CatalogFilters = {}): Promise<Product[]> {
  try {
    let query = createPublicClient().from("products").select(PRODUCT_COLUMNS).eq("is_active", true);

    if (filters.category) query = query.eq("category", filters.category);
    if (filters.material) query = query.eq("material", filters.material);
    if (filters.uniqueOnly) query = query.eq("is_unique_piece", true);
    if (filters.search) query = query.ilike("name", `%${escapeLike(filters.search)}%`);

    switch (filters.sort) {
      case "prix-croissant":
        query = query.order("price_cents", { ascending: true });
        break;
      case "prix-decroissant":
        query = query.order("price_cents", { ascending: false });
        break;
      default:
        query = query.order("created_at", { ascending: false });
    }

    const { data, error } = await query.limit(200);
    if (error) throw error;
    return (data ?? []) as Product[];
  } catch (error) {
    console.error("[catalog] listProducts failed", error);
    return [];
  }
}

export async function listFeaturedProducts(limit = 6): Promise<Product[]> {
  try {
    const { data, error } = await createPublicClient()
      .from("products")
      .select(PRODUCT_COLUMNS)
      .eq("is_active", true)
      .eq("is_featured", true)
      .order("created_at", { ascending: true })
      .limit(limit);
    if (error) throw error;
    return (data ?? []) as Product[];
  } catch (error) {
    console.error("[catalog] listFeaturedProducts failed", error);
    return [];
  }
}

export async function countActiveProducts(): Promise<number> {
  try {
    const { count, error } = await createPublicClient()
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true);
    if (error) throw error;
    return count ?? 0;
  } catch (error) {
    console.error("[catalog] countActiveProducts failed", error);
    return 0;
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (!/^[a-z0-9-]{1,120}$/.test(slug)) return null;
  try {
    const { data, error } = await createPublicClient()
      .from("products")
      .select(PRODUCT_COLUMNS)
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle();
    if (error) throw error;
    return (data as Product | null) ?? null;
  } catch (error) {
    console.error("[catalog] getProductBySlug failed", error);
    return null;
  }
}

export async function listRelatedProducts(product: Product, limit = 3): Promise<Product[]> {
  try {
    const { data, error } = await createPublicClient()
      .from("products")
      .select(PRODUCT_COLUMNS)
      .eq("is_active", true)
      .eq("category", product.category)
      .neq("id", product.id)
      .limit(limit);
    if (error) throw error;
    return (data ?? []) as Product[];
  } catch (error) {
    console.error("[catalog] listRelatedProducts failed", error);
    return [];
  }
}

/** Current price/stock for cart lines, used to refresh a cart stored in the browser. */
export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  const uuid = /^[0-9a-f-]{36}$/i;
  const valid = ids.filter((id) => uuid.test(id)).slice(0, 50);
  if (valid.length === 0) return [];
  const { data, error } = await createPublicClient()
    .from("products")
    .select(PRODUCT_COLUMNS)
    .eq("is_active", true)
    .in("id", valid);
  if (error) throw error;
  return (data ?? []) as Product[];
}

export async function listSitemapProducts(): Promise<Pick<Product, "slug" | "updated_at">[]> {
  try {
    const { data, error } = await createPublicClient()
      .from("products")
      .select("slug, updated_at")
      .eq("is_active", true);
    if (error) throw error;
    return data ?? [];
  } catch (error) {
    console.error("[catalog] listSitemapProducts failed", error);
    return [];
  }
}
