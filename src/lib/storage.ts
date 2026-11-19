export const PRODUCT_IMAGES_BUCKET = "product-images";
export const MAX_IMAGES = 8;
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

/** Products store storage object paths; this builds the public CDN URL. */
export function productImageUrl(path: string) {
  if (/^https?:\/\//.test(path)) return path;
  // Files shipped in /public (e.g. "/products/bague.jpg") are served as-is.
  if (path.startsWith("/")) return path;
  const base = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/\/$/, "");
  return `${base}/storage/v1/object/public/${PRODUCT_IMAGES_BUCKET}/${path
    .split("/")
    .map(encodeURIComponent)
    .join("/")}`;
}
