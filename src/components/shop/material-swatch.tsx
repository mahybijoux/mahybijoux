import { materialLabel, type Material } from "@/lib/types";

const COLORS: Record<Material, string> = {
  "or-18k": "#d4ae6a",
  "argent-925": "#c9cbcc",
  vermeil: "#dfb27d",
  perles: "#efe7da",
  "pierres-naturelles": "#a9b9c4",
};

export function MaterialSwatch({ material }: { material: Material }) {
  return (
    <span
      className="inline-block size-3 rounded-full ring-1 ring-ink/15"
      style={{ backgroundColor: COLORS[material] }}
      title={materialLabel(material)}
      aria-hidden="true"
    />
  );
}
