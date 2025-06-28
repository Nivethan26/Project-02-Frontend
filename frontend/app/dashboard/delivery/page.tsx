"use client";
import Sidebar from '@/components/layout/Sidebar';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { FaTruck, FaHistory, FaUserCircle, FaClipboardList } from 'react-icons/fa';
import { useEffect, useState } from 'react';
import { getOrdersByStatus } from '@/services/orders';

export default function DeliveryDashboardPage() {
  const [pending, setPending] = useState(0);
  const [shipped, setShipped] = useState(0);
  const [delivered, setDelivered] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const pendingOrders = await getOrdersByStatus('pending');
        setPending(pendingOrders.length);
        const ShippedOrders = await getOrdersByStatus('shipped');
        setShipped(ShippedOrders.length);
        const deliveredOrders = await getOrdersByStatus('delivered');
        setDelivered(deliveredOrders.length);
      } catch {}
    };
    fetchStats();
  }, []);

  return (
    <ProtectedRoute role="delivery">
      <div className="flex min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-200 relative overflow-hidden">
        {/* Faint white overlay for extra polish */}
        <div className="absolute inset-0 bg-white/40 pointer-events-none z-0" />
        {/* Blurred background shapes */}
        <div className="absolute -top-10 -left-32 w-96 h-96 bg-blue-400 opacity-30 rounded-full filter blur-3xl z-0" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-200 opacity-40 rounded-full filter blur-2xl z-0" />
        <Sidebar role="delivery" />
        <main className="flex-1 ml-64 p-0 sm:p-4 flex flex-col items-center justify-start relative z-10">
          <div className="w-full max-w-7xl mx-auto mt-8">
            <h1 className="text-4xl font-extrabold text-blue-900 mb-4 text-center tracking-tight">Welcome, Delivery Partner!</h1>
            <p className="text-center text-blue-500 mb-10 text-lg font-medium tracking-normal">Manage your assigned orders and deliveries efficiently</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
              <Card className="transition-all duration-200 hover:shadow-xl bg-white/80 backdrop-blur-xl border-blue-100">
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <FaClipboardList className="w-10 h-10 text-blue-600 mb-3" />
                  <span className="text-lg font-bold text-blue-900 mb-1">Pending Orders</span>
                  <span className="text-3xl font-extrabold text-blue-700">{pending}</span>
                </CardContent>
              </Card>
              <Card className="transition-all duration-200 hover:shadow-xl bg-white/80 backdrop-blur-xl border-blue-100">
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <FaTruck className="w-10 h-10 text-blue-600 mb-3" />
                  <span className="text-lg font-bold text-blue-900 mb-1">Shipped</span>
                  <span className="text-3xl font-extrabold text-blue-700">{shipped}</span>
                </CardContent>
              </Card>
              <Card className="transition-all duration-200 hover:shadow-xl bg-white/80 backdrop-blur-xl border-blue-100">
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <FaHistory className="w-10 h-10 text-blue-600 mb-3" />
                  <span className="text-lg font-bold text-blue-900 mb-1">Delivered</span>
                  <span className="text-3xl font-extrabold text-blue-700">{delivered}</span>
                </CardContent>
              </Card>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
              <Link href="/dashboard/delivery/assignedorders" className="group">
                <Card className="transition-all duration-200 hover:shadow-xl hover:-translate-y-1 bg-white/80 backdrop-blur-xl border-blue-100">
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <FaClipboardList className="w-10 h-10 text-blue-600 mb-3 group-hover:scale-110 transition-transform" />
                    <span className="text-lg font-bold text-blue-900 mb-1">Assigned Orders</span>
                    <span className="text-sm text-blue-500">View and manage assigned orders</span>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/dashboard/delivery/history" className="group">
                <Card className="transition-all duration-200 hover:shadow-xl hover:-translate-y-1 bg-white/80 backdrop-blur-xl border-blue-100">
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <FaHistory className="w-10 h-10 text-blue-600 mb-3 group-hover:scale-110 transition-transform" />
                    <span className="text-lg font-bold text-blue-900 mb-1">Delivered History</span>
                    <span className="text-sm text-blue-500">See your delivery history</span>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/dashboard/delivery/profile" className="group">
                <Card className="transition-all duration-200 hover:shadow-xl hover:-translate-y-1 bg-white/80 backdrop-blur-xl border-blue-100">
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <FaUserCircle className="w-10 h-10 text-blue-600 mb-3 group-hover:scale-110 transition-transform" />
                    <span className="text-lg font-bold text-blue-900 mb-1">Profile</span>
                    <span className="text-sm text-blue-500">View and edit your profile</span>
                  </CardContent>
                </Card>
              </Link>
            </div>
            <div className="bg-white/80 rounded-2xl shadow-lg p-8 max-w-2xl mx-auto text-center border border-blue-100">
              <p className="text-gray-700 text-lg font-medium">Welcome to your delivery dashboard. Use the quick links above to manage your assigned orders, view your delivery history, and update your profile. Thank you for keeping our customers happy and healthy!</p>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
} 