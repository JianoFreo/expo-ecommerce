/** Canonical API entity shapes — shared by Expo mobile and React admin. */

export type UserRole = "user" | "seller" | "super-admin";

export type OrderStatus = "pending" | "shipped" | "delivered";

export interface UserSummary {
  _id: string;
  name: string;
  email: string;
  imageUrl?: string;
  role?: UserRole;
}

export interface Shop {
  _id: string;
  name: string;
  description: string;
  bannerImage?: string;
  isActive: boolean;
  owner: UserSummary | string;
  productCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  images: string[];
  averageRating: number;
  totalReviews: number;
  shop?: Shop | string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  _id: string;
  clerkId?: string;
  email: string;
  name: string;
  imageUrl: string;
  role: UserRole;
  preferredTheme?: string;
  isBanned?: boolean;
  bannedAt?: string | null;
  bannedReason?: string;
  addresses?: Address[];
  wishlist?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Address {
  _id: string;
  label: string;
  fullName: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  phoneNumber: string;
  isDefault: boolean;
}

export interface OrderItem {
  _id?: string;
  product: Product | string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface ShippingAddress {
  fullName: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  phoneNumber: string;
}

export interface Order {
  _id: string;
  user: string | UserSummary;
  clerkId?: string;
  orderItems: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentResult?: { id?: string; status?: string };
  totalPrice: number;
  status: OrderStatus;
  hasReviewed?: boolean;
  shippedAt?: string | null;
  deliveredAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

/** Standard list/single API envelopes */
export interface ProductsResponse {
  products: Product[];
}

export interface ProductResponse {
  product: Product;
}

export interface OrdersResponse {
  orders: Order[];
}

export interface OrderResponse {
  order: Order;
}

export interface ShopsResponse {
  shops: Shop[];
}

export interface ShopResponse {
  shop: Shop;
}

export interface UsersResponse {
  users: User[];
}

export interface UserProfileResponse {
  user: User;
  shop?: Shop | null;
}

export interface ApiMessageResponse {
  message: string;
}

/** Realtime payloads (Socket.io / Inngest) */
export type RealtimeEntity = "product" | "order";

export interface RealtimePayload<T = Product | Order> {
  entity: RealtimeEntity;
  action: "created" | "updated" | "deleted";
  data: T;
  at: string;
}
