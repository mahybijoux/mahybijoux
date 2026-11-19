import Link from "next/link";
import { listProducts, type CatalogSort } from "@/lib/catalog";
import { CATEGORIES, MATERIALS, UNIQUE_PIECES_FILTER, isMaterial, type Category } from "@/lib/types";
import { Breadcrumbs } from "./breadcrumbs";
import { ProductCard } from "./product-card";

export type CatalogSearchParams = { [key: string]: string | string[] | undefined };

const SORTS: { value: CatalogSort; label: string }[] = [
  { value: "nouveautes", label: "Nouveautés" },
  { value: "prix-croissant", label: "Prix croissant" },
  { value: "prix-decroissant", label: "Prix décroissant" },
];

function first(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

export function parseCatalogParams(searchParams: CatalogSearchParams) {
  const matiere = first(searchParams.matiere) ?? "";
  const tri = first(searchParams.tri) ?? "";
  const q = (first(searchParams.q) ?? "").trim().slice(0, 60);
  return {
    material: isMaterial(matiere) ? matiere : undefined,
    uniqueOnly: matiere === UNIQUE_PIECES_FILTER.value,
    matiere: isMaterial(matiere) || matiere === UNIQUE_PIECES_FILTER.value ? matiere : "",
    sort: (SORTS.some((s) => s.value === tri) ? tri : "nouveautes") as CatalogSort,
    q,
  };
}

export async function CatalogView({
  category,
  title,
  intro,
  searchParams,
}: {
  category?: Category;
  title: React.ReactNode;
  intro: string;
  searchParams: CatalogSearchParams;
}) {
  const { material, uniqueOnly, matiere, sort, q } = parseCatalogParams(searchParams);
  const products = await listProducts({ category, material, uniqueOnly, sort, search: q || undefined });
  const basePath = category ? `/collections/${category}` : "/collections";

  const href = (next: { matiere?: string; tri?: string }) => {
    const params = new URLSearchParams();
    const m = next.matiere ?? matiere;
    const t = next.tri ?? sort;
    if (m) params.set("matiere", m);
    if (t && t !== "nouveautes") params.set("tri", t);
    if (q) params.set("q", q);
    const s = params.toString();
    return s ? `${basePath}?${s}` : basePath;
  };

  const categoryLabel = CATEGORIES.find((c) => c.value === category)?.label;

  return (
    <div className="container-page pt-8 pb-20">
      <Breadcrumbs
        items={[
          { href: "/", label: "Accueil" },
          { href: "/collections", label: "Bijoux" },
          ...(categoryLabel ? [{ href: basePath, label: categoryLabel }] : []),
        ]}
      />

      <header className="mt-6 max-w-2xl">
        <h1 className="text-4xl sm:text-5xl">{title}</h1>
        <p className="mt-4 leading-relaxed text-muted">{intro}</p>
        {q && (
          <p className="mt-4 text-sm">
            Résultats pour « <strong>{q}</strong> » ·{" "}
            <Link href={basePath} className="link-underline">
              effacer la recherche
            </Link>
          </p>
        )}
      </header>

      <nav aria-label="Catégories" className="mt-10 border-b border-line">
        <ul className="-mb-px flex gap-6 overflow-x-auto text-sm">
          <li>
            <Link
              href="/collections"
              aria-current={!category ? "page" : undefined}
              className={`block border-b-2 pb-3 whitespace-nowrap ${!category ? "border-ink font-medium" : "border-transparent text-muted hover:text-ink"}`}
            >
              Tout
            </Link>
          </li>
          {CATEGORIES.map((c) => (
            <li key={c.value}>
              <Link
                href={`/collections/${c.value}`}
                aria-current={category === c.value ? "page" : undefined}
                className={`block border-b-2 pb-3 whitespace-nowrap ${category === c.value ? "border-ink font-medium" : "border-transparent text-muted hover:text-ink"}`}
              >
                {c.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <ul className="flex flex-wrap gap-2" aria-label="Filtrer par matière">
          <li>
            <Link href={href({ matiere: "" })} className="chip" aria-current={!matiere ? "true" : undefined}>
              Toutes matières
            </Link>
          </li>
          {[...MATERIALS, UNIQUE_PIECES_FILTER].map((m) => (
            <li key={m.value}>
              <Link href={href({ matiere: m.value })} className="chip" aria-current={matiere === m.value ? "true" : undefined}>
                {m.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-muted">Trier :</span>
          {SORTS.map((s) => (
            <Link
              key={s.value}
              href={href({ tri: s.value })}
              aria-current={sort === s.value ? "true" : undefined}
              className={sort === s.value ? "font-medium underline underline-offset-4" : "text-muted hover:text-ink"}
            >
              {s.label}
            </Link>
          ))}
        </div>
      </div>

      <p className="mt-8 text-sm text-muted" aria-live="polite">
        {products.length} bijou{products.length > 1 ? "x" : ""}
      </p>

      {products.length > 0 ? (
        <div className="mt-4 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p, i) => (
            <ProductCard key={p.id} product={p} priority={i < 3} />
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-(--radius-card) border border-line p-12 text-center">
          <p className="font-serif text-2xl">Aucun bijou ne correspond.</p>
          <p className="mt-2 text-sm text-muted">Essayez une autre matière ou parcourez toute la collection.</p>
          <Link href="/collections" className="btn btn-primary mt-6">
            Voir tous les bijoux
          </Link>
        </div>
      )}
    </div>
  );
}
