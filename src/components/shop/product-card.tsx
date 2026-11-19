import Link from "next/link";
import { formatPrice } from "@/lib/format";
import { BADGES, type Product } from "@/lib/types";
import { AddToCartButton, FavoriteButton } from "./cart-buttons";
import { MaterialSwatch } from "./material-swatch";
import { ProductVisual } from "./product-visual";
import type { FavoriteItem } from "./shop-store";

export function toStoreItem(p: Product): FavoriteItem {
  return {
    productId: p.id,
    slug: p.slug,
    name: p.name,
    materialLabel: p.material_label,
    priceCents: p.price_cents,
    image: p.images[0] ?? null,
    category: p.category,
  };
}

export function ProductCard({ product, priority }: { product: Product; priority?: boolean }) {
  const href = `/produits/${product.slug}`;
  const badge = BADGES.find((b) => b.value === product.badge);
  const item = toStoreItem(product);

  return (
    <article className="group flex flex-col">
      <div className="relative aspect-[9/8] overflow-hidden rounded-(--radius-card) bg-sand">
        <Link href={href} className="absolute inset-0" aria-label={product.name} tabIndex={-1}>
          <ProductVisual
            name={product.name}
            image={product.images[0]}
            category={product.category}
            material={product.material}
            slug={product.slug}
            sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
            priority={priority}
            artClassName="w-[38%] transition-transform duration-700 group-hover:scale-105"
          />
        </Link>
        {badge && (
          <span className="absolute top-3 left-3 rounded-md bg-terracotta px-2 py-1 text-[0.6875rem] font-semibold text-ink">
            {badge.label}
          </span>
        )}
        {product.is_unique_piece && !badge && (
          <span className="absolute top-3 left-3 rounded-md bg-ink px-2 py-1 text-[0.6875rem] font-semibold text-cream">
            Pièce unique
          </span>
        )}
        <FavoriteButton item={item} className="absolute top-3 right-3" />
      </div>

      <div className="mt-4 flex flex-1 flex-col">
        <h3 className="text-lg leading-snug">
          <Link href={href} className="hover:text-terracotta-deep">
            {product.name}
          </Link>
        </h3>
        <p className="mt-1 text-sm text-muted">{product.material_label}</p>
        <div className="mt-2 flex items-center gap-2 text-xs text-muted">
          <MaterialSwatch material={product.material} />
          {product.stock > 0 && product.stock <= 2 ? (
            <span className="text-terracotta-deep">Plus que {product.stock} en stock</span>
          ) : product.stock === 0 ? (
            <span>Épuisé</span>
          ) : (
            <span>En stock</span>
          )}
        </div>
        <p className="mt-3 font-semibold">{formatPrice(product.price_cents)}</p>
        <div className="mt-4">
          <AddToCartButton item={item} stock={product.stock} />
        </div>
      </div>
    </article>
  );
}
