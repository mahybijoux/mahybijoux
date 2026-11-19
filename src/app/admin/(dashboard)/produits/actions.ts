"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/format";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGES,
  MAX_IMAGE_BYTES,
  PRODUCT_IMAGES_BUCKET,
} from "@/lib/storage";
import { BADGES, CATEGORIES, MATERIALS } from "@/lib/types";

export type ProductFormState = {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: Partial<Record<string, string>>;
};

const values = <T extends readonly { value: string }[]>(list: T) =>
  list.map((x) => x.value) as unknown as [T[number]["value"], ...T[number]["value"][]];

const productSchema = z.object({
  name: z.string().trim().min(1, "Nom requis.").max(120),
  slug: z
    .string()
    .trim()
    .max(120)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Uniquement minuscules, chiffres et tirets (ex. bague-aube-or-18k)."),
  category: z.enum(values(CATEGORIES), "Catégorie invalide."),
  material: z.enum(values(MATERIALS), "Matière invalide."),
  material_label: z.string().trim().max(160),
  description: z.string().trim().max(4000),
  details: z.array(z.string().trim().min(1).max(200)).max(20, "20 lignes maximum."),
  price_cents: z.number().int().min(0, "Prix invalide.").max(10_000_000, "Prix trop élevé."),
  stock: z.number().int().min(0, "Stock invalide.").max(100_000),
  is_active: z.boolean(),
  is_featured: z.boolean(),
  is_unique_piece: z.boolean(),
  badge: z.enum(values(BADGES)).nullable(),
});

function parseEuros(raw: string) {
  const normalized = raw.replace(/\s/g, "").replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return Number.NaN;
  return Math.round(Number.parseFloat(normalized) * 100);
}

function readProduct(formData: FormData) {
  const name = String(formData.get("name") ?? "");
  const slugInput = String(formData.get("slug") ?? "").trim();
  const badge = String(formData.get("badge") ?? "");
  return productSchema.safeParse({
    name,
    slug: slugInput || slugify(name),
    category: formData.get("category"),
    material: formData.get("material"),
    material_label: String(formData.get("material_label") ?? ""),
    description: String(formData.get("description") ?? ""),
    details: String(formData.get("details") ?? "")
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean),
    price_cents: parseEuros(String(formData.get("price") ?? "")),
    stock: Number.parseInt(String(formData.get("stock") ?? ""), 10),
    is_active: formData.get("is_active") === "on",
    is_featured: formData.get("is_featured") === "on",
    is_unique_piece: formData.get("is_unique_piece") === "on",
    badge: badge === "" ? null : badge,
  });
}

function fieldErrorsOf(error: z.ZodError) {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    out[key] ??= issue.message;
  }
  return out;
}

function newFiles(formData: FormData) {
  return formData.getAll("new_images").filter((f): f is File => f instanceof File && f.size > 0);
}

function validateFiles(files: File[], existingCount: number): string | null {
  if (existingCount + files.length > MAX_IMAGES) return `${MAX_IMAGES} images maximum par bijou.`;
  for (const f of files) {
    if (!ALLOWED_IMAGE_TYPES[f.type]) return `« ${f.name} » : format non accepté (JPEG, PNG, WebP ou AVIF).`;
    if (f.size > MAX_IMAGE_BYTES) return `« ${f.name} » dépasse 5 Mo.`;
  }
  return null;
}

type AdminClient = Awaited<ReturnType<typeof requireAdmin>>["supabase"];

async function uploadImages(supabase: AdminClient, productId: string, files: File[]) {
  const paths: string[] = [];
  for (const file of files) {
    const ext = ALLOWED_IMAGE_TYPES[file.type];
    const path = `${productId}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage
      .from(PRODUCT_IMAGES_BUCKET)
      .upload(path, file, { contentType: file.type, cacheControl: "31536000", upsert: false });
    if (error) {
      if (paths.length) await supabase.storage.from(PRODUCT_IMAGES_BUCKET).remove(paths);
      throw new Error(`Envoi de « ${file.name} » impossible : ${error.message}`);
    }
    paths.push(path);
  }
  return paths;
}

function revalidateShop(slugs: string[]) {
  revalidatePath("/", "layout"); // home, collections, sitemap
  for (const slug of slugs) revalidatePath(`/produits/${slug}`);
}

function dbErrorMessage(error: { code?: string; message: string }) {
  if (error.code === "23505") return { fieldErrors: { slug: "Cette adresse (slug) est déjà utilisée." } };
  if (error.code === "23514") return { message: "Une valeur ne respecte pas les contraintes (longueur, format)." };
  return { message: "L'enregistrement a échoué. Réessayez." };
}

export async function createProduct(_prev: ProductFormState, formData: FormData): Promise<ProductFormState> {
  const { supabase } = await requireAdmin();

  const parsed = readProduct(formData);
  if (!parsed.success) {
    return { status: "error", message: "Certains champs sont à corriger.", fieldErrors: fieldErrorsOf(parsed.error) };
  }

  const files = newFiles(formData);
  const fileError = validateFiles(files, 0);
  if (fileError) return { status: "error", message: fileError, fieldErrors: { images: fileError } };

  const { data, error } = await supabase.from("products").insert(parsed.data).select("id, slug").single();
  if (error || !data) {
    return { status: "error", ...(error ? dbErrorMessage(error) : { message: "Création impossible." }) };
  }

  if (files.length) {
    try {
      const paths = await uploadImages(supabase, data.id, files);
      const { error: updError } = await supabase.from("products").update({ images: paths }).eq("id", data.id);
      if (updError) throw new Error(updError.message);
    } catch (e) {
      revalidateShop([data.slug]);
      return {
        status: "error",
        message: `Bijou créé, mais les images n'ont pas pu être ajoutées : ${(e as Error).message}. Modifiez-le pour réessayer.`,
      };
    }
  }

  revalidateShop([data.slug]);
  redirect(`/admin/produits/${data.id}?enregistre=1`);
}

export async function updateProduct(_prev: ProductFormState, formData: FormData): Promise<ProductFormState> {
  const { supabase } = await requireAdmin();

  const id = z.uuid().safeParse(formData.get("id"));
  if (!id.success) return { status: "error", message: "Produit introuvable." };

  const parsed = readProduct(formData);
  if (!parsed.success) {
    return { status: "error", message: "Certains champs sont à corriger.", fieldErrors: fieldErrorsOf(parsed.error) };
  }

  const { data: current, error: readError } = await supabase
    .from("products")
    .select("id, slug, images")
    .eq("id", id.data)
    .maybeSingle();
  if (readError || !current) return { status: "error", message: "Produit introuvable." };

  // Only keep paths that really belong to this product (ignore anything forged in the form).
  const currentImages = current.images as string[];
  const kept = formData
    .getAll("keep_images")
    .map(String)
    .filter((p) => currentImages.includes(p));
  const removed = currentImages.filter((p) => !kept.includes(p));

  const files = newFiles(formData);
  const fileError = validateFiles(files, kept.length);
  if (fileError) return { status: "error", message: fileError, fieldErrors: { images: fileError } };

  let uploaded: string[] = [];
  try {
    uploaded = await uploadImages(supabase, id.data, files);
  } catch (e) {
    return { status: "error", message: (e as Error).message };
  }

  const { error } = await supabase
    .from("products")
    .update({ ...parsed.data, images: [...kept, ...uploaded] })
    .eq("id", id.data);

  if (error) {
    if (uploaded.length) await supabase.storage.from(PRODUCT_IMAGES_BUCKET).remove(uploaded);
    return { status: "error", ...dbErrorMessage(error) };
  }

  if (removed.length) {
    const { error: rmError } = await supabase.storage.from(PRODUCT_IMAGES_BUCKET).remove(removed);
    if (rmError) console.error("[admin] image cleanup failed", rmError);
  }

  revalidateShop([current.slug as string, parsed.data.slug]);
  redirect(`/admin/produits/${id.data}?enregistre=1`);
}

export async function deleteProduct(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = z.uuid().safeParse(formData.get("id"));
  if (!id.success) redirect("/admin/produits");

  const { data: current } = await supabase.from("products").select("slug, images").eq("id", id.data).maybeSingle();
  if (!current) redirect("/admin/produits");

  // Past orders keep their line (name + price snapshot); product_id becomes null.
  const { error } = await supabase.from("products").delete().eq("id", id.data);
  if (error) {
    console.error("[admin] delete product failed", error);
    redirect(`/admin/produits/${id.data}?erreur=suppression`);
  }

  const images = (current.images as string[]) ?? [];
  if (images.length) await supabase.storage.from(PRODUCT_IMAGES_BUCKET).remove(images);

  revalidateShop([current.slug as string]);
  redirect("/admin/produits?supprime=1");
}
