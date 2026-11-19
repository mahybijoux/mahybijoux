"use client";

import Image from "next/image";
import { startTransition, useActionState, useRef, useState } from "react";
import { slugify } from "@/lib/format";
import { MAX_IMAGES, productImageUrl } from "@/lib/storage";
import { BADGES, CATEGORIES, MATERIALS, type Product } from "@/lib/types";
import { createProduct, deleteProduct, updateProduct, type ProductFormState } from "./actions";

type Props = { product?: Product };

export function ProductForm({ product }: Props) {
  const isEdit = Boolean(product);
  const [state, formAction, pending] = useActionState<ProductFormState, FormData>(
    isEdit ? updateProduct : createProduct,
    { status: "idle" },
  );
  const errors = state.fieldErrors ?? {};

  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [kept, setKept] = useState<string[]>(product?.images ?? []);
  const [newFiles, setNewFiles] = useState<string[]>([]);
  const fileInput = useRef<HTMLInputElement>(null);

  const fieldId = (n: string) => `product-${n}`;
  const err = (n: string) =>
    errors[n] ? (
      <p id={`${fieldId(n)}-error`} className="field-error">
        {errors[n]}
      </p>
    ) : null;
  const aria = (n: string) =>
    errors[n] ? { "aria-invalid": true as const, "aria-describedby": `${fieldId(n)}-error` } : {};

  return (
    <div className="space-y-8">
      <form
        className="grid gap-8 xl:grid-cols-[1fr_20rem]"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          // Submitting through a transition (instead of the `action` prop) keeps typed values on error.
          startTransition(() => formAction(fd));
        }}
      >
        {product && <input type="hidden" name="id" value={product.id} />}

        <div className="space-y-6 rounded-(--radius-card) border border-line bg-white p-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor={fieldId("name")} className="field-label">
                Nom
              </label>
              <input
                id={fieldId("name")}
                name="name"
                required
                maxLength={120}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!slugTouched) setSlug(slugify(e.target.value));
                }}
                className="field"
                {...aria("name")}
              />
              {err("name")}
            </div>
            <div>
              <label htmlFor={fieldId("slug")} className="field-label">
                Adresse de la page (slug)
              </label>
              <div className="flex items-center rounded-lg border border-line bg-[#fffdf9] pl-3 text-sm text-muted focus-within:border-ink">
                /produits/
                <input
                  id={fieldId("slug")}
                  name="slug"
                  maxLength={120}
                  value={slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    setSlug(e.target.value.toLowerCase());
                  }}
                  className="w-full bg-transparent py-[0.7rem] pr-3 text-ink outline-none"
                  {...aria("slug")}
                />
              </div>
              {err("slug")}
              {isEdit && product?.slug !== slug && (
                <p className="mt-1 text-xs text-terracotta-deep">Changer l&apos;adresse casse les liens déjà partagés.</p>
              )}
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor={fieldId("category")} className="field-label">
                Catégorie
              </label>
              <select id={fieldId("category")} name="category" defaultValue={product?.category ?? "bagues"} className="field">
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
              {err("category")}
            </div>
            <div>
              <label htmlFor={fieldId("material")} className="field-label">
                Matière principale (filtre)
              </label>
              <select id={fieldId("material")} name="material" defaultValue={product?.material ?? "or-18k"} className="field">
                {MATERIALS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
              {err("material")}
            </div>
          </div>

          <div>
            <label htmlFor={fieldId("material_label")} className="field-label">
              Détail matière affiché <span className="font-normal text-muted">(ex. « Or jaune 18 ct · saphir blanc »)</span>
            </label>
            <input
              id={fieldId("material_label")}
              name="material_label"
              maxLength={160}
              defaultValue={product?.material_label}
              className="field"
              {...aria("material_label")}
            />
            {err("material_label")}
          </div>

          <div>
            <label htmlFor={fieldId("description")} className="field-label">
              Description
            </label>
            <textarea
              id={fieldId("description")}
              name="description"
              rows={5}
              maxLength={4000}
              defaultValue={product?.description}
              className="field"
              {...aria("description")}
            />
            {err("description")}
          </div>

          <div>
            <label htmlFor={fieldId("details")} className="field-label">
              Caractéristiques <span className="font-normal text-muted">(une par ligne)</span>
            </label>
            <textarea
              id={fieldId("details")}
              name="details"
              rows={4}
              defaultValue={product?.details.join("\n")}
              className="field text-sm"
              {...aria("details")}
            />
            {err("details")}
          </div>

          <fieldset>
            <legend className="field-label">
              Images <span className="font-normal text-muted">({MAX_IMAGES} max, 5 Mo chacune — la première est l&apos;image principale)</span>
            </legend>
            {product && product.images.length > 0 && (
              <ul className="mt-2 grid grid-cols-3 gap-3 sm:grid-cols-4">
                {product.images.map((path) => {
                  const keep = kept.includes(path);
                  return (
                    <li key={path} className="relative">
                      <label className={`block cursor-pointer overflow-hidden rounded-lg border ${keep ? "border-line" : "border-danger opacity-40"}`}>
                        <span className="relative block aspect-square bg-sand">
                          <Image src={productImageUrl(path)} alt="" fill sizes="160px" className="object-cover" />
                        </span>
                        <span className="flex items-center gap-2 px-2 py-1.5 text-xs">
                          <input
                            type="checkbox"
                            name="keep_images"
                            value={path}
                            checked={keep}
                            onChange={(e) =>
                              setKept((k) => (e.target.checked ? [...k, path] : k.filter((p) => p !== path)))
                            }
                          />
                          {keep ? "Conserver" : "Sera supprimée"}
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            )}
            <input
              ref={fileInput}
              type="file"
              name="new_images"
              multiple
              accept="image/jpeg,image/png,image/webp,image/avif"
              onChange={(e) => setNewFiles(Array.from(e.target.files ?? []).map((f) => f.name))}
              className="mt-3 block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-ink file:px-3 file:py-2 file:text-cream"
              {...aria("images")}
            />
            {newFiles.length > 0 && (
              <p className="mt-1 text-xs text-muted">
                {newFiles.length} nouvelle(s) image(s) ajoutée(s) après les images conservées.
              </p>
            )}
            {err("images")}
          </fieldset>
        </div>

        <aside className="space-y-6">
          <div className="space-y-5 rounded-(--radius-card) border border-line bg-white p-6">
            <div>
              <label htmlFor={fieldId("price")} className="field-label">
                Prix TTC (MAD)
              </label>
              <input
                id={fieldId("price")}
                name="price"
                inputMode="decimal"
                required
                defaultValue={product ? (product.price_cents / 100).toFixed(2).replace(".", ",") : ""}
                placeholder="1850"
                className="field"
                {...aria("price_cents")}
              />
              {err("price_cents")}
            </div>
            <div>
              <label htmlFor={fieldId("stock")} className="field-label">
                Stock disponible
              </label>
              <input
                id={fieldId("stock")}
                name="stock"
                type="number"
                min={0}
                step={1}
                required
                defaultValue={product?.stock ?? 1}
                className="field"
                {...aria("stock")}
              />
              {err("stock")}
            </div>
            <div>
              <label htmlFor={fieldId("badge")} className="field-label">
                Badge
              </label>
              <select id={fieldId("badge")} name="badge" defaultValue={product?.badge ?? ""} className="field">
                <option value="">Aucun</option>
                {BADGES.map((b) => (
                  <option key={b.value} value={b.value}>
                    {b.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-3 text-sm">
              <label className="flex items-center gap-3">
                <input type="checkbox" name="is_active" defaultChecked={product?.is_active ?? true} className="size-4 accent-ink" />
                En ligne (visible sur la boutique)
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" name="is_featured" defaultChecked={product?.is_featured ?? false} className="size-4 accent-ink" />
                Afficher dans « Nos pièces favorites »
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="is_unique_piece"
                  defaultChecked={product?.is_unique_piece ?? false}
                  className="size-4 accent-ink"
                />
                Pièce unique
              </label>
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-full py-3" disabled={pending}>
            {pending ? "Enregistrement…" : isEdit ? "Enregistrer les modifications" : "Créer le bijou"}
          </button>
          {state.message && (
            <p role="status" className={`text-sm ${state.status === "error" ? "text-danger" : "text-success"}`}>
              {state.message}
            </p>
          )}
          {isEdit && product?.is_active && (
            <a href={`/produits/${product.slug}`} target="_blank" className="link-underline block text-center text-sm">
              Voir la page produit ↗
            </a>
          )}
        </aside>
      </form>

      {product && (
        <form
          action={deleteProduct}
          onSubmit={(e) => {
            if (!window.confirm(`Supprimer définitivement « ${product.name} » et ses images ? Les commandes passées sont conservées.`)) {
              e.preventDefault();
            }
          }}
          className="flex flex-wrap items-center justify-between gap-4 rounded-(--radius-card) border border-danger/30 bg-white p-6"
        >
          <input type="hidden" name="id" value={product.id} />
          <div>
            <h2 className="text-lg">Supprimer ce bijou</h2>
            <p className="text-sm text-muted">Pour le retirer temporairement, décochez plutôt « En ligne ».</p>
          </div>
          <button type="submit" className="btn btn-danger">
            Supprimer
          </button>
        </form>
      )}
    </div>
  );
}
