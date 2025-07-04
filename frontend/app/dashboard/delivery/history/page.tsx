/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import Sidebar from '@/components/layout/Sidebar';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useEffect, useState } from 'react';
import { getOrdersByStatus } from '@/services/orders';
import { Card, CardContent } from '@/components/ui/card';
import { FaHistory, FaClipboardList, FaUser, FaMapMarkerAlt, FaPhone, FaCheckCircle, FaCalendarAlt, FaExclamationTriangle, FaSearch, FaFilter, FaChartLine, FaTrophy } from 'react-icons/fa';

interface DeliveryOrder {
  id: string;
  orderNumber: string;
  name: string;
  address: string;
  phone: string;
  status: string;
}

export default function HistoryPage() {
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterMonth, setFilterMonth] = useState<string>('all');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getOrdersByStatus('delivered');
        setOrders(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.address.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getMonthOptions = () => {
    const months = [
      { value: 'all', label: 'All Time' },
      { value: '1', label: 'January' },
      { value: '2', label: 'February' },
      { value: '3', label: 'March' },
      { value: '4', label: 'April' },
      { value: '5', label: 'May' },
      { value: '6', label: 'June' },
      { value: '7', label: 'July' },
      { value: '8', label: 'August' },
      { value: '9', label: 'September' },
      { value: '10', label: 'October' },
      { value: '11', label: 'November' },
      { value: '12', label: 'December' }
    ];
    return months;
  };

  const getDeliveryStats = () => {
    const totalDeliveries = orders.length;
    const thisMonth = new Date().getMonth() + 1;
    const thisMonthDeliveries = orders.length; // Mock data - in real app would filter by date
    const avgPerDay = totalDeliveries > 0 ? Math.round(totalDeliveries / 30) : 0;
    
    return {
      totalDeliveries,
      thisMonthDeliveries,
      avgPerDay
    };
  };

  const stats = getDeliveryStats();

  if (loading) {
    return (
      <ProtectedRoute role="delivery">
        <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
          <Sidebar role="delivery" />
          <main className="flex-1 ml-64 p-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600"></div>
              </div>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute role="delivery">
      <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 relative overflow-hidden">
        {/* Professional Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50/50 via-white/30 to-gray-50/50"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-slate-200/20 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gray-200/20 rounded-full filter blur-3xl"></div>
        
        <Sidebar role="delivery" />
        
        <main className="flex-1 ml-64 p-8 relative z-10">
          <div className="max-w-7xl mx-auto">
            {/* Professional Header Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-xl flex items-center justify-center shadow-lg">
                    <FaHistory className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-1">Delivery History</h1>
                    <p className="text-slate-600 flex items-center space-x-2">
                      <span>Track your completed deliveries</span>
                      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200">
                    <FaTrophy className="text-emerald-600" />
                    <span className="text-sm font-medium text-slate-900">
                      {filteredOrders.length} Completed
                    </span>
                  </div>
                </div>
              </div>
            </div>


            {/* Enhanced Filters and Search */}
            <Card className="mb-6 border-0 shadow-xl bg-white">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="relative flex-1 max-w-md">
                      <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search completed orders, customers, or addresses..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-transparent bg-slate-50"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <FaFilter className="text-slate-600 w-4 h-4" />
                      <select
                        value={filterMonth}
                        onChange={(e) => setFilterMonth(e.target.value)}
                        className="px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-transparent bg-slate-50 text-slate-700"
                      >
                        {getMonthOptions().map(month => (
                          <option key={month.value} value={month.value}>{month.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <span className="text-sm text-slate-600">Completed Deliveries</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Orders Display */}
            {error ? (
              <Card className="border-0 shadow-xl bg-white">
                <CardContent className="p-8">
                  <div className="text-center">
                    <FaExclamationTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Error Loading History</h3>
                    <p className="text-slate-600">{error}</p>
                  </div>
                </CardContent>
              </Card>
            ) : filteredOrders.length === 0 ? (
              <Card className="border-0 shadow-xl bg-white">
                <CardContent className="p-8">
                  <div className="text-center">
                    <FaHistory className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-slate-900 mb-2">No Delivery History</h3>
                    <p className="text-slate-600">
                      {searchTerm 
                        ? 'No completed orders match your search.' 
                        : 'No completed deliveries found in your history.'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-0 shadow-xl bg-white">
                <CardContent className="p-6">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                            <div className="flex items-center space-x-2">
                              <FaClipboardList className="w-4 h-4" />
                              <span>Order Details</span>
                            </div>
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                            <div className="flex items-center space-x-2">
                              <FaUser className="w-4 h-4" />
                              <span>Customer</span>
                            </div>
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                            <div className="flex items-center space-x-2">
                              <FaMapMarkerAlt className="w-4 h-4" />
                              <span>Delivery Address</span>
                            </div>
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                            <div className="flex items-center space-x-2">
                              <FaPhone className="w-4 h-4" />
                              <span>Contact</span>
                            </div>
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                            <div className="flex items-center space-x-2">
                              <FaCheckCircle className="w-4 h-4" />
                              <span>Status</span>
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-100">
                        {filteredOrders.map((order) => (
                          <tr key={order.id} className="hover:bg-slate-50 transition-colors duration-200">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center space-x-3">
                                <div className="w-3 h-3 bg-emerald-500 rounded-full flex-shrink-0"></div>
                                <div>
                                  <div className="text-sm font-bold text-slate-900">{order.orderNumber}</div>
                                  <div className="text-xs text-slate-500">Order ID: {order.id}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-semibold text-slate-900">{order.name}</div>
                              <div className="text-xs text-slate-500">Customer</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-slate-700 max-w-xs truncate" title={order.address}>
                                {order.address}
                              </div>
                              <div className="text-xs text-slate-500">Delivery Location</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-slate-700">{order.phone}</div>
                              <div className="text-xs text-slate-500">Phone Number</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border bg-emerald-100 text-emerald-800 border-emerald-200">
                                <FaCheckCircle className="w-4 h-4" />
                                <span className="text-xs font-semibold uppercase tracking-wide">Delivered</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Table Footer with Summary */}
                  <div className="mt-6 pt-4 border-t border-slate-200">
                    <div className="flex items-center justify-between text-sm text-slate-600">
                      <div className="flex items-center space-x-4">
                        <span>Showing {filteredOrders.length} of {orders.length} completed deliveries</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                          <span>All Successfully Delivered</span>
                        </div>
                      </div>
                      <div className="text-xs text-slate-500">
                        Last updated: {new Date().toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
} 