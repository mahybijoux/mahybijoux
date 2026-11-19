import Image from "next/image";
import Link from "next/link";
import { site } from "@/config/site";
import { countActiveProducts, listFeaturedProducts } from "@/lib/catalog";
import { MATERIALS, UNIQUE_PIECES_FILTER } from "@/lib/types";
import { ArrowRightIcon, SparkIcon, TargetIcon } from "@/components/icons";
import { NewsletterForm } from "@/components/shop/newsletter-form";
import { ProductCard } from "@/components/shop/product-card";
import { TrustBar } from "@/components/shop/trust-bar";

export const revalidate = 300;

export default async function HomePage() {
  const [featured, total] = await Promise.all([listFeaturedProducts(6), countActiveProducts()]);

  return (
    <>
      {/* Hero */}
      <section className="bg-sage">
        <div className="container-page grid items-center gap-12 py-16 md:grid-cols-[1.1fr_1fr] lg:py-12">
          <div className="max-w-xl">
            <p className="eyebrow text-ink/80">Collection Racines · Automne</p>
            <h1 className="mt-5 text-[2.6rem] leading-[1.08] sm:text-5xl lg:text-[3.6rem]">
              Des bijoux nés de la <em>main</em> et de la <em>terre</em>
            </h1>
            <p className="mt-6 max-w-md text-[1.0625rem] leading-relaxed text-ink/85">
              Métaux recyclés, pierres naturelles et petites séries façonnées dans notre atelier à {site.city}.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/collections" className="btn btn-primary px-6">
                Découvrir la collection <ArrowRightIcon size={16} />
              </Link>
              <Link href="/atelier" className="btn btn-outline border-ink/60 px-6 hover:border-ink">
                Notre atelier
              </Link>
            </div>
          </div>

          <div className="mx-auto w-full max-w-sm md:max-w-md">
            <div className="relative aspect-[4/5] overflow-hidden rounded-t-full rounded-b-xl bg-cream shadow-[0_30px_60px_-30px_rgb(35_45_40/0.35)]">
              <Image
                src="/images/hero.jpg"
                alt="Bracelet en or porté au poignet"
                fill
                priority
                sizes="(min-width: 768px) 28rem, 90vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <TrustBar />

      {/* Shop by material */}
      <section className="container-page flex flex-col gap-6 pt-16 lg:flex-row lg:items-center lg:justify-between">
        <h2 className="text-3xl sm:text-4xl">
          Acheter par <em>matière</em>
        </h2>
        <ul className="flex flex-wrap gap-2.5">
          {[...MATERIALS, UNIQUE_PIECES_FILTER].map((m) => (
            <li key={m.value}>
              <Link href={`/collections?matiere=${m.value}`} className="chip">
                {m.label}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Featured */}
      <section className="container-page py-14" aria-labelledby="favorites-title">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 id="favorites-title" className="text-3xl sm:text-4xl">
              Nos <em>pièces favorites</em>
            </h2>
            <p className="mt-2 text-sm text-muted">Sélectionnées par l&apos;atelier ce mois-ci.</p>
          </div>
          <Link href="/collections" className="link-underline inline-flex items-center gap-2 text-sm">
            Voir les {total > 0 ? `${total} ` : ""}bijoux <ArrowRightIcon size={14} />
          </Link>
        </div>

        {featured.length > 0 ? (
          <div className="mt-10 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((p, i) => (
              <ProductCard key={p.id} product={p} priority={i < 3} />
            ))}
          </div>
        ) : (
          <p className="mt-10 rounded-(--radius-card) border border-line p-10 text-center text-muted">
            La nouvelle sélection arrive très bientôt.
          </p>
        )}
      </section>

      {/* Atelier */}
      <section className="bg-ink text-cream" aria-labelledby="atelier-title">
        <div className="container-page grid items-center gap-12 py-20 md:grid-cols-2">
          <div className="relative aspect-[4/3] overflow-hidden rounded-(--radius-card) border border-terracotta/70">
            <Image
              src="/images/atelier.jpg"
              alt="Parure de bijoux en or à motif de feuilles, posée sur une pierre"
              fill
              sizes="(min-width: 768px) 45vw, 100vw"
              className="object-cover"
            />
          </div>
          <div>
            <p className="eyebrow text-terracotta">L&apos;atelier</p>
            <h2 id="atelier-title" className="mt-4 text-3xl leading-tight sm:text-[2.6rem]">
              Façonné lentement, <em>pensé pour durer</em>
            </h2>
            <ul className="mt-8 space-y-5">
              {[
                ["Métaux recyclés", "Or et argent issus de filières de recyclage, pour un luxe plus sobre."],
                ["Petites séries", "Chaque modèle est produit en quantité limitée, sans stock dormant."],
                ["Réparé à vie", "Ressoudure, polissage et mise à taille pris en charge par l'atelier."],
              ].map(([title, text]) => (
                <li key={title} className="flex gap-3">
                  <SparkIcon size={18} className="mt-0.5 shrink-0 text-terracotta" />
                  <div>
                    <p className="font-medium">{title}</p>
                    <p className="mt-1 text-sm text-cream/80">{text}</p>
                  </div>
                </li>
              ))}
            </ul>
            <Link href="/atelier#demarche" className="btn btn-accent mt-9 px-6">
              Découvrir notre démarche <ArrowRightIcon size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Size guide */}
      <section className="container-page py-16">
        <div className="flex flex-col gap-6 rounded-(--radius-card) border border-line p-6 sm:p-8 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <TargetIcon size={26} className="mt-1 shrink-0" />
            <div>
              <h2 className="text-2xl">Pas sûre de votre taille ?</h2>
              <p className="mt-1 text-sm text-muted">Mesurez votre doigt en deux minutes avec notre guide imprimable.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/guide-des-tailles" className="btn btn-primary">
              Voir le guide
            </Link>
            <Link href="/contact" className="btn btn-outline">
              Demander conseil
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-sage py-16 text-center" aria-labelledby="cercle-title">
        <div className="container-page">
          <h2 id="cercle-title" className="text-3xl sm:text-4xl">
            Rejoindre <em>le cercle</em>
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm text-ink/85">
            Avant-premières, éditions limitées et nouvelles de l&apos;atelier, une fois par mois.
          </p>
          <NewsletterForm />
        </div>
      </section>
    </>
  );
}
