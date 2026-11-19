import { site } from "@/config/site";
import { JsonLd } from "@/components/json-ld";
import { Footer } from "@/components/shop/footer";
import { AnnouncementBar, Header } from "@/components/shop/header";
import { ShopStoreProvider } from "@/components/shop/shop-store";
import { WhatsAppButton } from "@/components/shop/whatsapp-button";

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <ShopStoreProvider>
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-ink focus:px-4 focus:py-2 focus:text-cream"
      >
        Aller au contenu
      </a>
      <AnnouncementBar />
      <Header />
      <main id="contenu">{children}</main>
      <Footer />
      <WhatsAppButton />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: site.name,
          url: site.url,
          email: site.email,
          description: site.description,
          sameAs: [site.instagram],
          address: { "@type": "PostalAddress", addressLocality: site.city, addressCountry: "FR" },
        }}
      />
    </ShopStoreProvider>
  );
}
