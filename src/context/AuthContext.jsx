import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService, DEMO_ACCOUNTS } from '@/services/authService';
import { tokenStorage } from '@/utils/storage';
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
      if (res?.data?.user) {
        setUser(res.data.user);
        return res.data.user;
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signup = useCallback(async (data) => {
    setIsLoading(true);
    try {
      const res = await authService.signup(data);
      if (res?.data?.user) {
        setUser(res.data.user);
        return res.data.user;
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Quick switcher for demo and testing purposes
  const switchRole = useCallback((roleName) => {
    if (DEMO_ACCOUNTS[roleName]) {
      const demoUser = DEMO_ACCOUNTS[roleName];
      setUser(demoUser);
      tokenStorage.set(`demo-token-${demoUser.id}`);
      localStorage.setItem('dikf_user_session', JSON.stringify(demoUser));
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
    switchRole,
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
