const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string | null;
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