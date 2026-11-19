import { site } from "@/config/site";

// fr-FR grouping gives "1 850 MAD" (fr-MA would print "1.850 MAD").
const money = new Intl.NumberFormat("fr-FR", { style: "currency", currency: site.currency });
const moneyRound = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: site.currency,
  maximumFractionDigits: 0,
});
const dateTime = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Europe/Paris",
});

export function formatPrice(cents: number) {
  return cents % 100 === 0 ? moneyRound.format(cents / 100) : money.format(cents / 100);
}

export function formatDateTime(iso: string) {
  return dateTime.format(new Date(iso));
}

export function slugify(input: string) {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120)
    .replace(/-+$/g, "");
}
