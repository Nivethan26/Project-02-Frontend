/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import axios from 'axios';
import toast from 'react-hot-toast';
import Image from 'next/image';

interface Product {
  _id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  description: string;
  status: "active" | "inactive";
  prescription: "required" | "not_required";
  image?: string;
  images?: string[];
}

interface CartItem {
  product: Product;
  quantity: number;
}

interface Customer {
  name: string;
  phone: string;
  email: string;
}

export default function POSPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [customer, setCustomer] = useState<Customer>({ name: '', phone: '', email: '' });
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const getProductImage = (product: Product) => {
    const imagePath = product.images && product.images.length > 0 ? product.images[0] : product.image;
    if (!imagePath) {
      return '/placeholder.png';
    }
    const filename = imagePath.replace(/\\/g, '/').split('/').pop();
    return `http://localhost:8000/uploads/products/${filename}`;
  };

  const fetchProducts = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/api/staff/inventory', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(response.data.filter((product: Product) => product.status === 'active'));
    } catch (error) {
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const testBackendConnection = async () => {
    try {
      console.log('Testing backend connection...');
      
      // Test basic server connection
      const serverTest = await axios.get('http://localhost:8000/');
      console.log('Server is running:', serverTest.data);
      
      // Test simple API endpoint
      const apiTest = await axios.get('http://localhost:8000/api/test');
      console.log('API is accessible:', apiTest.data);
      
      // Test POS route
      const posTest = await axios.get('http://localhost:8000/api/staff/orders/pos-test');
      console.log('POS route is accessible:', posTest.data);
      
      // Test debug routes (optional)
      try {
        const debugTest = await axios.get('http://localhost:8000/api/debug/routes');
        console.log('Available routes:', debugTest.data);
      } catch (debugError: any) {
        console.log('Debug routes not available:', debugError.response?.data);
      }
      
      toast.success('Backend connection test successful! Check console for details.');
    } catch (error: any) {
      console.error('Backend connection test failed:', error);
      console.error('Error status:', error.response?.status);
      console.error('Error message:', error.response?.data);
      toast.error(`Backend test failed: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
    }
  };

  const addToCart = (product: Product) => {
    if (product.stock === 0) {
      toast.error(`${product.name} is out of stock`);
      return;
    }
    
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product._id === product._id);
      if (existingItem) {
        const newQuantity = existingItem.quantity + 1;
        if (newQuantity > product.stock) {
          toast.error(`Only ${product.stock} items available in stock`);
          return prevCart;
        }
        return prevCart.map(item =>
          item.product._id === product._id
            ? { ...item, quantity: newQuantity }
            : item
        );
      } else {
        return [...prevCart, { product, quantity: 1 }];
      }
    });
    toast.success(`${product.name} added to cart`);
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    const product = products.find(p => p._id === productId);
    if (product && newQuantity > product.stock) {
      toast.error(`Only ${product.stock} items available in stock`);
      return;
    }

    setCart(prevCart =>
      prevCart.map(item =>
        item.product._id === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.product._id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setCustomer({ name: '', phone: '', email: '' });
    setPaymentMethod('cash');
  };

  const getSubtotal = () => {
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const getTax = () => {
    return getSubtotal() * 0.05; // 5% tax
  };

  const getTotal = () => {
    return getSubtotal() + getTax();
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(products.map(product => product.category)));

  const processPayment = async () => {
    console.log('Starting payment process...');
    console.log('Cart items:', cart);
    console.log('Customer info:', customer);
    
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    if (!customer.name || !customer.phone) {
      toast.error('Please enter customer information');
      return;
    }

    setProcessingPayment(true);
    try {
      const token = sessionStorage.getItem('token');
      if (!token) {
        toast.error('Authentication token not found. Please login again.');
        return;
      }

      const orderData = {
        customer: customer,
        items: cart.map(item => ({
          productId: item.product._id,
          quantity: item.quantity,
          price: item.product.price
        })),
        paymentMethod: paymentMethod,
        subtotal: getSubtotal(),
        tax: getTax(),
        total: getTotal(),
        description: `POS Sale - ${customer.name}`
      };

      console.log('Order data being sent:', orderData);

      const response = await axios.post('http://localhost:8000/api/staff/orders/pos', orderData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Order created successfully:', response.data);
      console.log('Full order response:', response.data);
      // Find the correct orderId
      let orderId = response.data._id || response.data.id || response.data.orderId || response.data.order?._id;
      if (!orderId) {
        // Recursively search for _id in the response object
        function findId(obj: any): string | undefined {
          if (!obj || typeof obj !== 'object') return undefined;
          if (obj._id) return obj._id;
          for (const key of Object.keys(obj)) {
            const found = findId(obj[key]);
            if (found) return found;
          }
          return undefined;
        }
        orderId = findId(response.data);
        if (orderId) {
          console.warn('OrderId found recursively:', orderId);
        } else {
          console.error('Could not find orderId in order creation response:', response.data);
          toast.error('Could not find order ID after order creation. Payment will not be recorded.');
        }
      }
      if (orderId) {
        // Record payment in the Payment model
        try {
          await axios.post('http://localhost:8000/api/payments', {
            orderId: orderId,
            paymentMethod: paymentMethod,
            amount: getTotal(),
            paymentType: 'pos'
          });
          toast.success('Payment recorded in database!');
        } catch (err) {
          toast.error('Failed to record payment in database');
          console.error('Payment record error:', err);
        }
      }

      setReceiptData({
        orderId: response.data._id || `POS-${Date.now()}`,
        customer: customer,
        items: cart,
        paymentMethod: paymentMethod,
        subtotal: getSubtotal(),
        tax: getTax(),
        total: getTotal(),
        date: new Date().toLocaleString()
      });

      setShowReceipt(true);
      clearCart();
      
      // Refresh products to show updated stock levels
      await fetchProducts();
      
      toast.success('Payment processed successfully! Receipt will be printed automatically.');
      
      // Auto-print receipt after a short delay
      setTimeout(() => {
        printReceipt();
      }, 1000);
      
    } catch (error: any) {
      console.error('Payment processing failed:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      if (error.response?.status === 401) {
        toast.error('Authentication failed. Please login again.');
      } else if (error.response?.status === 400) {
        toast.error(`Validation error: ${error.response?.data?.message || 'Invalid data provided'}`);
      } else if (error.response?.status === 500) {
        toast.error('Server error. Please try again later.');
      } else {
        toast.error(error.response?.data?.message || 'Payment failed. Please check your connection and try again.');
      }
    } finally {
      setProcessingPayment(false);
    }
  };

  const printReceipt = () => {
    if (!receiptData) return;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Pharmacy Receipt</title>
            <style>
              @media print {
                body { margin: 0; padding: 20px; }
                .no-print { display: none; }
              }
              body { 
                font-family: 'Courier New', monospace; 
                margin: 20px; 
                font-size: 12px;
                line-height: 1.4;
              }
              .header { 
                text-align: center; 
                margin-bottom: 20px; 
                border-bottom: 2px solid #000;
                padding-bottom: 10px;
              }
              .receipt { 
                max-width: 300px; 
                margin: 0 auto; 
              }
              .item { 
                display: flex; 
                justify-content: space-between; 
                margin: 3px 0; 
                border-bottom: 1px dotted #ccc;
                padding: 2px 0;
              }
              .total { 
                border-top: 2px solid #000; 
                padding-top: 10px; 
                font-weight: bold; 
                margin-top: 10px;
              }
              .footer { 
                text-align: center; 
                margin-top: 20px; 
                font-size: 10px; 
                color: #666;
                border-top: 1px solid #ccc;
                padding-top: 10px;
              }
              .customer-info {
                margin: 15px 0;
                padding: 10px;
                border: 1px solid #ccc;
                background: #f9f9f9;
              }
              .payment-info {
                background: #e8f4fd;
                padding: 8px;
                margin: 10px 0;
                text-align: center;
                border-radius: 4px;
              }
            </style>
          </head>
          <body>
            <div class="receipt">
              <div class="header">
                <h2 style="margin: 0; font-size: 18px;">🏥 PHARMACY RECEIPT</h2>
                <p style="margin: 5px 0; font-size: 14px;">Order #${receiptData.orderId ? receiptData.orderId.slice(-8).toUpperCase() : 'N/A'}</p>
                <p style="margin: 5px 0; font-size: 12px;">${receiptData.date}</p>
                <p style="margin: 5px 0; font-size: 10px;">Computer Generated Receipt</p>
              </div>
              
              <div class="customer-info">
                <h3 style="margin: 0 0 8px 0; font-size: 14px;">Customer Details:</h3>
                <p style="margin: 3px 0;"><strong>Name:</strong> ${receiptData.customer.name}</p>
                <p style="margin: 3px 0;"><strong>Phone:</strong> ${receiptData.customer.phone}</p>
                ${receiptData.customer.email ? `<p style="margin: 3px 0;"><strong>Email:</strong> ${receiptData.customer.email}</p>` : ''}
              </div>
              
              <div style="margin: 15px 0;">
                <h3 style="margin: 0 0 10px 0; font-size: 14px; border-bottom: 1px solid #000; padding-bottom: 5px;">Items Purchased:</h3>
                ${receiptData.items.map((item: CartItem) => `
                  <div class="item">
                    <div style="flex: 1;">
                      <div style="font-weight: bold;">${item.product.name}</div>
                      <div style="font-size: 10px; color: #666;">${item.quantity} x Rs. ${item.product.price}</div>
                    </div>
                    <div style="text-align: right; font-weight: bold;">
                      Rs. ${(item.product.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                `).join('')}
              </div>
              
              <div class="total">
                <div class="item">
                  <span>Subtotal:</span>
                  <span>Rs. ${receiptData.subtotal.toFixed(2)}</span>
                </div>
                <div class="item">
                  <span>Tax (15%):</span>
                  <span>Rs. ${receiptData.tax.toFixed(2)}</span>
                </div>
                <div class="item" style="font-size: 14px; border-top: 1px solid #000; padding-top: 5px;">
                  <span>TOTAL AMOUNT:</span>
                  <span>Rs. ${receiptData.total.toFixed(2)}</span>
                </div>
              </div>
              
              <div class="payment-info">
                <p style="margin: 5px 0;"><strong>Payment Method:</strong> ${receiptData.paymentMethod.toUpperCase()}</p>
                <p style="margin: 5px 0; font-size: 11px;">✅ Payment Completed Successfully</p>
              </div>
              
              <div class="footer">
                <p style="margin: 5px 0;">Thank you for your purchase!</p>
                <p style="margin: 5px 0;">Please keep this receipt for your records</p>
                <p style="margin: 5px 0;">For any queries, please contact our pharmacy</p>
                <p style="margin: 5px 0;">This is a computer generated receipt</p>
              </div>
            </div>
            
            <div class="no-print" style="text-align: center; margin-top: 20px;">
              <button onclick="window.print()" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">
                Print Receipt
              </button>
              <button onclick="window.close()" style="padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">
                Close
              </button>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      
      // Auto-print after content loads
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  };

  if (loading) {
    return (
      <ProtectedRoute role="pharmacist">
        <div className="flex min-h-screen bg-gray-50">
          <Sidebar role="pharmacist" />
          <main className="flex-1 ml-64 p-8">
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute role="pharmacist">
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar role="pharmacist" />
        <main className="flex-1 ml-64 p-4">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Point of Sale</h1>
              <p className="text-gray-600">Process sales and manage transactions</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Product Catalog */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  {/* Search and Filter */}
                  <div className="p-6 border-b border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2">
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      <div>
                        <select
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="all">All Categories</option>
                          {categories.map((category) => (
                            <option key={category} value={category}>
                              {category.charAt(0).toUpperCase() + category.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Products Grid */}
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 max-h-[70vh] overflow-y-auto">
                      {filteredProducts.map((product) => {
                        const isOutOfStock = product.stock === 0;
                        const isLowStock = product.stock > 0 && product.stock <= 10;
                        
                        return (
                          <div
                            key={product._id}
                            className={`rounded-lg p-4 border transition-colors ${
                              isOutOfStock 
                                ? 'bg-gray-100 border-gray-300 cursor-not-allowed opacity-60' 
                                : 'bg-gray-50 border-gray-200 hover:border-blue-300 cursor-pointer hover:bg-blue-50'
                            }`}
                            onClick={() => !isOutOfStock && addToCart(product)}
                          >
                            <div className="flex items-center space-x-3">
                              <div className={`w-16 h-16 rounded-lg flex items-center justify-center flex-shrink-0 relative ${
                                isOutOfStock ? 'bg-gray-200' : 'bg-white'
                              }`}>
                                <Image
                                  src={getProductImage(product)}
                                  alt={product.name}
                                  fill
                                  priority
                                  sizes="64px"
                                  className={`object-cover rounded ${
                                    isOutOfStock ? 'grayscale' : ''
                                  }`}
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className={`text-sm font-semibold truncate ${
                                  isOutOfStock ? 'text-gray-500' : 'text-gray-900'
                                }`}>{product.name}</h3>
                                <p className={`text-xs truncate ${
                                  isOutOfStock ? 'text-gray-400' : 'text-gray-500'
                                }`}>{product.description}</p>
                                <div className="flex items-center justify-between mt-2">
                                  <span className={`text-lg font-bold ${
                                    isOutOfStock ? 'text-gray-400' : 'text-blue-600'
                                  }`}>Rs. {product.price}</span>
                                  <span className={`text-xs px-2 py-1 rounded-full ${
                                    isOutOfStock ? 'bg-red-100 text-red-800' :
                                    isLowStock ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-green-100 text-green-800'
                                  }`}>
                                    {isOutOfStock ? 'OUT OF STOCK' : 
                                     isLowStock ? `Only ${product.stock} left` : 
                                     `${product.stock} in stock`}
                                  </span>
                                </div>
                                {isOutOfStock && (
                                  <div className="mt-2 text-xs text-red-600 font-medium">
                                    Cannot be added to cart
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Cart and Payment */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  {/* Cart Header */}
                  <div className="bg-gradient-to-r from-blue-600 to-blue-400 text-white p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-bold">Billing Cart</h2>
                        <p className="text-blue-100">{cart.length} items</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">Rs. {getTotal().toFixed(2)}</div>
                        <div className="text-sm text-blue-100">Total Amount</div>
                      </div>
                    </div>
                  </div>

                  {/* Cart Items */}
                  <div className="p-6 max-h-[35vh] overflow-y-auto">
                    {cart.length === 0 ? (
                      <div className="text-center py-8">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m6 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">Cart is empty</h3>
                        <p className="mt-1 text-sm text-gray-500">Add products to start billing</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {cart.map((item) => (
                          <div key={item.product._id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <div className="flex items-start space-x-3">
                              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center flex-shrink-0 border relative">
                                <Image
                                  src={getProductImage(item.product)}
                                  alt={item.product.name}
                                  fill
                                  priority
                                  sizes="48px"
                                  className="object-cover rounded"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-semibold text-gray-900 truncate">{item.product.name}</h4>
                                <p className="text-xs text-gray-500 mb-2">Rs. {item.product.price} each</p>
                                
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        updateQuantity(item.product._id, item.quantity - 1);
                                      }}
                                      className="w-6 h-6 bg-white border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50 text-gray-600"
                                    >
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                                      </svg>
                                    </button>
                                    <span className="text-sm font-bold w-8 text-center bg-white border border-gray-300 rounded py-1">
                                      {item.quantity}
                                    </span>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        updateQuantity(item.product._id, item.quantity + 1);
                                      }}
                                      className="w-6 h-6 bg-white border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50 text-gray-600"
                                    >
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                      </svg>
                                    </button>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-sm font-bold text-gray-900">
                                      Rs. {(item.product.price * item.quantity).toFixed(2)}
                                    </div>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        removeFromCart(item.product._id);
                                      }}
                                      className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center hover:bg-red-200 text-red-600 hover:text-red-800 transition-colors"
                                    >
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                      </svg>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Customer Information */}
                  <div className="p-6 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Customer Details
                    </h3>
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Customer Name *"
                        value={customer.name}
                        onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                      <input
                        type="tel"
                        placeholder="Phone Number *"
                        value={customer.phone}
                        onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                      <input
                        type="email"
                        placeholder="Email (Optional)"
                        value={customer.email}
                        onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="p-6 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      Payment Method
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {['cash', 'card', 'upi', 'bank_transfer'].map((method) => (
                        <button
                          key={method}
                          onClick={() => setPaymentMethod(method)}
                          className={`p-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                            paymentMethod === method
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          {method.charAt(0).toUpperCase() + method.slice(1).replace('_', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Billing Summary */}
                  <div className="p-6 border-t border-gray-200 bg-gray-50">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      Billing Summary
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Items ({cart.length}):</span>
                        <span className="font-medium">Rs. {getSubtotal().toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Tax (5%):</span>
                        <span className="font-medium">Rs. {getTax().toFixed(2)}</span>
                      </div>
                      <div className="border-t border-gray-300 pt-3">
                        <div className="flex justify-between text-lg font-bold text-gray-900">
                          <span>Total Amount:</span>
                          <span>Rs. {getTotal().toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="p-6 border-t border-gray-200">
                    <div className="space-y-3">
                      <button
                        onClick={processPayment}
                        disabled={cart.length === 0 || processingPayment || !customer.name || !customer.phone}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-4 rounded-lg font-bold text-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
                      >
                        {processingPayment ? (
                          <div className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing Payment...
                          </div>
                        ) : (
                          <div className="flex items-center justify-center">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            Complete Billing - Rs. {getTotal().toFixed(2)}
                          </div>
                        )}
                      </button>
                      
                      <button
                        onClick={clearCart}
                        className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                      >
                        Clear Cart & Start New
                      </button>
                      
                      {/* Test Backend Connection */}
                      <button
                        onClick={testBackendConnection}
                        className="w-full bg-yellow-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-yellow-600 transition-colors"
                      >
                        Test Backend Connection
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Receipt Modal */}
          {showReceipt && receiptData && receiptData.orderId && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                <div className="p-6">
                  {/* Receipt Header */}
                  <div className="text-center mb-6 border-b border-gray-200 pb-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">PHARMACY RECEIPT</h2>
                    <p className="text-gray-600 text-sm">Order #{receiptData.orderId ? receiptData.orderId.slice(-8).toUpperCase() : 'N/A'}</p>
                    <p className="text-gray-500 text-xs mt-1">{receiptData.date}</p>
                  </div>
                  
                  <div className="space-y-4">
                    {/* Customer Details */}
                    <div className="border-b border-gray-200 pb-4">
                      <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                        <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Customer Details
                      </h3>
                      <div className="text-sm space-y-1">
                        <p className="text-gray-900"><span className="font-medium">Name:</span> {receiptData.customer.name}</p>
                        <p className="text-gray-900"><span className="font-medium">Phone:</span> {receiptData.customer.phone}</p>
                        {receiptData.customer.email && (
                          <p className="text-gray-900"><span className="font-medium">Email:</span> {receiptData.customer.email}</p>
                        )}
                      </div>
                    </div>

                    {/* Items */}
                    <div className="border-b border-gray-200 pb-4">
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <svg className="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        Items Purchased
                      </h3>
                      <div className="space-y-2">
                        {receiptData.items.map((item: CartItem) => (
                          <div key={item.product._id} className="flex justify-between items-start text-sm">
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">{item.product.name}</div>
                              <div className="text-gray-500 text-xs">
                                {item.quantity} x Rs. {item.product.price}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold text-gray-900">
                                Rs. {(item.product.price * item.quantity).toFixed(2)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Billing Summary */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="font-medium">Rs. {receiptData.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Tax (5%):</span>
                        <span className="font-medium">Rs. {receiptData.tax.toFixed(2)}</span>
                      </div>
                      <div className="border-t border-gray-300 pt-2">
                        <div className="flex justify-between text-lg font-bold text-gray-900">
                          <span>Total Amount:</span>
                          <span>Rs. {receiptData.total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Payment Info */}
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-center text-sm">
                        <p className="text-gray-600">
                          <span className="font-medium">Payment Method:</span> {receiptData.paymentMethod.toUpperCase()}
                        </p>
                        <p className="text-gray-500 text-xs mt-1">Thank you for your purchase!</p>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="text-center text-xs text-gray-500 border-t border-gray-200 pt-4">
                      <p>This is a computer generated receipt</p>
                      <p>For any queries, please contact our pharmacy</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-6 flex space-x-3">
                    <button
                      onClick={() => setShowReceipt(false)}
                      className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => {
                        // Print receipt functionality
                        printReceipt();
                      }}
                      className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                      Print Receipt
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
} 