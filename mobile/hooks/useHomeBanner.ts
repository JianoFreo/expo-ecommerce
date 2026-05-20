import { useQuery } from "@tanstack/react-query";
import { useApi } from "@/lib/api";

export type HomeBanner = {
  key: string;
  title: string;
  subtitle: string;
  badgeText?: string;
  ctaText?: string;
  imageUrl?: string;
  backgroundColor?: string;
  textColor?: string;
  buttonColor?: string;
  buttonTextColor?: string;
  isActive?: boolean;
};

const defaultBanner: HomeBanner = {
  key: "home-banner",
  title: "Discount sale",
  subtitle: "Save on top picks",
  badgeText: "Best Deals",
  ctaText: "Shop Now",
  imageUrl: "",
  backgroundColor: "#1DB954",
  textColor: "#FFFFFF",
  buttonColor: "#FFFFFF",
  buttonTextColor: "#121212",
  isActive: true,
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