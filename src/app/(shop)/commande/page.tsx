import type { Metadata } from "next";
import { CheckoutForm } from "./checkout-form";

export const metadata: Metadata = {
  title: "Finaliser ma commande",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <div className="container-page pt-10 pb-20">
      <h1 className="text-4xl sm:text-5xl">
        Finaliser ma <em>commande</em>
      </h1>
      <p className="mt-3 max-w-xl text-sm text-muted">
        Renseignez vos coordonnées de livraison. L&apos;atelier vérifie chaque commande et vous recontacte par e-mail pour
        la confirmer et organiser le règlement.
      </p>
      <CheckoutForm />
    </div>
  );
}
