"use client";

import Link from "next/link";
import { useActionState } from "react";
import { shippingFor } from "@/config/site";
import { placeOrder, type CheckoutState } from "@/lib/actions/checkout";
import { formatPrice } from "@/lib/format";
import { LineThumb } from "@/components/shop/line-thumb";
import { useVerifiedCart } from "@/components/shop/use-verified-cart";

const COUNTRIES = [
  { code: "MA", label: "Maroc" },
  { code: "FR", label: "France" },
  { code: "BE", label: "Belgique" },
  { code: "LU", label: "Luxembourg" },
  { code: "CH", label: "Suisse" },
  { code: "MC", label: "Monaco" },
];

function Field({
  name,
  label,
  error,
  className = "",
  values,
  ...input
}: React.InputHTMLAttributes<HTMLInputElement> & {
  name: string;
  label: string;
  error?: string;
  values?: Record<string, string>;
}) {
  const id = `checkout-${name}`;
  return (
    <div className={className}>
      <label htmlFor={id} className="field-label">
        {label}
        {input.required ? "" : <span className="font-normal text-muted"> (facultatif)</span>}
      </label>
      <input
        id={id}
        name={name}
        className="field"
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        defaultValue={values?.[name]}
        {...input}
      />
      {error && (
        <p id={`${id}-error`} className="field-error">
          {error}
        </p>
      )}
    </div>
  );
}

export function CheckoutForm() {
  const { ready, verified, cart, notices, subtotalCents } = useVerifiedCart();
  const [state, action, pending] = useActionState<CheckoutState, FormData>(placeOrder, { status: "idle" });
  const errors = state.fieldErrors ?? {};
  const v = state.values ?? {};

  if (!ready || !verified) return <p className="mt-10 text-muted">Vérification de votre panier…</p>;

  if (cart.length === 0) {
    return (
      <div className="mt-10 rounded-(--radius-card) border border-line p-12 text-center">
        <p className="font-serif text-2xl">Votre panier est vide.</p>
        <Link href="/collections" className="btn btn-primary mt-6">
          Découvrir les bijoux
        </Link>
      </div>
    );
  }

  const shipping = shippingFor(subtotalCents);
  const payload = JSON.stringify(cart.map((l) => ({ product_id: l.productId, quantity: l.quantity })));

  return (
    <form action={action} className="mt-10 grid gap-10 lg:grid-cols-[1fr_24rem]" noValidate>
      <input type="hidden" name="cart" value={payload} />
      <div className="hidden" aria-hidden="true">
        <label>
          Site web
          <input type="text" name="company_website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="space-y-10">
        {(state.status === "error" || notices.length > 0) && (
          <div role="alert" className="rounded-lg border border-danger/30 bg-danger/5 p-4 text-sm">
            {state.message && <p className="font-medium text-danger">{state.message}</p>}
            {notices.map((n) => (
              <p key={n}>{n}</p>
            ))}
          </div>
        )}

        <fieldset className="grid gap-5 sm:grid-cols-2">
          <legend className="mb-5 font-serif text-2xl">Coordonnées</legend>
          <Field values={v} name="first_name" label="Prénom" autoComplete="given-name" required maxLength={80} error={errors.first_name} />
          <Field values={v} name="last_name" label="Nom" autoComplete="family-name" required maxLength={80} error={errors.last_name} />
          <Field values={v} name="email" label="E-mail" type="email" autoComplete="email" required maxLength={254} error={errors.email} />
          <Field values={v} name="phone" label="Téléphone" type="tel" autoComplete="tel" maxLength={30} error={errors.phone} />
        </fieldset>

        <fieldset className="grid gap-5 sm:grid-cols-2">
          <legend className="mb-5 font-serif text-2xl">Adresse de livraison</legend>
          <Field
            values={v}
            name="address_line1"
            label="Adresse"
            autoComplete="address-line1"
            required
            maxLength={160}
            error={errors.address_line1}
            className="sm:col-span-2"
          />
          <Field
            values={v}
            name="address_line2"
            label="Complément d'adresse"
            autoComplete="address-line2"
            maxLength={160}
            error={errors.address_line2}
            className="sm:col-span-2"
          />
          <Field values={v} name="postal_code" label="Code postal" autoComplete="postal-code" required maxLength={12} error={errors.postal_code} />
          <Field values={v} name="city" label="Ville" autoComplete="address-level2" required maxLength={100} error={errors.city} />
          <div className="sm:col-span-2">
            <label htmlFor="checkout-country" className="field-label">
              Pays
            </label>
            <select
              id="checkout-country"
              name="country"
              className="field"
              key={v.country ?? "MA"}
              defaultValue={v.country || "MA"}
              autoComplete="country"
            >
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label}
                </option>
              ))}
            </select>
            {errors.country && <p className="field-error">{errors.country}</p>}
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="checkout-note" className="field-label">
              Message pour l&apos;atelier <span className="font-normal text-muted">(facultatif : taille, gravure, emballage cadeau…)</span>
            </label>
            <textarea id="checkout-note" name="note" rows={3} maxLength={1000} className="field" defaultValue={v.note} />
          </div>
        </fieldset>
      </div>

      <aside className="h-fit rounded-(--radius-card) bg-sand p-6 lg:sticky lg:top-40" aria-label="Récapitulatif de commande">
        <h2 className="text-2xl">Votre commande</h2>
        <ul className="mt-5 space-y-4">
          {cart.map((l) => (
            <li key={l.productId} className="flex items-center gap-3 text-sm">
              <LineThumb line={l} size="size-14" />
              <div className="flex-1">
                <p className="font-medium">{l.name}</p>
                <p className="text-xs text-muted">Quantité : {l.quantity}</p>
              </div>
              <p>{formatPrice(l.priceCents * l.quantity)}</p>
            </li>
          ))}
        </ul>
        <dl className="mt-6 space-y-2 border-t border-ink/15 pt-4 text-sm">
          <div className="flex justify-between">
            <dt>Sous-total</dt>
            <dd>{formatPrice(subtotalCents)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Livraison</dt>
            <dd>{shipping === 0 ? "Offerte" : formatPrice(shipping)}</dd>
          </div>
          <div className="flex justify-between pt-2 text-base font-semibold">
            <dt>Total TTC</dt>
            <dd>{formatPrice(subtotalCents + shipping)}</dd>
          </div>
        </dl>

        <label className="mt-6 flex items-start gap-3 text-xs leading-relaxed">
          <input
            type="checkbox"
            name="accept_terms"
            required
            defaultChecked={v.accept_terms === "on"}
            className="mt-0.5 size-4 accent-ink"
          />
          <span>
            J&apos;accepte les{" "}
            <Link href="/cgv" target="_blank" className="link-underline">
              conditions générales de vente
            </Link>{" "}
            et la{" "}
            <Link href="/confidentialite" target="_blank" className="link-underline">
              politique de confidentialité
            </Link>
            .
          </span>
        </label>
        {errors.accept_terms && <p className="field-error">{errors.accept_terms}</p>}

        <button type="submit" className="btn btn-primary mt-6 w-full py-3.5" disabled={pending}>
          {pending ? "Envoi de la commande…" : "Envoyer ma commande"}
        </button>
        <p className="mt-3 text-center text-xs text-muted">Le montant final est confirmé par l&apos;atelier.</p>
      </aside>
    </form>
  );
}
