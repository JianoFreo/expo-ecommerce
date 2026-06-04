import { useQuery } from "@tanstack/react-query";
import { useApi } from "@/lib/api";
import { Product, ProductResponse } from "@/types";

export const useProduct = (productId: string) => {
  const api = useApi();

  const result = useQuery<Product>({
    queryKey: ["product", productId],
    queryFn: async () => {
      const { data } = await api.get<ProductResponse>(`/products/${productId}`);
      return data.product;
    },
    enabled: !!productId,
  });

  return result;
};
