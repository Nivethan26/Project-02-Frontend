"use client";
import { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { FiSearch, FiX, FiChevronLeft, FiChevronRight, FiPackage, FiUser, FiPhone, FiMail, FiMapPin } from 'react-icons/fi';
import { getAllOrders, updateOrderStatus, OrderItem } from '@/services/orders';
import authService from '@/services/auth';
import Image from 'next/image';

interface AdminOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  date: string;
  total: number;
  subtotal: number;
  shipping: number;
  tax: number;
  status: 'pending' | 'shipped' | 'delivered' | 'cancelled';
  items: OrderItem[];
  itemsCount: number;
  paymentMethod: string;
  orderType: string;
  description: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
}

const statusColors: Record<AdminOrder['status'], string> = {
  pending: "bg-yellow-100 text-yellow-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800"
};

const statusLabels: Record<AdminOrder['status'], string> = {
  pending: "Pending",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled"
};

export default function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<AdminOrder['status'] | 'all'>("all");
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState<AdminOrder['status']>('pending');
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalOrders: 0,
    hasNextPage: false,
    hasPrevPage: false
  });
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const testAuth = async () => {
    try {
      const token = authService.getToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/orders/test-auth`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      console.log('Auth test response status:', response.status);
      const result = await response.json();
      console.log('Auth test result:', result);
      
      return response.ok;
    } catch (error) {
      console.error('Auth test failed:', error);
      return false;
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Debug: Check authentication
      const currentUser = authService.getCurrentUser();
      const token = authService.getToken();
      
      console.log('Current user:', currentUser);
      console.log('Token exists:', !!token);
      
      if (!currentUser || !token) {
        setError('Authentication required. Please log in again.');
        setLoading(false);
        return;
      }
      
      if (currentUser.role !== 'admin') {
        setError('Access denied. Admin privileges required.');
        setLoading(false);
        return;
      }
      
      // Test authentication first
      const authOk = await testAuth();
      if (!authOk) {
        setError('Authentication failed. Please log in again.');
        setLoading(false);
        return;
      }
      
      const result = await getAllOrders({
        status: statusFilter === 'all' ? undefined : statusFilter,
        search: searchTerm || undefined,
        page: pagination.currentPage,
        limit: 20
      });
      setOrders(result.orders as unknown as AdminOrder[]);
      setPagination(result.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, searchTerm, pagination.currentPage]);

  const handleUpdateStatus = async () => {
    if (!selectedOrder) return;
    
    try {
      if (!selectedOrder.id) {
        throw new Error('Order ID is required');
      }
      await updateOrderStatus(selectedOrder.id, newStatus);
      setOrders(prev => prev.map(order => 
        order.id === selectedOrder.id ? { ...order, status: newStatus } : order
      ));
      setSelectedOrder({ ...selectedOrder, status: newStatus });
      setShowStatusModal(false);
      setSuccessMessage('Order status updated successfully!');
      setTimeout(() => setSuccessMessage(null), 2000);
    } catch (err) {
      console.error('Failed to update order status:', err);
    }
  };



  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && orders.length === 0) {
    return (
      <ProtectedRoute role="admin">
        <div className="flex h-screen bg-gray-50">
          <div className="fixed inset-y-0 left-0 w-64">
            <Sidebar role="admin" />
          </div>
          <main className="flex-1 ml-64 p-8 overflow-auto">
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading orders...</p>
              </div>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute role="admin">
      <div className="flex h-screen bg-gray-50">
        <div className="fixed inset-y-0 left-0 w-64">
          <Sidebar role="admin" />
        </div>
        <main className="flex-1 ml-64 p-8 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
                <p className="text-gray-600 mt-1">Manage and track all customer orders</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <div className="relative w-full sm:w-64">
                  <input
                    type="text"
                    placeholder="Search orders..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <FiSearch className="absolute left-3 top-3 text-gray-400" />
                </div>
                <select
                  className="w-full sm:w-48 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as AdminOrder['status'] | 'all')}
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <p className="text-red-800">{error}</p>
                  {error.includes('Authentication') && (
                    <button
                      onClick={() => window.location.href = '/login'}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                    >
                      Go to Login
                    </button>
                  )}
                </div>
              </div>
            )}

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.orderNumber}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{order.customerName}</p>
                            <p className="text-sm text-gray-500">{order.customerEmail}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(order.date)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Rs.{order.total.toFixed(2)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[order.status]}`}>
                            {statusLabels[order.status]}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.itemsCount}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-2">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="px-3 py-1 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-semibold text-sm"
                            aria-label="View order"
                          >
                            View
                          </button>

                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={!pagination.hasPrevPage}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={!pagination.hasNextPage}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">{((pagination.currentPage - 1) * 20) + 1}</span> to{' '}
                        <span className="font-medium">
                          {Math.min(pagination.currentPage * 20, pagination.totalOrders)}
                        </span>{' '}
                        of <span className="font-medium">{pagination.totalOrders}</span> results
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                        <button
                          onClick={() => handlePageChange(pagination.currentPage - 1)}
                          disabled={!pagination.hasPrevPage}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <FiChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handlePageChange(pagination.currentPage + 1)}
                          disabled={!pagination.hasNextPage}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <FiChevronRight className="h-5 w-5" />
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Order Details Modal */}
            {selectedOrder && (
              <div className="fixed inset-0 bg-blue-900/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-blue-200">
                  <div className="p-8">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-bold text-gray-900">Order Details - {selectedOrder.orderNumber}</h2>
                      <button
                        onClick={() => setSelectedOrder(null)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <FiX className="w-6 h-6" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Order Information */}
                      <div className="space-y-4">
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <FiPackage className="w-5 h-5 mr-2" />
                            Order Information
                          </h3>
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Order Number:</span>
                              <span className="font-medium">{selectedOrder.orderNumber}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Order Date:</span>
                              <span className="font-medium">{formatDate(selectedOrder.date)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Order Type:</span>
                              <span className="font-medium capitalize">{selectedOrder.orderType}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Payment Method:</span>
                              <span className="font-medium">{selectedOrder.paymentMethod}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Status:</span>
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[selectedOrder.status]}`}>
                                {statusLabels[selectedOrder.status]}
                              </span>
                            </div>
                            {selectedOrder.trackingNumber && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Tracking Number:</span>
                                <span className="font-medium">{selectedOrder.trackingNumber}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Customer Information */}
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <FiUser className="w-5 h-5 mr-2" />
                            Customer Information
                          </h3>
                          <div className="space-y-3">
                            <div className="flex items-center">
                              <FiUser className="w-4 h-4 text-gray-400 mr-2" />
                              <span className="font-medium">{selectedOrder.customerName}</span>
                            </div>
                            <div className="flex items-center">
                              <FiMail className="w-4 h-4 text-gray-400 mr-2" />
                              <span className="text-gray-600">{selectedOrder.customerEmail}</span>
                            </div>
                            <div className="flex items-center">
                              <FiPhone className="w-4 h-4 text-gray-400 mr-2" />
                              <span className="text-gray-600">{selectedOrder.customerPhone}</span>
                            </div>
                            <div className="flex items-start">
                              <FiMapPin className="w-4 h-4 text-gray-400 mr-2 mt-1" />
                              <span className="text-gray-600">{selectedOrder.customerAddress}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div className="space-y-4">
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items ({selectedOrder.itemsCount})</h3>
                          <div className="space-y-3">
                            {selectedOrder.items.map((item, index) => (
                              <div key={index} className="flex items-center space-x-3 p-3 bg-white rounded-lg border">
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
                                <div className="flex-1">
                                  <h4 className="font-medium text-gray-900">{item.name}</h4>
                                  <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                  <p className="text-sm text-gray-500">Rs.{item.price.toFixed(2)} each</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-medium text-gray-900">Rs.{(item.price * item.quantity).toFixed(2)}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Order Summary */}
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Subtotal:</span>
                              <span className="font-medium">Rs.{selectedOrder.subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Shipping:</span>
                              <span className="font-medium">Rs.{selectedOrder.shipping.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Tax:</span>
                              <span className="font-medium">Rs.{selectedOrder.tax.toFixed(2)}</span>
                            </div>
                            <div className="border-t pt-2 flex justify-between">
                              <span className="text-lg font-semibold text-gray-900">Total:</span>
                              <span className="text-lg font-semibold text-gray-900">Rs.{selectedOrder.total.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-4 mt-6 pt-6 border-t">
                      <button
                        onClick={() => setSelectedOrder(null)}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                      >
                        Close
                      </button>
                      <button
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        onClick={() => {
                          setNewStatus(selectedOrder.status);
                          setShowStatusModal(true);
                        }}
                      >
                        Update Status
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Update Status Modal */}
            {showStatusModal && selectedOrder && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold">Update Order Status</h2>
                    <button
                      onClick={() => setShowStatusModal(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <FiX className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select new status:</label>
                    <select
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={newStatus}
                      onChange={e => setNewStatus(e.target.value as AdminOrder['status'])}
                    >
                      <option value="pending">Pending</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div className="flex justify-end gap-4">
                    <button
                      onClick={() => setShowStatusModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUpdateStatus}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Update
                    </button>
                  </div>
                </div>
              </div>
            )}

            {successMessage && (
              <div className="fixed top-8 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 text-lg font-semibold">
                {successMessage}
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
} 