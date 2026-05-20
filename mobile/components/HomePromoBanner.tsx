import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import type { HomeBanner } from "@/hooks/useHomeBanner";

type Props = {
  banner: HomeBanner;
};

const HomePromoBanner = ({ banner }: Props) => {
  const product = banner.product;

  if (!banner.isActive || !product) {
    return null;
  }

  return (
    <TouchableOpacity
      className="mx-6 mb-6 rounded-[28px] overflow-hidden"
      activeOpacity={0.9}
      onPress={() => router.push(`/product/${product._id}`)}
    >
      <View className="flex-row items-center p-5 gap-4">
        <View className="flex-1 pr-2">
          <View className="self-start rounded-full px-3 py-1 mb-3 border border-white/25">
            <Text className="text-xs font-bold uppercase tracking-wide text-white">
              {banner.badgeText || "Best Deals"}
            </Text>
          </View>

          <Text className="text-2xl font-extrabold leading-tight text-white">
            {product.name}
          </Text>
          <Text className="text-sm opacity-90 mt-2 leading-5 text-white">
            {product.description}
          </Text>

          <TouchableOpacity
            activeOpacity={0.85}
            className="self-start mt-4 rounded-full px-4 py-2"
            style={{ backgroundColor: "#FFFFFF" }}
            onPress={() => router.push(`/product/${product._id}`)}
          >
            <View className="flex-row items-center gap-2">
              <Text className="font-bold text-[#121212]">
                {banner.ctaText || "Shop Now"}
              </Text>
              <Ionicons name="arrow-forward" size={16} color="#121212" />
            </View>
          </TouchableOpacity>
        </View>

        {product.images?.[0] ? (
          <Image
            source={{ uri: product.images[0] }}
            style={{ width: 118, height: 118, borderRadius: 24 }}
            contentFit="cover"
          />
        ) : (
          <View className="w-[118px] h-[118px] rounded-3xl bg-black/15 items-center justify-center px-3">
            <Text className="text-center text-xs font-semibold opacity-90 text-white">
              Product image will appear here
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default HomePromoBanner;