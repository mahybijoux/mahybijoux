"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "../auth-actions";

const LINKS = [
  { href: "/admin", label: "Tableau de bord", exact: true },
  { href: "/admin/commandes", label: "Commandes" },
  { href: "/admin/produits", label: "Produits" },
];

export function AdminNav({ email }: { email: string }) {
  const pathname = usePathname();

  return (
    <aside className="border-b border-line bg-ink text-cream lg:sticky lg:top-0 lg:h-dvh lg:border-r lg:border-b-0">
      <div className="flex h-full flex-col gap-6 px-4 py-5 lg:px-5 lg:py-8">
        <div className="flex items-center justify-between lg:block">
          <Link href="/admin" className="font-serif text-xl">
            mahy<span className="text-terracotta">.</span>bijoux
          </Link>
          <p className="text-xs text-cream/60 lg:mt-1">Administration</p>
        </div>
        <nav aria-label="Administration">
          <ul className="flex gap-1 overflow-x-auto lg:flex-col">
            {LINKS.map((l) => {
              const active = l.exact ? pathname === l.href : pathname.startsWith(l.href);
              return (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    aria-current={active ? "page" : undefined}
                    className={`block rounded-md px-3 py-2 text-sm whitespace-nowrap transition ${active ? "bg-cream/10 text-cream" : "text-cream/70 hover:bg-cream/5 hover:text-cream"}`}
                  >
                    {l.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="mt-auto hidden space-y-3 text-xs text-cream/60 lg:block">
          <Link href="/" target="_blank" className="block hover:text-cream">
            Voir la boutique ↗
          </Link>
          <p className="truncate" title={email}>
            {email}
          </p>
          <form action={signOut}>
            <button type="submit" className="text-cream/80 underline underline-offset-4 hover:text-cream">
              Se déconnecter
            </button>
          </form>
        </div>
        <form action={signOut} className="lg:hidden">
          <button type="submit" className="text-xs text-cream/80 underline underline-offset-4">
            Se déconnecter ({email})
          </button>
        </form>
      </div>
    </aside>
  );
}
