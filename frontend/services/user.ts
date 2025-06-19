import axios from 'axios';
import authService from './auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = authService.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout');
      throw new Error('Request timeout. Please try again.');
    }
    
    if (!error.response) {
      console.error('Network error:', error);
      throw new Error('Network error. Please check your connection and try again.');
    }

    const message = error.response.data?.message || 'An error occurred';
    console.error('API error:', message);
    throw new Error(message);
  }
);

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'doctor' | 'pharmacist' | 'delivery' | 'customer';
  status: 'active' | 'inactive';
  createdAt: string;
  lastLogin?: string;
  phone?: string;
  address?: string;
  addedBy?: {
    firstName: string;
    lastName: string;
    date: string;
  };
}

// Add CartItem type
export interface CartItem {
  product: string; // product id
  quantity: number;
}

const userService = {
  async getAllUsers(): Promise<User[]> {
    try {
      const response = await api.get('/admin/users');
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  async getStaffMembers(): Promise<User[]> {
    try {
      const response = await api.get('/admin/staff');
      return response.data;
    } catch (error) {
      console.error('Error fetching staff members:', error);
      throw error;
    }
  },

  async createStaffMember(data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone: string;
    address: string;
    role: 'doctor' | 'pharmacist' | 'delivery';
  }): Promise<User> {
    try {
      const response = await api.post('/admin/staff', data);
      return response.data.user;
    } catch (error) {
      console.error('Error creating staff member:', error);
      throw error;
    }
  },

  async updateStaffMember(id: string, data: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    address?: string;
    role?: 'doctor' | 'pharmacist' | 'delivery';
  }): Promise<User> {
    try {
      const response = await api.put(`/admin/staff/${id}`, data);
      return response.data.user;
    } catch (error) {
      console.error('Error updating staff member:', error);
      throw error;
    }
  },

  async deleteStaffMember(id: string): Promise<void> {
    try {
      await api.delete(`/admin/staff/${id}`);
    } catch (error) {
      console.error('Error deleting staff member:', error);
      throw error;
    }
  },

  async updateUserStatus(id: string, status: 'active' | 'inactive'): Promise<User> {
    try {
      const response = await api.patch(`/admin/users/${id}/status`, { status });
      return response.data.user;
    } catch (error) {
      console.error('Error updating user status:', error);
      throw error;
    }
  },

  async deleteUser(id: string): Promise<void> {
    try {
      await api.delete(`/admin/users/${id}`);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },

  // Cart functions
  async getCart(): Promise<CartItem[]> {
    try {
      const response = await api.get('/auth/cart');
      return response.data;
    } catch (error: unknown) {
      console.error('Error fetching cart:', error);
      throw error;
    }
  },

  async updateCart(cart: CartItem[]): Promise<CartItem[]> {
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('token') : null;
    if (!token) {
      // Don't call the API if not logged in
      return [];
    }
    try {
      const response = await api.post('/auth/cart', { cart });
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error && error.message !== 'Not authorized, no token') {
        console.error('Error updating cart:', error);
      }
      throw error;
    }
  }
};

export default userService; 