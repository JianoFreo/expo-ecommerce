import React, { createContext, useContext, useState } from 'react';

type UserRole = 'buyer' | 'seller' | 'guest' | null;

interface RoleContextType {
  selectedRole: UserRole;
  setSelectedRole: (role: UserRole) => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [selectedRole, setSelectedRole] = useState<UserRole>(null);

  return (
    <RoleContext.Provider value={{ selectedRole, setSelectedRole }}>
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
