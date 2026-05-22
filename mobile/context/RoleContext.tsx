import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type UserRole = 'buyer' | 'seller' | 'guest' | null;

interface RoleContextType {
  selectedRole: UserRole;
  setSelectedRole: (role: UserRole) => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

const STORAGE_KEY = 'selectedRole';

// Fallback in-memory storage for when AsyncStorage native module isn't available
const memoryStorage = new Map<string, string>();

const getItem = async (key: string): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(key);
  } catch {
    return memoryStorage.get(key) ?? null;
  }
};

const setItem = async (key: string, value: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(key, value);
  } catch {
    memoryStorage.set(key, value);
  }
};

const removeItem = async (key: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(key);
  } catch {
    memoryStorage.delete(key);
  }
};

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [selectedRole, setSelectedRoleState] = useState<UserRole>(null);
  const [rehydrated, setRehydrated] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const saved = await getItem(STORAGE_KEY);
        if (mounted && saved) {
          const role = (saved as UserRole) ?? null;
          setSelectedRoleState(role);
        }
      } catch (err) {
        console.warn('Failed to load role from storage', err);
      } finally {
        if (mounted) setRehydrated(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // wrapper that persists role changes
  const setSelectedRole = (role: UserRole) => {
    setSelectedRoleState(role);
    // persist in background (don't block navigation)
    (async () => {
      try {
        if (role === null) {
          await removeItem(STORAGE_KEY);
        } else {
          await setItem(STORAGE_KEY, role);
        }
      } catch (err) {
        console.warn('Failed to persist role', err);
      }
    })();
  };

  return (
    <RoleContext.Provider value={{ selectedRole: rehydrated ? selectedRole : null, setSelectedRole }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRole must be used within RoleProvider');
  }
  return context;
}
