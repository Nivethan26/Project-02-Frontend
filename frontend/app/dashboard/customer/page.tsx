"use client";
import Sidebar from '@/components/layout/Sidebar';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { FaFilePrescription, FaUserCircle, FaClipboardList, FaComments, FaHeart, FaClock, FaCheckCircle, FaExclamationTriangle, FaChartLine, FaBell, FaCalendarAlt, FaMapMarkerAlt } from 'react-icons/fa';
import { useEffect, useState } from 'react';
import { getCustomerOrders } from '@/services/orders';
import authService from '@/services/auth';

interface CustomerStats {
  totalOrders: number;
  activePrescriptions: number;
  upcomingConsultations: number;
  completedOrders: number;
}

interface RecentActivity {
  id: string;
  type: string;
  title: string;
  timestamp: string;
  status: string;
}

interface Prescription {
  _id: string;
  name: string;
  email: string;
  status: 'pending' | 'processing' | 'approved' | 'rejected';
  createdAt: string;
  duration: string;
  frequency: string;
}

export default function CustomerDashboard() {
  const [stats, setStats] = useState<CustomerStats>({
    totalOrders: 0,
    activePrescriptions: 0,
    upcomingConsultations: 0,
    completedOrders: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get current user
        const user = authService.getCurrentUser();
        if (!user) {
          throw new Error('User not authenticated');
        }

        // Fetch customer orders using the proper API
        const customerOrders = await getCustomerOrders(user._id, user.email);
        
        // Calculate order statistics
        const totalOrders = customerOrders.length;
        const completedOrders = customerOrders.filter(order => order.status === 'delivered').length;

        // Fetch prescriptions for current customer
        const prescriptionsResponse = await fetch(`http://localhost:8000/api/prescriptions/customer/${user.email}`);
        let prescriptions: Prescription[] = [];
        if (prescriptionsResponse.ok) {
          prescriptions = await prescriptionsResponse.json();
        }

        // Calculate prescription statistics
        const activePrescriptions = prescriptions.filter(p => p.status === 'approved' || p.status === 'processing').length;

        // Mock consultation data (would need separate API endpoint)
        const upcomingConsultations = Math.floor(Math.random() * 3); // Mock data

        setStats({
          totalOrders,
          activePrescriptions,
          upcomingConsultations,
          completedOrders
        });

        // Generate recent activity from actual data
        const generateRecentActivity = (): RecentActivity[] => {
          const activities: RecentActivity[] = [];
          
          // Add recent delivered orders
          const deliveredOrders = customerOrders.filter(order => order.status === 'delivered').slice(0, 2);
          deliveredOrders.forEach((order, index) => {
            activities.push({
              id: order.id || order._id || '',
              type: 'order',
              title: `Order #${order.orderNumber} delivered successfully`,
              timestamp: order.createdAt || order.date || new Date(Date.now() - (index + 1) * 2 * 60 * 60 * 1000).toISOString(),
              status: 'delivered'
            });
          });

          // Add recent shipped orders
          const shippedOrders = customerOrders.filter(order => order.status === 'shipped').slice(0, 1);
          shippedOrders.forEach((order, index) => {
            activities.push({
              id: order.id || order._id || '',
              type: 'order',
              title: `Order #${order.orderNumber} is on the way`,
              timestamp: order.createdAt || order.date || new Date(Date.now() - (index + 3) * 2 * 60 * 60 * 1000).toISOString(),
              status: 'shipped'
            });
          });

          // Add recent prescription activities
          prescriptions.slice(0, 2).forEach((prescription: Prescription) => {
            let title = '';
            let status = '';
            
            switch (prescription.status) {
              case 'approved':
                title = 'Prescription approved and ready for order';
                status = 'approved';
                break;
              case 'processing':
                title = 'Prescription is being reviewed';
                status = 'processing';
                break;
              case 'rejected':
                title = 'Prescription was rejected';
                status = 'rejected';
                break;
              default:
                title = 'New prescription uploaded';
                status = 'pending';
            }

            activities.push({
              id: prescription._id,
              type: 'prescription',
              title,
              timestamp: prescription.createdAt,
              status
            });
          });

          // Add mock consultation activity
          if (upcomingConsultations > 0) {
            activities.push({
              id: 'consultation-1',
              type: 'consultation',
              title: 'Consultation scheduled for tomorrow',
              timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
              status: 'scheduled'
            });
          }

          // Sort by timestamp (most recent first)
          return activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        };

        setRecentActivity(generateRecentActivity());

      } catch (err: any) {
        setError(err.message || 'Failed to fetch customer data');
        console.error('Error fetching customer data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerData();
  }, []);

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

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <FaClipboardList className="w-4 h-4" />;
      case 'prescription':
        return <FaFilePrescription className="w-4 h-4" />;
      case 'consultation':
        return <FaComments className="w-4 h-4" />;
      default:
        return <FaClipboardList className="w-4 h-4" />;
    }
  };

  const getActivityBgColor = (type: string) => {
    switch (type) {
      case 'order':
        return 'bg-emerald-50';
      case 'prescription':
        return 'bg-blue-50';
      case 'consultation':
        return 'bg-amber-50';
      default:
        return 'bg-slate-50';
    }
  };

  const getActivityDotColor = (type: string) => {
    switch (type) {
      case 'order':
        return 'bg-emerald-500';
      case 'prescription':
        return 'bg-blue-500';
      case 'consultation':
        return 'bg-amber-500';
      default:
        return 'bg-slate-500';
    }
  };

  if (loading) {
    return (
      <ProtectedRoute role="customer">
        <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
          <Sidebar role="customer" />
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
    <ProtectedRoute role="customer">
      <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 relative overflow-hidden">
        {/* Professional Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50/50 via-white/30 to-gray-50/50"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-slate-200/20 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gray-200/20 rounded-full filter blur-3xl"></div>
        
        <Sidebar role="customer" />
        
        <main className="flex-1 ml-64 p-8 relative z-10">
          <div className="max-w-7xl mx-auto">
            {/* Professional Header Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-xl flex items-center justify-center shadow-lg">
                    <FaHeart className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-1">Customer Dashboard</h1>
                    <p className="text-slate-600 flex items-center space-x-2">
                      <span>Welcome back, valued customer</span>
                      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200">
                    <FaCalendarAlt className="text-slate-600" />
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

            {/* Error Display */}
            {error && (
              <Card className="mb-8 border-0 shadow-xl bg-white">
                <CardContent className="p-6">
                  <div className="text-center">
                    <FaExclamationTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Error Loading Dashboard</h3>
                    <p className="text-slate-600">{error}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Customer Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800 text-white border-0 shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-2 h-2 bg-emerald-300 rounded-full"></div>
                        <p className="text-emerald-100 text-sm font-medium">Total Orders</p>
                      </div>
                      <p className="text-4xl font-bold mb-1">{stats.totalOrders}</p>
                      <p className="text-emerald-200 text-sm">All time orders</p>
                    </div>
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                      <FaClipboardList className="w-8 h-8" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white border-0 shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
                        <p className="text-blue-100 text-sm font-medium">Active Prescriptions</p>
                      </div>
                      <p className="text-4xl font-bold mb-1">{stats.activePrescriptions}</p>
                      <p className="text-blue-200 text-sm">Current prescriptions</p>
                    </div>
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                      <FaFilePrescription className="w-8 h-8" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-amber-600 via-amber-700 to-amber-800 text-white border-0 shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-2 h-2 bg-amber-300 rounded-full"></div>
                        <p className="text-amber-100 text-sm font-medium">Upcoming Consultations</p>
                      </div>
                      <p className="text-4xl font-bold mb-1">{stats.upcomingConsultations}</p>
                      <p className="text-amber-200 text-sm">Scheduled sessions</p>
                    </div>
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                      <FaComments className="w-8 h-8" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 text-white border-0 shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-2 h-2 bg-slate-300 rounded-full"></div>
                        <p className="text-slate-200 text-sm font-medium">Completed Orders</p>
                      </div>
                      <p className="text-4xl font-bold mb-1">{stats.completedOrders}</p>
                      <p className="text-slate-300 text-sm">Successfully delivered</p>
                    </div>
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                      <FaCheckCircle className="w-8 h-8" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Link href="/dashboard/customer/orders" className="group">
                <Card className="h-full border-0 shadow-lg hover:shadow-2xl transition-all duration-300 group-hover:-translate-y-2 bg-white">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-2xl flex items-center justify-center shadow-lg">
                        <FaClipboardList className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-slate-900 mb-1">My Orders</h3>
                        <p className="text-slate-600 text-sm mb-3">Track and manage your orders</p>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                          <span className="text-xs text-emerald-700 font-medium">Active</span>
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

              <Link href="/dashboard/customer/prescriptions" className="group">
                <Card className="h-full border-0 shadow-lg hover:shadow-2xl transition-all duration-300 group-hover:-translate-y-2 bg-white">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg">
                        <FaFilePrescription className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-slate-900 mb-1">Prescriptions</h3>
                        <p className="text-slate-600 text-sm mb-3">Manage your prescriptions</p>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          <span className="text-xs text-blue-700 font-medium">Active</span>
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

              <Link href="/dashboard/customer/consultations" className="group">
                <Card className="h-full border-0 shadow-lg hover:shadow-2xl transition-all duration-300 group-hover:-translate-y-2 bg-white">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-amber-600 to-amber-700 rounded-2xl flex items-center justify-center shadow-lg">
                        <FaComments className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-slate-900 mb-1">Consultations</h3>
                        <p className="text-slate-600 text-sm mb-3">Book doctor consultations</p>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-amber-600 rounded-full"></div>
                          <span className="text-xs text-amber-700 font-medium">Available</span>
                        </div>
                      </div>
                      <div className="text-amber-600 group-hover:translate-x-2 transition-transform">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/dashboard/customer/profile" className="group">
                <Card className="h-full border-0 shadow-lg hover:shadow-2xl transition-all duration-300 group-hover:-translate-y-2 bg-white">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-slate-600 to-slate-700 rounded-2xl flex items-center justify-center shadow-lg">
                        <FaUserCircle className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-slate-900 mb-1">Profile</h3>
                        <p className="text-slate-600 text-sm mb-3">Manage your account</p>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-slate-600 rounded-full"></div>
                          <span className="text-xs text-slate-700 font-medium">Settings</span>
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
            </div>

            {/* Recent Activity & Quick Tips */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
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
                    {recentActivity.length === 0 ? (
                      <div className="text-center py-8">
                        <FaClock className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                        <p className="text-slate-600">No recent activity</p>
                      </div>
                    ) : (
                      recentActivity.map((activity) => (
                        <div key={activity.id} className={`flex items-center space-x-4 p-3 ${getActivityBgColor(activity.type)} rounded-xl`}>
                          <div className={`w-3 h-3 ${getActivityDotColor(activity.type)} rounded-full`}></div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-slate-900">{activity.title}</p>
                            <p className="text-xs text-slate-500">{formatTimeAgo(activity.timestamp)}</p>
                          </div>
                          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                            {getActivityIcon(activity.type)}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Tips */}
              <Card className="border-0 shadow-xl bg-gradient-to-br from-slate-50 via-gray-50 to-slate-50">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                      <FaBell className="w-5 h-5 text-slate-700" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">Quick Tips</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3 p-3 bg-white/60 rounded-xl">
                      <div className="w-2 h-2 bg-emerald-600 rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">Track Your Orders</p>
                        <p className="text-xs text-slate-600">Monitor delivery status in real-time</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-3 bg-white/60 rounded-xl">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">Upload Prescriptions</p>
                        <p className="text-xs text-slate-600">Easily upload and manage prescriptions</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-3 bg-white/60 rounded-xl">
                      <div className="w-2 h-2 bg-amber-600 rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">Book Consultations</p>
                        <p className="text-xs text-slate-600">Schedule appointments with doctors</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-3 bg-white/60 rounded-xl">
                      <div className="w-2 h-2 bg-slate-600 rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">24/7 Support</p>
                        <p className="text-xs text-slate-600">Get help anytime you need it</p>
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

