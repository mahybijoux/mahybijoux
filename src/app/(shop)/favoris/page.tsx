import type { Metadata } from "next";
import { FavoritesView } from "./favorites-view";

export const metadata: Metadata = {
  title: "Mes favoris",
  robots: { index: false, follow: true },
};

export default function FavoritesPage() {
  return (
    <div className="container-page pt-10 pb-20">
      <h1 className="text-4xl sm:text-5xl">
        Mes <em>favoris</em>
      </h1>
      <p className="mt-3 text-sm text-muted">Enregistrés sur cet appareil.</p>
      <FavoritesView />
    </div>
  );
}
