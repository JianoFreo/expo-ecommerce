import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { productApi, reviewApi, unwrapProducts, unwrapReviews } from "../lib/api";
import { queryKeys } from "../lib/queryKeys";
import type { Product, Review, UserSummary } from "../shared/types";

function reviewerName(review: Review): string {
  const user = review.userId;
  if (typeof user === "object" && user !== null) {
    return (user as UserSummary).name || "User";
  }
  return "User";
}

export default function Reviews() {
  const queryClient = useQueryClient();
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);

  const { data: products = [], isLoading } = useQuery({
    queryKey: queryKeys.productsCatalog,
    queryFn: async () => unwrapProducts(await productApi.listCatalog()),
  });

  const { data: reviews = [] } = useQuery({
    queryKey: queryKeys.reviews(expandedProduct ?? ""),
    queryFn: async () => {
      if (!expandedProduct) return [];
      return unwrapReviews(await reviewApi.listByProduct(expandedProduct));
    },
    enabled: Boolean(expandedProduct),
  });

  const deleteMutation = useMutation({
    mutationFn: (reviewId: string) => reviewApi.removeAdmin(reviewId),
    onSuccess: () => {
      if (expandedProduct) {
        queryClient.invalidateQueries({ queryKey: queryKeys.reviews(expandedProduct) });
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.productsCatalog });
    },
  });

  const toggleProduct = (product: Product) => {
    const id = product._id;
    setExpandedProduct((current) => (current === id ? null : id));
  };

  return (
    <div>
      <h1 className="text-2xl font-bold">Reviews Moderation</h1>
      {isLoading ? (
        <div className="mt-4 text-muted">Loading…</div>
      ) : (
        <div className="mt-4 space-y-3">
          {products.map((product) => (
            <div key={product._id} className="rounded border p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">{product.name}</div>
                  <div className="text-sm text-muted">{product.totalReviews ?? 0} reviews</div>
                </div>
                <button type="button" className="btn btn-sm" onClick={() => toggleProduct(product)}>
                  {expandedProduct === product._id ? "Hide" : "View Reviews"}
                </button>
              </div>
              {expandedProduct === product._id ? (
                <div className="mt-3 space-y-2">
                  {reviews.length === 0 ? (
                    <div className="text-sm text-muted">No reviews</div>
                  ) : (
                    reviews.map((review) => (
                      <div key={review._id} className="rounded bg-base-200 p-3">
                        <div className="flex justify-between">
                          <div>
                            <div className="font-semibold">{reviewerName(review)}</div>
                            <div className="text-sm text-muted">{review.comment}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-semibold">{review.rating} ★</div>
                            <button
                              type="button"
                              className="btn btn-sm btn-error mt-2"
                              onClick={() => deleteMutation.mutate(review._id)}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
