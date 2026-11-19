import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { site } from "@/config/site";
import { getProductBySlug, listRelatedProducts } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import { productImageUrl } from "@/lib/storage";
import { BADGES, categoryLabel, materialLabel } from "@/lib/types";
import { JsonLd } from "@/components/json-ld";
import { LockIcon, ReturnIcon, TruckIcon } from "@/components/icons";
import { Breadcrumbs } from "@/components/shop/breadcrumbs";
import { FavoriteButton } from "@/components/shop/cart-buttons";
import { MaterialSwatch } from "@/components/shop/material-swatch";
import { ProductCard, toStoreItem } from "@/components/shop/product-card";
import { ProductGallery } from "@/components/shop/product-gallery";
import { ProductPurchase } from "@/components/shop/product-purchase";

export const revalidate = 300;

// Pages are generated on first visit, then cached and refreshed on admin edits.
export function generateStaticParams() {
  return [];
}

const getProduct = cache(getProductBySlug);

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Bijou introuvable", robots: { index: false } };

  const description = (product.description || `${product.name} — ${product.material_label}`).slice(0, 158);
  const image = product.images[0] ? productImageUrl(product.images[0]) : undefined;
  return {
    title: `${product.name} · ${product.material_label || materialLabel(product.material)}`,
    description,
    alternates: { canonical: `/produits/${product.slug}` },
    openGraph: {
      type: "website",
      title: product.name,
      description,
      url: `/produits/${product.slug}`,
      images: image ? [{ url: image, alt: product.name }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const related = await listRelatedProducts(product, 3);
  const badge = BADGES.find((b) => b.value === product.badge);
  const url = `${site.url}/produits/${product.slug}`;

  return (
    <div className="container-page pt-8 pb-20">
      <Breadcrumbs
        items={[
          { href: "/", label: "Accueil" },
          { href: `/collections/${product.category}`, label: categoryLabel(product.category) },
          { href: `/produits/${product.slug}`, label: product.name },
        ]}
      />

      <div className="mt-6 grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
        <ProductGallery
          name={product.name}
          images={product.images}
          category={product.category}
          material={product.material}
          slug={product.slug}
        />

        <div className="lg:sticky lg:top-40 lg:self-start">
          <div className="flex items-center gap-2">
            {badge && (
              <span className="rounded-md bg-terracotta px-2 py-1 text-[0.6875rem] font-semibold">{badge.label}</span>
            )}
            {product.is_unique_piece && (
              <span className="rounded-md bg-ink px-2 py-1 text-[0.6875rem] font-semibold text-cream">Pièce unique</span>
            )}
          </div>
          <div className="mt-3 flex items-start justify-between gap-4">
            <h1 className="text-4xl leading-tight sm:text-5xl">{product.name}</h1>
            <FavoriteButton item={toStoreItem(product)} className="mt-2 shrink-0 border border-line" />
          </div>
          <p className="mt-3 flex items-center gap-2 text-muted">
            <MaterialSwatch material={product.material} /> {product.material_label || materialLabel(product.material)}
          </p>
          <p className="mt-6 text-2xl font-semibold">{formatPrice(product.price_cents)}</p>
          <p className="mt-1 text-xs text-muted">TVA incluse · livraison calculée au panier</p>

          <ProductPurchase item={toStoreItem(product)} stock={product.stock} />

          <ul className="mt-8 space-y-3 border-y border-line py-6 text-sm">
            <li className="flex items-center gap-3">
              <TruckIcon size={18} /> Livraison offerte dès {formatPrice(site.shipping.freeThresholdCents)}
            </li>
            <li className="flex items-center gap-3">
              <ReturnIcon size={18} /> Retours gratuits sous {site.returnDays} jours
            </li>
            <li className="flex items-center gap-3">
              <LockIcon size={18} /> Commande sécurisée, confirmée par l&apos;atelier
            </li>
          </ul>

          {product.description && (
            <section className="mt-8">
              <h2 className="text-xl">Description</h2>
              <p className="mt-3 leading-relaxed whitespace-pre-line text-ink-soft">{product.description}</p>
            </section>
          )}

          {product.details.length > 0 && (
            <section className="mt-8">
              <h2 className="text-xl">Caractéristiques</h2>
              <ul className="mt-3 space-y-2 text-sm text-ink-soft">
                {product.details.map((d) => (
                  <li key={d} className="flex gap-2">
                    <span aria-hidden="true" className="text-terracotta">
                      —
                    </span>
                    {d}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-24" aria-labelledby="related-title">
          <h2 id="related-title" className="text-3xl">
            Vous aimerez <em>aussi</em>
          </h2>
          <div className="mt-8 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.name,
          description: product.description || undefined,
          sku: product.slug,
          category: categoryLabel(product.category),
          material: materialLabel(product.material),
          image: product.images.length
            ? product.images.map((p) => {
                const u = productImageUrl(p);
                return u.startsWith("/") ? `${site.url}${u}` : u;
              })
            : undefined,
          brand: { "@type": "Brand", name: site.name },
          url,
          offers: {
            "@type": "Offer",
            url,
            priceCurrency: site.currency,
            price: (product.price_cents / 100).toFixed(2),
            availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            itemCondition: "https://schema.org/NewCondition",
            seller: { "@type": "Organization", name: site.name },
          },
        }}
      />
    </div>
  );
}
