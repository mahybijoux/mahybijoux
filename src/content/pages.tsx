import Link from "next/link";
import { site } from "@/config/site";
import { formatPrice } from "@/lib/format";

export type InfoPage = {
  title: string;
  h1: React.ReactNode;
  description: string;
  eyebrow: string;
  body: React.ReactNode;
  noindex?: boolean;
};

const freeShipping = formatPrice(site.shipping.freeThresholdCents);
const flatShipping = formatPrice(site.shipping.flatCents);

export const INFO_PAGES: Record<string, InfoPage> = {
  atelier: {
    title: "L'atelier et notre démarche",
    eyebrow: "La maison",
    h1: (
      <>
        Façonné lentement, <em>pensé pour durer</em>
      </>
    ),
    description: `Découvrez l'atelier ${site.name} : bijoux façonnés à la main à ${site.city}, en métaux recyclés et en petites séries, réparés à vie.`,
    body: (
      <>
        <p>
          {site.name} est né d&apos;une conviction simple : un bijou se transmet. Chaque pièce est dessinée, façonnée et
          polie à la main dans notre atelier à {site.city}, en petites séries, pour éviter les stocks dormants.
        </p>
        <h2 id="demarche">Notre démarche</h2>
        <ul>
          <li>
            <strong>Métaux recyclés.</strong> Nous travaillons l&apos;or 18 carats, l&apos;argent 925 et le vermeil issus de
            filières de recyclage.
          </li>
          <li>
            <strong>Pierres naturelles.</strong> Perles d&apos;eau douce et pierres fines sont choisies une à une ; aucune
            n&apos;est identique.
          </li>
          <li>
            <strong>Petites séries.</strong> Chaque modèle existe en quantité limitée. Certaines pièces sont uniques.
          </li>
          <li>
            <strong>Réparé à vie.</strong> Ressoudure, polissage et mise à taille sont pris en charge par l&apos;atelier.
          </li>
        </ul>
        <h2>Nous rendre visite</h2>
        <p>
          L&apos;atelier vous reçoit sur rendez-vous, du lundi au samedi ({site.hours}). Écrivez-nous depuis la page{" "}
          <Link href="/contact">contact</Link>.
        </p>
      </>
    ),
  },

  "guide-des-tailles": {
    title: "Guide des tailles de bagues",
    eyebrow: "Aide",
    h1: (
      <>
        Trouver <em>votre taille</em>
      </>
    ),
    description: "Mesurez votre tour de doigt en deux minutes et trouvez votre taille de bague grâce à notre tableau de correspondance.",
    body: (
      <>
        <h2>Mesurer votre tour de doigt</h2>
        <ul>
          <li>Enroulez un fil ou une bande de papier fine autour de la base du doigt, sans serrer.</li>
          <li>Marquez le point de jonction, puis mesurez la longueur à plat en millimètres.</li>
          <li>Mesurez en fin de journée : les doigts sont légèrement plus épais.</li>
          <li>Entre deux tailles, choisissez la plus grande.</li>
        </ul>
        <h2>Correspondance des tailles</h2>
        <table>
          <thead>
            <tr>
              <th>Tour de doigt (mm)</th>
              <th>Taille française</th>
              <th>Diamètre (mm)</th>
            </tr>
          </thead>
          <tbody>
            {[
              [46, 14.6],
              [48, 15.3],
              [50, 15.9],
              [52, 16.5],
              [54, 17.2],
              [56, 17.8],
              [58, 18.5],
              [60, 19.1],
              [62, 19.7],
            ].map(([size, dia]) => (
              <tr key={size}>
                <td>{size}</td>
                <td>{size}</td>
                <td>{dia?.toString().replace(".", ",")}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p>
          La première mise à taille est offerte sur nos bagues en or. Un doute ? <Link href="/contact">Écrivez-nous</Link>.
        </p>
      </>
    ),
  },

  "livraison-retours": {
    title: "Livraison et retours",
    eyebrow: "Aide",
    h1: (
      <>
        Livraison <em>&amp; retours</em>
      </>
    ),
    description: `Livraison offerte dès ${freeShipping} d'achat, retours gratuits sous ${site.returnDays} jours. Toutes les informations sur l'expédition de vos bijoux.`,
    body: (
      <>
        <h2>Livraison</h2>
        <ul>
          <li>
            Livraison offerte dès {freeShipping} d&apos;achat, {flatShipping} en dessous.
          </li>
          <li>Pays desservis : Maroc, France, Belgique, Luxembourg, Suisse et Monaco.</li>
          <li>Envoi suivi et assuré, dans un écrin prêt à offrir.</li>
          <li>Après confirmation de votre commande, l&apos;atelier vous communique le délai d&apos;expédition par e-mail.</li>
        </ul>
        <h2>Retours</h2>
        <p>
          Vous disposez de {site.returnDays} jours après réception pour nous retourner un bijou non porté, dans son
          emballage d&apos;origine. Les pièces gravées ou réalisées sur mesure ne sont ni reprises ni échangées.
        </p>
        <p>
          Pour initier un retour, écrivez à <a href={`mailto:${site.email}`}>{site.email}</a> en indiquant votre numéro de
          commande.
        </p>
      </>
    ),
  },

  entretien: {
    title: "Entretien des bijoux",
    eyebrow: "Aide",
    h1: (
      <>
        Prendre soin de <em>vos bijoux</em>
      </>
    ),
    description: "Nos conseils pour entretenir vos bijoux en or, argent, vermeil, perles et pierres naturelles.",
    body: (
      <>
        <h2>Au quotidien</h2>
        <ul>
          <li>Retirez vos bijoux pour nager, faire du sport ou dormir.</li>
          <li>Appliquez parfum et crème avant de les porter.</li>
          <li>Rangez chaque pièce séparément, à l&apos;abri de l&apos;humidité.</li>
        </ul>
        <h2>Par matière</h2>
        <ul>
          <li>
            <strong>Or 18 carats :</strong> eau tiède savonneuse et brosse douce, puis séchage.
          </li>
          <li>
            <strong>Argent 925 :</strong> chiffon de polissage pour raviver l&apos;éclat ; l&apos;oxydation est naturelle.
          </li>
          <li>
            <strong>Vermeil :</strong> chiffon doux uniquement, jamais de produit abrasif.
          </li>
          <li>
            <strong>Perles et pierres :</strong> chiffon légèrement humide ; évitez tout produit chimique.
          </li>
        </ul>
        <p>Un bijou abîmé ? L&apos;atelier le répare : c&apos;est notre engagement à vie.</p>
      </>
    ),
  },

  contact: {
    title: "Contact et rendez-vous",
    eyebrow: "La maison",
    h1: (
      <>
        Nous <em>écrire</em>
      </>
    ),
    description: `Contactez l'atelier ${site.name} pour un conseil, une commande sur mesure ou un rendez-vous.`,
    body: (
      <>
        <p>
          Une question sur un bijou, une taille, une commande ou une création sur mesure ? Nous répondons du lundi au
          samedi, {site.hours}.
        </p>
        <ul>
          <li>
            E-mail : <a href={`mailto:${site.email}`}>{site.email}</a>
          </li>
          <li>
            Téléphone : <a href={`tel:${site.phone.replace(/\s/g, "")}`}>{site.phone}</a>
          </li>
          <li>
            Instagram : <a href={site.instagram} rel="noopener noreferrer" target="_blank">@mahy.bijoux</a>
          </li>
        </ul>
        <h2>Rendez-vous à l&apos;atelier</h2>
        <p>
          Pour essayer les pièces ou préparer une alliance, proposez-nous un créneau par e-mail : nous vous confirmons le
          rendez-vous et l&apos;adresse de l&apos;atelier à {site.city}.
        </p>
      </>
    ),
  },

  "mentions-legales": {
    title: "Mentions légales",
    eyebrow: "Informations légales",
    h1: "Mentions légales",
    description: `Mentions légales du site ${site.name}.`,
    noindex: true,
    body: (
      <>
        <h2>Éditeur</h2>
        <p>
          {site.legal.companyName} — {site.legal.legalForm}
          <br />
          Adresse : {site.legal.address}
          <br />
          SIRET : {site.legal.siret} · TVA intracommunautaire : {site.legal.vatNumber}
          <br />
          Contact : <a href={`mailto:${site.email}`}>{site.email}</a>
          <br />
          Directeur·rice de la publication : {site.legal.publicationDirector}
        </p>
        <h2>Hébergement</h2>
        <p>{site.legal.host}</p>
        <h2>Propriété intellectuelle</h2>
        <p>
          Les créations, photographies, textes et éléments graphiques de ce site sont la propriété exclusive de{" "}
          {site.legal.companyName}. Toute reproduction sans autorisation écrite est interdite.
        </p>
      </>
    ),
  },

  cgv: {
    title: "Conditions générales de vente",
    eyebrow: "Informations légales",
    h1: "Conditions générales de vente",
    description: `Conditions générales de vente de ${site.name}.`,
    noindex: true,
    body: (
      <>
        <h2>1. Objet</h2>
        <p>
          Les présentes conditions régissent les ventes de bijoux réalisées sur le site {site.url} par{" "}
          {site.legal.companyName} auprès de consommateurs.
        </p>
        <h2>2. Commande</h2>
        <p>
          La commande passée sur le site constitue une demande d&apos;achat. Elle est définitive après confirmation
          écrite de l&apos;atelier par e-mail, qui précise le montant total, les modalités de règlement et le délai
          d&apos;expédition. Le numéro de commande affiché à l&apos;écran permet de suivre votre demande.
        </p>
        <h2>3. Prix</h2>
        <p>
          Les prix sont indiqués en dirhams marocains (MAD), toutes taxes comprises. Les frais de livraison s&apos;élèvent à{" "}
          {flatShipping} et sont offerts dès {freeShipping} d&apos;achat.
        </p>
        <h2>4. Paiement</h2>
        <p>
          Le règlement intervient après confirmation de la commande, selon les modalités indiquées par l&apos;atelier.
          L&apos;expédition a lieu après encaissement.
        </p>
        <h2>5. Droit de rétractation</h2>
        <p>
          Conformément à l&apos;article L221-18 du Code de la consommation, vous disposez de 14 jours à compter de la
          réception pour vous rétracter ; {site.name} étend ce délai à {site.returnDays} jours. Les bijoux personnalisés
          (gravure, mise à taille, création sur mesure) en sont exclus (article L221-28).
        </p>
        <h2>6. Garanties</h2>
        <p>
          Les bijoux bénéficient de la garantie légale de conformité (articles L217-3 et suivants du Code de la
          consommation) et de la garantie des vices cachés (articles 1641 et suivants du Code civil).
        </p>
        <h2>7. Médiation</h2>
        <p>
          En cas de litige, contactez-nous d&apos;abord à <a href={`mailto:${site.email}`}>{site.email}</a>. À défaut
          d&apos;accord, vous pouvez recourir gratuitement à un médiateur de la consommation.
        </p>
      </>
    ),
  },

  confidentialite: {
    title: "Politique de confidentialité",
    eyebrow: "Informations légales",
    h1: "Politique de confidentialité",
    description: `Comment ${site.name} collecte et protège vos données personnelles.`,
    noindex: true,
    body: (
      <>
        <h2>Données collectées</h2>
        <ul>
          <li>Commande : nom, prénom, e-mail, téléphone (facultatif), adresse de livraison, message.</li>
          <li>Newsletter : adresse e-mail.</li>
          <li>Panier et favoris : enregistrés uniquement dans votre navigateur (stockage local).</li>
        </ul>
        <h2>Finalités et base légale</h2>
        <p>
          Vos données servent à traiter et expédier vos commandes (exécution du contrat) et, si vous l&apos;avez demandé,
          à vous envoyer la newsletter (consentement). Elles ne sont jamais revendues.
        </p>
        <h2>Conservation</h2>
        <p>
          Les données de commande sont conservées le temps nécessaire aux obligations comptables (10 ans). Les adresses
          newsletter sont supprimées dès votre désinscription.
        </p>
        <h2>Sécurité</h2>
        <p>
          Les échanges sont chiffrés (HTTPS). Les commandes sont stockées dans une base de données dont l&apos;accès est
          réservé à l&apos;atelier.
        </p>
        <h2>Vos droits</h2>
        <p>
          Vous disposez d&apos;un droit d&apos;accès, de rectification, d&apos;effacement et d&apos;opposition. Écrivez à{" "}
          <a href={`mailto:${site.email}`}>{site.email}</a>. Vous pouvez aussi saisir la CNIL.
        </p>
        <h2>Cookies</h2>
        <p>
          La boutique n&apos;utilise aucun cookie publicitaire ni de mesure d&apos;audience. Seul l&apos;espace
          d&apos;administration dépose un cookie de session strictement nécessaire.
        </p>
      </>
    ),
  },
};
