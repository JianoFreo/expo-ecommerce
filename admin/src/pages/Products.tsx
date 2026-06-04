import React, { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { productApi, unwrapProducts } from "../lib/api";
import { formatMoney } from "../lib/format";
import { buildCategoryList, filterProducts } from "../lib/productFilters";
import { queryKeys } from "../lib/queryKeys";
import type { Product } from "../shared/types";

type ProductForm = {
  name: string;
  price: string;
  description: string;
  stock: string;
  category: string;
  images: Array<{ file?: File; preview: string; name: string }>;
};

const emptyForm: ProductForm = {
  name: "",
  price: "",
  description: "",
  stock: "1",
  category: "General",
  images: [],
};

export default function Products() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const { data: products = [], isLoading } = useQuery({
    queryKey: queryKeys.productsAdmin,
    queryFn: async () => unwrapProducts(await productApi.listAdmin()),
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("price", form.price);
      fd.append("description", form.description);
      fd.append("stock", form.stock);
      fd.append("category", form.category);
      form.images.forEach((image) => {
        if (image.file) fd.append("images", image.file, image.name || image.file.name);
      });
      if (editing) return productApi.update(editing._id, fd);
      return productApi.create(fd);
    },
    onSuccess: () => {
      setEditing(null);
      setForm(emptyForm);
      queryClient.invalidateQueries({ queryKey: queryKeys.productsAdmin });
      queryClient.invalidateQueries({ queryKey: queryKeys.productsCatalog });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.productsAdmin });
      queryClient.invalidateQueries({ queryKey: queryKeys.productsCatalog });
    },
  });

  const categories = useMemo(() => buildCategoryList(products), [products]);
  const filteredProducts = useMemo(
    () => filterProducts(products, { query, category: activeCategory }),
    [products, query, activeCategory],
  );

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
  };

  const openEdit = (product: Product) => {
    setEditing(product);
    setForm({
      name: product.name,
      price: String(product.price ?? ""),
      description: product.description || "",
      stock: String(product.stock ?? 1),
      category: product.category || "General",
      images: (product.images || []).slice(0, 3).map((image, index) => ({
        preview: image,
        name: `${product.name}-${index + 1}`,
      })),
    });
  };

  const onFilesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []).slice(0, 3);
    if (!files.length) return;
    setForm((current) => ({
      ...current,
      images: files.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
        name: file.name,
      })),
    }));
  };

  const remove = async (product: Product) => {
    if (!confirm("Delete this product?")) return;
    deleteMutation.mutate(product._id);
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] bg-gradient-to-br from-[#ff6b6b] via-[#ff8f4c] to-[#ffb347] p-6 text-white shadow-[0_20px_60px_rgba(255,120,64,0.28)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/80">Catalog</p>
            <h1 className="mt-2 text-3xl font-black leading-tight">Products</h1>
            <p className="mt-2 max-w-xl text-sm text-white/85">Admin CRUD via /admin/products — synced over Socket.io.</p>
          </div>
          <button type="button" onClick={openCreate} className="rounded-2xl bg-white px-4 py-3 text-sm font-bold text-slate-900">
            New Product
          </button>
        </div>
      </section>

      <section className="rounded-[24px] border border-black/5 bg-white p-4 shadow-sm">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search products"
          className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-orange-400"
        />
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${
                activeCategory === category ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          saveMutation.mutate();
        }}
        className="rounded-[24px] border border-black/5 bg-white p-5 shadow-sm"
      >
        <h2 className="text-lg font-bold text-slate-900">{editing ? "Edit Product" : "Create Product"}</h2>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <input value={form.name} onChange={(e) => setForm((c) => ({ ...c, name: e.target.value }))} placeholder="Product name" className="input" />
          <input value={form.price} onChange={(e) => setForm((c) => ({ ...c, price: e.target.value }))} placeholder="Price" className="input" />
          <input value={form.stock} onChange={(e) => setForm((c) => ({ ...c, stock: e.target.value }))} placeholder="Stock" className="input" />
          <input value={form.category} onChange={(e) => setForm((c) => ({ ...c, category: e.target.value }))} placeholder="Category" className="input" />
        </div>
        <textarea value={form.description} onChange={(e) => setForm((c) => ({ ...c, description: e.target.value }))} placeholder="Description" className="textarea mt-3 w-full" />
        <input type="file" accept="image/*" multiple onChange={onFilesChange} className="mt-4 block w-full text-sm" />
        <button type="submit" disabled={saveMutation.isPending} className="btn btn-primary mt-4">
          {saveMutation.isPending ? "Saving…" : editing ? "Update" : "Create"}
        </button>
      </form>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {isLoading ? (
          <div className="col-span-full text-center text-slate-500">Loading…</div>
        ) : (
          filteredProducts.map((product) => (
            <article key={product._id} className="overflow-hidden rounded-[24px] border border-white/10 bg-[#111318]">
              {product.images?.[0] ? (
                <img src={product.images[0]} alt={product.name} className="aspect-square w-full object-cover" />
              ) : null}
              <div className="p-3">
                <h3 className="truncate text-sm font-bold text-white">{product.name}</h3>
                <p className="text-xs text-emerald-300">{formatMoney(product.price)}</p>
                <div className="mt-2 flex gap-2">
                  <button type="button" className="btn btn-xs" onClick={() => openEdit(product)}>Edit</button>
                  <button type="button" className="btn btn-xs btn-error" onClick={() => remove(product)}>Delete</button>
                </div>
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  );
}
