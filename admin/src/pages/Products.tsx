import React, { useEffect, useState } from "react";
import axios from "../shared";
import type { Product } from "../shared/types";

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<{ name: string; price: string; description: string; images: Array<any> }>({ name: "", price: "", description: "", images: [] });

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
    setForm({ name: "", price: "", description: "", images: [] });
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({ name: p.name, price: String(p.price), description: p.description || "" });
  };

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("price", String(Number(form.price)));
      fd.append("description", form.description);
      // append files if provided
      form.images?.forEach((img: any, idx: number) => {
        if (img.file) {
          fd.append("images", img.file, img.name || img.file.name);
        }
      });

      if (editing) {
        await axios.put(`/products/${editing.id}`, fd, { headers: { "Content-Type": "multipart/form-data" } });
      } else {
        await axios.post(`/products`, fd, { headers: { "Content-Type": "multipart/form-data" } });
      }
      await fetch();
      setEditing(null);
      setForm({ name: "", price: "", description: "", images: [] });
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

  const onFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const arr = Array.from(files).slice(0, 3).map((f) => ({ file: f, preview: URL.createObjectURL(f), name: f.name, type: f.type }));
    setForm((s) => ({ ...s, images: [...(s.images || []).slice(0, 3 - arr.length), ...arr] }));
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
          <label className="block mb-2">Images (max 3)</label>
          <input type="file" accept="image/*" multiple onChange={onFilesChange} />
          <div className="flex gap-2 mt-2">
            {(form.images || []).map((img: any, idx: number) => (
              <img key={idx} src={img.preview || img.uri} alt={img.name || idx} className="w-20 h-20 object-cover rounded" />
            ))}
          </div>
        </div>
        <div className="mt-3">
          <button className="btn btn-success" type="submit">{editing ? "Save" : "Create"}</button>
          {editing && (
            <button type="button" className="btn ml-2" onClick={() => { setEditing(null); setForm({ name: "", price: "", description: "", images: [] }); }}>
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
