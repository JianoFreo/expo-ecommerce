import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { productApi, unwrapProducts } from "../lib/api";
import { formatMoney } from "../lib/format";
import { buildCategoryList, filterProducts } from "../lib/productFilters";
import { queryKeys } from "../lib/queryKeys";

export default function BuyerHome() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const { data: products = [], isLoading } = useQuery({
    queryKey: queryKeys.productsCatalog,
    queryFn: async () => unwrapProducts(await productApi.listCatalog()),
  });

  const categories = useMemo(() => buildCategoryList(products), [products]);
  const filtered = useMemo(
    () => filterProducts(products, { query, category: activeCategory }),
    [products, query, activeCategory],
  );

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] bg-gradient-to-br from-[#ff6b6b] via-[#ff8f4c] to-[#ffb347] p-6 text-white">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/80">Shop</p>
        <h1 className="mt-2 text-3xl font-black">Browse products</h1>
        <p className="mt-2 text-sm text-white/85">Read-only catalog from GET /products</p>
      </section>

      <section className="rounded-[24px] border border-white/10 bg-[#111318] p-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products"
          className="input w-full"
        />
        <div className="mt-4 flex gap-2 overflow-x-auto">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              className={`rounded-full px-4 py-2 text-sm ${activeCategory === category ? "bg-white text-slate-900" : "bg-white/10"}`}
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      {isLoading ? (
        <div className="text-muted">Loading…</div>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {filtered.map((product) => (
            <article key={product._id} className="rounded-[24px] border border-white/10 bg-[#111318] p-3">
              {product.images?.[0] ? (
                <img src={product.images[0]} alt={product.name} className="mb-2 aspect-square w-full rounded-2xl object-cover" />
              ) : null}
              <h3 className="truncate font-bold">{product.name}</h3>
              <p className="text-sm text-emerald-300">{formatMoney(product.price)}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
