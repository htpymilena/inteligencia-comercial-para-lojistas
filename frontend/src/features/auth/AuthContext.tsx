import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, UserProfile, StoreItem, LoginResponse } from '@/lib/api';

export interface AuthContextType {
  token: string | null;
  user: UserProfile | null;
  selectedStore: StoreItem | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<LoginResponse>;
  logout: () => void;
  setSelectedStore: (store: StoreItem | null) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Deliberate security decision: token is kept EXCLUSIVELY in memory.
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [selectedStore, setSelectedStore] = useState<StoreItem | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    setSelectedStore(null);
    api.setTokenGetter(() => null);
  }, []);

  useEffect(() => {
    api.setTokenGetter(() => token);
    api.setOnUnauthorized(() => {
      logout();
    });
  }, [token, logout]);

  const login = useCallback(async (credentials: { email: string; password: string }) => {
    setIsLoading(true);
    try {
      const response = await api.login(credentials);
      setToken(response.access_token);
      setUser(response.user);
      api.setTokenGetter(() => response.access_token);
      return response;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value: AuthContextType = {
    token,
    user,
    selectedStore,
    isAuthenticated: Boolean(token && user),
    isLoading,
    login,
    logout,
    setSelectedStore,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }
  return context;
}
