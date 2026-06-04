import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { productApi, unwrapProducts } from "../lib/api";
import { formatMoney } from "../lib/format";
import { filterProducts } from "../lib/productFilters";
import { queryKeys } from "../lib/queryKeys";

export default function SellerHome() {
  const [query, setQuery] = useState("");

  const { data: products = [], isLoading } = useQuery({
    queryKey: queryKeys.productsCatalog,
    queryFn: async () => unwrapProducts(await productApi.listCatalog()),
  });

  const filtered = useMemo(() => filterProducts(products, { query }), [products, query]);

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] bg-gradient-to-br from-emerald-600 via-teal-500 to-cyan-500 p-6 text-white">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/80">Seller Mode</p>
        <h1 className="mt-2 text-3xl font-black">Your catalog view</h1>
        <p className="mt-2 text-sm text-white/85">Products from GET /products (seller shell)</p>
      </section>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search your products"
        className="input w-full"
      />

      {isLoading ? (
        <div className="text-muted">Loading…</div>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {filtered.map((product) => (
            <article key={product._id} className="rounded-[24px] border border-white/10 bg-[#111318] p-3">
              <h3 className="font-bold">{product.name}</h3>
              <p className="text-sm text-emerald-300">{formatMoney(product.price)}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
