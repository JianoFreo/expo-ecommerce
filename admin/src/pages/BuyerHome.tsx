import React, { useEffect, useMemo, useState } from "react";
import axios from "../shared";
import type { Product } from "../shared/types";

export default function BuyerHome() {
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    axios
      .get("/products")
      .then((res) => {
        if (!alive) return;
        setProducts(Array.isArray(res.data) ? res.data : res.data?.products || []);
      })
      .catch(() => {
        if (!alive) return;
        setProducts([]);
      })
      .finally(() => {
        if (!alive) return;
        setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, []);

  const categories = useMemo(() => {
    const values = new Set<string>();
    products.forEach((product) => {
      if (product.category) values.add(product.category);
    });
    return ["All", ...Array.from(values)];
  }, [products]);

  const filtered = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory = activeCategory === "All" || product.category === activeCategory;
      const haystack = `${product.name} ${product.description || ""} ${product.category || ""}`.toLowerCase();
      const matchesQuery = !query.trim() || haystack.includes(query.toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [products, query, activeCategory]);

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] bg-gradient-to-br from-[#ff6b6b] via-[#ff8f4c] to-[#ffb347] p-6 text-white shadow-[0_20px_60px_rgba(255,120,64,0.28)]">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/80">Shop</p>
        <h1 className="mt-2 text-3xl font-black leading-tight">Browse products</h1>
        <p className="mt-2 max-w-xl text-sm text-white/85">Buyer-first experience with search and category filters, matching the mobile storefront flow.</p>
      </section>

      <section className="rounded-[24px] border border-white/10 bg-[#111318] p-4 shadow-sm">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search for products"
          className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none focus:border-orange-400"
        />
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {categories.map((category) => {
            const active = activeCategory === category;
            return (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${active ? "bg-white text-slate-900" : "bg-white/10 text-white/70"}`}
              >
                {category}
              </button>
            );
          })}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-lg font-bold text-slate-900">Products</h2>
          <span className="text-sm text-slate-500">{filtered.length} items</span>
        </div>

        {loading ? (
          <div className="rounded-[24px] border border-white/10 bg-[#111318] p-6 text-center text-white/60 shadow-sm">Loading products...</div>
        ) : filtered.length === 0 ? (
          <div className="rounded-[24px] border border-dashed border-white/15 bg-[#111318] p-8 text-center text-white/60 shadow-sm">No products found.</div>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {filtered.map((product) => (
              <article key={product.id || product._id} className="overflow-hidden rounded-[24px] border border-white/10 bg-[#111318] shadow-sm">
                <div className="aspect-[1/1] bg-white/5">
                  {product.images?.[0] ? <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" /> : null}
                </div>
                <div className="p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-bold text-white">{product.name}</h3>
                      <p className="mt-1 text-xs text-white/60">{product.category || "General"}</p>
                    </div>
                    <div className="rounded-full bg-emerald-500/15 px-2 py-1 text-xs font-bold text-emerald-300">${Number(product.price || 0).toFixed(2)}</div>
                  </div>
                  <p className="mt-2 line-clamp-2 text-xs text-white/60">{product.description || "No description provided."}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
