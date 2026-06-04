import React, { useEffect, useMemo, useState } from "react";
import axios from "../shared";
import type { Product } from "../shared/types";

export default function SellerHome() {
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState("");
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

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return products.filter((product) => !term || `${product.name} ${product.description || ""}`.toLowerCase().includes(term));
  }, [products, query]);

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] bg-gradient-to-br from-emerald-600 via-teal-500 to-cyan-500 p-6 text-white shadow-[0_20px_60px_rgba(16,185,129,0.25)]">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/80">Seller Mode</p>
        <h1 className="mt-2 text-3xl font-black leading-tight">Your shop</h1>
        <p className="mt-2 max-w-xl text-sm text-white/85">Seller-only home with product cards and quick access to inventory, matching the mobile seller experience.</p>
      </section>

      <section className="rounded-[24px] border border-white/10 bg-[#101215] p-4 shadow-sm">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search your products"
          className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none focus:border-emerald-400"
        />
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-lg font-bold text-white">Products</h2>
          <span className="text-sm text-white/60">{filtered.length} items</span>
        </div>

        {loading ? (
          <div className="rounded-[24px] border border-white/10 bg-[#101215] p-6 text-center text-white/60 shadow-sm">Loading products...</div>
        ) : filtered.length === 0 ? (
          <div className="rounded-[24px] border border-dashed border-white/15 bg-[#101215] p-8 text-center text-white/60 shadow-sm">No products found.</div>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {filtered.map((product) => (
              <article key={product.id || product._id} className="overflow-hidden rounded-[24px] border border-white/10 bg-[#101215] shadow-sm">
                <div className="aspect-[1/1] bg-white/5">
                  {product.images?.[0] ? <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" /> : null}
                </div>
                <div className="p-3">
                  <h3 className="line-clamp-1 text-sm font-bold text-white">{product.name}</h3>
                  <p className="mt-1 text-xs text-white/60">{product.category || "General"}</p>
                  <div className="mt-3 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-300">${Number(product.price || 0).toFixed(2)}</div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
