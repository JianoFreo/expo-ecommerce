import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { adminShopApi } from "../lib/api";
import { formatDate } from "../lib/utils";

function ShopsPage() {
  const queryClient = useQueryClient();
  const [editingShop, setEditingShop] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    bannerImage: "",
    isActive: true,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["adminShops"],
    queryFn: adminShopApi.getAll,
  });

  const migrateMutation = useMutation({
    mutationFn: adminShopApi.migrateMagtangobProducts,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminShops"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      alert("Magtangob products migrated to jianofreomagtangob's shop.");
    },
  });

  const updateMutation = useMutation({
    mutationFn: adminShopApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminShops"] });
      setEditingShop(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: adminShopApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminShops"] });
    },
  });

  const shops = data?.shops || [];

  const startEdit = (shop) => {
    setEditingShop(shop);
    setFormData({
      name: shop.name || "",
      description: shop.description || "",
      bannerImage: shop.bannerImage || "",
      isActive: shop.isActive ?? true,
    });
  };

  const submitEdit = () => {
    if (!editingShop) return;
    updateMutation.mutate({ id: editingShop._id, payload: formData });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Shops</h1>
          <p className="text-base-content/70 mt-1">
            Super-admin controls for every seller shop.
          </p>
        </div>

        <button
          className="btn btn-warning"
          type="button"
          onClick={() => migrateMutation.mutate()}
          disabled={migrateMutation.isPending}
        >
          {migrateMutation.isPending ? <span className="loading loading-spinner loading-sm" /> : "Migrate Magtangob Products"}
        </button>
      </div>

      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <span className="loading loading-spinner loading-lg" />
            </div>
          ) : shops.length === 0 ? (
            <div className="text-center py-12 text-base-content/60">
              No shops found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Shop</th>
                    <th>Owner</th>
                    <th>Products</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {shops.map((shop) => (
                    <tr key={shop._id}>
                      <td>
                        <div className="font-semibold">{shop.name}</div>
                        <div className="text-xs opacity-60">{shop.description || "-"}</div>
                      </td>
                      <td>
                        <div>
                          <div className="font-medium">{shop.owner?.name || "-"}</div>
                          <div className="text-xs opacity-60">{shop.owner?.email || "-"}</div>
                        </div>
                      </td>
                      <td>{shop.productCount || 0}</td>
                      <td>
                        <div className={`badge ${shop.isActive ? "badge-success" : "badge-ghost"}`}>
                          {shop.isActive ? "Active" : "Inactive"}
                        </div>
                      </td>
                      <td>{formatDate(shop.createdAt)}</td>
                      <td>
                        <div className="flex gap-2 flex-wrap">
                          <button className="btn btn-xs" type="button" onClick={() => startEdit(shop)}>
                            Edit
                          </button>
                          <button
                            className="btn btn-xs btn-error"
                            type="button"
                            onClick={() => deleteMutation.mutate(shop._id)}
                            disabled={deleteMutation.isPending}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {editingShop && (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body space-y-4">
            <h2 className="card-title">Edit Shop</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="form-control md:col-span-2">
                <span className="label-text mb-1">Name</span>
                <input className="input input-bordered" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </label>

              <label className="form-control md:col-span-2">
                <span className="label-text mb-1">Description</span>
                <textarea className="textarea textarea-bordered" rows="3" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
              </label>

              <label className="form-control md:col-span-2">
                <span className="label-text mb-1">Banner Image URL</span>
                <input className="input input-bordered" value={formData.bannerImage} onChange={(e) => setFormData({ ...formData, bannerImage: e.target.value })} />
              </label>

              <label className="label cursor-pointer justify-start gap-3 md:col-span-2">
                <input type="checkbox" className="toggle toggle-primary" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} />
                <span className="label-text">Active</span>
              </label>
            </div>

            <div className="flex justify-end gap-2">
              <button className="btn" type="button" onClick={() => setEditingShop(null)}>
                Cancel
              </button>
              <button className="btn btn-primary" type="button" onClick={submitEdit} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? <span className="loading loading-spinner loading-sm" /> : "Save Shop"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ShopsPage;