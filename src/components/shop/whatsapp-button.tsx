"use client";

import { usePathname } from "next/navigation";
import { site } from "@/config/site";

/** Floating WhatsApp chat button (bottom right). Hidden until site.whatsapp is set. */
export function WhatsAppButton() {
  const pathname = usePathname();
  const number = site.whatsapp.replace(/\D/g, "");
  if (!number) return null;

  // On a product page, mention which piece the customer is looking at.
  const onProduct = pathname.startsWith("/produits/");
  const text = onProduct ? `${site.whatsappMessage}\n${site.url}${pathname}` : site.whatsappMessage;
  const href = `https://wa.me/${number}?text=${encodeURIComponent(text)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Discuter avec nous sur WhatsApp"
      className="group fixed right-4 bottom-4 z-50 flex items-center gap-2 rounded-full bg-[#25D366] p-3.5 text-white shadow-[0_10px_30px_-8px_rgb(0_0_0/0.35)] transition-transform duration-300 hover:scale-105 sm:right-6 sm:bottom-6"
    >
      <span className="hidden max-w-0 overflow-hidden text-sm font-medium whitespace-nowrap transition-all duration-300 group-hover:max-w-40 group-hover:pl-1 sm:inline">
        Une question ?
      </span>
      <svg viewBox="0 0 32 32" width="28" height="28" fill="currentColor" aria-hidden="true">
        <path d="M16.04 3C8.86 3 3.03 8.82 3.03 16c0 2.3.6 4.53 1.74 6.5L3 29l6.68-1.75A12.95 12.95 0 0 0 16.04 29C23.2 29 29 23.18 29 16S23.2 3 16.04 3Zm0 23.62c-2 0-3.95-.54-5.65-1.55l-.4-.24-3.97 1.04 1.06-3.86-.26-.4a10.6 10.6 0 0 1-1.63-5.6c0-5.86 4.78-10.63 10.66-10.63 5.86 0 10.62 4.77 10.62 10.63 0 5.85-4.77 10.61-10.43 10.61Zm5.83-7.95c-.32-.16-1.89-.93-2.18-1.04-.3-.1-.5-.16-.72.16-.21.32-.82 1.04-1.01 1.25-.18.21-.37.24-.69.08-.32-.16-1.35-.5-2.57-1.59-.95-.85-1.6-1.9-1.78-2.22-.19-.32-.02-.49.14-.65.14-.14.32-.37.48-.56.16-.18.21-.32.32-.53.1-.21.05-.4-.03-.56-.08-.16-.72-1.73-.98-2.37-.26-.62-.53-.54-.72-.55h-.62c-.21 0-.56.08-.85.4-.29.32-1.11 1.09-1.11 2.66 0 1.57 1.14 3.08 1.3 3.3.16.2 2.24 3.42 5.43 4.8.76.33 1.35.52 1.81.67.76.24 1.45.2 2 .12.61-.09 1.89-.77 2.15-1.52.27-.74.27-1.38.19-1.52-.08-.13-.29-.21-.61-.37Z" />
      </svg>
    </a>
  );
}
