import React, { useEffect, useMemo, useState } from "react";
import axios from "../shared";
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

function money(value: number | string | undefined) {
  const numeric = typeof value === "number" ? value : Number(value || 0);
  return `$${numeric.toFixed(2)}`;
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/products");
      setProducts(Array.isArray(res.data) ? res.data : res.data?.products || []);
    } catch (error) {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((product) => {
      if (product.category) set.add(product.category);
    });
    return ["All", ...Array.from(set)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory = activeCategory === "All" || product.category === activeCategory;
      const haystack = `${product.name} ${product.description || ""} ${product.category || ""}`.toLowerCase();
      const matchesQuery = !query.trim() || haystack.includes(query.toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [products, query, activeCategory]);

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
      images: (product.images || []).slice(0, 3).map((image, index) => ({ preview: image, name: `${product.name}-${index + 1}` })),
    });
  };

  const onFilesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []).slice(0, 3);
    if (!files.length) return;

    const nextImages = files.map((file) => ({ file, preview: URL.createObjectURL(file), name: file.name }));
    setForm((current) => ({
      ...current,
      images: nextImages,
    }));
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);

    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("price", form.price);
      fd.append("description", form.description);
      fd.append("stock", form.stock);
      fd.append("category", form.category);
      form.images.forEach((image) => {
        if (image.file) {
          fd.append("images", image.file, image.name || image.file.name);
        }
      });

      if (editing) {
        await axios.put(`/products/${editing.id || editing._id}`, fd, { headers: { "Content-Type": "multipart/form-data" } });
      } else {
        await axios.post("/products", fd, { headers: { "Content-Type": "multipart/form-data" } });
      }

      setEditing(null);
      setForm(emptyForm);
      await loadProducts();
    } catch (error) {
      console.error(error);
      alert("Could not save product");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (product: Product) => {
    const id = product.id || product._id;
    if (!id) return;
    if (!confirm("Delete this product?")) return;

    try {
      await axios.delete(`/products/${id}`);
      setProducts((current) => current.filter((item) => (item.id || item._id) !== id));
    } catch (error) {
      alert("Could not delete product");
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] bg-gradient-to-br from-[#ff6b6b] via-[#ff8f4c] to-[#ffb347] p-6 text-white shadow-[0_20px_60px_rgba(255,120,64,0.28)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/80">Catalog</p>
            <h1 className="mt-2 text-3xl font-black leading-tight">Products</h1>
            <p className="mt-2 max-w-xl text-sm text-white/85">Manage inventory, prices, and product images from a cleaner mobile-style interface.</p>
          </div>
          <button onClick={openCreate} className="rounded-2xl bg-white px-4 py-3 text-sm font-bold text-slate-900 shadow-lg shadow-black/10 active:scale-[0.98]">
            New Product
          </button>
        </div>
      </section>

      <section className="rounded-[24px] border border-black/5 bg-white p-4 shadow-sm">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search products"
          className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-orange-400"
        />
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {categories.map((category) => {
            const active = activeCategory === category;
            return (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${active ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600"}`}
              >
                {category}
              </button>
            );
          })}
        </div>
      </section>

      <form onSubmit={submit} className="rounded-[24px] border border-black/5 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{editing ? "Edit Product" : "Create Product"}</h2>
            <p className="text-sm text-slate-500">Add one to three images just like the mobile product form.</p>
          </div>
          {editing ? (
            <button type="button" onClick={openCreate} className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
              Reset
            </button>
          ) : null}
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="Product name" className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 outline-none focus:border-orange-400" />
          <input value={form.price} onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))} placeholder="Price" className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 outline-none focus:border-orange-400" />
          <input value={form.stock} onChange={(event) => setForm((current) => ({ ...current, stock: event.target.value }))} placeholder="Stock" className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 outline-none focus:border-orange-400" />
          <input value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))} placeholder="Category" className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 outline-none focus:border-orange-400" />
        </div>

        <textarea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} placeholder="Description" className="mt-3 min-h-28 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none focus:border-orange-400" />

        <div className="mt-4">
          <label className="text-sm font-semibold text-slate-700">Images</label>
          <input type="file" accept="image/*" multiple onChange={onFilesChange} className="mt-2 block w-full text-sm" />
          <div className="mt-3 flex gap-3 overflow-x-auto">
            {form.images.map((image, index) => (
              <img key={`${image.preview}-${index}`} src={image.preview} alt={image.name} className="h-24 w-24 rounded-2xl object-cover" />
            ))}
          </div>
        </div>

        <div className="mt-5 flex gap-3">
          <button type="submit" disabled={saving} className="rounded-full bg-slate-900 px-5 py-3 text-sm font-bold text-white disabled:opacity-60">
            {saving ? "Saving..." : editing ? "Update Product" : "Create Product"}
          </button>
          {editing ? (
            <button type="button" onClick={openCreate} className="rounded-full bg-slate-100 px-5 py-3 text-sm font-bold text-slate-700">
              Cancel
            </button>
          ) : null}
        </div>
      </form>

      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-lg font-bold text-slate-900">Inventory</h2>
          <span className="text-sm text-slate-500">{filteredProducts.length} items</span>
        </div>

        {loading ? (
          <div className="rounded-[24px] border border-black/5 bg-white p-6 text-center text-slate-500 shadow-sm">Loading products...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="rounded-[24px] border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500 shadow-sm">
            No products found.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {filteredProducts.map((product) => {
              const id = product.id || product._id;
              const firstImage = product.images?.[0];
              return (
                <article key={id} className="overflow-hidden rounded-[24px] border border-white/10 bg-[#111318] shadow-sm">
                  <div className="aspect-[1/1] bg-white/5">
                    {firstImage ? <img src={firstImage} alt={product.name} className="h-full w-full object-cover" /> : null}
                  </div>
                  <div className="p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-bold text-white">{product.name}</h3>
                        <p className="mt-1 text-xs text-white/60">{product.category || "General"}</p>
                      </div>
                      <div className="rounded-full bg-emerald-500/15 px-2 py-1 text-xs font-bold text-emerald-300">{money(product.price)}</div>
                    </div>
                    <p className="mt-2 line-clamp-2 text-xs text-white/60">{product.description || "No description provided."}</p>
                    <div className="mt-3 flex gap-2">
                      <button type="button" onClick={() => openEdit(product)} className="rounded-full bg-white px-3 py-2 text-xs font-semibold text-slate-900">
                        Edit
                      </button>
                      <button type="button" onClick={() => remove(product)} className="rounded-full bg-rose-500/15 px-3 py-2 text-xs font-semibold text-rose-300">
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
