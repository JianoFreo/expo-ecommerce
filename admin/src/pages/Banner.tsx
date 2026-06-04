import React, { useEffect, useState } from "react";
import axios from "../shared";

export default function Banner() {
  const [banners, setBanners] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [image, setImage] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const fetch = async () => {
    try {
      const res = await axios.get("/admin/banners");
      setBanners(res.data?.banners || []);
    } catch (e) {}
  };

  useEffect(() => {
    fetch();
  }, []);

  const create = async () => {
    try {
      if (file) {
        const fd = new FormData();
        fd.append("title", title);
        fd.append("image", file, (file as File).name);
        await axios.post("/admin/banners", fd, { headers: { "Content-Type": "multipart/form-data" } });
      } else {
        await axios.post("/admin/banners", { title, image });
      }
      setTitle("");
      setImage("");
      setFile(null);
      fetch();
    } catch (e) {}
  };

  return (
    <div>
      <h1 className="text-2xl font-bold">Banners</h1>
      <div className="mt-4 p-4 bg-base-200 rounded">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="input input-bordered w-full mb-2" />
        <input value={image} onChange={(e) => setImage(e.target.value)} placeholder="Image URL" className="input input-bordered w-full mb-2" />
        <div className="flex gap-2">
          <button className="btn btn-primary" onClick={create}>Create</button>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {banners.map((b) => (
          <div key={b._id || b.id} className="p-3 border rounded flex items-center gap-4">
            {b.image ? <img src={b.image} alt={b.title} className="w-36 h-16 object-cover rounded" /> : null}
            <div>
              <div className="font-semibold">{b.title}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
