import type { Product } from "../shared/types";

export function buildCategoryList(products: Product[]): string[] {
  const categories = new Set<string>();
  products.forEach((product) => {
    if (product.category) categories.add(product.category);
  });
  return ["All", ...Array.from(categories)];
}

export function filterProducts(
  products: Product[],
  options: { query?: string; category?: string } = {},
): Product[] {
  const term = options.query?.trim().toLowerCase() ?? "";
  const category = options.category ?? "All";

  return products.filter((product) => {
    const matchesCategory = category === "All" || product.category === category;
    const haystack = `${product.name} ${product.description ?? ""} ${product.category ?? ""}`.toLowerCase();
    const matchesQuery = !term || haystack.includes(term);
    return matchesCategory && matchesQuery;
  });
}
