import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@clerk/clerk-react";
import { PlusIcon, PencilIcon, Trash2Icon, XIcon, ImageIcon } from "lucide-react";
import { productApi, shopApi } from "../lib/api";
import { getStockStatusBadge } from "../lib/utils";

function ProductsPage() {
  const queryClient = useQueryClient();
  const { user } = useUser();
  const currentEmail = user?.emailAddresses?.[0]?.emailAddress?.toLowerCase() || "";
  const isSuperAdmin = currentEmail === "magtangob65@gmail.com";

  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    stock: "",
    description: "",
  });
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const [sellerFormData, setSellerFormData] = useState({
    name: "",
    category: "",
    price: "",
    stock: "",
    description: "",
  });
  const [sellerImages, setSellerImages] = useState([]);
  const [sellerPreviews, setSellerPreviews] = useState([]);

  const { data: adminProducts = [] } = useQuery({
    queryKey: ["products"],
    queryFn: productApi.getAll,
    enabled: isSuperAdmin,
  });

  const { data: myShopData } = useQuery({
    queryKey: ["myShop"],
    queryFn: shopApi.getMyShop,
    enabled: !isSuperAdmin,
  });

  const { data: sellerProductsData } = useQuery({
    queryKey: ["myProducts"],
    queryFn: shopApi.getMyProducts,
    enabled: !isSuperAdmin,
  });

  const products = isSuperAdmin ? adminProducts : sellerProductsData?.products || [];

  useEffect(() => {
    return () => {
      imagePreviews.forEach((url) => {
        if (url.startsWith("blob:")) URL.revokeObjectURL(url);
      });
      sellerPreviews.forEach((url) => {
        if (url.startsWith("blob:")) URL.revokeObjectURL(url);
      });
    };
  }, [imagePreviews, sellerPreviews]);

  const closeModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setFormData({ name: "", category: "", price: "", stock: "", description: "" });
    setImages([]);
    setImagePreviews([]);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price.toString(),
      stock: product.stock.toString(),
      description: product.description,
    });
    setImagePreviews(product.images || []);
    setShowModal(true);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 3) return alert("Maximum 3 images allowed");

    imagePreviews.forEach((url) => {
      if (url.startsWith("blob:")) URL.revokeObjectURL(url);
    });

    setImages(files);
    setImagePreviews(files.map((file) => URL.createObjectURL(file)));
  };

  const handleSellerImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 3) return alert("Maximum 3 images allowed");

    sellerPreviews.forEach((url) => {
      if (url.startsWith("blob:")) URL.revokeObjectURL(url);
    });

    setSellerImages(files);
    setSellerPreviews(files.map((file) => URL.createObjectURL(file)));
  };

  const createProductMutation = useMutation({
    mutationFn: productApi.create,
    onSuccess: () => {
      closeModal();
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: productApi.update,
    onSuccess: () => {
      closeModal();
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: productApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const sellerCreateMutation = useMutation({
    mutationFn: (payload) => shopApi.createProduct(payload),
    onSuccess: () => {
      setSellerFormData({ name: "", category: "", price: "", stock: "", description: "" });
      setSellerImages([]);
      setSellerPreviews([]);
      queryClient.invalidateQueries({ queryKey: ["myProducts"] });
      queryClient.invalidateQueries({ queryKey: ["myShopStats"] });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isSuperAdmin) {
      if (!editingProduct && imagePreviews.length === 0) {
        return alert("Please upload at least one image");
      }

      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("price", formData.price);
      formDataToSend.append("stock", formData.stock);
      formDataToSend.append("category", formData.category);

      if (images.length > 0) {
        images.forEach((image) => formDataToSend.append("images", image));
      }

      if (editingProduct) {
        updateProductMutation.mutate({ id: editingProduct._id, formData: formDataToSend });
      } else {
        createProductMutation.mutate(formDataToSend);
      }
      return;
    }

    if (!myShopData?.shop) {
      return alert("Create your shop first from the dashboard.");
    }
    if (sellerImages.length === 0) {
      return alert("Please upload at least one image");
    }

    const formDataToSend = new FormData();
    formDataToSend.append("name", sellerFormData.name);
    formDataToSend.append("description", sellerFormData.description);
    formDataToSend.append("price", sellerFormData.price);
    formDataToSend.append("stock", sellerFormData.stock);
    formDataToSend.append("category", sellerFormData.category);
    sellerImages.forEach((image) => formDataToSend.append("images", image));

    sellerCreateMutation.mutate(formDataToSend);
  };

  const sellerHasShop = !!myShopData?.shop;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-base-content/70 mt-1">
            {isSuperAdmin
              ? "Manage the full product catalog"
              : "Create and manage the products in your shop"}
          </p>
        </div>

        {isSuperAdmin && (
          <button onClick={() => setShowModal(true)} className="btn btn-primary gap-2" type="button">
            <PlusIcon className="w-5 h-5" />
            Add Product
          </button>
        )}
      </div>

      {!isSuperAdmin && (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body space-y-4">
            <div>
              <h2 className="card-title text-2xl">Add Product</h2>
              <p className="text-base-content/70 mt-1">
                Products created here will show under your shop on mobile and in the seller list.
              </p>
            </div>

            {!sellerHasShop ? (
              <div className="alert alert-warning">
                <span>You need to create a shop first on the Dashboard before uploading products.</span>
              </div>
            ) : null}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="form-control">
                <span className="label-text mb-1">Product Name</span>
                <input
                  className="input input-bordered"
                  value={sellerFormData.name}
                  onChange={(e) => setSellerFormData({ ...sellerFormData, name: e.target.value })}
                  placeholder="Product name"
                />
              </label>

              <label className="form-control">
                <span className="label-text mb-1">Category</span>
                <input
                  className="input input-bordered"
                  value={sellerFormData.category}
                  onChange={(e) => setSellerFormData({ ...sellerFormData, category: e.target.value })}
                  placeholder="Electronics"
                />
              </label>

              <label className="form-control md:col-span-2">
                <span className="label-text mb-1">Description</span>
                <textarea
                  className="textarea textarea-bordered"
                  value={sellerFormData.description}
                  onChange={(e) => setSellerFormData({ ...sellerFormData, description: e.target.value })}
                  placeholder="Describe your product"
                  rows="3"
                />
              </label>

              <label className="form-control">
                <span className="label-text mb-1">Price</span>
                <input
                  className="input input-bordered"
                  type="number"
                  step="0.01"
                  value={sellerFormData.price}
                  onChange={(e) => setSellerFormData({ ...sellerFormData, price: e.target.value })}
                  placeholder="99.99"
                />
              </label>

              <label className="form-control">
                <span className="label-text mb-1">Stock</span>
                <input
                  className="input input-bordered"
                  type="number"
                  value={sellerFormData.stock}
                  onChange={(e) => setSellerFormData({ ...sellerFormData, stock: e.target.value })}
                  placeholder="10"
                />
              </label>

              <label className="form-control md:col-span-2">
                <span className="label-text mb-1">Images</span>
                <input
                  className="file-input file-input-bordered w-full"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleSellerImageChange}
                />
                <span className="label-text-alt mt-2">Select up to 3 images.</span>
              </label>
            </div>

            {sellerPreviews.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {sellerPreviews.map((preview, index) => (
                  <div key={index} className="avatar">
                    <div className="w-20 rounded-lg">
                      <img src={preview} alt={`Preview ${index + 1}`} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={
                  sellerCreateMutation.isPending ||
                  !sellerHasShop ||
                  !sellerFormData.name.trim() ||
                  !sellerFormData.description.trim() ||
                  !sellerFormData.price.trim() ||
                  !sellerFormData.stock.trim() ||
                  !sellerFormData.category.trim() ||
                  sellerImages.length === 0
                }
                type="button"
              >
                {sellerCreateMutation.isPending ? (
                  <span className="loading loading-spinner loading-sm" />
                ) : (
                  "Upload Product"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {products?.map((product) => {
          const status = getStockStatusBadge(product.stock);
          const sellerName = product.shop?.owner?.name || product.shop?.name || "Unknown seller";

          return (
            <div key={product._id} className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <div className="flex items-center gap-6">
                  <div className="avatar">
                    <div className="w-20 rounded-xl bg-base-200">
                      {product.images?.[0] ? <img src={product.images[0]} alt={product.name} /> : null}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="card-title truncate">{product.name}</h3>
                        <p className="text-base-content/70 text-sm truncate">{product.category}</p>
                        <p className="text-xs opacity-60 mt-1 truncate">Seller: {sellerName}</p>
                      </div>
                      <div className={`badge ${status.class}`}>{status.text}</div>
                    </div>

                    <div className="flex items-center gap-6 mt-4">
                      <div>
                        <p className="text-xs text-base-content/70">Price</p>
                        <p className="font-bold text-lg">${product.price}</p>
                      </div>
                      <div>
                        <p className="text-xs text-base-content/70">Stock</p>
                        <p className="font-bold text-lg">{product.stock} units</p>
                      </div>
                    </div>
                  </div>

                  {isSuperAdmin && (
                    <div className="card-actions shrink-0">
                      <button className="btn btn-square btn-ghost" onClick={() => handleEdit(product)} type="button">
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button
                        className="btn btn-square btn-ghost text-error"
                        onClick={() => deleteProductMutation.mutate(product._id)}
                        type="button"
                      >
                        {deleteProductMutation.isPending ? (
                          <span className="loading loading-spinner"></span>
                        ) : (
                          <Trash2Icon className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {isSuperAdmin && (
        <>
          <input type="checkbox" className="modal-toggle" checked={showModal} readOnly />
          <div className="modal">
            <div className="modal-box max-w-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-2xl">{editingProduct ? "Edit Product" : "Add New Product"}</h3>
                <button onClick={closeModal} className="btn btn-sm btn-circle btn-ghost" type="button">
                  <XIcon className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span>Product Name</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter product name"
                      className="input input-bordered"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span>Category</span>
                    </label>
                    <select
                      className="select select-bordered"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      required
                    >
                      <option value="">Select category</option>
                      <option value="Electronics">Electronics</option>
                      <option value="Accessories">Accessories</option>
                      <option value="Fashion">Fashion</option>
                      <option value="Sports">Sports</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span>Price ($)</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className="input input-bordered"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span>Stock</span>
                    </label>
                    <input
                      type="number"
                      placeholder="0"
                      className="input input-bordered"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-control flex flex-col gap-2">
                  <label className="label">
                    <span>Description</span>
                  </label>
                  <textarea
                    className="textarea textarea-bordered h-24 w-full"
                    placeholder="Enter product description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold text-base flex items-center gap-2">
                      <ImageIcon className="h-5 w-5" />
                      Product Images
                    </span>
                    <span className="label-text-alt text-xs opacity-60">Max 3 images</span>
                  </label>

                  <div className="bg-base-200 rounded-xl p-4 border-2 border-dashed border-base-300 hover:border-primary transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                      className="file-input file-input-bordered file-input-primary w-full"
                      required={!editingProduct}
                    />

                    {editingProduct && (
                      <p className="text-xs text-base-content/60 mt-2 text-center">
                        Leave empty to keep current images
                      </p>
                    )}
                  </div>

                  {imagePreviews.length > 0 && (
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="avatar">
                          <div className="w-20 rounded-lg">
                            <img src={preview} alt={`Preview ${index + 1}`} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="modal-action">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="btn"
                    disabled={createProductMutation.isPending || updateProductMutation.isPending}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={createProductMutation.isPending || updateProductMutation.isPending}
                  >
                    {createProductMutation.isPending || updateProductMutation.isPending ? (
                      <span className="loading loading-spinner"></span>
                    ) : editingProduct ? (
                      "Update Product"
                    ) : (
                      "Add Product"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default ProductsPage;
