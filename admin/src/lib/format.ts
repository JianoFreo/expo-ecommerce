import type { OrderStatus } from "../shared/types";

export function formatMoney(value: number | string | undefined | null): string {
  const numeric = typeof value === "number" ? value : Number(value ?? 0);
  return `$${numeric.toFixed(2)}`;
}

export function formatDate(dateString?: string | null): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function getOrderStatusBadge(status?: OrderStatus | string): string {
  switch (status?.toLowerCase()) {
    case "delivered":
      return "badge-success";
    case "shipped":
      return "badge-info";
    case "pending":
      return "badge-warning";
    default:
      return "badge-ghost";
  }
}

export function getStockStatusBadge(stock: number): { text: string; class: string } {
  if (stock === 0) return { text: "Out of Stock", class: "badge-error" };
  if (stock < 20) return { text: "Low Stock", class: "badge-warning" };
  return { text: "In Stock", class: "badge-success" };
}
