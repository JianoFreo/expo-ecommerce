import { useApi } from "@/lib/api";
import { Product, ProductsResponse } from "@/types";
import { useQuery } from "@tanstack/react-query";

const useProducts = () => {
  const api = useApi();

  const result = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data } = await api.get<ProductsResponse>("/products");
      return data.products;
    },
  });

  return result;
};

export default useProducts;
