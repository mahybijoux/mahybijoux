-- =====================================================================
-- mahy.bijoux — schema, Row-Level Security and storage
-- Run once in Supabase → SQL Editor (or `supabase db push`).
-- =====================================================================

-- ---------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------
create type public.product_category as enum ('bagues', 'colliers', 'boucles-oreilles', 'bracelets');
create type public.product_material as enum ('or-18k', 'argent-925', 'vermeil', 'perles', 'pierres-naturelles');
create type public.order_status as enum ('pending', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled');

-- ---------------------------------------------------------------------
-- Admins: membership table. Rows are managed ONLY from the SQL editor.
-- ---------------------------------------------------------------------
create table public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

-- SECURITY DEFINER so policies can call it without granting read access to admins.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins a where a.user_id = (select auth.uid()));
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- ---------------------------------------------------------------------
-- updated_at helper
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------
-- Products
-- ---------------------------------------------------------------------
create table public.products (
  id               uuid primary key default gen_random_uuid(),
  slug             text not null unique
                   check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 120),
  name             text not null check (char_length(name) between 1 and 120),
  category         public.product_category not null,
  material         public.product_material not null,
  material_label   text not null default '' check (char_length(material_label) <= 160),
  description      text not null default '' check (char_length(description) <= 4000),
  details          text[] not null default '{}' check (cardinality(details) <= 20),
  price_cents      integer not null check (price_cents between 0 and 10000000),
  images           text[] not null default '{}' check (cardinality(images) <= 8),
  stock            integer not null default 0 check (stock >= 0),
  is_active        boolean not null default true,
  is_featured      boolean not null default false,
  is_unique_piece  boolean not null default false,
  badge            text check (badge in ('nouveau', 'best-seller')),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index products_active_category_idx on public.products (is_active, category);
create index products_active_featured_idx on public.products (is_active, is_featured);

create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- Orders
-- ---------------------------------------------------------------------
create table public.orders (
  id                  uuid primary key default gen_random_uuid(),
  reference           text not null unique,
  status              public.order_status not null default 'pending',
  customer_first_name text not null check (char_length(customer_first_name) between 1 and 80),
  customer_last_name  text not null check (char_length(customer_last_name) between 1 and 80),
  email               text not null check (char_length(email) <= 254 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone               text check (char_length(phone) <= 30),
  address_line1       text not null check (char_length(address_line1) between 1 and 160),
  address_line2       text check (char_length(address_line2) <= 160),
  postal_code         text not null check (char_length(postal_code) between 2 and 12),
  city                text not null check (char_length(city) between 1 and 100),
  country             text not null default 'FR' check (country ~ '^[A-Z]{2}$'),
  customer_note       text check (char_length(customer_note) <= 1000),
  admin_note          text check (char_length(admin_note) <= 2000),
  subtotal_cents      integer not null check (subtotal_cents >= 0),
  shipping_cents      integer not null check (shipping_cents >= 0),
  total_cents         integer not null check (total_cents >= 0),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index orders_status_created_idx on public.orders (status, created_at desc);
create index orders_created_idx on public.orders (created_at desc);

create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

create table public.order_items (
  id                bigint generated always as identity primary key,
  order_id          uuid not null references public.orders (id) on delete cascade,
  product_id        uuid references public.products (id) on delete set null,
  product_name      text not null,
  product_slug      text,
  unit_price_cents  integer not null check (unit_price_cents >= 0),
  quantity          integer not null check (quantity between 1 and 20),
  line_total_cents  integer generated always as (unit_price_cents * quantity) stored
);

create index order_items_order_idx on public.order_items (order_id);
create index order_items_product_idx on public.order_items (product_id);

-- Status history (audit trail)
create table public.order_events (
  id          bigint generated always as identity primary key,
  order_id    uuid not null references public.orders (id) on delete cascade,
  status      public.order_status not null,
  created_by  uuid references auth.users (id) on delete set null,
  created_at  timestamptz not null default now()
);

create index order_events_order_idx on public.order_events (order_id, created_at);

-- Status transitions: log every change, restock on cancellation, forbid leaving 'cancelled'.
create or replace function public.handle_order_status_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status is distinct from old.status then
    if old.status = 'cancelled' then
      raise exception 'Une commande annulée ne peut pas être réactivée.' using errcode = 'P0001';
    end if;

    if new.status = 'cancelled' then
      update public.products p
         set stock = p.stock + oi.quantity
        from public.order_items oi
       where oi.order_id = new.id
         and oi.product_id = p.id;
    end if;

    insert into public.order_events (order_id, status, created_by)
    values (new.id, new.status, (select auth.uid()));
  end if;
  return new;
end;
$$;

create trigger orders_status_change
  after update of status on public.orders
  for each row execute function public.handle_order_status_change();

-- ---------------------------------------------------------------------
-- Newsletter
-- ---------------------------------------------------------------------
create table public.newsletter_subscribers (
  id          bigint generated always as identity primary key,
  email       text not null unique check (char_length(email) <= 254 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- place_order: the ONLY way the public can create an order.
-- Prices, stock and totals are computed server-side from the catalog,
-- so a customer can never forge a price, a total or a status.
-- Keep the shipping constants in sync with src/config/site.ts.
-- ---------------------------------------------------------------------
create or replace function public.place_order(customer jsonb, items jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  c_free_shipping_threshold constant integer := 150000; -- 1 500 MAD
  c_shipping_flat           constant integer := 4000;   -- 40 MAD

  v_order_id   uuid;
  v_reference  text;
  v_subtotal   integer := 0;
  v_shipping   integer;
  v_line       record;
  v_product    public.products%rowtype;
  v_email      text := lower(trim(customer ->> 'email'));
begin
  if items is null or jsonb_typeof(items) <> 'array'
     or jsonb_array_length(items) = 0 or jsonb_array_length(items) > 20 then
    raise exception 'INVALID_CART' using errcode = 'P0001';
  end if;

  if customer is null or jsonb_typeof(customer) <> 'object' then
    raise exception 'INVALID_CUSTOMER' using errcode = 'P0001';
  end if;

  -- Unique, non-guessable reference: MB-YYMMDD-XXXXXX
  loop
    v_reference := 'MB-' || to_char(now() at time zone 'Europe/Paris', 'YYMMDD') || '-'
                   || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));
    exit when not exists (select 1 from public.orders o where o.reference = v_reference);
  end loop;

  -- Column CHECK constraints validate every customer field.
  insert into public.orders (
    reference, customer_first_name, customer_last_name, email, phone,
    address_line1, address_line2, postal_code, city, country, customer_note,
    subtotal_cents, shipping_cents, total_cents
  ) values (
    v_reference,
    trim(customer ->> 'first_name'),
    trim(customer ->> 'last_name'),
    v_email,
    nullif(trim(customer ->> 'phone'), ''),
    trim(customer ->> 'address_line1'),
    nullif(trim(customer ->> 'address_line2'), ''),
    trim(customer ->> 'postal_code'),
    trim(customer ->> 'city'),
    upper(coalesce(nullif(trim(customer ->> 'country'), ''), 'MA')),
    nullif(trim(customer ->> 'note'), ''),
    0, 0, 0
  )
  returning id into v_order_id;

  for v_line in
    select (e ->> 'product_id')::uuid as product_id,
           sum((e ->> 'quantity')::integer)::integer as quantity
      from jsonb_array_elements(items) e
     group by 1
     order by 1 -- deterministic lock order prevents deadlocks
  loop
    if v_line.quantity is null or v_line.quantity < 1 or v_line.quantity > 20 then
      raise exception 'INVALID_QUANTITY' using errcode = 'P0001';
    end if;

    select * into v_product
      from public.products p
     where p.id = v_line.product_id and p.is_active
       for update;

    if not found then
      raise exception 'PRODUCT_UNAVAILABLE' using errcode = 'P0001';
    end if;

    if v_product.stock < v_line.quantity then
      raise exception 'OUT_OF_STOCK:%', v_product.name using errcode = 'P0001';
    end if;

    update public.products set stock = stock - v_line.quantity where id = v_product.id;

    insert into public.order_items (order_id, product_id, product_name, product_slug, unit_price_cents, quantity)
    values (v_order_id, v_product.id, v_product.name, v_product.slug, v_product.price_cents, v_line.quantity);

    v_subtotal := v_subtotal + v_product.price_cents * v_line.quantity;
  end loop;

  v_shipping := case when v_subtotal >= c_free_shipping_threshold then 0 else c_shipping_flat end;

  update public.orders
     set subtotal_cents = v_subtotal,
         shipping_cents = v_shipping,
         total_cents    = v_subtotal + v_shipping
   where id = v_order_id;

  insert into public.order_events (order_id, status) values (v_order_id, 'pending');

  return jsonb_build_object('reference', v_reference, 'total_cents', v_subtotal + v_shipping);
end;
$$;

revoke all on function public.place_order(jsonb, jsonb) from public;
grant execute on function public.place_order(jsonb, jsonb) to anon, authenticated;

revoke all on function public.handle_order_status_change() from public, anon, authenticated;

-- =====================================================================
-- Row-Level Security
-- =====================================================================
alter table public.admins                 enable row level security;
alter table public.products               enable row level security;
alter table public.orders                 enable row level security;
alter table public.order_items            enable row level security;
alter table public.order_events           enable row level security;
alter table public.newsletter_subscribers enable row level security;

-- Defense in depth: the public role gets no direct privileges on private tables.
revoke all on public.admins, public.orders, public.order_items, public.order_events from anon;
revoke all on public.newsletter_subscribers from anon;
grant insert on public.newsletter_subscribers to anon;
grant select on public.products to anon;
revoke insert, update, delete, truncate on public.products from anon;

-- admins: a signed-in user may only see their own membership row. No write policy.
create policy "admins: read own row"
  on public.admins for select to authenticated
  using (user_id = (select auth.uid()));

-- products: everyone reads active items; admins read everything and write.
create policy "products: public read active"
  on public.products for select to anon, authenticated
  using (is_active or (select public.is_admin()));

create policy "products: admin insert"
  on public.products for insert to authenticated
  with check ((select public.is_admin()));

create policy "products: admin update"
  on public.products for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "products: admin delete"
  on public.products for delete to authenticated
  using ((select public.is_admin()));

-- orders: admins only. Customers create orders exclusively through place_order().
create policy "orders: admin read"
  on public.orders for select to authenticated
  using ((select public.is_admin()));

create policy "orders: admin update"
  on public.orders for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "order_items: admin read"
  on public.order_items for select to authenticated
  using ((select public.is_admin()));

create policy "order_events: admin read"
  on public.order_events for select to authenticated
  using ((select public.is_admin()));

-- newsletter: anyone may subscribe; only admins read the list.
create policy "newsletter: public subscribe"
  on public.newsletter_subscribers for insert to anon, authenticated
  with check (true);

create policy "newsletter: admin read"
  on public.newsletter_subscribers for select to authenticated
  using ((select public.is_admin()));

-- =====================================================================
-- Storage: public product images, writable by admins only
-- =====================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 5242880,
        array['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Public buckets serve files by URL without a SELECT policy, so listing stays private.
create policy "product-images: admin read"
  on storage.objects for select to authenticated
  using (bucket_id = 'product-images' and (select public.is_admin()));

create policy "product-images: admin insert"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'product-images' and (select public.is_admin()));

create policy "product-images: admin update"
  on storage.objects for update to authenticated
  using (bucket_id = 'product-images' and (select public.is_admin()))
  with check (bucket_id = 'product-images' and (select public.is_admin()));

create policy "product-images: admin delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'product-images' and (select public.is_admin()));
