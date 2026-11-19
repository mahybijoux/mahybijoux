import Image from "next/image";
import { productImageUrl } from "@/lib/storage";
import type { Category, Material } from "@/lib/types";
import { ProductArt } from "./product-art";

export function ProductVisual({
  name,
  image,
  category,
  material,
  slug,
  sizes,
  priority,
  artClassName = "w-1/2",
}: {
  name: string;
  image: string | null | undefined;
  category: Category;
  material: Material;
  slug: string;
  sizes: string;
  priority?: boolean;
  artClassName?: string;
}) {
  if (image) {
    return (
      <Image
        src={productImageUrl(image)}
        alt={name}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover transition-transform duration-700 ease-(--ease-soft) group-hover:scale-[1.03]"
      />
    );
  }
  return (
    <div className="absolute inset-0 flex items-center justify-center text-ink" role="img" aria-label={name}>
      <ProductArt category={category} material={material} slug={slug} className={artClassName} />
    </div>
  );
}
