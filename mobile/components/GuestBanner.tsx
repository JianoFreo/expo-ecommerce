import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRole } from '@/context/RoleContext';
import { router } from 'expo-router';

const GuestBanner = () => {
  const { selectedRole, setSelectedRole } = useRole();

  if (selectedRole !== 'guest') return null;

  return (
    <View className="w-full bg-yellow-100 py-2 px-4 border-b border-yellow-200">
      <View className="flex-row justify-between items-center">
        <Text className="text-sm text-yellow-800">Browsing as guest — sign in for more features</Text>
        <TouchableOpacity
          onPress={() => {
            // clear guest role and navigate to role selection / auth
            setSelectedRole(null);
            router.push('/role-selection');
          }}
          className="px-3 py-1 bg-yellow-200 rounded-full"
        >
          <Text className="text-xs text-yellow-900">Sign in</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default GuestBanner;
