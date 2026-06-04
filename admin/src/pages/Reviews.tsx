import React, { useEffect, useState } from "react";
import axios from "../shared";

export default function Reviews() {
  const [products, setProducts] = useState<any[]>([]);
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Record<string, any[]>>({});

  useEffect(() => {
    axios
      .get("/products")
      .then((res) => setProducts(res.data || []))
      .catch(() => {});
  }, []);

  const loadReviews = async (productId: string) => {
    if (reviews[productId]) {
      setExpandedProduct(expandedProduct === productId ? null : productId);
      return;
    }
    try {
      const res = await axios.get(`/reviews/product/${productId}`);
      setReviews((r) => ({ ...r, [productId]: res.data?.reviews || [] }));
      setExpandedProduct(productId);
    } catch (e) {
      // ignore
    }
  };

  const deleteReview = async (id: string) => {
    if (!confirm("Delete this review?")) return;
    try {
      await axios.delete(`/reviews/admin/${id}`);
      // optimistic remove
      setReviews((r) => {
        const copy = { ...r };
        for (const key of Object.keys(copy)) {
          copy[key] = copy[key].filter((rev) => rev._id !== id && rev.id !== id);
        }
        return copy;
      });
    } catch (err: any) {
      alert(err?.response?.data?.error || err?.message || "Could not delete review (server may restrict this action).");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold">Reviews Moderation</h1>
      <div className="mt-4 space-y-3">
        {products.map((p) => (
          <div key={p._id || p.id} className="p-3 border rounded">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-semibold">{p.name}</div>
                <div className="text-sm text-muted">{p.totalReviews || 0} reviews</div>
              </div>
              <div>
                <button className="btn btn-sm" onClick={() => loadReviews(p._id || p.id)}>
                  {expandedProduct === (p._id || p.id) ? "Hide" : "View Reviews"}
                </button>
              </div>
            </div>
            {expandedProduct === (p._id || p.id) && (
              <div className="mt-3 space-y-2">
                {(reviews[p._id || p.id] || []).map((rev: any) => (
                  <div key={rev._id || rev.id} className="p-3 bg-base-200 rounded">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold">{rev.userId?.name || rev.userName || 'User'}</div>
                        <div className="text-sm text-muted">{rev.comment}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold">{rev.rating} ★</div>
                        <div className="mt-2 flex gap-2 justify-end">
                          <button className="btn btn-sm btn-error" onClick={() => deleteReview(rev._id || rev.id)}>Delete</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {!(reviews[p._id || p.id] || []).length && <div className="text-sm text-muted">No reviews</div>}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
