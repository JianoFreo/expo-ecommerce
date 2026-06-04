import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { bannerApi, productApi, unwrapBanner, unwrapProducts } from "../lib/api";
import { queryKeys } from "../lib/queryKeys";
import type { Product } from "../shared/types";

export default function Banner() {
  const queryClient = useQueryClient();
  const [productId, setProductId] = useState("");
  const [badgeText, setBadgeText] = useState("Best Deals");
  const [ctaText, setCtaText] = useState("Shop Now");
  const [isActive, setIsActive] = useState(true);

  const { data: products = [] } = useQuery({
    queryKey: queryKeys.productsCatalog,
    queryFn: async () => unwrapProducts(await productApi.listCatalog()),
  });

  const { data: banner, isLoading } = useQuery({
    queryKey: queryKeys.banner,
    queryFn: async () => {
      const res = await bannerApi.get();
      const home = unwrapBanner(res);
      setProductId(typeof home.product === "object" && home.product ? home.product._id : String(home.product || ""));
      setBadgeText(home.badgeText || "Best Deals");
      setCtaText(home.ctaText || "Shop Now");
      setIsActive(Boolean(home.isActive));
      return home;
    },
  });

  const saveMutation = useMutation({
    mutationFn: () =>
      bannerApi.upsert({
        productId,
        badgeText,
        ctaText,
        isActive,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.banner }),
  });

  const featuredProduct =
    typeof banner?.product === "object" && banner.product !== null
      ? (banner.product as Product)
      : products.find((p) => p._id === productId);

  return (
    <div>
      <h1 className="text-2xl font-bold">Home Banner</h1>
      <p className="mt-1 text-sm text-muted">Configure the mobile home promo via PUT /admin/banner</p>

      {isLoading ? (
        <div className="mt-4">Loading…</div>
      ) : (
        <div className="mt-4 space-y-4 rounded border p-4">
          <label className="block">
            <span className="text-sm font-semibold">Featured product</span>
            <select
              className="select select-bordered mt-1 w-full"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
            >
              <option value="">Select product</option>
              {products.map((product) => (
                <option key={product._id} value={product._id}>
                  {product.name}
                </option>
              ))}
            </select>
          </label>

          <input
            value={badgeText}
            onChange={(e) => setBadgeText(e.target.value)}
            placeholder="Badge text"
            className="input input-bordered w-full"
          />
          <input
            value={ctaText}
            onChange={(e) => setCtaText(e.target.value)}
            placeholder="CTA text"
            className="input input-bordered w-full"
          />
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            <span className="text-sm">Active on home screen</span>
          </label>

          <button
            type="button"
            className="btn btn-primary"
            disabled={!productId || saveMutation.isPending}
            onClick={() => saveMutation.mutate()}
          >
            {saveMutation.isPending ? "Saving…" : "Save banner"}
          </button>

          {featuredProduct ? (
            <div className="rounded bg-base-200 p-3 text-sm">
              Preview: {featuredProduct.name} — {featuredProduct.images?.[0] ? "has image" : "no image"}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
