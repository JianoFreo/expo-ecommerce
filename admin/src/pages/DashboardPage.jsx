import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { bannerApi, orderApi, statsApi } from "../lib/api";
import {
  DollarSignIcon,
  PackageIcon,
  ShoppingBagIcon,
  UsersIcon,
} from "lucide-react";
import { capitalizeText, formatDate, getOrderStatusBadge } from "../lib/utils";

function DashboardPage() {
  const queryClient = useQueryClient();

  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: orderApi.getAll,
  });

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: statsApi.getDashboard,
  });

  const { data: bannerData, isLoading: bannerLoading } = useQuery({
    queryKey: ["homeBanner"],
    queryFn: bannerApi.get,
  });

  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    badgeText: "",
    ctaText: "",
    imageUrl: "",
    backgroundColor: "#1DB954",
    textColor: "#FFFFFF",
    buttonColor: "#FFFFFF",
    buttonTextColor: "#121212",
    isActive: true,
  });

  useEffect(() => {
    if (bannerData?.banner) {
      setFormData({
        title: bannerData.banner.title || "",
        subtitle: bannerData.banner.subtitle || "",
        badgeText: bannerData.banner.badgeText || "",
        ctaText: bannerData.banner.ctaText || "",
        imageUrl: bannerData.banner.imageUrl || "",
        backgroundColor: bannerData.banner.backgroundColor || "#1DB954",
        textColor: bannerData.banner.textColor || "#FFFFFF",
        buttonColor: bannerData.banner.buttonColor || "#FFFFFF",
        buttonTextColor: bannerData.banner.buttonTextColor || "#121212",
        isActive: bannerData.banner.isActive ?? true,
      });
    }
  }, [bannerData]);

  const saveBannerMutation = useMutation({
    mutationFn: bannerApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["homeBanner"] });
    },
  });

  // it would be better to send the last 5 items from the api, instead of slicing it here
  // but we're just keeping it simple here...
  const recentOrders = ordersData?.orders?.slice(0, 5) || [];

  const statsCards = [
    {
      name: "Total Revenue",
      value: statsLoading
        ? "..."
        : `$${statsData?.totalRevenue?.toFixed(2) || 0}`,
      icon: <DollarSignIcon className="size-8" />,
    },
    {
      name: "Total Orders",
      value: statsLoading ? "..." : statsData?.totalOrders || 0,
      icon: <ShoppingBagIcon className="size-8" />,
    },
    {
      name: "Total Customers",
      value: statsLoading ? "..." : statsData?.totalCustomers || 0,
      icon: <UsersIcon className="size-8" />,
    },
    {
      name: "Total Products",
      value: statsLoading ? "..." : statsData?.totalProducts || 0,
      icon: <PackageIcon className="size-8" />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* HOMEPAGE BANNER EDITOR */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h2 className="card-title text-2xl">Homepage Banner</h2>
              <p className="text-base-content/70 mt-1">
                Edit the best deals ad shown at the top of the mobile app.
              </p>
            </div>
            <div className={`badge ${formData.isActive ? "badge-success" : "badge-ghost"}`}>
              {formData.isActive ? "Active" : "Hidden"}
            </div>
          </div>

          <div
            className="rounded-3xl p-6 flex items-center justify-between gap-6"
            style={{ backgroundColor: formData.backgroundColor }}
          >
            <div className="max-w-xl space-y-2" style={{ color: formData.textColor }}>
              <div className="badge badge-outline" style={{ color: formData.textColor }}>
                {formData.badgeText || "Best Deals"}
              </div>
              <h3 className="text-3xl font-bold">{formData.title || "Discount sale"}</h3>
              <p className="text-base opacity-90">{formData.subtitle || "Save on top picks"}</p>
              <button
                className="btn btn-sm mt-3"
                style={{
                  backgroundColor: formData.buttonColor,
                  color: formData.buttonTextColor,
                  borderColor: formData.buttonColor,
                }}
                type="button"
              >
                {formData.ctaText || "Shop Now"}
              </button>
            </div>

            {formData.imageUrl ? (
              <img
                src={formData.imageUrl}
                alt={formData.title || "banner preview"}
                className="h-40 w-44 rounded-2xl object-cover bg-base-200"
              />
            ) : (
              <div className="h-40 w-44 rounded-2xl bg-base-200/40 flex items-center justify-center text-center text-sm opacity-70 px-4">
                Add an image URL to preview the banner artwork here.
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="form-control">
              <span className="label-text mb-1">Title</span>
              <input
                className="input input-bordered"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Discount sale"
              />
            </label>

            <label className="form-control">
              <span className="label-text mb-1">Subtitle</span>
              <input
                className="input input-bordered"
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                placeholder="Save on top picks"
              />
            </label>

            <label className="form-control">
              <span className="label-text mb-1">Badge Text</span>
              <input
                className="input input-bordered"
                value={formData.badgeText}
                onChange={(e) => setFormData({ ...formData, badgeText: e.target.value })}
                placeholder="Best Deals"
              />
            </label>

            <label className="form-control">
              <span className="label-text mb-1">CTA Text</span>
              <input
                className="input input-bordered"
                value={formData.ctaText}
                onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                placeholder="Shop Now"
              />
            </label>

            <label className="form-control md:col-span-2">
              <span className="label-text mb-1">Image URL</span>
              <input
                className="input input-bordered"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="https://..."
              />
            </label>

            <label className="form-control">
              <span className="label-text mb-1">Background Color</span>
              <input
                className="input input-bordered"
                value={formData.backgroundColor}
                onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                placeholder="#1DB954"
              />
            </label>

            <label className="form-control">
              <span className="label-text mb-1">Text Color</span>
              <input
                className="input input-bordered"
                value={formData.textColor}
                onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                placeholder="#FFFFFF"
              />
            </label>

            <label className="form-control">
              <span className="label-text mb-1">Button Color</span>
              <input
                className="input input-bordered"
                value={formData.buttonColor}
                onChange={(e) => setFormData({ ...formData, buttonColor: e.target.value })}
                placeholder="#FFFFFF"
              />
            </label>

            <label className="form-control">
              <span className="label-text mb-1">Button Text Color</span>
              <input
                className="input input-bordered"
                value={formData.buttonTextColor}
                onChange={(e) => setFormData({ ...formData, buttonTextColor: e.target.value })}
                placeholder="#121212"
              />
            </label>

            <label className="label cursor-pointer justify-start gap-3 md:col-span-2">
              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              />
              <span className="label-text">Show on app</span>
            </label>
          </div>

          <div className="flex items-center justify-between gap-4 flex-wrap">
            <p className="text-sm text-base-content/60">
              {bannerLoading ? "Loading current banner..." : "This banner is shared across all app users."}
            </p>
            <button
              className="btn btn-primary"
              onClick={() => saveBannerMutation.mutate(formData)}
              disabled={saveBannerMutation.isPending}
              type="button"
            >
              {saveBannerMutation.isPending ? (
                <span className="loading loading-spinner loading-sm" />
              ) : (
                "Save Banner"
              )}
            </button>
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="stats stats-vertical lg:stats-horizontal shadow w-full bg-base-100">
        {statsCards.map((stat) => (
          <div key={stat.name} className="stat">
            <div className="stat-figure text-primary">{stat.icon}</div>
            <div className="stat-title">{stat.name}</div>
            <div className="stat-value">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* RECENT ORDERS */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Recent Orders</h2>

          {ordersLoading ? (
            <div className="flex justify-center py-8">
              <span className="loading loading-spinner loading-lg" />
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="text-center py-8 text-base-content/60">
              No orders yet
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>

                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order._id}>
                      <td>
                        <span className="font-medium">
                          #{order._id.slice(-8).toUpperCase()}
                        </span>
                      </td>

                      <td>
                        <div>
                          <div className="font-medium">
                            {order.shippingAddress.fullName}
                          </div>
                          <div className="text-sm opacity-60">
                            {order.orderItems.length} item(s)
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="text-sm">
                          {order.orderItems[0]?.name}
                          {order.orderItems.length > 1 &&
                            ` +${order.orderItems.length - 1} more`}
                        </div>
                      </td>

                      <td>
                        <span className="font-semibold">
                          ${order.totalPrice.toFixed(2)}
                        </span>
                      </td>

                      <td>
                        <div
                          className={`badge ${getOrderStatusBadge(order.status)}`}
                        >
                          {capitalizeText(order.status)}
                        </div>
                      </td>

                      <td>
                        <span className="text-sm opacity-60">
                          {formatDate(order.createdAt)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
