export type Product = {
  id: string;
  _id?: string;
  name: string;
  price: number;
  description?: string;
  images?: string[];
  sellerId?: string;
  stock?: number;
  category?: string;
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
