/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import axios from 'axios';
import Sidebar from '@/components/layout/Sidebar';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  ShoppingCart, 
  Package, 
  TrendingUp, 
  AlertTriangle,
  Eye,
  Plus,
  DollarSign,
  Users,
  Activity
} from 'lucide-react';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

interface Prescription {
  _id: string;
  name: string;
  email: string;
  status: 'pending' | 'processing' | 'approved' | 'rejected';
  createdAt: string;
}

interface InventoryItem {
  _id: string;
  name: string;
  stock: number;
  status: "active" | "inactive";
}

interface DashboardStats {
  totalPrescriptions: number;
  pendingPrescriptions: number;
  processingPrescriptions: number;
  approvedPrescriptions: number;
  rejectedPrescriptions: number;
  totalOrders: number;
  lowStockItems: number;
  totalRevenue: number;
}

export default function PharmacistDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalPrescriptions: 0,
    pendingPrescriptions: 0,
    processingPrescriptions: 0,
    approvedPrescriptions: 0,
    rejectedPrescriptions: 0,
    totalOrders: 0,
    lowStockItems: 0,
    totalRevenue: 0
  });
  const [recentPrescriptions, setRecentPrescriptions] = useState<Prescription[]>([]);
  const [lowStockInventory, setLowStockInventory] = useState<InventoryItem[]>([]);

  useEffect(() => {
    // Check if user is logged in and is pharmacist
    const storedUser = sessionStorage.getItem('user');
    if (!storedUser) {
      router.push('/login');
      return;
    }

    const userData = JSON.parse(storedUser);
    if (userData.role !== 'pharmacist') {
      toast.error('Unauthorized access');
      router.push('/login');
      return;
    }

    setUser(userData);
    fetchDashboardData();
  }, [router]);

  const fetchDashboardData = async () => {
    try {
      const token = sessionStorage.getItem('token');
      if (!token) {
        toast.error('Authentication token not found');
        router.push('/login');
        return;
      }

      // Fetch prescriptions
      const prescriptionsResponse = await axios.get('http://localhost:8000/api/prescriptions');
      const prescriptions = prescriptionsResponse.data;

      // Fetch inventory
      const inventoryResponse = await axios.get('http://localhost:8000/api/staff/inventory', {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const inventory = inventoryResponse.data;

      // Calculate statistics
      const stats: DashboardStats = {
        totalPrescriptions: prescriptions.length,
        pendingPrescriptions: prescriptions.filter((p: Prescription) => p.status === 'pending').length,
        processingPrescriptions: prescriptions.filter((p: Prescription) => p.status === 'processing').length,
        approvedPrescriptions: prescriptions.filter((p: Prescription) => p.status === 'approved').length,
        rejectedPrescriptions: prescriptions.filter((p: Prescription) => p.status === 'rejected').length,
        totalOrders: 0, // Will be updated when order API is available
        lowStockItems: inventory.filter((item: InventoryItem) => item.stock <= 10 && item.status === 'active').length,
        totalRevenue: 0 // Will be updated when order API is available
      };

      setStats(stats);
      setRecentPrescriptions(prescriptions.slice(0, 5)); // Get 5 most recent
      setLowStockInventory(inventory.filter((item: InventoryItem) => item.stock <= 10 && item.status === 'active').slice(0, 5));
    } catch (error: any) {
      console.error('Dashboard fetch error:', error);
      if (error.response?.status === 401) {
        toast.error('Authentication failed. Please login again.');
        router.push('/login');
        return;
      }
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'processing':
        return <Activity className="w-5 h-5 text-blue-500" />;
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Sidebar role="pharmacist" />
        <div className="ml-64 p-8">
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Sidebar role="pharmacist" />
      
      {/* Main Content */}
      <div className="ml-64 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {user.firstName}! 👋
            </h1>
            <p className="text-gray-600">Here's what's happening with your pharmacy today</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Pending Prescriptions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pendingPrescriptions}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-xs text-gray-500">
                  {stats.pendingPrescriptions > 0 ? 'Requires immediate attention' : 'All clear!'}
                </span>
              </div>
            </div>

            {/* Processing Prescriptions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">In Processing</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.processingPrescriptions}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Activity className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-xs text-gray-500">
                  Currently being reviewed
                </span>
              </div>
            </div>

            {/* Total Prescriptions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Prescriptions</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalPrescriptions}</p>
                </div>
                <div className="p-3 bg-gray-100 rounded-lg">
                  <FileText className="w-6 h-6 text-gray-600" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-xs text-gray-500">
                  This month
                </span>
              </div>
            </div>

            {/* Low Stock Alert */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
                  <p className="text-2xl font-bold text-red-600">{stats.lowStockItems}</p>
                </div>
                <div className="p-3 bg-red-100 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-xs text-gray-500">
                  {stats.lowStockItems > 0 ? 'Needs restocking' : 'Stock levels good'}
                </span>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Prescriptions */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Recent Prescriptions</h2>
                  <button 
                    onClick={() => router.push('/dashboard/pharmacist/prescriptions')}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                  >
                    View All
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
                
                {recentPrescriptions.length > 0 ? (
                  <div className="space-y-4">
                    {recentPrescriptions.map((prescription) => (
                      <div key={prescription._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(prescription.status)}
                          <div>
                            <p className="font-medium text-gray-900">{prescription.name}</p>
                            <p className="text-sm text-gray-500">{prescription.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(prescription.status)}`}>
                            {prescription.status.charAt(0).toUpperCase() + prescription.status.slice(1)}
                          </span>
                          <span className="text-xs text-gray-500">{formatDate(prescription.createdAt)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No prescriptions found</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions & Alerts */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button 
                    onClick={() => router.push('/dashboard/pharmacist/prescriptions')}
                    className="w-full flex items-center gap-3 p-3 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    <FileText className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-blue-900">Review Prescriptions</span>
                  </button>
                  <button 
                    onClick={() => router.push('/dashboard/pharmacist/pos')}
                    className="w-full flex items-center gap-3 p-3 text-left bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                  >
                    <ShoppingCart className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-900">Point of Sale</span>
                  </button>
                  <button 
                    onClick={() => router.push('/dashboard/pharmacist/inventory')}
                    className="w-full flex items-center gap-3 p-3 text-left bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                  >
                    <Package className="w-5 h-5 text-purple-600" />
                    <span className="font-medium text-purple-900">Check Inventory</span>
                  </button>
                </div>
              </div>

              {/* Low Stock Alerts */}
              {lowStockInventory.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    Low Stock Alerts
                  </h3>
                  <div className="space-y-3">
                    {lowStockInventory.map((item) => (
                      <div key={item._id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{item.name}</p>
                          <p className="text-sm text-red-600">Only {item.stock} left</p>
                        </div>
                        <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                          Critical
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Approval Progress */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Approval Progress</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Pending</span>
                    <span className="text-sm font-medium text-yellow-600">{stats.pendingPrescriptions}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Processing</span>
                    <span className="text-sm font-medium text-blue-600">{stats.processingPrescriptions}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Approved</span>
                    <span className="text-sm font-medium text-green-600">{stats.approvedPrescriptions}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Rejected</span>
                    <span className="text-sm font-medium text-red-600">{stats.rejectedPrescriptions}</span>
                  </div>
                </div>
                
                {stats.pendingPrescriptions > 0 && (
                  <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      ⚠️ {stats.pendingPrescriptions} prescription{stats.pendingPrescriptions > 1 ? 's' : ''} need{stats.pendingPrescriptions === 1 ? 's' : ''} your attention
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 