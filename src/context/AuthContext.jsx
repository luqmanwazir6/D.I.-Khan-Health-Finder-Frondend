import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '@/services/authService';
import { setUnauthorizedHandler } from '@/api/axiosClient';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  // Load current session on startup
  useEffect(() => {
    let isMounted = true;
    const initAuth = async () => {
      try {
        const res = await authService.getCurrentUser();
        if (isMounted && res?.data) {
          setUser(res.data);
        }
      } catch {
        // no valid session
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    initAuth();

    // Register global 401 logout listener
    setUnauthorizedHandler(() => {
      logout();
    });

    return () => {
      isMounted = false;
    };
  }, [logout]);

  const login = useCallback(async (credentials) => {
    setIsLoading(true);
    try {
      const res = await authService.login(credentials);
      const authenticatedUser = res?.data?.user || res?.user || res?.data;
      if (authenticatedUser) {
        setUser(authenticatedUser);
        return authenticatedUser;
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signup = useCallback(async (data) => {
    setIsLoading(true);
    try {
      const res = await authService.signup(data);
      const authenticatedUser = res?.data?.user || res?.user || res?.data;
      if (authenticatedUser) {
        setUser(authenticatedUser);
        return authenticatedUser;
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value = {
    user,
    role: user?.role || null,
    isAuthenticated: Boolean(user),
    isLoading,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
