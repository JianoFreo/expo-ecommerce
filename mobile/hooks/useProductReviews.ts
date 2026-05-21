import { useQuery } from "@tanstack/react-query";
import { useApi } from "@/lib/api";

export const useProductReviews = (productId: string | undefined) => {
  const api = useApi();

  return useQuery({
    queryKey: ["productReviews", productId],
    enabled: !!productId,
    initialData: [],
    queryFn: async () => {
      if (!productId) return [];
      const resp = await api.get(`/reviews/product/${productId}`);
      return resp.data?.reviews ?? [];
    },
  });
};

export default useProductReviews;
