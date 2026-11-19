import { statusLabel, type OrderStatus } from "@/lib/types";

const STYLES: Record<OrderStatus, string> = {
  pending: "bg-terracotta/20 text-terracotta-deep",
  confirmed: "bg-sage/30 text-ink",
  preparing: "bg-[#e7dcc4] text-[#6b5524]",
  shipped: "bg-[#d9e3ea] text-[#2e4a5e]",
  delivered: "bg-success/15 text-success",
  cancelled: "bg-line text-muted line-through",
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${STYLES[status]}`}>
      {statusLabel(status)}
    </span>
  );
}
