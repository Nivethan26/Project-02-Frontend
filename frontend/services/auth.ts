/* eslint-disable @typescript-eslint/no-unused-vars */
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  address: string;
}

export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'customer' | 'admin' | 'doctor' | 'pharmacist' | 'delivery';
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

const authService = {
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await axios.post(`${API_URL}/auth/register`, data);
    if (response.data.token) {
      sessionStorage.setItem('token', response.data.token);
      sessionStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await axios.post(`${API_URL}/auth/login`, { email, password });
    if (response.data.token) {
      sessionStorage.setItem('token', response.data.token);
      sessionStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout(): void {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    // Clear any other auth-related data
    sessionStorage.clear();
  },

  getCurrentUser(): User | null {
    const userStr = sessionStorage.getItem('user');
    const token = sessionStorage.getItem('token');
    
    // Only return user if token exists
    if (userStr && token) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        this.logout(); // Clear invalid data
        return null;
      }
    }
    return null;
  },

  getToken() {
    return sessionStorage.getItem('token');
  },

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'admin';
  },

  isCustomer(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'customer';
  },

  isDoctor(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'doctor';
  },

  isPharmacist(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'pharmacist';
  },

  isDelivery(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'delivery';
  },

  isStaff(): boolean {
    const user = this.getCurrentUser();
    return ['admin', 'doctor', 'pharmacist', 'delivery'].includes(user?.role || '');
  }
};

export default authService; 