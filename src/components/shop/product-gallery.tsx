"use client";

import Image from "next/image";
import { useState } from "react";
import { productImageUrl } from "@/lib/storage";
import type { Category, Material } from "@/lib/types";
import { ProductArt } from "./product-art";

export function ProductGallery({
  name,
  images,
  category,
  material,
  slug,
}: {
  name: string;
  images: string[];
  category: Category;
  material: Material;
  slug: string;
}) {
  const [active, setActive] = useState(0);
  const current = images[active];

  return (
    <div className="flex flex-col-reverse gap-4 sm:flex-row">
      {images.length > 1 && (
        <ul className="flex gap-3 sm:flex-col" aria-label="Miniatures">
          {images.map((img, i) => (
            <li key={img}>
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Voir l'image ${i + 1} sur ${images.length}`}
                aria-current={i === active}
                className={`relative block size-16 overflow-hidden rounded-md bg-sand ring-offset-2 ring-offset-cream transition sm:size-20 ${i === active ? "ring-1 ring-ink" : "opacity-70 hover:opacity-100"}`}
              >
                <Image src={productImageUrl(img)} alt="" fill sizes="80px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="relative aspect-square flex-1 overflow-hidden rounded-(--radius-card) bg-sand">
        {current ? (
          <Image
            src={productImageUrl(current)}
            alt={images.length > 1 ? `${name} — vue ${active + 1}` : name}
            fill
            priority
            sizes="(min-width: 1024px) 55vw, 100vw"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-ink" role="img" aria-label={name}>
            <ProductArt category={category} material={material} slug={slug} className="w-2/5" />
          </div>
        )}
      </div>
    </div>
  );
}
