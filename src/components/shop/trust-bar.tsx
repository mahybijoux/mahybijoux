import { site } from "@/config/site";
import { formatPrice } from "@/lib/format";
import { ChatIcon, LockIcon, ReturnIcon, TruckIcon } from "@/components/icons";

const ITEMS = [
  { icon: TruckIcon, title: "Livraison offerte", text: `dès ${formatPrice(site.shipping.freeThresholdCents)} d'achat` },
  { icon: ReturnIcon, title: "Retours gratuits", text: `sous ${site.returnDays} jours` },
  { icon: LockIcon, title: "Commande sécurisée", text: "données chiffrées (HTTPS)" },
  { icon: ChatIcon, title: "Conseil personnalisé", text: "par e-mail ou à l'atelier" },
];

export function TrustBar() {
  return (
    <section aria-label="Nos engagements" className="border-b border-line bg-cream">
      <ul className="container-page grid grid-cols-2 gap-6 py-6 lg:grid-cols-4">
        {ITEMS.map(({ icon: Icon, title, text }) => (
          <li key={title} className="flex items-start gap-3">
            <Icon size={20} className="mt-0.5 shrink-0" />
            <div className="text-sm">
              <p className="font-medium">{title}</p>
              <p className="text-muted">{text}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
