import Image from "next/image";
import { productImageUrl } from "@/lib/storage";
import { isCategory } from "@/lib/types";
import { ProductArt } from "./product-art";
import type { CartLine } from "./shop-store";

export function LineThumb({ line, size = "size-20" }: { line: Pick<CartLine, "image" | "name" | "category" | "slug">; size?: string }) {
  return (
    <div className={`relative shrink-0 overflow-hidden rounded-lg bg-sand ${size}`}>
      {line.image ? (
        <Image src={productImageUrl(line.image)} alt="" fill sizes="96px" className="object-cover" />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <ProductArt
            category={isCategory(line.category) ? line.category : "bagues"}
            material="or-18k"
            slug={line.slug}
            className="w-3/5"
          />
        </div>
      )}
    </div>
  );
}
