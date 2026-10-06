import axiosClient from '@/api/axiosClient';
import { ENDPOINTS } from '@/api/endpoints';
import { ROLES } from '@/constants/roles';
import { tokenStorage, storage } from '@/utils/storage';

const USER_SESSION_KEY = 'dikf_user_session';

/** Default demo accounts allowing instant role switching and test testing */
export const DEMO_ACCOUNTS = {
  customer: {
    id: 'cust-1',
    name: 'Muhammad Luqman',
    email: 'luqman@example.com',
    phone: '+92 300 1234567',
    role: ROLES.CUSTOMER,
    city: 'dera-ismail-khan',
    area: 'Cantt Area',
    address: 'House #42, Street 4, Officer Colony, Cantt',
  },
  provider: {
    id: 'prov-101',
    name: 'Ustad Tariq Mehmood',
    email: 'tariq@example.com',
    phone: '+92 300 9876543',
    role: ROLES.PROVIDER,
    service: 'Plumber',
    serviceId: 'plumber',
    category: 'Home Services',
    categoryId: 'home-services',
    isVerified: true,
    city: 'dera-ismail-khan',
    area: 'Circular Road',
  },
  admin: {
    id: 'admin-1',
    name: 'System Administrator',
    email: 'admin@dikhanfinder.com',
    phone: '+92 300 0000000',
    role: ROLES.ADMIN,
    city: 'dera-ismail-khan',
  },
};

/**
 * Service module for Authentication.
 * Shared API Contract:
 * POST /api/v1/auth/signup
 * POST /api/v1/auth/login
 * GET /api/v1/auth/me
 */
export const authService = {
  async signup(data) {
    try {
      const response = await axiosClient.post(ENDPOINTS.AUTH.SIGNUP, data);
      if (response.data?.token) {
        tokenStorage.set(response.data.token);
      }
      return response.data;
    } catch {
      // Mock signup for offline / pre-backend testing
      const role = data.role === ROLES.PROVIDER ? ROLES.PROVIDER : ROLES.CUSTOMER;
      const newUser = {
        id: `${role === ROLES.PROVIDER ? 'prov' : 'cust'}-${Date.now()}`,
        name: data.name,
        email: data.email,
        phone: data.phone,
        role,
        service: data.service || undefined,
        category: data.category || undefined,
        city: 'dera-ismail-khan',
        area: data.area || 'Topanwala Gate',
        isVerified: false,
      };
      const token = `mock-token-${Date.now()}`;
      tokenStorage.set(token);
      storage.set(USER_SESSION_KEY, JSON.stringify(newUser));
      return {
        success: true,
        message: 'Account created successfully',
        data: { user: newUser, token },
      };
    }
  },

  async login(credentials) {
    try {
      const response = await axiosClient.post(ENDPOINTS.AUTH.LOGIN, credentials);
      if (response.data?.token) {
        tokenStorage.set(response.data.token);
      }
      return response.data;
    } catch {
      // Offline / demo fallback login logic
      const targetRole = credentials.demoRole || credentials.role || ROLES.CUSTOMER;
      const user = DEMO_ACCOUNTS[targetRole] || DEMO_ACCOUNTS.customer;
      const token = `mock-jwt-token-${user.id}`;
      tokenStorage.set(token);
      storage.set(USER_SESSION_KEY, JSON.stringify(user));
      return {
        success: true,
        message: 'Logged in successfully',
        data: { user, token },
      };
    }
  },

  async getCurrentUser() {
    try {
      const response = await axiosClient.get(ENDPOINTS.AUTH.ME);
      return response.data;
    } catch {
      const stored = storage.get(USER_SESSION_KEY);
      if (stored) {
        try {
          return {
            success: true,
            message: 'User session loaded',
            data: JSON.parse(stored),
          };
        } catch {
          // ignore
        }
      }
      return null;
    }
  },

  logout() {
    tokenStorage.clear();
    storage.remove(USER_SESSION_KEY);
  },
};
