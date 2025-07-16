/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prefer-const */
"use client";
import Sidebar from '@/components/layout/Sidebar';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { getCustomerOrders, Order } from '@/services/orders';

export default function CustomerOrderPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get user info from session storage
      const token = sessionStorage.getItem("token");
      const userInfo = token ? JSON.parse(sessionStorage.getItem("userInfo") || sessionStorage.getItem("user") || '{}') : null;
      
      console.log('Fetching orders for user:', userInfo);
      
      if (!userInfo) {
        setError('User information not found. Please login again.');
        setOrders([]);
        return;
      }

      // Try different ways to get customer identifier
      let customerId = userInfo._id || userInfo.id;
      let email = userInfo.email;
      let phone = userInfo.phone;
      let userType = userInfo.type || userInfo.userType || userInfo.role;

      // Prevent fetch if type is prescription and no customerId
      if ((userType === 'prescription' || userInfo.orderType === 'prescription') && !customerId) {
        setError('No customer ID found for prescription type.');
        setOrders([]);
        return;
      }

      console.log('Customer identifiers:', { customerId, email, phone });

      // Fetch orders for the logged-in customer
      const customerOrders = await getCustomerOrders(customerId, email, phone);
      // Filter out orders with empty items or totalAmount 0
      const filteredOrders = (customerOrders || []).filter(order => Array.isArray(order.items) && order.items.length > 0 && (order.totalAmount || order.total || 0) > 0);
      console.log('Fetched orders:', filteredOrders);
      setOrders(filteredOrders);
      
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to load orders. Please try again later.');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'processing': return '⚙️';
      case 'shipped': return '📦';
      case 'delivered': return '✅';
      case 'cancelled': return '❌';
      default: return '📋';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  if (loading) {
    return (
      <ProtectedRoute role="customer">
        <div className="flex min-h-screen bg-gray-50">
          <Sidebar role="customer" />
          <main className="flex-1 ml-64 p-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  console.log('selectedOrder:', selectedOrder);
  // Calculate subtotal, shipping, and tax for selectedOrder
  const subtotal = selectedOrder?.subtotal ?? selectedOrder?.items.reduce((sum, item) => sum + item.price * item.quantity, 0) ?? 0;
  const shipping = selectedOrder?.shipping ?? 500;
  const tax = selectedOrder?.tax ?? 0;
  const total = subtotal + shipping + tax;
  return (
    <ProtectedRoute role="customer">
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar role="customer" />
        <main className="flex-1 ml-64 p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
                  <p className="text-gray-600">Track your pharmacy orders and view order history</p>
                </div>
                <button
                  onClick={fetchOrders}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 disabled:opacity-50"
                >
                  <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {loading ? 'Refreshing...' : 'Refresh Orders'}
                </button>
              </div>
            </div>

            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-red-700">{error}</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Orders List */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Order History</h2>
                  
                  {orders.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                      <p className="text-gray-500">Start shopping to see your orders here</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => {
                        const subtotal = order.subtotal ?? order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
                        const shipping = order.shipping ?? 500;
                        const tax = order.tax ?? 0;
                        const total = subtotal + shipping + tax;
                        return (
                          <div
                            key={order.id}
                            onClick={() => setSelectedOrder(order)}
                            className={`p-6 border rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md ${
                              selectedOrder?.id === order.id
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-4">
                              <div>
                                <h3 className="font-semibold text-gray-900">{order.orderNumber}</h3>
                                <p className="text-sm text-gray-500">{formatDate(order.date || order.createdAt || '')}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-gray-900">LKR {total.toFixed(2)}</p>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                  {getStatusIcon(order.status)} {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 mb-3">
                              <span className="text-sm text-gray-600">{order.items.length} {order.items.length === 1 ? 'item' : 'items'}</span>
                              <span className="text-gray-300">•</span>
                              <span className="text-sm text-gray-600">{order.paymentMethod}</span>
                            </div>
                            
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              </svg>
                              <span>{order.shippingAddress}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Order Details */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
                  {selectedOrder ? (
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Details</h2>
                      
                      {/* Order Info */}
                      <div className="space-y-4 mb-6">
                        <div>
                          <h3 className="font-medium text-gray-900">{selectedOrder.orderNumber}</h3>
                          <p className="text-sm text-gray-500">{formatDate(selectedOrder.date || selectedOrder.createdAt || '')}</p>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Status:</span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                            {getStatusIcon(selectedOrder.status)} {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Order Type:</span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.orderType || '')}`}>
                            {getStatusIcon(selectedOrder.orderType || '')} 
                            {selectedOrder.orderType
                              ? selectedOrder.orderType.charAt(0).toUpperCase() + selectedOrder.orderType.slice(1)
                              : 'N/A'}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Total:</span>
                          <span className="font-bold text-gray-900">LKR {total.toFixed(2)}</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Payment:</span>
                          <span className="text-gray-900">{selectedOrder.paymentMethod}</span>
                        </div>
                        
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Shipping:</span>
                            <span className="font-semibold text-gray-900">LKR {shipping.toFixed(2)}</span>
                          </div>

                        {tax > 0 && (
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Tax:</span>
                            <span className="font-semibold text-gray-900">LKR {tax.toFixed(2)}</span>
                          </div>
                        )}

                        
                        {selectedOrder.estimatedDelivery && (
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Delivery:</span>
                            <span className="text-gray-900">{formatDate(selectedOrder.estimatedDelivery)}</span>
                          </div>
                        )}
                      </div>

                      {/* Order Items */}
                      <div className="mb-6">
                        <h4 className="font-medium text-gray-900 mb-3">Items</h4>
                        <div className="space-y-3">
                          {selectedOrder.items.map((item) => (
                            <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                              <div className="relative w-12 h-12 flex-shrink-0">
                                <Image
                                  src={
                                    item.image && item.image.trim()
                                      ? item.image.startsWith('http')
                                        ? item.image.replace(/\\/g, '/')
                                        : item.image.startsWith('/')
                                          ? item.image.replace(/\\/g, '/')
                                          : `http://localhost:8000/${item.image.replace(/\\/g, '/')}`
                                      : '/images/doc1.webp'
                                  }
                                  alt={item.name}
                                  width={48}
                                  height={48}
                                  className="w-12 h-12 object-cover rounded-lg border"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h5 className="font-medium text-gray-900 truncate">{item.name}</h5>
                                <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                              </div>
                              <span className="font-semibold text-gray-900">LKR {(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                            
                          ))}

                        </div>
                      </div>

                      {/* Shipping Address */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Shipping Address</h4>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700">{selectedOrder.shippingAddress}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Select an order</h3>
                      <p className="text-gray-500">Click on an order to view its details</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
} 