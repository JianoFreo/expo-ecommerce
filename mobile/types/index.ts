export type {
  Address,
  Order,
  OrderItem,
  OrderStatus,
  Product,
  ProductResponse,
  ProductsResponse,
  Shop,
  User,
  UserRole,
  UserSummary,
} from "@expo-ecommerce/contract";

export interface Review {
  _id: string;
  productId: string;
  userId: string | User;
  orderId: string;
  rating: number;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  _id: string;
  product: Product;
  quantity: number;
}

export interface Cart {
  _id: string;
  user: string;
  clerkId: string;
  items: CartItem[];
  createdAt: string;
  updatedAt: string;
}

export interface HomeBanner {
  key: string;
  product?: Product | null;
  badgeText?: string;
  ctaText?: string;
  isActive?: boolean;
}
