import type { Metadata } from "next";
import { CatalogView, parseCatalogParams, type CatalogSearchParams } from "@/components/shop/catalog-view";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<CatalogSearchParams>;
}): Promise<Metadata> {
  const { matiere, q } = parseCatalogParams(await searchParams);
  return {
    title: "Tous nos bijoux artisanaux",
    description:
      "Bagues, colliers, boucles d'oreilles et bracelets en or 18 carats, argent 925 et vermeil recyclés, façonnés à la main en petites séries.",
    alternates: { canonical: "/collections" },
    // Filtered / searched variants are not indexed to avoid duplicate content.
    robots: matiere || q ? { index: false, follow: true } : undefined,
  };
}

export default async function CollectionsPage({ searchParams }: { searchParams: Promise<CatalogSearchParams> }) {
  return (
    <CatalogView
      title={
        <>
          Tous nos <em>bijoux</em>
        </>
      }
      intro="Des pièces façonnées à la main, en métaux recyclés et pierres naturelles, produites en petites séries dans notre atelier."
      searchParams={await searchParams}
    />
  );
}
