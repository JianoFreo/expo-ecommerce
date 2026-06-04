import React, { useEffect, useState } from "react";
import axios from "../shared";
import type { Product } from "../shared/types";

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    let mounted = true;
    axios
      .get("/products")
      .then((res) => {
        if (mounted) setProducts(res.data || []);
      })
      .catch(() => {})
      .finally(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold">Products</h1>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((p) => (
          <div key={p.id} className="card p-4 shadow">
            <h3 className="font-semibold">{p.name}</h3>
            <p className="text-sm">${p.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
