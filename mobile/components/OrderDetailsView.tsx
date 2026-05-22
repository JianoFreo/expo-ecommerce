import React from "react";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View, Image as RNImage } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Image } from "expo-image";
import axiosInstance from "../lib/axios";
import SafeScreen from "./SafeScreen";
import { Product } from "@/types";

type OrderDetails = {
    _id: string;
    user?: {
        _id: string;
        name: string;
        email: string;
        clerkId?: string;
        imageUrl?: string;
    };
    orderItems: Array<{
        _id?: string;
        product: Product;
        name: string;
        price: number;
        quantity: number;
        image: string;
    }>;
    shippingAddress: {
        fullName: string;
        streetAddress: string;
        city: string;
        state: string;
        zipCode: string;
        phoneNumber: string;
    };
    paymentResult?: {
        id?: string;
        status?: string;
    };
    totalPrice: number;
    status: "pending" | "shipped" | "delivered";
    createdAt: string;
    updatedAt: string;
    shippedAt?: string | null;
    deliveredAt?: string | null;
};

type Props = {
    orderId: string;
    endpoint: string;
    title: string;
    subtitle: string;
};

const money = (value: number) => `$${Number(value || 0).toFixed(2)}`;

const formatDateTime = (value?: string | null) => {
    if (!value) return "N/A";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "N/A";
    return date.toLocaleString();
};

export default function OrderDetailsView({ orderId, endpoint, title, subtitle }: Props) {
    const { data, isLoading, isError } = useQuery({
        queryKey: [endpoint, orderId],
        queryFn: async () => {
            const res = await axiosInstance.get(endpoint);
            return res.data?.order as OrderDetails;
        },
        enabled: !!orderId,
    });

    if (isLoading) {
        return (
            <SafeScreen>
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" />
                </View>
            </SafeScreen>
        );
    }

    if (isError || !data) {
        return (
            <SafeScreen>
                <View className="flex-1 items-center justify-center px-6">
                    <Ionicons name="alert-circle-outline" size={48} color="#ff6b6b" />
                    <Text className="text-text-primary text-xl font-bold mt-4">Order not found</Text>
                    <Text className="text-text-secondary text-center mt-2">
                        The order may have been removed or you do not have access to it.
                    </Text>
                    <TouchableOpacity className="bg-primary rounded-2xl px-5 py-3 mt-6" onPress={() => router.back()}>
                        <Text className="text-background font-bold">Go Back</Text>
                    </TouchableOpacity>
                </View>
            </SafeScreen>
        );
    }

    const statusStyle =
        data.status === "delivered"
            ? { bg: "bg-green-500/20", text: "text-green-500" }
            : data.status === "shipped"
                ? { bg: "bg-blue-500/20", text: "text-blue-500" }
                : { bg: "bg-orange-500/20", text: "text-orange-500" };

    return (
        <SafeScreen>
            <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 110 }} showsVerticalScrollIndicator={false}>
                <View className="px-6 pt-6 pb-4 flex-row items-center justify-between">
                    <View>
                        <Text className="text-text-primary text-3xl font-bold tracking-tight">{title}</Text>
                        <Text className="text-text-secondary text-sm mt-1">{subtitle}</Text>
                    </View>
                    <TouchableOpacity className="bg-surface/50 p-3 rounded-full" onPress={() => router.back()}>
                        <Ionicons name="close" size={22} color="#fff" />
                    </TouchableOpacity>
                </View>

                <View className="px-6 gap-4">
                    <View className="bg-surface rounded-3xl p-5">
                        <View className="flex-row items-start justify-end">
                            <View className={`${statusStyle.bg} px-3 py-1 rounded-full`}>
                                <Text className={`${statusStyle.text} font-bold text-xs capitalize`}>{data.status}</Text>
                            </View>
                        </View>

                        <View className="flex-row gap-3 mt-5">
                            <View className="flex-1 bg-black/20 rounded-2xl p-4">
                                <Text className="text-text-secondary text-xs">Total</Text>
                                <Text className="text-primary text-2xl font-bold mt-1">{money(data.totalPrice)}</Text>
                            </View>
                            <View className="flex-1 bg-black/20 rounded-2xl p-4">
                                <Text className="text-text-secondary text-xs">Payment</Text>
                                <Text className="text-text-primary font-semibold mt-1">Stripe</Text>
                                <Text className="text-text-secondary text-xs mt-1">
                                    {data.paymentResult?.status || "pending"}
                                </Text>
                            </View>
                        </View>
                    </View>

                    <View className="bg-surface rounded-3xl p-5">
                        <Text className="text-text-primary text-lg font-bold mb-4">Customer</Text>
                        <View className="flex-row items-center gap-3">
                            <View className="w-12 h-12 rounded-full overflow-hidden bg-black/20 items-center justify-center">
                                {data.user?.imageUrl ? (
                                    <Image source={data.user.imageUrl} style={{ width: 48, height: 48 }} contentFit="cover" />
                                ) : (
                                    <Ionicons name="person-outline" size={22} color="#666" />
                                )}
                            </View>
                            <View className="flex-1">
                                <Text className="text-text-primary font-semibold">{data.user?.name || "Unknown customer"}</Text>
                                <Text className="text-text-secondary text-sm">{data.user?.email || "No email"}</Text>
                            </View>
                        </View>
                    </View>

                    <View className="bg-surface rounded-3xl p-5">
                        <Text className="text-text-primary text-lg font-bold mb-4">Shipping Address</Text>
                        <Text className="text-text-primary font-semibold">{data.shippingAddress.fullName}</Text>
                        <Text className="text-text-secondary mt-1">{data.shippingAddress.streetAddress}</Text>
                        <Text className="text-text-secondary">
                            {data.shippingAddress.city}, {data.shippingAddress.state} {data.shippingAddress.zipCode}
                        </Text>
                        <Text className="text-text-secondary mt-1">{data.shippingAddress.phoneNumber}</Text>
                    </View>

                    <View className="bg-surface rounded-3xl p-5">
                        <Text className="text-text-primary text-lg font-bold mb-4">Timeline</Text>
                        <DetailRow label="Ordered at" value={formatDateTime(data.createdAt)} />
                        <DetailRow label="Updated at" value={formatDateTime(data.updatedAt)} />
                        <DetailRow label="Shipped at" value={formatDateTime(data.shippedAt)} />
                        <DetailRow label="Delivered at" value={formatDateTime(data.deliveredAt)} />
                        <DetailRow label="Payment reference" value={data.paymentResult?.id || "N/A"} />
                    </View>

                    <View className="bg-surface rounded-3xl p-5">
                        <Text className="text-text-primary text-lg font-bold mb-4">Items</Text>
                        <View className="gap-3">
                            {data.orderItems.map((item, index) => {
                                const product = item.product;
                                const shopOwner = product?.shop?.owner?.name || product?.shop?.name || "Platform Store";
                                return (
                                    <View key={`${item._id || index}`} className="flex-row gap-3 bg-black/20 rounded-2xl p-3">
                                        <View className="w-16 h-16 rounded-xl overflow-hidden bg-background-lighter items-center justify-center">
                                            {item.image || product?.images?.[0] ? (
                                                <Image
                                                    source={{ uri: item.image || product?.images?.[0] }}
                                                    style={{ width: 64, height: 64 }}
                                                    contentFit="cover"
                                                />
                                            ) : (
                                                <Ionicons name="cube-outline" size={20} color="#666" />
                                            )}
                                        </View>
                                        <View className="flex-1">
                                            <Text className="text-text-primary font-semibold" numberOfLines={2}>
                                                {item.name}
                                            </Text>
                                            <Text className="text-text-secondary text-xs mt-1">From {shopOwner}</Text>
                                            <Text className="text-text-secondary text-xs mt-1">Qty {item.quantity} x {money(item.price)}</Text>
                                        </View>
                                        <View className="items-end justify-between">
                                            <Text className="text-primary font-bold">{money(item.price * item.quantity)}</Text>
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeScreen>
    );
}

function DetailRow({ label, value }: { label: string; value: string }) {
    return (
        <View className="flex-row items-start justify-between py-2 border-b border-white/5 last:border-b-0">
            <Text className="text-text-secondary text-sm">{label}</Text>
            <Text className="text-text-primary text-sm font-medium text-right flex-1 ml-4">{value}</Text>
        </View>
    );
}