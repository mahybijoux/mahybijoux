# mahy.bijoux

Boutique de bijoux artisanaux — Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · Supabase (Postgres, Auth, Storage, RLS) · Vercel.

- **Storefront**: home, catalog by category / material with search and sort, product pages, favorites, cart, checkout, on-screen order reference.
- **Admin** (`/admin`, not linked from the shop): dashboard, order tracking and status updates (pending → confirmed → preparing → shipped → delivered / cancelled), product create / edit / delete with image upload.

## Project structure

```
supabase/
  migrations/20261119000000_init.sql   schema, RLS policies, place_order(), storage bucket + policies
  seed.sql                             6 starter products (from the design reference)
src/
  proxy.ts                             session refresh + login redirect for /admin/*
  config/site.ts                       brand, contact, legal info, shipping rules
  content/pages.tsx                    info & legal pages (atelier, sizes, delivery, CGV…)
  lib/
    supabase/{public,server,env}.ts    anon client (catalog/orders) · session client (admin)
    auth.ts                            requireAdmin(): verifies user + admin role
    catalog.ts                         public catalog queries
    actions/checkout.ts                cart refresh + placeOrder server action
    actions/newsletter.ts
    types.ts · format.ts · storage.ts
  components/
    shop/…                             header, footer, product card/gallery, cart store…
    admin/status-badge.tsx
  app/
    layout.tsx                         fonts, global metadata
    (shop)/                            public storefront
      page.tsx                         home
      collections/[category]/          catalog
      produits/[slug]/                 product page (+ JSON-LD Product)
      panier/ · commande/ · favoris/
      commande/confirmee/[reference]/  confirmation
      [page]/                          info & legal pages
    admin/
      login/                           sign-in
      (dashboard)/                     guarded area: dashboard, commandes, produits
    robots.ts · sitemap.ts · not-found.tsx
```

## Security model

| Actor | Products | Orders | Storage (`product-images`) |
|---|---|---|---|
| Visitor (`anon`) | read **active** only | create **only** via `place_order()`; no read | public URLs only (no listing) |
| Signed-in non-admin | same as visitor | nothing | nothing |
| Admin (row in `public.admins`) | full CRUD | read + update status / notes | upload, replace, delete |

- **No direct order inserts.** `place_order()` (`SECURITY DEFINER`) reads prices from the catalog, locks rows, checks and decrements stock, computes shipping and totals, and returns a random reference. A customer cannot forge a price, total or status. Cancelling an order restocks its items; a cancelled order cannot be reopened. Each status change is logged in `order_events`.
- **Admin checked three times.** `proxy.ts` redirects anyone without a session. `requireAdmin()` re-verifies the user with Supabase Auth and calls `is_admin()` in every admin page **and** every server action. RLS enforces the same rule in the database.
- **No service-role key** anywhere in the app. All admin writes run as the signed-in user, under RLS.
- Honeypot fields on checkout and newsletter. Security headers (HSTS, `X-Frame-Options`, nosniff…). `/admin` is `noindex`, `no-store` and excluded in `robots.txt`.

The policies were tested against Postgres (PGlite) with Supabase-like `auth`/`storage` stubs: 34 checks covering anon, a signed-in non-admin and admin.

## Local setup

1. **Create a Supabase project** (region near your customers, e.g. `eu-west-3` Paris).
2. **Run the SQL**: Supabase → SQL Editor → paste and run `supabase/migrations/20261119000000_init.sql`, then `supabase/seed.sql`.
   (With the Supabase CLI: `supabase link` then `supabase db push`.)
3. **Lock down sign-ups**: Authentication → Sign In / Providers → turn **off** "Allow new users to sign up". Admins are invited manually.
4. **Create the admin account**: Authentication → Users → *Add user* (email + strong password, "Auto confirm"). Then in the SQL Editor:
   ```sql
   insert into public.admins (user_id)
   select id from auth.users where email = 'you@example.com';
   ```
5. **Environment**:
   ```bash
   cp .env.example .env.local   # fill NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, NEXT_PUBLIC_SITE_URL
   npm install
   npm run dev                  # http://localhost:3000 — admin at /admin
   ```

## Deploy to Vercel

1. Push the repo to GitHub / GitLab and import it in Vercel (framework auto-detected: Next.js).
2. Project → Settings → Environment Variables (Production **and** Preview):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL` = `https://your-domain` (no trailing slash)
3. Deploy, then add your domain (Project → Domains) and update `NEXT_PUBLIC_SITE_URL` if it changed; redeploy.
4. Supabase → Authentication → URL Configuration → set **Site URL** to your domain.
5. Submit `https://your-domain/sitemap.xml` in Google Search Console.

## Before going live — owner checklist

- `src/config/site.ts`: email, phone, hours, city, Instagram, **legal fields** (SIRET, VAT, address, publication director), return window.
- `src/content/pages.tsx`: review every service promise (delivery countries, resizing, repairs) and the CGV / privacy texts with your own terms.
- Shipping rules live in **two** places that must match: `site.shipping` in `src/config/site.ts` and the constants at the top of `place_order()` in the SQL.
- Replace the seed products and upload real photos from `/admin/produits`. Products without photos show a line-art illustration.

## Order flow

1. The customer submits the checkout. `place_order()` stores the order as **En attente** and the screen shows the reference `MB-YYMMDD-XXXXXX`.
2. The admin sees it on `/admin`, contacts the customer by email (the `mailto` link is prefilled with the reference), agrees on payment, then moves it through **Confirmée → En préparation → Expédiée → Livrée**.

Online card payment and automatic emails are not included. Natural next steps: Stripe Checkout (create the session from the `place_order` result) and Resend or Supabase webhooks for confirmation emails.
