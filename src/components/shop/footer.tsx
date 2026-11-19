import Link from "next/link";
import { site } from "@/config/site";

const COLUMNS = [
  {
    title: "Boutique",
    links: [
      { href: "/collections", label: "Tous les bijoux" },
      { href: "/collections?tri=nouveautes", label: "Nouveautés" },
      { href: "/collections?matiere=pieces-uniques", label: "Pièces uniques" },
      { href: "/favoris", label: "Mes favoris" },
    ],
  },
  {
    title: "Aide",
    links: [
      { href: "/guide-des-tailles", label: "Guide des tailles" },
      { href: "/livraison-retours", label: "Livraison & retours" },
      { href: "/entretien", label: "Entretien des bijoux" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "La maison",
    links: [
      { href: "/atelier", label: "L'atelier" },
      { href: "/atelier#demarche", label: "Notre démarche" },
      { href: "/contact", label: "Rendez-vous à l'atelier" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-ink text-cream">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-serif text-2xl tracking-[0.04em]">
            mahy<span className="text-terracotta">.</span>bijoux
          </p>
          <p className="mt-4 text-sm leading-relaxed text-cream/85">Bijoux façonnés à la main à {site.city}.</p>
          <p className="mt-3 text-sm leading-relaxed text-cream/85">
            Service client :{" "}
            <a href={`mailto:${site.email}`} className="link-underline">
              {site.email}
            </a>
            <br />
            du lundi au samedi, {site.hours}
          </p>
        </div>
        {COLUMNS.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h2 className="eyebrow font-sans text-terracotta">{col.title}</h2>
            <ul className="mt-5 space-y-3 text-sm">
              {col.links.map((l) => (
                <li key={l.href + l.label}>
                  <Link href={l.href} className="text-cream/90 transition-colors hover:text-terracotta">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-cream/10">
        <div className="container-page flex flex-col gap-3 py-5 text-xs text-cream/80 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {site.name}
          </p>
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            <li>
              <Link href="/mentions-legales" className="link-underline">
                Mentions légales
              </Link>
            </li>
            <li>
              <Link href="/cgv" className="link-underline">
                CGV
              </Link>
            </li>
            <li>
              <Link href="/confidentialite" className="link-underline">
                Confidentialité
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
