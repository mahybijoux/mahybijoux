import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Connexion administration",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ erreur?: string }> }) {
  const { erreur } = await searchParams;
  return (
    <main className="flex min-h-dvh items-center justify-center bg-sand px-4">
      <div className="w-full max-w-sm rounded-(--radius-card) border border-line bg-cream p-8 shadow-sm">
        <p className="font-serif text-2xl">
          mahy<span className="text-terracotta">.</span>bijoux
        </p>
        <h1 className="mt-1 font-sans text-sm font-medium text-muted">Espace administration</h1>
        <LoginForm initialError={erreur === "acces" ? "Ce compte n'a pas accès à l'administration." : undefined} />
      </div>
    </main>
  );
}
