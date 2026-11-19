"use client";

import Link from "next/link";
import { site, shippingFor } from "@/config/site";
import { formatPrice } from "@/lib/format";
import { ArrowRightIcon, MinusIcon, PlusIcon } from "@/components/icons";
import { LineThumb } from "@/components/shop/line-thumb";
import { useVerifiedCart } from "@/components/shop/use-verified-cart";

export function CartView() {
  const { ready, verified, cart, notices, stockById, subtotalCents, setQuantity, removeFromCart } = useVerifiedCart();

  if (!ready) {
    return <p className="mt-10 text-muted">Chargement du panier…</p>;
  }

  if (cart.length === 0) {
    return (
      <div className="mt-10 rounded-(--radius-card) border border-line p-12 text-center">
        {notices.length > 0 && (
          <ul className="mb-6 space-y-1 text-sm text-terracotta-deep">
            {notices.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        )}
        <p className="font-serif text-2xl">Votre panier est vide.</p>
        <p className="mt-2 text-sm text-muted">Laissez-vous guider par nos pièces favorites.</p>
        <Link href="/collections" className="btn btn-primary mt-6">
          Découvrir les bijoux
        </Link>
      </div>
    );
  }

  const shipping = shippingFor(subtotalCents);
  const remaining = site.shipping.freeThresholdCents - subtotalCents;

  return (
    <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_22rem]">
      <section aria-label="Articles">
        {notices.length > 0 && (
          <ul role="status" className="mb-6 space-y-1 rounded-lg bg-sand p-4 text-sm">
            {notices.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        )}
        <ul className="divide-y divide-line border-y border-line">
          {cart.map((line) => {
            const max = Math.min(20, stockById[line.productId] ?? 20);
            return (
              <li key={line.productId} className="flex gap-4 py-5">
                <Link href={`/produits/${line.slug}`}>
                  <LineThumb line={line} size="size-24" />
                </Link>
                <div className="flex flex-1 flex-col justify-between gap-3 sm:flex-row">
                  <div>
                    <Link href={`/produits/${line.slug}`} className="font-serif text-lg hover:text-terracotta-deep">
                      {line.name}
                    </Link>
                    <p className="text-sm text-muted">{line.materialLabel}</p>
                    <p className="mt-1 text-sm">{formatPrice(line.priceCents)}</p>
                  </div>
                  <div className="flex items-center justify-between gap-6 sm:flex-col sm:items-end">
                    <div className="flex items-center rounded-lg border border-line" role="group" aria-label={`Quantité de ${line.name}`}>
                      <button
                        type="button"
                        className="flex size-9 items-center justify-center"
                        onClick={() => setQuantity(line.productId, line.quantity - 1)}
                        aria-label="Diminuer"
                      >
                        <MinusIcon size={14} />
                      </button>
                      <span className="w-7 text-center text-sm tabular-nums">{line.quantity}</span>
                      <button
                        type="button"
                        className="flex size-9 items-center justify-center disabled:opacity-40"
                        onClick={() => setQuantity(line.productId, line.quantity + 1)}
                        disabled={line.quantity >= max}
                        aria-label="Augmenter"
                      >
                        <PlusIcon size={14} />
                      </button>
                    </div>
                    <button type="button" onClick={() => removeFromCart(line.productId)} className="link-underline text-xs text-muted">
                      Retirer
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <aside className="h-fit rounded-(--radius-card) bg-sand p-6" aria-label="Récapitulatif">
        <h2 className="text-2xl">Récapitulatif</h2>
        <dl className="mt-5 space-y-3 text-sm">
          <div className="flex justify-between">
            <dt>Sous-total</dt>
            <dd>{formatPrice(subtotalCents)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Livraison</dt>
            <dd>{shipping === 0 ? "Offerte" : formatPrice(shipping)}</dd>
          </div>
          <div className="flex justify-between border-t border-ink/15 pt-3 text-base font-semibold">
            <dt>Total</dt>
            <dd>{formatPrice(subtotalCents + shipping)}</dd>
          </div>
        </dl>
        {remaining > 0 && (
          <p className="mt-4 text-xs text-muted">Plus que {formatPrice(remaining)} pour profiter de la livraison offerte.</p>
        )}
        <Link
          href="/commande"
          className={`btn btn-primary mt-6 w-full ${verified ? "" : "pointer-events-none opacity-60"}`}
          aria-disabled={!verified}
        >
          Passer commande <ArrowRightIcon size={16} />
        </Link>
        <Link href="/collections" className="link-underline mt-4 block text-center text-sm">
          Continuer mes achats
        </Link>
      </aside>
    </div>
  );
}
