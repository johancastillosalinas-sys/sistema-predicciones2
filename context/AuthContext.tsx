'use client';

import React, { createContext, useContext, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, UserRole } from '@/types';
import { useData } from './DataContext';

interface AuthContextType {
  currentUser: User | undefined;
  currentRole: UserRole;
  isAdmin: boolean;
  canEdit: boolean;
  canManageMembers: boolean;
  switchUser: (userId: string) => void;
  setCurrentUserDirect: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { users } = useData();
  const router = useRouter();

  // Estado local del usuario activo (almacena el objeto de usuario activo o su ID)
  const [activeUser, setActiveUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('inmo_user_obj');
      return saved ? JSON.parse(saved) : null;
    }
    return null;
  });

  // Busca en la lista de usuarios o mantiene el usuario activo en sesión
  const currentUser = users.find((u) => u.email.toLowerCase() === activeUser?.email?.toLowerCase()) || activeUser || undefined;

  const switchUser = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (target) {
      setActiveUser(target);
      localStorage.setItem('inmo_user_id', target.id);
      localStorage.setItem('inmo_user_obj', JSON.stringify(target));
    }
  };

  const setCurrentUserDirect = (user: User) => {
    setActiveUser(user);
    localStorage.setItem('inmo_user_id', user.id);
    localStorage.setItem('inmo_user_obj', JSON.stringify(user));
  };

  const logout = () => {
    setActiveUser(null);
    localStorage.removeItem('inmo_user_id');
    localStorage.removeItem('inmo_user_obj');
    router.push('/projects');
  };

  const isAdmin = currentUser?.role === 'ADMIN';
  const canEdit = currentUser?.role === 'ADMIN' || currentUser?.role === 'EDITOR';
  const canManageMembers = currentUser?.role === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentRole: currentUser?.role || 'READER',
        isAdmin,
        canEdit,
        canManageMembers,
        switchUser,
        setCurrentUserDirect,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe utilizarse dentro de un AuthProvider');
  }
  return context;
}