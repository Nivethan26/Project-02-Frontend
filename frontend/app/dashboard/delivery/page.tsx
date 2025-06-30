"use client";
import Sidebar from '@/components/layout/Sidebar';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { FaTruck, FaHistory, FaUserCircle, FaClipboardList, FaMapMarkerAlt, FaClock, FaCheckCircle, FaExclamationTriangle, FaChartLine, FaStar, FaRoute, FaBell } from 'react-icons/fa';
import { useEffect, useState } from 'react';
import { getOrdersByStatus } from '@/services/orders';

interface RecentActivity {
  id: string;
  orderNumber: string;
  customerName: string;
  status: string;
  timestamp: string;
  location?: string;
  priority?: string;
}

interface PerformanceMetrics {
  totalOrders: number;
  successRate: number;
  avgDeliveryTime: string;
  customerRating: number;
  weeklyDeliveries: number;
  monthlyDeliveries: number;
}

export default function DeliveryDashboardPage() {
  const [pending, setPending] = useState(0);
  const [shipped, setShipped] = useState(0);
  const [delivered, setDelivered] = useState(0);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics>({
    totalOrders: 0,
    successRate: 0,
    avgDeliveryTime: '24h',
    customerRating: 4.8,
    weeklyDeliveries: 0,
    monthlyDeliveries: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch order statistics
        const [pendingOrders, shippedOrders, deliveredOrders] = await Promise.all([
          getOrdersByStatus('pending'),
          getOrdersByStatus('shipped'),
          getOrdersByStatus('delivered')
        ]);

        setPending(pendingOrders.length);
        setShipped(shippedOrders.length);
        setDelivered(deliveredOrders.length);

        // Calculate performance metrics
        const totalOrders = pendingOrders.length + shippedOrders.length + deliveredOrders.length;
        const successRate = totalOrders > 0 ? Math.round((deliveredOrders.length / totalOrders) * 100) : 0;

        // Calculate average delivery time (mock calculation based on delivered orders)
        const avgDeliveryTime = deliveredOrders.length > 0 ? 
          Math.round(24 + (deliveredOrders.length * 2)) + 'h' : '24h';

        // Calculate weekly and monthly deliveries (mock data)
        const weeklyDeliveries = Math.round(deliveredOrders.length * 0.3);
        const monthlyDeliveries = Math.round(deliveredOrders.length * 1.2);

        setPerformanceMetrics({
          totalOrders,
          successRate,
          avgDeliveryTime,
          customerRating: 4.8,
          weeklyDeliveries,
          monthlyDeliveries
        });

        // Generate recent activity from actual orders
        const generateRecentActivity = (): RecentActivity[] => {
          const activities: RecentActivity[] = [];
          
          // Add recent delivered orders
          deliveredOrders.slice(0, 2).forEach((order: any, index: number) => {
            activities.push({
              id: order.id,
              orderNumber: order.orderNumber,
              customerName: order.name,
              status: 'delivered',
              timestamp: new Date(Date.now() - (index + 1) * 2 * 60 * 60 * 1000).toISOString(), // 2, 4 hours ago
              location: order.address
            });
          });

          // Add recent shipped orders
          shippedOrders.slice(0, 1).forEach((order: any, index: number) => {
            activities.push({
              id: order.id,
              orderNumber: order.orderNumber,
              customerName: order.name,
              status: 'shipped',
              timestamp: new Date(Date.now() - (index + 3) * 2 * 60 * 60 * 1000).toISOString(), // 6 hours ago
              location: order.address
            });
          });

          // Add recent pending orders
          pendingOrders.slice(0, 1).forEach((order: any, index: number) => {
            activities.push({
              id: order.id,
              orderNumber: order.orderNumber,
              customerName: order.name,
              status: 'pending',
              timestamp: new Date(Date.now() - (index + 4) * 2 * 60 * 60 * 1000).toISOString(), // 8 hours ago
              priority: 'High'
            });
          });

          // Sort by timestamp (most recent first)
          return activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        };

        setRecentActivity(generateRecentActivity());

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const totalOrders = pending + shipped + delivered;
  const successRate = totalOrders > 0 ? Math.round((delivered / totalOrders) * 100) : 0;

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - activityTime.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours === 1) return '1 hour ago';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return '1 day ago';
    return `${diffInDays} days ago`;
  };

  const getActivityIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <FaCheckCircle className="w-4 h-4 text-emerald-600" />;
      case 'shipped':
        return <FaTruck className="w-4 h-4 text-blue-600" />;
      case 'pending':
        return <FaClipboardList className="w-4 h-4 text-amber-600" />;
      default:
        return <FaClipboardList className="w-4 h-4 text-gray-600" />;
    }
  };

  const getActivityBgColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-emerald-50';
      case 'shipped':
        return 'bg-blue-50';
      case 'pending':
        return 'bg-amber-50';
      default:
        return 'bg-gray-50';
    }
  };

  const getActivityDotColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-emerald-500';
      case 'shipped':
        return 'bg-blue-500';
      case 'pending':
        return 'bg-amber-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <ProtectedRoute role="delivery">
        <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100">
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
        <div className="absolute top-1/2 left-0 w-64 h-64 bg-slate-200/10 rounded-full filter blur-2xl"></div>
        
        <Sidebar role="delivery" />
        
        <main className="flex-1 ml-64 p-8 relative z-10">
          <div className="max-w-7xl mx-auto">
            {/* Professional Header Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl flex items-center justify-center shadow-lg">
                    <FaTruck className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-1">Delivery Dashboard</h1>
                    <p className="text-slate-600 flex items-center space-x-2">
                      <span>Welcome back, Delivery Partner</span>
                      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200">
                    <FaClock className="text-slate-600" />
                    <span className="text-sm font-medium text-slate-900">
                      {new Date().toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-2 h-2 bg-slate-300 rounded-full animate-pulse"></div>
                        <p className="text-slate-200 text-sm font-medium">Pending Orders</p>
                      </div>
                      <p className="text-4xl font-bold mb-1">{pending}</p>
                      <p className="text-slate-300 text-sm">Awaiting pickup</p>
                    </div>
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                      <FaClipboardList className="w-8 h-8" />
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/20">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-300">Priority</span>
                      <span className="text-white font-semibold">High</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-2 h-2 bg-blue-300 rounded-full animate-pulse"></div>
                        <p className="text-blue-100 text-sm font-medium">In Transit</p>
                      </div>
                      <p className="text-4xl font-bold mb-1">{shipped}</p>
                      <p className="text-blue-200 text-sm">On the way</p>
                    </div>
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                      <FaTruck className="w-8 h-8" />
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/20">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-blue-200">Avg Time</span>
                      <span className="text-white font-semibold">2.5h</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-2 h-2 bg-emerald-300 rounded-full"></div>
                        <p className="text-emerald-100 text-sm font-medium">Delivered</p>
                      </div>
                      <p className="text-4xl font-bold mb-1">{delivered}</p>
                      <p className="text-emerald-200 text-sm">Successfully completed</p>
                    </div>
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                      <FaCheckCircle className="w-8 h-8" />
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/20">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-emerald-200">Success Rate</span>
                      <span className="text-white font-semibold">{successRate}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance Overview */}
            <Card className="mb-8 border-0 shadow-xl bg-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                      <FaChartLine className="w-5 h-5 text-slate-700" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">Performance Overview</h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FaChartLine className="w-5 h-5 text-slate-600" />
                    <span className="text-sm text-slate-600">This Week</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl">
                    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <FaRoute className="w-8 h-8 text-slate-700" />
                    </div>
                    <p className="text-2xl font-bold text-slate-900">{performanceMetrics.totalOrders}</p>
                    <p className="text-sm text-slate-600">Total Orders</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl">
                    <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <FaCheckCircle className="w-8 h-8 text-emerald-700" />
                    </div>
                    <p className="text-2xl font-bold text-slate-900">{performanceMetrics.successRate}%</p>
                    <p className="text-sm text-slate-600">Success Rate</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl">
                    <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <FaClock className="w-8 h-8 text-blue-700" />
                    </div>
                    <p className="text-2xl font-bold text-slate-900">{performanceMetrics.avgDeliveryTime}</p>
                    <p className="text-sm text-slate-600">Avg Delivery Time</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Link href="/dashboard/delivery/assignedorders" className="group">
                <Card className="h-full border-0 shadow-lg hover:shadow-2xl transition-all duration-300 group-hover:-translate-y-2 bg-white">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-slate-600 to-slate-700 rounded-2xl flex items-center justify-center shadow-lg">
                        <FaClipboardList className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-slate-900 mb-1">Assigned Orders</h3>
                        <p className="text-slate-600 text-sm mb-3">View and manage your assigned deliveries</p>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-slate-600 rounded-full"></div>
                          <span className="text-xs text-slate-700 font-medium">Active</span>
                        </div>
                      </div>
                      <div className="text-slate-600 group-hover:translate-x-2 transition-transform">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/dashboard/delivery/history" className="group">
                <Card className="h-full border-0 shadow-lg hover:shadow-2xl transition-all duration-300 group-hover:-translate-y-2 bg-white">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-2xl flex items-center justify-center shadow-lg">
                        <FaHistory className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-slate-900 mb-1">Delivery History</h3>
                        <p className="text-slate-600 text-sm mb-3">Track your completed deliveries</p>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                          <span className="text-xs text-emerald-700 font-medium">Complete</span>
                        </div>
                      </div>
                      <div className="text-emerald-600 group-hover:translate-x-2 transition-transform">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/dashboard/delivery/profile" className="group">
                <Card className="h-full border-0 shadow-lg hover:shadow-2xl transition-all duration-300 group-hover:-translate-y-2 bg-white">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg">
                        <FaUserCircle className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-slate-900 mb-1">Profile</h3>
                        <p className="text-slate-600 text-sm mb-3">Manage your account settings</p>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          <span className="text-xs text-blue-700 font-medium">Settings</span>
                        </div>
                      </div>
                      <div className="text-blue-600 group-hover:translate-x-2 transition-transform">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>

            {/* Enhanced Activity & Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Enhanced Recent Activity */}
              <Card className="border-0 shadow-xl bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                        <FaChartLine className="w-5 h-5 text-slate-700" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900">Recent Activity</h3>
                    </div>
                    <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">Today</span>
                  </div>
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className={`flex items-center space-x-4 p-3 ${getActivityBgColor(activity.status)} rounded-xl`}>
                        <div className={`w-3 h-3 ${getActivityDotColor(activity.status)} rounded-full`}></div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-slate-900">{activity.orderNumber} - {activity.customerName}</p>
                          <p className="text-xs text-slate-500">{formatTimeAgo(activity.timestamp)}</p>
                        </div>
                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                          {getActivityIcon(activity.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Enhanced Quick Tips */}
              <Card className="border-0 shadow-xl bg-gradient-to-br from-slate-50 via-gray-50 to-slate-50">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                      <FaExclamationTriangle className="w-5 h-5 text-slate-700" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">Best Practices</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3 p-3 bg-white/60 rounded-xl">
                      <div className="w-2 h-2 bg-slate-600 rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">Verify Customer Details</p>
                        <p className="text-xs text-slate-600">Always confirm customer information before delivery</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-3 bg-white/60 rounded-xl">
                      <div className="w-2 h-2 bg-emerald-600 rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">Update Status Promptly</p>
                        <p className="text-xs text-slate-600">Keep order status current for better tracking</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-3 bg-white/60 rounded-xl">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">Communicate Delays</p>
                        <p className="text-xs text-slate-600">Notify customers immediately if delivery is delayed</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-3 bg-white/60 rounded-xl">
                      <div className="w-2 h-2 bg-slate-600 rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">Maintain Vehicle</p>
                        <p className="text-xs text-slate-600">Keep delivery vehicle clean and organized</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
} 