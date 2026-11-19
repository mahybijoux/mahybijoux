-- Starter catalog (the six pieces from the design reference).
-- Edit or delete them later from /admin/produits. Images can be uploaded there;
-- until then the storefront shows a line-art illustration.

insert into public.products
  (slug, name, category, material, material_label, description, details, price_cents, stock, is_featured, is_unique_piece, badge)
values
  ('bague-aube-or-jaune-18k', 'Bague Aube', 'bagues', 'or-18k', 'Or jaune 18 ct · saphir blanc',
   'Un anneau fin en or jaune recyclé surmonté d''un saphir blanc serti clos. Une lumière douce, pensée pour être portée chaque jour.',
   array['Or jaune 18 carats recyclé', 'Saphir blanc 3 mm, serti clos', 'Largeur de l''anneau : 1,6 mm', 'Fabriquée à la commande en 3 semaines'],
   29000, 6, true, false, 'nouveau'),

  ('collier-perle-de-lune-argent-925', 'Collier Perle de Lune', 'colliers', 'perles', 'Argent 925 · perle d''eau douce',
   'Une perle d''eau douce baroque suspendue à une chaîne forçat en argent massif. Chaque perle est unique par sa forme et son orient.',
   array['Argent 925 recyclé', 'Perle d''eau douce 7–8 mm', 'Chaîne réglable 40 / 42 / 45 cm', 'Fermoir mousqueton'],
   14500, 12, true, false, null),

  ('creoles-halo-vermeil', 'Créoles Halo', 'boucles-oreilles', 'vermeil', 'Vermeil · finition polie',
   'Des créoles légères au profil arrondi, en argent massif recouvert d''une épaisse couche d''or. Un classique à porter seul ou en accumulation.',
   array['Vermeil : argent 925 + or 18 ct (3 microns)', 'Diamètre : 14 mm', 'Fermeture charnière', 'Vendues par paire'],
   9500, 20, true, false, 'best-seller'),

  ('jonc-ligne-or-rose-18k', 'Jonc Ligne', 'bracelets', 'or-18k', 'Or rose 18 ct · gravable',
   'Un jonc ouvert, fin et graphique, en or rose massif. Il peut être gravé à l''intérieur d''un prénom ou d''une date.',
   array['Or rose 18 carats recyclé', 'Section : 2 mm', 'Gravure intérieure offerte (15 caractères)', 'Tailles S, M, L'],
   42000, 4, true, false, null),

  ('pendentif-goutte-or-jaune-18k', 'Pendentif Goutte', 'colliers', 'or-18k', 'Or jaune 18 ct',
   'Une goutte facettée en or massif, montée sur une chaîne vénitienne délicate.',
   array['Or jaune 18 carats recyclé', 'Pendentif : 8 × 5 mm', 'Chaîne 42 cm avec anneau de rappel à 40 cm'],
   26000, 5, true, false, null),

  ('pendants-rosee-pierre-de-lune', 'Pendants Rosée', 'boucles-oreilles', 'pierres-naturelles', 'Argent 925 · pierre de lune',
   'Deux navettes de pierre de lune à l''éclat bleuté, serties à la main sur des crochets en argent massif. Pièce unique de l''atelier.',
   array['Argent 925 recyclé', 'Pierres de lune naturelles, taille navette', 'Hauteur totale : 32 mm', 'Pièce unique'],
   12000, 1, true, true, 'nouveau')
on conflict (slug) do nothing;
