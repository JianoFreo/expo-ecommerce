import React from "react";
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";

interface Props {
  visible: boolean;
  minPrice: string;
  maxPrice: string;
  setMinPrice: (v: string) => void;
  setMaxPrice: (v: string) => void;
  onApply: () => void;
  onClose: () => void;
}

const FilterModal = ({ visible, minPrice, maxPrice, setMinPrice, setMaxPrice, onApply, onClose }: Props) => {
  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.container}>
          <Text style={styles.title}>Filters</Text>

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
    backgroundColor: "#121212",
    padding: 18,
    borderRadius: 12,
  },
  title: { color: "#fff", fontSize: 18, fontWeight: "700", marginBottom: 12 },
  label: { color: "#B3B3B3", marginTop: 8, marginBottom: 6 },
  input: {
    backgroundColor: "#000",
    color: "#fff",
    padding: 10,
    borderRadius: 8,
  },
  row: { flexDirection: "row", justifyContent: "flex-end", marginTop: 14, gap: 8 },
  button: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8 },
  primary: { backgroundColor: "#1DB954" },
  buttonText: { color: "#fff" },
  primaryText: { color: "#071013", fontWeight: "700" },
});

export default FilterModal;
