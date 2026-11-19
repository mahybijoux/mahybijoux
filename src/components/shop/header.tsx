import Link from "next/link";
import { site } from "@/config/site";
import { formatPrice } from "@/lib/format";
import { CATEGORIES } from "@/lib/types";
import { MenuIcon, SearchIcon } from "@/components/icons";
import { HeaderActions } from "./header-actions";

export function AnnouncementBar() {
  return (
    <div className="bg-ink text-cream">
      <p className="container-page flex flex-wrap items-center justify-center gap-x-6 gap-y-1 py-2 text-center text-xs">
        <span>Livraison offerte dès {formatPrice(site.shipping.freeThresholdCents)}</span>
        <span aria-hidden="true" className="hidden opacity-50 sm:inline">
          ·
        </span>
        <span className="hidden sm:inline">Retours gratuits sous {site.returnDays} jours</span>
        <span aria-hidden="true" className="hidden opacity-50 md:inline">
          ·
        </span>
        <Link href="/contact" className="link-underline hidden md:inline">
          Prendre rendez-vous à l&apos;atelier
        </Link>
      </p>
    </div>
  );
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`font-serif text-2xl tracking-[0.04em] ${className}`} aria-label={`${site.name} — accueil`}>
      mahy<span className="text-terracotta">.</span>bijoux
    </Link>
  );
}

function SearchForm({ id }: { id: string }) {
  return (
    <form action="/collections" method="get" role="search" className="relative w-full">
      <label htmlFor={id} className="sr-only">
        Rechercher un bijou
      </label>
      <input
        id={id}
        name="q"
        type="search"
        maxLength={60}
        placeholder="Bague, collier, or rose…"
        className="w-full rounded-lg border border-line bg-cream py-2.5 pr-10 pl-4 text-sm placeholder:text-muted/80 focus:border-ink focus:outline-none"
      />
      <button type="submit" className="absolute top-1/2 right-3 -translate-y-1/2 text-ink" aria-label="Lancer la recherche">
        <SearchIcon size={16} />
      </button>
    </form>
  );
}

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-cream/95 backdrop-blur supports-[backdrop-filter]:bg-cream/85">
      <div className="container-page">
        <div className="flex items-center justify-between gap-6 pt-5 pb-3 lg:pb-2">
          <div className="flex items-center gap-3">
            <details className="group relative lg:hidden">
              <summary
                className="flex size-9 cursor-pointer list-none items-center justify-center rounded-md hover:bg-sand [&::-webkit-details-marker]:hidden"
                aria-label="Ouvrir le menu"
              >
                <MenuIcon size={20} />
              </summary>
              <nav
                aria-label="Menu mobile"
                className="absolute top-11 -left-2 z-50 w-[min(20rem,calc(100vw-2rem))] rounded-xl border border-line bg-cream p-4 shadow-xl"
              >
                <SearchForm id="search-mobile" />
                <ul className="mt-3 divide-y divide-line">
                  {CATEGORIES.map((c) => (
                    <li key={c.value}>
                      <Link href={`/collections/${c.value}`} className="block py-3 text-[0.9375rem]">
                        {c.label}
                      </Link>
                    </li>
                  ))}
                  <li>
                    <Link href="/collections?matiere=pieces-uniques" className="block py-3 text-terracotta-deep">
                      Pièces uniques
                    </Link>
                  </li>
                  <li>
                    <Link href="/atelier" className="block py-3">
                      L&apos;atelier
                    </Link>
                  </li>
                </ul>
              </nav>
            </details>
            <Logo />
          </div>

          <nav aria-label="Navigation principale" className="hidden lg:block">
            <ul className="flex items-center gap-7 text-[0.9375rem]">
              {CATEGORIES.map((c) => (
                <li key={c.value}>
                  <Link href={`/collections/${c.value}`} className="transition-colors hover:text-terracotta-deep">
                    {c.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/collections" className="transition-colors hover:text-terracotta-deep">
                  Tous les bijoux
                </Link>
              </li>
              <li>
                <Link href="/collections?matiere=pieces-uniques" className="text-terracotta-deep hover:text-ink">
                  Pièces uniques
                </Link>
              </li>
            </ul>
          </nav>

          <div className="lg:hidden">
            <HeaderActions compact />
          </div>
        </div>

        <div className="hidden items-center gap-6 pb-4 lg:flex">
          <div className="w-60">
            <SearchForm id="search-desktop" />
          </div>
          <HeaderActions />
        </div>
      </div>
    </header>
  );
}
