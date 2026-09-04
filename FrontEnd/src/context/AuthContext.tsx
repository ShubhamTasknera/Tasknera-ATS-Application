'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchApi, User, AuthResponse, UserRole } from '../lib/api';
import { atsStore } from '../lib/atsStore';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signin: (email: string, password: string) => Promise<UserRole>;
  signup: (name: string, email: string, password: string) => Promise<UserRole>;
  googleSignin: () => Promise<void>;
  setRole: (role: UserRole) => void;
  logout: () => void;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DESIGNATED_ADMIN_EMAIL = 'admin123@gmail.com';

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
          const isDesignatedAdmin = data.user.email?.toLowerCase().trim() === DESIGNATED_ADMIN_EMAIL;
          const userRole: UserRole = isDesignatedAdmin ? 'ADMIN' : 'RECRUITER_MEMBER';
          const fullUser = { 
            ...data.user, 
            name: isDesignatedAdmin ? 'Admin' : data.user.name,
            role: userRole 
          };
          setUser(fullUser);
          atsStore.ensureMember(fullUser);
          localStorage.setItem('tasknera_role', userRole);
          if (data.user.name) localStorage.setItem('tasknera_name', fullUser.name || 'User');
          if (data.user.email) localStorage.setItem('tasknera_email', data.user.email);
        } else {
          throw new Error('Invalid user response');
        }
      } catch (err) {
        console.warn('Fallback to local stored session:', err);
        const savedEmail = localStorage.getItem('tasknera_email');
        const savedName = localStorage.getItem('tasknera_name');
        const savedUserId = localStorage.getItem('tasknera_user_id');
        if (savedEmail) {
          const isDesignatedAdmin = savedEmail.toLowerCase().trim() === DESIGNATED_ADMIN_EMAIL;
          const computedRole: UserRole = isDesignatedAdmin ? 'ADMIN' : 'RECRUITER_MEMBER';
          const userId = savedUserId || (computedRole === 'ADMIN' ? 'admin-1' : `usr-${savedEmail.toLowerCase().replace(/[^a-zA-Z0-9]/g, '_')}`);
          const fallbackUser = {
            id: userId,
            email: savedEmail,
            name: isDesignatedAdmin ? 'Admin' : (savedName || 'Team Member'),
            role: computedRole,
          };
          setUser(fallbackUser);
          atsStore.ensureMember(fallbackUser);
          localStorage.setItem('tasknera_role', computedRole);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const setRole = (newRole: UserRole) => {
    const isDesignatedAdmin = user?.email?.toLowerCase().trim() === DESIGNATED_ADMIN_EMAIL;
    if (newRole === 'ADMIN' && !isDesignatedAdmin) {
      console.warn('[AuthContext] Access restricted: Only admin123@gmail.com can assume the ADMIN role.');
      return;
    }
    const resolvedRole: UserRole = newRole === 'ADMIN' && isDesignatedAdmin ? 'ADMIN' : 'RECRUITER_MEMBER';
    localStorage.setItem('tasknera_role', resolvedRole);
    setUser(prev => {
      const updated = prev ? { ...prev, role: resolvedRole } : { id: 'usr-1', email: 'user@tasknera.com', name: 'User', role: resolvedRole };
      atsStore.ensureMember(updated);
      return updated;
    });
  };

  const signin = async (email: string, password: string): Promise<UserRole> => {
    const cleanEmail = email.trim().toLowerCase();
    const isDesignatedAdmin = cleanEmail === DESIGNATED_ADMIN_EMAIL;
    const defaultRole: UserRole = isDesignatedAdmin ? 'ADMIN' : 'RECRUITER_MEMBER';
    const userName = isDesignatedAdmin ? 'Admin' : (email.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Team Member');
    const uniqueUserId = isDesignatedAdmin ? 'admin-1' : `usr-${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`;
    const dummyToken = 'tasknera_jwt_' + Date.now();

    try {
      const data = await fetchApi<AuthResponse>('/auth/signin', {
        method: 'POST',
        body: JSON.stringify({ email: cleanEmail, password }),
      });
      const userRole: UserRole = isDesignatedAdmin ? 'ADMIN' : 'RECRUITER_MEMBER';
      const resolvedUserId = data.user?.id || uniqueUserId;
      localStorage.setItem('tasknera_token', data.token);
      localStorage.setItem('tasknera_role', userRole);
      localStorage.setItem('tasknera_email', data.user?.email || cleanEmail);
      localStorage.setItem('tasknera_name', isDesignatedAdmin ? 'Admin' : (data.user?.name || userName));
      localStorage.setItem('tasknera_user_id', resolvedUserId);
      setToken(data.token);
      const signedUser = { ...data.user, id: resolvedUserId, name: isDesignatedAdmin ? 'Admin' : (data.user?.name || userName), role: userRole };
      setUser(signedUser);
      atsStore.ensureMember(signedUser);
      return userRole;
    } catch {
      // Standalone frontend fallback
      localStorage.setItem('tasknera_token', dummyToken);
      localStorage.setItem('tasknera_role', defaultRole);
      localStorage.setItem('tasknera_email', cleanEmail);
      localStorage.setItem('tasknera_name', isDesignatedAdmin ? 'Admin' : userName);
      localStorage.setItem('tasknera_user_id', uniqueUserId);
      setToken(dummyToken);
      const fallbackUser = {
        id: uniqueUserId,
        email: cleanEmail,
        name: isDesignatedAdmin ? 'Admin' : userName,
        role: defaultRole,
      };
      setUser(fallbackUser);
      atsStore.ensureMember(fallbackUser);
      return defaultRole;
    }
  };

  const signup = async (name: string, email: string, password: string): Promise<UserRole> => {
    const cleanEmail = email.trim().toLowerCase();
    const isDesignatedAdmin = cleanEmail === DESIGNATED_ADMIN_EMAIL;
    const defaultRole: UserRole = isDesignatedAdmin ? 'ADMIN' : 'RECRUITER_MEMBER';
    const uniqueUserId = isDesignatedAdmin ? 'admin-1' : `usr-${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`;
    const dummyToken = 'tasknera_jwt_' + Date.now();

    try {
      const data = await fetchApi<AuthResponse>('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ name: isDesignatedAdmin ? 'Admin' : name, email: cleanEmail, password }),
      });
      const userRole: UserRole = isDesignatedAdmin ? 'ADMIN' : 'RECRUITER_MEMBER';
      const resolvedUserId = data.user?.id || uniqueUserId;
      localStorage.setItem('tasknera_token', data.token);
      localStorage.setItem('tasknera_role', userRole);
      localStorage.setItem('tasknera_email', data.user?.email || cleanEmail);
      localStorage.setItem('tasknera_name', isDesignatedAdmin ? 'Admin' : name);
      localStorage.setItem('tasknera_user_id', resolvedUserId);
      setToken(data.token);
      const signedUser = { ...data.user, id: resolvedUserId, name: isDesignatedAdmin ? 'Admin' : name, role: userRole };
      setUser(signedUser);
      atsStore.ensureMember(signedUser);
      return userRole;
    } catch {
      // Standalone frontend fallback
      localStorage.setItem('tasknera_token', dummyToken);
      localStorage.setItem('tasknera_role', defaultRole);
      localStorage.setItem('tasknera_email', cleanEmail);
      localStorage.setItem('tasknera_name', isDesignatedAdmin ? 'Admin' : name);
      localStorage.setItem('tasknera_user_id', uniqueUserId);
      setToken(dummyToken);
      const fallbackUser = {
        id: uniqueUserId,
        email: cleanEmail,
        name: isDesignatedAdmin ? 'Admin' : name,
        role: defaultRole,
      };
      setUser(fallbackUser);
      atsStore.ensureMember(fallbackUser);
      return defaultRole;
    }
  };

  const googleSignin = async (): Promise<void> => {
    return new Promise((resolve, reject) => {
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      if (!clientId) {
        reject(new Error('Google Client ID is not configured'));
        return;
      }

      // Load the GIS script if not already present
      const loadGIS = (): Promise<void> => {
        return new Promise((res) => {
          if (typeof window !== 'undefined' && (window as any).google?.accounts?.id) {
            res();
            return;
          }
          const script = document.createElement('script');
          script.src = 'https://accounts.google.com/gsi/client';
          script.async = true;
          script.defer = true;
          script.onload = () => res();
          script.onerror = () => res(); // still attempt even if blocked
          document.head.appendChild(script);
        });
      };

      loadGIS().then(() => {
        const google = (window as any).google;
        if (!google?.accounts?.id) {
          reject(new Error('Google Identity Services failed to load'));
          return;
        }

        google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response: { credential: string }) => {
            try {
              const idToken = response.credential;
              if (!idToken) throw new Error('No credential received from Google');

              const data = await fetchApi<AuthResponse>('/auth/google', {
                method: 'POST',
                body: JSON.stringify({ idToken }),
              });

              const userRole: UserRole = data.user?.role === 'ADMIN' ? 'ADMIN' : 'RECRUITER_MEMBER';
              const resolvedUserId = data.user?.id || `usr-google-${Date.now()}`;

              localStorage.setItem('tasknera_token', data.token);
              localStorage.setItem('tasknera_role', userRole);
              localStorage.setItem('tasknera_email', data.user?.email || '');
              localStorage.setItem('tasknera_name', data.user?.name || '');
              localStorage.setItem('tasknera_user_id', resolvedUserId);
              if (data.user?.avatarUrl) {
                localStorage.setItem('tasknera_avatar', data.user.avatarUrl);
              }

              setToken(data.token);
              setUser({ ...data.user, id: resolvedUserId, role: userRole });

              google.accounts.id.cancel();
              resolve();
            } catch (err) {
              reject(err instanceof Error ? err : new Error('Google authentication failed'));
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        // Try One Tap first, fall back to popup
        google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            // One Tap was suppressed — use popup flow
            const tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
              client_id: clientId,
              scope: 'openid email profile',
              callback: '', // handled by initTokenClient's promise equivalent
            });
            // Fall back: re-use the id flow via renderButton on a hidden div
            const tempDiv = document.createElement('div');
            tempDiv.style.display = 'none';
            document.body.appendChild(tempDiv);
            google.accounts.id.renderButton(tempDiv, {
              type: 'standard',
              shape: 'rectangular',
              theme: 'outline',
              size: 'large',
            });
            // Click the hidden button to trigger the Google popup
            const btn = tempDiv.querySelector('[role="button"], button, div[tabindex]') as HTMLElement | null;
            if (btn) {
              btn.click();
            } else {
              document.body.removeChild(tempDiv);
              reject(new Error('Google sign-in popup could not be opened. Please try again.'));
            }
          }
        });
      });
    });
  };

  const logout = (): void => {
    localStorage.removeItem('tasknera_token');
    localStorage.removeItem('tasknera_role');
    localStorage.removeItem('tasknera_email');
    localStorage.removeItem('tasknera_name');
    localStorage.removeItem('tasknera_user_id');
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
