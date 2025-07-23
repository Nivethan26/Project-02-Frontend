const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
import authService from './auth';

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string | null;
  customizationConfirmed?: boolean;
}

export interface Order {
  _id?: string;
  id?: string;
  orderNumber: string;
  date?: string;
  createdAt?: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total?: number;
  totalAmount: number;
  subtotal?: number;
  shipping?: number;
  tax?: number;
  items: OrderItem[];
  shippingAddress?: string;
  paymentMethod: string;
  estimatedDelivery?: string;
  customer?: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
  };
  trackingNumber?: string;
  orderType?: string;
  customerId?: string;
  description?: string;
  customizationConfirmed?: boolean;
}

export interface CreateOrderData {
  customer: {
    name: string;
    email: string;
    phone: string;
    billingAddress: string;
    city: string;
    postalCode: string;
  };
  items: OrderItem[];
  paymentMethod: string;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  customerId?: string;
}

export interface PrescriptionOrder {
  _id: string;
  prescriptionNumber?: string;
  date?: string;
  createdAt?: string;
  confirmed?: boolean;
  prescriptionImage?: string;
  doctorName?: string;
  items?: any[]; // adjust as per your model
  shippingAddress?: string;
  totalAmount?: number;
  status?: string;
  paymentMethod?: string;
  estimatedDelivery?: string;
  type?: 'prescription';
}

// Get customer orders
export const getCustomerOrders = async (customerId?: string, email?: string, phone?: string): Promise<Order[]> => {
  try {
    console.log('=== FRONTEND GET CUSTOMER ORDERS START ===');
    console.log('Fetching orders with:', { customerId, email, phone });
    
    const params = new URLSearchParams();
    if (customerId) params.append('customerId', customerId);
    if (email) params.append('email', email);
    if (phone) params.append('phone', phone);

    const url = `${API_BASE_URL}/orders/customer?${params.toString()}`;
    console.log('API URL:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('Backend response data:', result);
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch orders');
    }

    console.log('=== FRONTEND GET CUSTOMER ORDERS SUCCESS ===');
    console.log('Orders received:', result.data);
    // Log prescription orders specifically
    if (Array.isArray(result.data)) {
      const prescriptionOrders = result.data.filter((order: any) => order.orderType === 'prescription');
      console.log('Prescription orders:', prescriptionOrders);
    }
    return result.data;
  } catch (error) {
    console.error('=== FRONTEND GET CUSTOMER ORDERS ERROR ===');
    console.error('Error fetching customer orders:', error);
    throw error;
  }
};

// Get order by ID
export const getOrderById = async (orderId: string): Promise<Order> => {
  try {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch order');
    }

    return result.data;
  } catch (error) {
    console.error('Error fetching order:', error);
    throw error;
  }
};

// Create online order
export const createOnlineOrder = async (orderData: any): Promise<Order> => {
  try {
    console.log('=== FRONTEND ORDER SERVICE START ===');
    console.log('Sending order data to backend:', orderData);
    
    const response = await fetch(`${API_BASE_URL}/orders/online`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    console.log('Backend response status:', response.status);
    console.log('Backend response headers:', response.headers);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('Backend response data:', result);
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to create order');
    }

    console.log('=== FRONTEND ORDER SERVICE SUCCESS ===');
    return result.data;
  } catch (error) {
    console.error('=== FRONTEND ORDER SERVICE ERROR ===');
    console.error('Error creating online order:', error);
    throw error;
  }
};

// Get available products (for debugging)
export const getAvailableProducts = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/orders/debug/products`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch products');
    }

    return result.data;
  } catch (error) {
    console.error('Error fetching available products:', error);
    throw error;
  }
};

// Get all orders by status (for delivery dashboard)
export const getOrdersByStatus = async (status: string) => {
  const response = await fetch(`${API_BASE_URL}/orders?status=${status}`);
  if (!response.ok) throw new Error('Failed to fetch orders');
  const result = await response.json();
  if (!result.success) throw new Error(result.message || 'Failed to fetch orders');
  return result.data;
};

// Update order status by ID (for delivery dashboard)
export const updateOrderStatus = async (orderId: string, status: string) => {
  const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!response.ok) throw new Error('Failed to update order status');
  const result = await response.json();
  if (!result.success) throw new Error(result.message || 'Failed to update order status');
  return result.data;
};

// Get all orders for admin dashboard
export const getAllOrders = async (params: {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
} = {}): Promise<{
  orders: Order[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalOrders: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}> => {
  try {
    const token = authService.getToken();
    if (!token) {
      throw new Error('Authentication token not found. Please log in again.');
    }

    const queryParams = new URLSearchParams();
    if (params.status) queryParams.append('status', params.status);
    if (params.search) queryParams.append('search', params.search);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());

    const response = await fetch(`${API_BASE_URL}/orders/admin/all?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token might be expired, redirect to login
        authService.logout();
        window.location.href = '/login';
        throw new Error('Session expired. Please log in again.');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch orders');
    }

    return result.data;
  } catch (error) {
    console.error('Error fetching all orders:', error);
    throw error;
  }
};

export const getCustomerPrescriptionOrders = async (customerId: string, email?: string, phone?: string): Promise<PrescriptionOrder[]> => {
  const params = new URLSearchParams();
  if (customerId) params.append('customerId', customerId);
  if (email) params.append('email', email);
  if (phone) params.append('phone', phone);
  params.append('orderType', 'prescription'); // Always filter for prescription orders

  const url = `${API_BASE_URL}/prescriptions/customer?${params.toString()}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) throw new Error('Failed to fetch prescription orders');
  const result = await response.json();
  // If your backend wraps data in a success/data object, adjust accordingly
  return result.data || result;
}; 