import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@clerk/clerk-react";
import { activityApi, bannerApi, orderApi, productApi, statsApi, shopApi, userManagementApi } from "../lib/api";
import {
  DollarSignIcon,
  PackageIcon,
  ShoppingBagIcon,
  UsersIcon,
  BanIcon,
  CheckCircleIcon,
} from "lucide-react";
import { capitalizeText, formatDate, getOrderStatusBadge } from "../lib/utils";

function DashboardPage() {
  const queryClient = useQueryClient();
  const { user } = useUser();
  const currentEmail = user?.emailAddresses?.[0]?.emailAddress?.toLowerCase() || "";
  const isSuperAdmin = currentEmail === "magtangob65@gmail.com";

  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: orderApi.getAll,
    enabled: isSuperAdmin,
  });

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: statsApi.getDashboard,
    enabled: isSuperAdmin,
  });

  const { data: productsData } = useQuery({
    queryKey: ["products"],
    queryFn: productApi.getAll,
    enabled: isSuperAdmin,
  });

  const { data: myShopData, isLoading: myShopLoading } = useQuery({
    queryKey: ["myShop"],
    queryFn: shopApi.getMyShop,
  });

  const { data: myShopStatsData, isLoading: myShopStatsLoading } = useQuery({
    queryKey: ["myShopStats"],
    queryFn: shopApi.getMyShopStats,
  });

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ["adminUsers"],
    queryFn: userManagementApi.getAllUsers,
    enabled: isSuperAdmin,
  });

  const products = productsData || [];

  const { data: bannerData, isLoading: bannerLoading } = useQuery({
    queryKey: ["homeBanner"],
    queryFn: bannerApi.get,
    enabled: isSuperAdmin,
  });

  const { data: activitiesData, isLoading: activitiesLoading } = useQuery({
    queryKey: ["recentActivities"],
    queryFn: activityApi.getRecent,
    enabled: isSuperAdmin,
  });

  const [formData, setFormData] = useState({
    productId: "",
    badgeText: "",
    ctaText: "",
    isActive: true,
  });

  const [shopFormData, setShopFormData] = useState({
    name: "",
    description: "",
    bannerImage: "",
  });

  const [banFormData, setBanFormData] = useState({
    userId: "",
    reason: "",
  });


  useEffect(() => {
    if (myShopData?.shop) {
      setShopFormData({
        name: myShopData.shop.name || "",
        description: myShopData.shop.description || "",
        bannerImage: myShopData.shop.bannerImage || "",
      });
    }
  }, [myShopData]);

  useEffect(() => {
    if (bannerData?.banner) {
      setFormData({
        productId: bannerData.banner.product?._id || bannerData.banner.product || "",
        badgeText: bannerData.banner.badgeText || "",
        ctaText: bannerData.banner.ctaText || "",
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

  const createShopMutation = useMutation({
    mutationFn: shopApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myShop"] });
    },
  });

  const updateShopMutation = useMutation({
    mutationFn: ({ id, payload }) => shopApi.update({ id, payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myShop"] });
    },
  });

  const banUserMutation = useMutation({
    mutationFn: ({ userId, reason }) => userManagementApi.banUser({ userId, reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      setBanFormData({ userId: "", reason: "" });
    },
  });

  const unbanUserMutation = useMutation({
    mutationFn: (userId) => userManagementApi.unbanUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
    },
  });

  const dashboardStats = isSuperAdmin ? statsData : myShopStatsData?.stats;
  const recentOrders = isSuperAdmin ? ordersData?.orders?.slice(0, 5) || [] : myShopStatsData?.recentOrders || [];

  const statsCards = isSuperAdmin
    ? [
        {
          name: "Total Revenue",
          value: statsLoading
            ? "..."
            : `$${dashboardStats?.totalRevenue?.toFixed(2) || 0}`,
          icon: <DollarSignIcon className="size-8" />,
        },
        {
          name: "Total Orders",
          value: statsLoading ? "..." : dashboardStats?.totalOrders || 0,
          icon: <ShoppingBagIcon className="size-8" />,
        },
        {
          name: "Total Customers",
          value: statsLoading ? "..." : dashboardStats?.totalCustomers || 0,
          icon: <UsersIcon className="size-8" />,
        },
        {
          name: "Total Products",
          value: statsLoading ? "..." : dashboardStats?.totalProducts || 0,
          icon: <PackageIcon className="size-8" />,
        },
      ]
    : [
        {
          name: "Shop Products",
          value: myShopStatsLoading ? "..." : dashboardStats?.totalProducts || 0,
          icon: <PackageIcon className="size-8" />,
        },
        {
          name: "Shop Orders",
          value: myShopStatsLoading ? "..." : dashboardStats?.totalOrders || 0,
          icon: <ShoppingBagIcon className="size-8" />,
        },
        {
          name: "Shop Revenue",
          value: myShopStatsLoading ? "..." : `$${dashboardStats?.totalRevenue?.toFixed(2) || 0}`,
          icon: <DollarSignIcon className="size-8" />,
        },
        {
          name: "Items Sold",
          value: myShopStatsLoading ? "..." : dashboardStats?.totalItemsSold || 0,
          icon: <UsersIcon className="size-8" />,
        },
      ];

  return (
    <div className="space-y-6">
      {/* SHOP CREATION/MANAGEMENT */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body space-y-4">
          <h2 className="card-title text-2xl">Your Shop</h2>
          {myShopLoading ? (
            <div className="flex justify-center py-8">
              <span className="loading loading-spinner loading-lg" />
            </div>
          ) : myShopData?.shop ? (
            <>
              <div className="alert alert-info">
                <div>
                  <h3 className="font-bold">{myShopData.shop.name}</h3>
                  <div className="text-sm">{myShopData.shop.description}</div>
                  <div className="text-xs mt-1">
                    ID: {myShopData.shop._id}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="form-control md:col-span-2">
                  <span className="label-text mb-1">Shop Name</span>
                  <input
                    className="input input-bordered"
                    value={shopFormData.name}
                    onChange={(e) => setShopFormData({ ...shopFormData, name: e.target.value })}
                    placeholder="My Shop"
                  />
                </label>

                <label className="form-control md:col-span-2">
                  <span className="label-text mb-1">Shop Description</span>
                  <textarea
                    className="textarea textarea-bordered"
                    value={shopFormData.description}
                    onChange={(e) => setShopFormData({ ...shopFormData, description: e.target.value })}
                    placeholder="Describe your shop..."
                    rows="3"
                  ></textarea>
                </label>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  className="btn btn-primary"
                  onClick={() => updateShopMutation.mutate({ id: myShopData.shop._id, payload: shopFormData })}
                  disabled={updateShopMutation.isPending}
                  type="button"
                >
                  {updateShopMutation.isPending ? (
                    <span className="loading loading-spinner loading-sm" />
                  ) : (
                    "Update Shop"
                  )}
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-base-content/70">Create your shop to start selling products.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="form-control md:col-span-2">
                  <span className="label-text mb-1">Shop Name</span>
                  <input
                    className="input input-bordered"
                    value={shopFormData.name}
                    onChange={(e) => setShopFormData({ ...shopFormData, name: e.target.value })}
                    placeholder="My Shop"
                  />
                </label>

                <label className="form-control md:col-span-2">
                  <span className="label-text mb-1">Shop Description</span>
                  <textarea
                    className="textarea textarea-bordered"
                    value={shopFormData.description}
                    onChange={(e) => setShopFormData({ ...shopFormData, description: e.target.value })}
                    placeholder="Describe your shop..."
                    rows="3"
                  ></textarea>
                </label>
              </div>

              <div className="flex justify-end">
                <button
                  className="btn btn-primary"
                  onClick={() => createShopMutation.mutate(shopFormData)}
                  disabled={createShopMutation.isPending || !shopFormData.name.trim()}
                  type="button"
                >
                  {createShopMutation.isPending ? (
                    <span className="loading loading-spinner loading-sm" />
                  ) : (
                    "Create Shop"
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* HOMEPAGE BANNER EDITOR */}
      {isSuperAdmin && (
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
            className="rounded-3xl p-6 flex items-center justify-between gap-6 bg-base-200"
          >
            {(() => {
              const selectedProduct = products.find((product) => product._id === formData.productId);
              return selectedProduct ? (
                <>
                  <div className="max-w-xl space-y-2">
                    <div className="badge badge-outline">{formData.badgeText || "Best Deals"}</div>
                    <h3 className="text-3xl font-bold">{selectedProduct.name}</h3>
                    <p className="text-base opacity-90 line-clamp-2">{selectedProduct.description}</p>
                    <button className="btn btn-sm mt-3" type="button">
                      {formData.ctaText || "Shop Now"}
                    </button>
                  </div>

                  <img
                    src={selectedProduct.images?.[0]}
                    alt={selectedProduct.name}
                    className="h-40 w-44 rounded-2xl object-cover bg-base-200"
                  />
                </>
              ) : (
                <div className="w-full text-sm opacity-70 text-center py-10">
                  Select a product to preview the banner.
                </div>
              );
            })()}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="form-control md:col-span-2">
              <span className="label-text mb-1">Product</span>
              <select
                className="select select-bordered"
                value={formData.productId}
                onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
              >
                <option value="">Select a product</option>
                {products.map((product) => (
                  <option key={product._id} value={product._id}>
                    {product.name}
                  </option>
                ))}
              </select>
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
      )}

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

      {/* USERS MANAGEMENT - SUPER ADMIN ONLY */}
      {isSuperAdmin && (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body space-y-4">
            <h2 className="card-title">User Management (Super Admin)</h2>

            {usersLoading ? (
              <div className="flex justify-center py-8">
                <span className="loading loading-spinner loading-lg" />
              </div>
            ) : usersData?.users && usersData.users.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Joined</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersData.users.map((user) => (
                      <tr key={user._id}>
                        <td>
                          <span className="font-medium">{user.name}</span>
                        </td>
                        <td>{user.email}</td>
                        <td>
                          <div className={`badge ${user.role === 'admin' ? 'badge-warning' : 'badge-ghost'}`}>
                            {capitalizeText(user.role)}
                          </div>
                        </td>
                        <td>
                          <div className={`badge ${user.isBanned ? 'badge-error' : 'badge-success'}`}>
                            {user.isBanned ? 'Banned' : 'Active'}
                          </div>
                        </td>
                        <td>
                          <span className="text-sm opacity-60">
                            {formatDate(user.createdAt)}
                          </span>
                        </td>
                        <td>
                          {user.isBanned ? (
                            <button
                              className="btn btn-xs btn-info gap-1"
                              onClick={() => unbanUserMutation.mutate(user._id)}
                              disabled={unbanUserMutation.isPending}
                            >
                              <CheckCircleIcon className="size-4" />
                              Unban
                            </button>
                          ) : (
                            <button
                              className="btn btn-xs btn-error gap-1"
                              onClick={() => setBanFormData({ userId: user._id, reason: "" })}
                            >
                              <BanIcon className="size-4" />
                              Ban
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-base-content/60">
                No users found
              </div>
            )}

            {/* Ban Modal */}
            {banFormData.userId && (
              <div className="modal modal-open">
                <div className="modal-box">
                  <h3 className="font-bold text-lg">Ban User</h3>
                  <p className="py-4 text-sm opacity-70">
                    Enter reason for banning this user:
                  </p>
                  <textarea
                    className="textarea textarea-bordered w-full"
                    value={banFormData.reason}
                    onChange={(e) => setBanFormData({ ...banFormData, reason: e.target.value })}
                    placeholder="Reason for ban..."
                    rows="3"
                  ></textarea>
                  <div className="modal-action">
                    <button
                      className="btn"
                      onClick={() => setBanFormData({ userId: "", reason: "" })}
                    >
                      Cancel
                    </button>
                    <button
                      className="btn btn-error"
                      onClick={() => banUserMutation.mutate(banFormData)}
                      disabled={banUserMutation.isPending}
                    >
                      {banUserMutation.isPending ? (
                        <span className="loading loading-spinner loading-sm" />
                      ) : (
                        "Confirm Ban"
                      )}
                    </button>
                  </div>
                </div>
                <div
                  className="modal-backdrop"
                  onClick={() => setBanFormData({ userId: "", reason: "" })}
                ></div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* RECENT ORDERS */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">
            {isSuperAdmin ? "Recent Orders" : "Recent Shop Orders"}
          </h2>

          {isSuperAdmin ? (
            ordersLoading ? (
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
            )
          ) : myShopStatsLoading ? (
            <div className="flex justify-center py-8">
              <span className="loading loading-spinner loading-lg" />
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="text-center py-8 text-base-content/60">
              No shop orders yet
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Shop Items</th>
                    <th>Revenue</th>
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
                          <div className="font-medium">{order.customerName}</div>
                          <div className="text-sm opacity-60">
                            {order.itemCount} item(s)
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="text-sm">{order.itemCount} item(s)</div>
                      </td>

                      <td>
                        <span className="font-semibold">
                          ${order.revenue.toFixed(2)}
                        </span>
                      </td>

                      <td>
                        <div className={`badge ${getOrderStatusBadge(order.status)}`}>
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

      {isSuperAdmin && (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Recent Activity</h2>

            {activitiesLoading ? (
              <div className="flex justify-center py-8">
                <span className="loading loading-spinner loading-lg" />
              </div>
            ) : activitiesData?.activities?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Activity</th>
                      <th>User</th>
                      <th>Target</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activitiesData.activities.map((activity) => (
                      <tr key={activity._id}>
                        <td>
                          <div className="font-medium">{activity.description}</div>
                          <div className="text-xs opacity-60">{activity.type}</div>
                        </td>
                        <td>
                          <div>
                            <div className="font-medium">{activity.user?.name || "System"}</div>
                            <div className="text-xs opacity-60">{activity.user?.email || "-"}</div>
                          </div>
                        </td>
                        <td>
                          <div className="text-sm opacity-80">
                            {activity.shop?.name || activity.product?.name || activity.order?._id || "-"}
                          </div>
                        </td>
                        <td>
                          <span className="text-sm opacity-60">{formatDate(activity.createdAt)}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-base-content/60">No activity logs yet</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardPage;
