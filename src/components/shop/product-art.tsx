import type { Category, Material } from "@/lib/types";

/**
 * Fine line-art illustration used when a product has no photo yet,
 * matching the drawn jewelry of the design reference.
 */
export function ProductArt({
  category,
  material,
  slug,
  className,
}: {
  category: Category;
  material: Material;
  slug: string;
  className?: string;
}) {
  const variant = [...slug].reduce((n, c) => n + c.charCodeAt(0), 0) % 2;
  const stroke = "currentColor";

  let shape: React.ReactNode;
  switch (category) {
    case "bagues":
      shape = (
        <>
          <circle cx="60" cy="68" r="20" />
          {variant === 0 ? <circle cx="60" cy="44" r="5" /> : <path d="M54 48 60 38l6 10-6 4z" />}
        </>
      );
      break;
    case "colliers":
      shape =
        material === "perles" || variant === 0 ? (
          <>
            <path d="M38 30c0 22 8 34 22 34s22-12 22-34" />
            <circle cx="60" cy="70" r="6" />
          </>
        ) : (
          <>
            <path d="M38 30c0 22 8 34 22 34s22-12 22-34" />
            <path d="M54 66h12l-6 12z" />
          </>
        );
      break;
    case "boucles-oreilles":
      shape =
        variant === 0 ? (
          <>
            <circle cx="49" cy="62" r="12" />
            <circle cx="71" cy="62" r="12" />
            <circle cx="49" cy="50" r="1.5" />
            <circle cx="71" cy="50" r="1.5" />
          </>
        ) : (
          <>
            <circle cx="50" cy="42" r="3" />
            <circle cx="70" cy="42" r="3" />
            <path d="M50 46c-5 8-5 20 0 30 5-10 5-22 0-30z" />
            <path d="M70 46c-5 8-5 20 0 30 5-10 5-22 0-30z" />
          </>
        );
      break;
    case "bracelets":
      shape = (
        <>
          <ellipse cx="60" cy="62" rx="26" ry="14" />
          <ellipse cx="60" cy="62" rx="21" ry="10" opacity="0.6" />
          <circle cx="60" cy="48" r="2" />
        </>
      );
      break;
  }

  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      stroke={stroke}
      strokeWidth="1.1"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {shape}
    </svg>
  );
}
