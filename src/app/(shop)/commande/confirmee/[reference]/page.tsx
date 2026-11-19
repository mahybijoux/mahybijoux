import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { site } from "@/config/site";
import { CheckIcon } from "@/components/icons";
import { ClearCart } from "./clear-cart";

export const metadata: Metadata = {
  title: "Commande envoyée",
  robots: { index: false, follow: false },
};

/**
 * Shows only the reference from the URL. Order details are never readable
 * by the public (RLS), so nothing about the customer can leak from this page.
 */
export default async function ConfirmationPage({ params }: { params: Promise<{ reference: string }> }) {
  const { reference } = await params;
  const ref = decodeURIComponent(reference);
  if (!/^MB-\d{6}-[A-F0-9]{6}$/.test(ref)) notFound();

  return (
    <div className="container-page flex flex-col items-center py-20 text-center">
      <ClearCart />
      <span className="flex size-14 items-center justify-center rounded-full bg-sage text-ink">
        <CheckIcon size={26} />
      </span>
      <h1 className="mt-6 text-4xl sm:text-5xl">
        Merci, votre commande est <em>enregistrée</em>
      </h1>
      <p className="mt-6 text-sm text-muted">Votre numéro de commande</p>
      <p className="mt-2 rounded-lg border border-line bg-sand px-6 py-3 font-mono text-xl tracking-wider" aria-live="polite">
        {ref}
      </p>
      <p className="mt-6 max-w-lg leading-relaxed text-ink-soft">
        Conservez ce numéro. L&apos;atelier vérifie votre commande et vous écrit à l&apos;adresse indiquée pour la confirmer
        et organiser le règlement. Pour toute question : <a href={`mailto:${site.email}?subject=Commande%20${ref}`} className="link-underline">{site.email}</a>.
      </p>
      <Link href="/collections" className="btn btn-primary mt-10">
        Continuer la découverte
      </Link>
    </div>
  );
}
