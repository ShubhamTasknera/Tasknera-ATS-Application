'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchApi, User, AuthResponse, UserRole } from '../lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signin: (email: string, password: string) => Promise<UserRole>;
  signup: (name: string, email: string, password: string) => Promise<UserRole>;
  googleSignin: (email?: string, name?: string) => Promise<void>;
  setRole: (role: UserRole) => void;
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
    if (!savedToken) {
      setIsLoading(false);
      return;
    }

    const loadUser = async () => {
      setToken(savedToken);
      try {
        const data = await fetchApi<{ user: User }>('/auth/me', {}, savedToken);
        if (data && data.user) {
          const userRole: UserRole = data.user.role === 'ADMIN' ? 'ADMIN' : 'RECRUITER_MEMBER';
          setUser({ ...data.user, role: userRole });
          localStorage.setItem('tasknera_role', userRole);
          if (data.user.name) localStorage.setItem('tasknera_name', data.user.name);
          if (data.user.email) localStorage.setItem('tasknera_email', data.user.email);
        } else {
          throw new Error('Invalid user response');
        }
      } catch (err) {
        console.warn('Fallback to local stored session:', err);
        const savedRole = localStorage.getItem('tasknera_role') as UserRole | null;
        const savedEmail = localStorage.getItem('tasknera_email');
        const savedName = localStorage.getItem('tasknera_name');
        if (savedEmail) {
          const computedRole: UserRole = savedRole || (savedEmail.toLowerCase().includes('admin') ? 'ADMIN' : 'RECRUITER_MEMBER');
          setUser({
            id: computedRole === 'ADMIN' ? 'admin-1' : 'rec-1',
            email: savedEmail,
            name: savedName || (computedRole === 'ADMIN' ? 'Administrator' : 'Team Member'),
            role: computedRole,
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const setRole = (newRole: UserRole) => {
    localStorage.setItem('tasknera_role', newRole);
    setUser(prev => prev ? { ...prev, role: newRole } : { id: 'usr-1', email: 'user@tasknera.com', name: 'User', role: newRole });
  };

  const signin = async (email: string, password: string): Promise<UserRole> => {
    const cleanEmail = email.trim().toLowerCase();
    const isAdmin = cleanEmail === 'admin@tasknera.com' || cleanEmail === 'admin@ats.tasknera.com';
    const defaultRole: UserRole = isAdmin ? 'ADMIN' : 'RECRUITER_MEMBER';
    const userName = isAdmin ? 'Administrator' : (email.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Team Member');
    const dummyToken = 'tasknera_jwt_' + Date.now();

    try {
      const data = await fetchApi<AuthResponse>('/auth/signin', {
        method: 'POST',
        body: JSON.stringify({ email: cleanEmail, password }),
      });
      const userRole: UserRole = (data.user?.role === 'ADMIN' || isAdmin) ? 'ADMIN' : 'RECRUITER_MEMBER';
      localStorage.setItem('tasknera_token', data.token);
      localStorage.setItem('tasknera_role', userRole);
      localStorage.setItem('tasknera_email', data.user?.email || cleanEmail);
      localStorage.setItem('tasknera_name', data.user?.name || userName);
      setToken(data.token);
      setUser({ ...data.user, role: userRole });
      return userRole;
    } catch {
      // Standalone frontend fallback
      localStorage.setItem('tasknera_token', dummyToken);
      localStorage.setItem('tasknera_role', defaultRole);
      localStorage.setItem('tasknera_email', cleanEmail);
      localStorage.setItem('tasknera_name', userName);
      setToken(dummyToken);
      setUser({
        id: isAdmin ? 'admin-1' : 'rec-1',
        email: cleanEmail,
        name: userName,
        role: defaultRole,
      });
      return defaultRole;
    }
  };

  const signup = async (name: string, email: string, password: string): Promise<UserRole> => {
    const cleanEmail = email.trim().toLowerCase();
    const isAdmin = cleanEmail === 'admin@tasknera.com';
    const defaultRole: UserRole = isAdmin ? 'ADMIN' : 'RECRUITER_MEMBER';
    const dummyToken = 'tasknera_jwt_' + Date.now();

    try {
      const data = await fetchApi<AuthResponse>('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ name, email: cleanEmail, password }),
      });
      const userRole: UserRole = (data.user?.role === 'ADMIN' || isAdmin) ? 'ADMIN' : 'RECRUITER_MEMBER';
      localStorage.setItem('tasknera_token', data.token);
      localStorage.setItem('tasknera_role', userRole);
      localStorage.setItem('tasknera_email', data.user?.email || cleanEmail);
      localStorage.setItem('tasknera_name', name);
      setToken(data.token);
      setUser({ ...data.user, role: userRole });
      return userRole;
    } catch {
      // Standalone frontend fallback
      localStorage.setItem('tasknera_token', dummyToken);
      localStorage.setItem('tasknera_role', defaultRole);
      localStorage.setItem('tasknera_email', cleanEmail);
      localStorage.setItem('tasknera_name', name);
      setToken(dummyToken);
      setUser({
        id: isAdmin ? 'admin-1' : 'rec-1',
        email: cleanEmail,
        name,
        role: defaultRole,
      });
      return defaultRole;
    }
  };

  const googleSignin = async (email?: string, name?: string): Promise<void> => {
    const defaultEmail = email || 'recruiter@tasknera.com';
    const defaultName = name || 'Google User';

    const data = await fetchApi<AuthResponse>('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ email: defaultEmail, name: defaultName }),
    });

    localStorage.setItem('tasknera_token', data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const logout = (): void => {
    localStorage.removeItem('tasknera_token');
    localStorage.removeItem('tasknera_role');
    localStorage.removeItem('tasknera_email');
    localStorage.removeItem('tasknera_name');
    // NOTE: Keep user's created jobs and evaluation data in localStorage so work is never lost across sessions
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
        googleSignin,
        setRole,
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
