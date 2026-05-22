import SafeScreen from "@/components/SafeScreen";
import { ScrollView, Text, View } from "react-native";

export default function PrivacySecurity() {
  return (
    <SafeScreen>
      <ScrollView className="flex-1 px-6 py-4">
        <Text className="text-2xl font-bold mb-6 text-white">
          Privacy & Security
        </Text>

        <View className="mb-6">
          <Text className="text-lg font-semibold mb-2 text-white">
            Privacy Policy
          </Text>

          <Text className="text-white leading-6 mb-3">
            We value your privacy and are committed to protecting your
            personal information. By using this ecommerce platform,
            you agree to the collection and use of information in
            accordance with this policy.
          </Text>

          <Text className="text-white leading-6 mb-3">
            We may collect account details, order information,
            shipping addresses, and usage data to improve the platform,
            process transactions, and provide customer support.
          </Text>

          <Text className="text-white leading-6">
            Your information will not be sold to third parties.
            However, some data may be shared with payment providers,
            delivery services, and analytics tools required for
            platform operations.
          </Text>
        </View>

        <View className="mb-6">
          <Text className="text-lg font-semibold mb-2 text-white">
            Security
          </Text>

          <Text className="text-white leading-6 mb-3">
            We implement reasonable security measures to protect user
            accounts and platform data. However, no online service can
            guarantee absolute security.
          </Text>

          <Text className="text-white leading-6">
            Users are responsible for maintaining the confidentiality
            of their account credentials and activities associated
            with their accounts.
          </Text>
        </View>

        <View className="mb-6">
          <Text className="text-lg font-semibold mb-2 text-white">
            Marketplace & Seller Policy
          </Text>

          <Text className="text-white leading-6 mb-3">
            Sellers are responsible for the products, pricing,
            descriptions, and transactions associated with their shops.
          </Text>

          <Text className="text-white leading-6">
            The platform reserves the right to remove products,
            suspend seller accounts, or restrict access for violations
            of platform rules or fraudulent activity.
          </Text>
        </View>

        <View className="mb-10">
          <Text className="text-lg font-semibold mb-2 text-white">
            Terms & Conditions
          </Text>

          <Text className="text-white leading-6 mb-3">
            By using this platform, users agree to comply with all
            applicable rules, policies, and regulations.
          </Text>

          <Text className="text-white leading-6 mb-3">
            Users may not engage in illegal activities, fraudulent
            transactions, unauthorized access attempts, or abuse of
            the platform.
          </Text>

          <Text className="text-white leading-6">
            Continued use of the platform indicates acceptance of
            these terms and any future updates or modifications.
          </Text>
        </View>
      </ScrollView>
    </SafeScreen>
  );
}