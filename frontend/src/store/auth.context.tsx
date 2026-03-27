import React, { createContext, useState, useCallback } from 'react';
import type { User } from '@app-types/index';
import { authApi } from '@services/api';

export interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credential: string, password: string) => Promise<{ mustChangePassword: boolean }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

function getCachedUser(): User | null {
  try {
    const s = localStorage.getItem('auth_user');
    return s ? (JSON.parse(s) as User) : null;
  } catch { return null; }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(getCachedUser);
  const [isLoading]     = useState(false);

  const refreshUser = useCallback(async () => {
    try {
      const res = await authApi.me();
      const u = res.data.data;
      setUser(u);
      localStorage.setItem('auth_user', JSON.stringify(u));
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 401) {
        setUser(null);
        localStorage.removeItem('access_token');
        localStorage.removeItem('auth_user');
      }
    }
  }, []);

  const login = async (credential: string, password: string) => {
    const res = await authApi.login(credential, password);
    const { accessToken, user: u, mustChangePassword } = res.data;
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('auth_user', JSON.stringify(u));
    setUser(u);
    return { mustChangePassword };
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('auth_user');
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};
