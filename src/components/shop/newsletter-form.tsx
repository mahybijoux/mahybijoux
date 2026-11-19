"use client";

import { useActionState } from "react";
import Link from "next/link";
import { subscribeNewsletter, type NewsletterState } from "@/lib/actions/newsletter";

export function NewsletterForm() {
  const [state, action, pending] = useActionState<NewsletterState, FormData>(subscribeNewsletter, { status: "idle" });

  return (
    <form action={action} className="mx-auto mt-8 max-w-md text-left" noValidate>
      <label htmlFor="newsletter-email" className="field-label">
        Adresse e-mail
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          id="newsletter-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="prenom@exemple.fr"
          aria-invalid={state.status === "error"}
          aria-describedby="newsletter-msg"
          className="field flex-1 border-ink/60 bg-cream"
        />
        <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? "Envoi…" : "Je m'inscris"}
        </button>
      </div>
      <p id="newsletter-msg" role="status" className="mt-2 min-h-5 text-xs">
        {state.status === "idle" ? (
          <>
            Jamais revendue, jamais de spam.{" "}
            <Link href="/confidentialite" className="link-underline">
              Politique de confidentialité
            </Link>
          </>
        ) : (
          <span className={state.status === "error" ? "font-medium text-danger" : "font-medium"}>{state.message}</span>
        )}
      </p>
    </form>
  );
}
