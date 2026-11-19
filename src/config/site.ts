/**
 * Shop-wide configuration. Business details shown publicly (footer, legal pages, JSON-LD)
 * live here so they are edited in one place.
 */
export const site = {
  name: "mahy.bijoux",
  shortName: "mahy",
  tagline: "Bijoux artisanaux en métaux recyclés",
  description:
    "Bijoux façonnés à la main en petites séries : or 18 carats, argent 925, vermeil, perles et pierres naturelles. Métaux recyclés, réparation à vie.",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
  locale: "fr_FR",
  currency: "MAD",
  city: "Paris",
  email: "bonjour@mahy.bijoux",
  phone: "+33 1 00 00 00 00",
  hours: "10 h – 18 h",
  instagram: "https://www.instagram.com/mahy.bijoux",
  /** WhatsApp number in international format, digits only (e.g. "212612345678"). Empty = button hidden. */
  whatsapp: "212653609768",
  whatsappMessage: "Bonjour mahy.bijoux, j'ai une question :",
  legal: {
    companyName: "mahy.bijoux",
    legalForm: "Entreprise individuelle",
    address: "Paris, France",
    siret: "À compléter",
    vatNumber: "À compléter",
    publicationDirector: "À compléter",
    host: "Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis",
  },
  /** Must match the constants in supabase/migrations/*_init.sql → place_order() */
  shipping: {
    freeThresholdCents: 150000, // 1 500 MAD
    flatCents: 4000, // 40 MAD
  },
  returnDays: 30,
} as const;

export function shippingFor(subtotalCents: number): number {
  return subtotalCents >= site.shipping.freeThresholdCents ? 0 : site.shipping.flatCents;
}
