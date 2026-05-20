import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";
import type { HomeBanner } from "@/hooks/useHomeBanner";

type Props = {
  banner: HomeBanner;
};

const HomePromoBanner = ({ banner }: Props) => {
  const backgroundColor = banner.backgroundColor || "#1DB954";
  const textColor = banner.textColor || "#FFFFFF";
  const buttonColor = banner.buttonColor || "#FFFFFF";
  const buttonTextColor = banner.buttonTextColor || "#121212";

  return (
    <View
      className="mx-6 mb-6 rounded-[28px] overflow-hidden"
      style={{ backgroundColor }}
    >
      <View className="flex-row items-center p-5 gap-4">
        <View className="flex-1 pr-2">
          <View className="self-start rounded-full px-3 py-1 mb-3 border border-white/25">
            <Text style={{ color: textColor }} className="text-xs font-bold uppercase tracking-wide">
              {banner.badgeText || "Best Deals"}
            </Text>
          </View>

          <Text style={{ color: textColor }} className="text-2xl font-extrabold leading-tight">
            {banner.title}
          </Text>
          <Text style={{ color: textColor }} className="text-sm opacity-90 mt-2 leading-5">
            {banner.subtitle}
          </Text>

          <TouchableOpacity
            activeOpacity={0.85}
            className="self-start mt-4 rounded-full px-4 py-2"
            style={{ backgroundColor: buttonColor }}
          >
            <View className="flex-row items-center gap-2">
              <Text className="font-bold" style={{ color: buttonTextColor }}>
                {banner.ctaText || "Shop Now"}
              </Text>
              <Ionicons name="arrow-forward" size={16} color={buttonTextColor} />
            </View>
          </TouchableOpacity>
        </View>

        {banner.imageUrl ? (
          <Image
            source={{ uri: banner.imageUrl }}
            style={{ width: 118, height: 118, borderRadius: 24 }}
            contentFit="cover"
          />
        ) : (
          <View className="w-[118px] h-[118px] rounded-3xl bg-black/15 items-center justify-center px-3">
            <Text style={{ color: textColor }} className="text-center text-xs font-semibold opacity-90">
              Add an image URL in the admin dashboard
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default HomePromoBanner;