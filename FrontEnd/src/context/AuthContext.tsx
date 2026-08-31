'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchApi, User, AuthResponse } from '../lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signin: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('tasknera_token');
    if (savedToken) {
      setToken(savedToken);
      fetchApi<{ user: User }>('/auth/me', { method: 'GET' }, savedToken)
        .then((data) => {
          setUser(data.user);
        })
        .catch(() => {
          localStorage.removeItem('tasknera_token');
          setToken(null);
          setUser(null);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const signin = async (email: string, password: string): Promise<void> => {
    const data = await fetchApi<AuthResponse>('/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    localStorage.setItem('tasknera_token', data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const signup = async (name: string, email: string, password: string): Promise<void> => {
    const data = await fetchApi<AuthResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });

    localStorage.setItem('tasknera_token', data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const logout = (): void => {
    localStorage.removeItem('tasknera_token');
    setToken(null);
    setUser(null);
    if (typeof window !== 'undefined') {
      window.location.href = '/home';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        signin,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
