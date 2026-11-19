-- TEST CATALOG — replaces the starter jewelry with the pieces from /public/products,
-- priced in Moroccan dirhams (MAD). Run once in Supabase → SQL Editor.
-- To get the original starter pieces back later, run supabase/seed.sql again.

-- 1. Remove the starter jewelry (past orders keep their lines).
delete from public.products
 where slug in ('bague-aube-or-jaune-18k', 'collier-perle-de-lune-argent-925', 'creoles-halo-vermeil',
                'jonc-ligne-or-rose-18k', 'pendentif-goutte-or-jaune-18k', 'pendants-rosee-pierre-de-lune');

-- 2. The six pieces from the photos (prices in MAD centimes: 185000 = 1 850 MAD).
insert into public.products
  (slug, name, category, material, material_label, description, details, price_cents, images, stock,
   is_featured, is_unique_piece, badge)
values
  ('pendentif-goutte-or', 'Pendentif Goutte', 'colliers', 'or-18k', 'Or jaune 18 ct',
   'Une goutte d''or lisse suspendue à une chaîne forçat délicate. Un bijou à porter tous les jours.',
   array['Or jaune 18 carats recyclé', 'Pendentif : 10 × 7 mm', 'Chaîne 42 cm avec anneau de rappel à 40 cm'],
   260000, array['/products/pendentif-goutte-1.jpg'], 5, true, false, 'nouveau'),

  ('bague-vague-or-jaune-18k', 'Bague Vague', 'bagues', 'or-18k', 'Or jaune 18 ct · finition polie',
   'Un anneau ondulé en or massif, pensé pour épouser une bague de fiançailles ou se porter seul.',
   array['Or jaune 18 carats recyclé', 'Largeur : 2 mm', 'Finition polie miroir'],
   185000, array['/products/bague-vague-or.jpg'], 5, true, false, 'nouveau'),

  ('bracelet-trefles-pierres-vertes', 'Bracelet Trèfles', 'bracelets', 'vermeil', 'Vermeil · pierres vertes',
   'Une chaîne fine rythmée de trèfles dorés, de pierres vertes serties clos et de motifs pavés.',
   array['Vermeil : argent 925 + or 18 ct', 'Longueur : 17 cm + 2 cm de rallonge', 'Fermoir mousqueton'],
   135000, array['/products/bracelet-trefles-pierres-vertes.jpg', '/products/bracelet-trefles-porte.jpg'], 8,
   true, false, 'best-seller'),

  ('bracelets-breloques-trefles', 'Bracelets Breloques', 'bracelets', 'vermeil', 'Vermeil · duo à superposer',
   'Deux chaînes fines ornées de breloques trèfles, lisses et pavées, à porter ensemble ou séparément.',
   array['Vermeil : argent 925 + or 18 ct', 'Vendus par deux', 'Longueur réglable 15–18 cm'],
   79000, array['/products/bracelets-breloques-trefles.jpg'], 10, true, false, null),

  ('collier-coeur-argent-925', 'Collier Cœur', 'colliers', 'argent-925', 'Argent 925 · cœur ajouré',
   'Un cœur ajouré glissé sur une chaîne fine en argent massif. Un cadeau simple et durable.',
   array['Argent 925 recyclé', 'Chaîne 42 cm', 'Pendentif : 12 mm'],
   89000, array['/products/collier-coeur-et-bracelet-fleurs-argent.jpg'], 12, true, false, null),

  ('parure-feuillage-or', 'Parure Feuillage', 'colliers', 'vermeil', 'Vermeil · motif feuilles',
   'Collier, jonc, bague et boucles d''oreilles assortis, ciselés comme des feuilles nervurées.',
   array['Vermeil : argent 925 + or 18 ct', 'Parure complète en 5 pièces', 'Pièce unique'],
   490000, array['/products/parure-feuilles-or.jpg'], 1, true, true, null)
on conflict (slug) do nothing;

-- 3. Shipping in MAD: free from 1 500 MAD, otherwise 40 MAD; Morocco is the default country.
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
