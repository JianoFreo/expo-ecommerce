import React, { useEffect, useState } from "react";
import axios from "../shared";
import type { Product } from "../shared/types";

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState({ name: "", price: "", description: "" });

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/products");
      setProducts(res.data || []);
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", price: "", description: "" });
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({ name: p.name, price: String(p.price), description: p.description || "" });
  };

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const payload = { name: form.name, price: Number(form.price), description: form.description } as Partial<Product>;
    try {
      if (editing) {
        await axios.put(`/products/${editing.id}`, payload);
      } else {
        await axios.post(`/products`, payload);
      }
      await fetch();
      setEditing(null);
      setForm({ name: "", price: "", description: "" });
    } catch (err) {
      console.error(err);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete product?")) return;
    try {
      await axios.delete(`/products/${id}`);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (e) {
      // ignore
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Products</h1>
        <div>
          <button className="btn btn-primary" onClick={openCreate}>
            Create Product
          </button>
        </div>
      </div>

      <form onSubmit={submit} className="mt-4 p-4 bg-base-200 rounded">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} placeholder="Name" className="input input-bordered w-full" />
          <input value={form.price} onChange={(e) => setForm((s) => ({ ...s, price: e.target.value }))} placeholder="Price" className="input input-bordered w-full" />
          <input value={form.description} onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))} placeholder="Description" className="input input-bordered w-full" />
        </div>
        <div className="mt-3">
          <button className="btn btn-success" type="submit">{editing ? "Save" : "Create"}</button>
          {editing && (
            <button type="button" className="btn ml-2" onClick={() => { setEditing(null); setForm({ name: "", price: "", description: "" }); }}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="mt-6">
        {loading ? (
          <div>Loading…</div>
        ) : (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((p) => (
              <div key={p.id} className="card p-4 shadow">
                <h3 className="font-semibold">{p.name}</h3>
                <p className="text-sm">${p.price}</p>
                <div className="mt-3 flex gap-2">
                  <button className="btn btn-sm" onClick={() => openEdit(p)}>Edit</button>
                  <button className="btn btn-sm btn-error" onClick={() => remove(p.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
