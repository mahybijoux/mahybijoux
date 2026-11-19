import type { Metadata } from "next";
import { CartView } from "./cart-view";

export const metadata: Metadata = {
  title: "Votre panier",
  robots: { index: false, follow: false },
};

export default function CartPage() {
  return (
    <div className="container-page pt-10 pb-20">
      <h1 className="text-4xl sm:text-5xl">
        Votre <em>panier</em>
      </h1>
      <CartView />
    </div>
  );
}
