import { useQuery } from "@tanstack/react-query";
import { useApi } from "@/lib/api";

export type HomeBanner = {
  key: string;
  product?: {
    _id: string;
    name: string;
    description: string;
    images: string[];
  } | null;
  badgeText?: string;
  ctaText?: string;
  isActive?: boolean;
};

const defaultBanner: HomeBanner = {
  key: "home-banner",
  badgeText: "Best Deals",
  ctaText: "Shop Now",
  product: null,
  isActive: false,
};

const useHomeBanner = () => {
  const api = useApi();

  return useQuery({
    queryKey: ["homeBanner"],
    queryFn: async () => {
      const { data } = await api.get<{ banner: HomeBanner }>("/banner");
      return data?.banner || defaultBanner;
    },
  });
};

export default useHomeBanner;