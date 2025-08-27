/* eslint-disable @typescript-eslint/no-explicit-any */
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
  updatedAt?: string;
  profileImage?: string;
  phone?: string;
  address?: string;
  city?: string;
  speciality?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

const authService = {
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, data);
      if (response.data.token) {
        sessionStorage.setItem('token', response.data.token);
        sessionStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error: any) {
      // Handle axios error response
      if (error.response && error.response.data && error.response.data.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('Registration failed. Please try again.');
      }
    }
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
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    const response = await axios.post(`${API_URL}/auth/forgot-password`, { email });
    return response.data;
  },

  async verifyOTP(email: string, otp: string): Promise<{ message: string }> {
    const response = await axios.post(`${API_URL}/auth/verify-otp`, { email, otp });
    return response.data;
  },

  async resetPassword(email: string, otp: string, newPassword: string): Promise<{ message: string }> {
    const response = await axios.post(`${API_URL}/auth/reset-password`, { email, otp, newPassword });
    return response.data;
  },

  async fetchProfile(): Promise<User> {
    const token = this.getToken();
    if (!token) throw new Error('No auth token');
    const response = await axios.get(`${API_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  async updateProfile(data: Partial<RegisterData & { speciality?: string }>): Promise<User> {
    const token = this.getToken();
    if (!token) throw new Error('No auth token');
    const response = await axios.put(`${API_URL}/auth/profile`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    // Update sessionStorage with new user data
    sessionStorage.setItem('user', JSON.stringify(response.data));
    return response.data;
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    const token = this.getToken();
    if (!token) throw new Error('No auth token');
    const response = await axios.put(`${API_URL}/auth/change-password`, { currentPassword, newPassword }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  async deleteProfile(): Promise<{ message: string }> {
    const token = this.getToken();
    if (!token) throw new Error('No auth token');
    const response = await axios.delete(`${API_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('token');
    return response.data;
  }
};

export default authService; 