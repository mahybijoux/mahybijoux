import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CatalogView, parseCatalogParams, type CatalogSearchParams } from "@/components/shop/catalog-view";
import { CATEGORIES, isCategory, type Category } from "@/lib/types";

const COPY: Record<Category, { title: string; h1: [string, string]; intro: string; description: string }> = {
  bagues: {
    title: "Bagues artisanales en or et argent",
    h1: ["Nos ", "bagues"],
    intro: "Anneaux fins, solitaires et bagues à empiler, en or 18 carats, vermeil et argent 925 recyclés.",
    description: "Bagues artisanales en or 18 carats, argent 925 et vermeil recyclés, serties de pierres naturelles. Mise à taille offerte.",
  },
  colliers: {
    title: "Colliers et pendentifs artisanaux",
    h1: ["Nos ", "colliers"],
    intro: "Chaînes délicates, pendentifs et perles d'eau douce, à porter seuls ou superposés.",
    description: "Colliers et pendentifs faits main en or et argent recyclés, perles d'eau douce et pierres naturelles.",
  },
  "boucles-oreilles": {
    title: "Boucles d'oreilles artisanales",
    h1: ["Nos ", "boucles d'oreilles"],
    intro: "Créoles, puces et pendants façonnés à la main, pour tous les jours comme pour les grandes occasions.",
    description: "Boucles d'oreilles artisanales : créoles, puces et pendants en vermeil, or 18 carats et argent 925 recyclés.",
  },
  bracelets: {
    title: "Bracelets et joncs artisanaux",
    h1: ["Nos ", "bracelets"],
    intro: "Joncs graphiques et chaînes fines, gravables à l'intérieur sur demande.",
    description: "Bracelets et joncs en or 18 carats et argent 925 recyclés, façonnés à la main et gravables.",
  },
};

export const dynamicParams = false;

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ category: c.value }));
}

type Props = {
  params: Promise<{ category: string }>;
  searchParams: Promise<CatalogSearchParams>;
};

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { category } = await params;
  if (!isCategory(category)) return {};
  const { matiere, q } = parseCatalogParams(await searchParams);
  const copy = COPY[category];
  return {
    title: copy.title,
    description: copy.description,
    alternates: { canonical: `/collections/${category}` },
    openGraph: { title: copy.title, description: copy.description, url: `/collections/${category}` },
    robots: matiere || q ? { index: false, follow: true } : undefined,
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { category } = await params;
  if (!isCategory(category)) notFound();
  const copy = COPY[category];

  return (
    <CatalogView
      category={category}
      title={
        <>
          {copy.h1[0]}
          <em>{copy.h1[1]}</em>
        </>
      }
      intro={copy.intro}
      searchParams={await searchParams}
    />
  );
}
