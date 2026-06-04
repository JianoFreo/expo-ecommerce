/**
 * Admin API client — single entry point for all backend calls.
 * UI shells must not duplicate business rules; only display API data.
 */
import axios from "../shared";
import type {
  ActivitiesResponse,
  ApiMessageResponse,
  BannerResponse,
  DashboardStats,
  HomeBanner,
  Order,
  OrderResponse,
  OrderStatus,
  OrderStatusUpdateResponse,
  OrdersResponse,
  Product,
  ProductResponse,
  ProductsResponse,
  Review,
  ReviewsResponse,
  SettingsResponse,
  Shop,
  ShopResponse,
  ShopsResponse,
  User,
  UserMutationResponse,
  UserProfileResponse,
  UsersResponse,
} from "../shared/types";

async function get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
  const { data } = await axios.get<T>(url, { params });
  return data;
}

async function patch<T>(url: string, body?: unknown): Promise<T> {
  const { data } = await axios.patch<T>(url, body);
  return data;
}

async function put<T>(url: string, body?: unknown): Promise<T> {
  const { data } = await axios.put<T>(url, body);
  return data;
}

async function post<T>(url: string, body?: unknown, config?: object): Promise<T> {
  const { data } = await axios.post<T>(url, body, config);
  return data;
}

async function del<T>(url: string): Promise<T> {
  const { data } = await axios.delete<T>(url);
  return data;
}

// —— Products ——
export const productApi = {
  listAdmin: () => get<ProductsResponse>("/admin/products"),
  listCatalog: () => get<ProductsResponse>("/products"),
  getById: (id: string) => get<ProductResponse>(`/products/${id}`),
  create: (formData: FormData) =>
    post<ProductResponse & ApiMessageResponse>("/admin/products", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  update: (id: string, formData: FormData) =>
    put<ProductResponse>(`/admin/products/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  remove: (id: string) => del<ApiMessageResponse>(`/admin/products/${id}`),
};

// —— Orders ——
export const orderApi = {
  list: () => get<OrdersResponse>("/admin/orders"),
  getById: (orderId: string) => get<OrderResponse>(`/admin/orders/${orderId}`),
  updateStatus: (orderId: string, status: OrderStatus) =>
    patch<OrderStatusUpdateResponse>(`/admin/orders/${orderId}/status`, { status }),
};

// —— Shops ——
export const shopApi = {
  listAdmin: () => get<ShopsResponse>("/admin/shops"),
  listPublic: () => get<ShopsResponse>("/shops"),
  getById: (id: string) => get<ShopResponse>(`/shops/${id}`),
  updateAdmin: (id: string, payload: Partial<Shop>) =>
    patch<ShopResponse>(`/admin/shops/${id}`, payload),
  remove: (id: string) => del<ApiMessageResponse>(`/admin/shops/${id}`),
};

// —— Users ——
export const userApi = {
  profile: () => get<UserProfileResponse>("/user/profile"),
  list: () => get<UsersResponse>("/admin/users"),
  ban: (userId: string, reason?: string) =>
    patch<UserMutationResponse>(`/admin/users/${userId}/ban`, { reason }),
  unban: (userId: string) => patch<UserMutationResponse>(`/admin/users/${userId}/unban`),
  setRole: (userId: string, role: string) =>
    patch<UserMutationResponse>(`/admin/users/${userId}/role`, { role }),
};

// —— Reviews ——
export const reviewApi = {
  listByProduct: (productId: string) => get<ReviewsResponse>(`/reviews/product/${productId}`),
  removeAdmin: (reviewId: string) => del<ApiMessageResponse>(`/reviews/admin/${reviewId}`),
};

// —— Banner ——
export const bannerApi = {
  get: () => get<BannerResponse>("/banner"),
  upsert: (payload: {
    productId: string;
    badgeText?: string;
    ctaText?: string;
    isActive?: boolean;
  }) => put<BannerResponse>("/admin/banner", payload),
};

// —— Stats & activity ——
export const statsApi = {
  dashboard: () => get<DashboardStats>("/admin/stats"),
};

export const activityApi = {
  list: (params?: { type?: string; search?: string; page?: number; limit?: number }) =>
    get<ActivitiesResponse>("/admin/activities", params as Record<string, unknown>),
};

// —— Settings ——
export const settingsApi = {
  get: () => get<SettingsResponse>("/settings"),
  setGuestAccess: (enabled: boolean) =>
    patch<SettingsResponse>("/settings/guest-access", { enabled }),
};

// —— Seller (seller-mode UI shell) ——
export const sellerApi = {
  orders: () => get<OrdersResponse>("/seller/orders"),
  orderById: (orderId: string) => get<OrderResponse>(`/seller/orders/${orderId}`),
  updateOrderStatus: (orderId: string, status: OrderStatus) =>
    patch<OrderStatusUpdateResponse>(`/seller/orders/${orderId}/status`, { status }),
  products: () => get<ProductsResponse>("/seller/products"),
  stats: () => get<Record<string, unknown>>("/seller/stats"),
};

/** Normalize list responses — backend always uses envelope keys. */
export function unwrapProducts(res: ProductsResponse): Product[] {
  return res.products ?? [];
}

export function unwrapOrders(res: OrdersResponse): Order[] {
  return res.orders ?? [];
}

export function unwrapShops(res: ShopsResponse): Shop[] {
  return res.shops ?? [];
}

export function unwrapUsers(res: UsersResponse): User[] {
  return res.users ?? [];
}

export function unwrapReviews(res: ReviewsResponse): Review[] {
  return res.reviews ?? [];
}

export function unwrapBanner(res: BannerResponse): HomeBanner {
  return res.banner;
}
