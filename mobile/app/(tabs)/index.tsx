import ProductsGrid from "@/components/ProductsGrid";
import HomePromoBanner from "@/components/HomePromoBanner";
import SafeScreen from "@/components/SafeScreen";
import useHomeBanner from "@/hooks/useHomeBanner";
import useProducts from "@/hooks/useProducts";

import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput } from "react-native";
import FilterModal from "@/components/FilterModal";

const CATEGORIES = [
  { name: "All", icon: "grid-outline" as const },
  { name: "Electronics", icon: "phone-portrait-outline" as const },
  { name: "Fashion", icon: "shirt-outline" as const },
  { name: "Sports", icon: "football-outline" as const },
  { name: "Books", icon: "book-outline" as const },
];

const ShopScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const { data: products, isLoading, isError } = useProducts();
  const { data: banner } = useHomeBanner();
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [minPriceInput, setMinPriceInput] = useState("");
  const [maxPriceInput, setMaxPriceInput] = useState("");
  const [appliedMinPrice, setAppliedMinPrice] = useState<number | null>(null);
  const [appliedMaxPrice, setAppliedMaxPrice] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState("newest"); // newest, name-asc, name-desc, price-asc, price-desc, rating

  const filteredProducts = useMemo(() => {
    if (!products) return [];

    let filtered = products;

    // filtering by category
    if (selectedCategory !== "All") {
      filtered = filtered.filter((product) => product.category === selectedCategory);
    }

    // filtering by searh query
    if (searchQuery.trim()) {
      filtered = filtered.filter((product) =>
        [
          product.name,
          product.description,
          product.category,
          product.shop?.name,
          product.shop?.owner?.name,
        ]
          .filter(Boolean)
          .some((value) => value?.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // filter by price range
    const min = appliedMinPrice;
    const max = appliedMaxPrice;
    if (min != null || max != null) {
      filtered = filtered.filter((product) => {
        const price = typeof product.price === "number" ? product.price : parseFloat(String(product.price || 0));
        if (min != null && price < min) return false;
        if (max != null && price > max) return false;
        return true;
      });
    }

    // apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "price-asc":
          return (a.price || 0) - (b.price || 0);
        case "price-desc":
          return (b.price || 0) - (a.price || 0);
        case "rating":
          return (b.averageRating || 0) - (a.averageRating || 0);
        case "newest":
        default:
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
    });

    return sorted;
  }, [products, selectedCategory, searchQuery, appliedMinPrice, appliedMaxPrice, sortBy]);

  return (
    <SafeScreen>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <View className="px-6 pb-4 pt-6">
          <View className="flex-row items-center justify-between mb-6">
            <View>
              <Text className="text-text-primary text-3xl font-bold tracking-tight">Shop</Text>
              <Text className="text-text-secondary text-sm mt-1">Browse all products</Text>
            </View>

            <TouchableOpacity
              className="bg-surface/50 p-3 rounded-full"
              activeOpacity={0.7}
              onPress={() => setFilterModalVisible(true)}
            >
              <Ionicons name="options-outline" size={22} color={"#fff"} />
            </TouchableOpacity>
          </View>

          {/* SEARCH BAR */}
          <View className="bg-surface flex-row items-center px-5 py-4 rounded-2xl">
            <Ionicons color={"#666"} size={22} name="search" />
            <TextInput
              placeholder="Search for products"
              placeholderTextColor={"#666"}
              className="flex-1 ml-3 text-base text-text-primary"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        <HomePromoBanner banner={banner || { key: "home-banner", product: null, isActive: false }} />

        <FilterModal
          visible={filterModalVisible}
          minPrice={minPriceInput}
          maxPrice={maxPriceInput}
          setMinPrice={setMinPriceInput}
          setMaxPrice={setMaxPriceInput}
          sortBy={sortBy}
          setSortBy={setSortBy}
          onClose={() => setFilterModalVisible(false)}
          onApply={() => {
            const min = parseFloat(minPriceInput);
            const max = parseFloat(maxPriceInput);
            setAppliedMinPrice(Number.isFinite(min) ? min : null);
            setAppliedMaxPrice(Number.isFinite(max) ? max : null);
            setFilterModalVisible(false);
          }}
        />

        {/* CATEGORY FILTER */}
        <View className="mb-6">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20 }}
          >
            {CATEGORIES.map((category) => {
              const isSelected = selectedCategory === category.name;
              return (
                <TouchableOpacity
                  key={category.name}
                  onPress={() => setSelectedCategory(category.name)}
                  className={`mr-3 rounded-2xl size-20 overflow-hidden items-center justify-center ${isSelected ? "bg-primary" : "bg-surface"}`}
                >
                  <Ionicons
                    name={category.icon}
                    size={36}
                    color={isSelected ? "#121212" : "#fff"}
                  />
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <View className="px-6 mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-text-primary text-lg font-bold">Products</Text>
            <Text className="text-text-secondary text-sm">{filteredProducts.length} items</Text>
          </View>

          {/* PRODUCTS GRID */}
          <ProductsGrid products={filteredProducts} isLoading={isLoading} isError={isError} />
        </View>
      </ScrollView>
    </SafeScreen>
  );
};

export default ShopScreen;
