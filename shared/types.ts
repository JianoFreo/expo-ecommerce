export type Product = {
  id: string;
  name: string;
  price: number;
  description?: string;
  images?: string[];
  sellerId?: string;
  stock?: number;
};

export type User = {
  id: string;
  email?: string;
  name?: string;
  role?: "admin" | "seller" | "customer";
};

export type Order = {
  id: string;
  userId: string;
  total: number;
  items: Array<{ productId: string; quantity: number; price: number }>;
  status: string;
};
