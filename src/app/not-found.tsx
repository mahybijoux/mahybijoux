import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-cream px-4 text-center">
      <p className="eyebrow text-terracotta-deep">Erreur 404</p>
      <h1 className="mt-4 text-4xl sm:text-5xl">
        Cette page s&apos;est <em>égarée</em>
      </h1>
      <p className="mt-4 max-w-md text-muted">Le bijou ou la page que vous cherchez n&apos;existe plus ou a changé d&apos;adresse.</p>
      <div className="mt-8 flex gap-3">
        <Link href="/" className="btn btn-primary">
          Accueil
        </Link>
        <Link href="/collections" className="btn btn-outline">
          Tous les bijoux
        </Link>
      </div>
    </main>
  );
}
