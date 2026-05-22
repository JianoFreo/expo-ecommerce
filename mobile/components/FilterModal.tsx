import React from "react";
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Props {
  visible: boolean;
  minPrice: string;
  maxPrice: string;
  setMinPrice: (v: string) => void;
  setMaxPrice: (v: string) => void;
  sortBy: string; // "name" | "price-asc" | "price-desc" | "rating" | "newest"
  setSortBy: (v: string) => void;
  onApply: () => void;
  onClose: () => void;
}

const FilterModal = ({
  visible,
  minPrice,
  maxPrice,
  setMinPrice,
  setMaxPrice,
  sortBy,
  setSortBy,
  onApply,
  onClose,
}: Props) => {
  const sortOptions = [
    { value: "newest", label: "Newest", icon: "swap-vertical" },
    { value: "name-asc", label: "Name (A-Z)", icon: "arrow-down-outline" },
    { value: "name-desc", label: "Name (Z-A)", icon: "arrow-up-outline" },
    { value: "price-asc", label: "Price (Low-High)", icon: "trending-down" },
    { value: "price-desc", label: "Price (High-Low)", icon: "trending-up" },
    { value: "rating", label: "Highest Rated", icon: "star" },
  ];
  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.container}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>Filters & Sort</Text>

            {/* PRICE SECTION */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Price Range</Text>
              <Text style={styles.label}>Min price</Text>
              <TextInput
                value={minPrice}
                onChangeText={setMinPrice}
                keyboardType="numeric"
                placeholder="0"
                style={styles.input}
              />

              <Text style={styles.label}>Max price</Text>
              <TextInput
                value={maxPrice}
                onChangeText={setMaxPrice}
                keyboardType="numeric"
                placeholder="No limit"
                style={styles.input}
              />
            </View>

            {/* SORT SECTION */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Sort By</Text>
              {sortOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.sortOption,
                    sortBy === option.value && styles.sortOptionActive,
                  ]}
                  onPress={() => setSortBy(option.value)}
                >
                  <Ionicons
                    name={option.icon as any}
                    size={16}
                    color={sortBy === option.value ? "#1DB954" : "#B3B3B3"}
                  />
                  <Text
                    style={[
                      styles.sortOptionText,
                      sortBy === option.value && styles.sortOptionTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                  {sortBy === option.value && (
                    <Ionicons name="checkmark" size={16} color="#1DB954" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <View style={styles.row}>
            <TouchableOpacity style={styles.button} onPress={onClose}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, styles.primary]} onPress={onApply}>
              <Text style={[styles.buttonText, styles.primaryText]}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "90%",
    maxHeight: "80%",
    backgroundColor: "#121212",
    padding: 18,
    borderRadius: 12,
  },
  title: { color: "#fff", fontSize: 18, fontWeight: "700", marginBottom: 16 },
  section: { marginBottom: 20 },
  sectionTitle: { color: "#1DB954", fontSize: 12, fontWeight: "700", marginBottom: 10 },
  label: { color: "#B3B3B3", marginTop: 8, marginBottom: 6 },
  input: {
    backgroundColor: "#000",
    color: "#fff",
    padding: 10,
    borderRadius: 8,
  },
  sortOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: "#000",
    gap: 10,
  },
  sortOptionActive: {
    backgroundColor: "rgba(29, 185, 84, 0.1)",
  },
  sortOptionText: {
    color: "#B3B3B3",
    flex: 1,
    fontSize: 14,
  },
  sortOptionTextActive: {
    color: "#1DB954",
    fontWeight: "600",
  },
  row: { flexDirection: "row", justifyContent: "flex-end", marginTop: 14, gap: 8 },
  button: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8 },
  primary: { backgroundColor: "#1DB954" },
  buttonText: { color: "#fff" },
  primaryText: { color: "#071013", fontWeight: "700" },
});

export default FilterModal;
