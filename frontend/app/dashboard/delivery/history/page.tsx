/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import Sidebar from '@/components/layout/Sidebar';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useEffect, useState } from 'react';
import { getOrdersByStatus } from '@/services/orders';

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

  return (
    <ProtectedRoute role="delivery">
      <div className="flex min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-200">
        <Sidebar role="delivery" />
        <main className="flex-1 ml-64 p-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-blue-900 mb-8">Delivered Orders History</h1>
            <div className="bg-white rounded-lg shadow p-6">
              {loading ? (
                <div className="text-center py-8 text-blue-600 font-semibold">Loading delivered orders...</div>
              ) : error ? (
                <div className="text-center py-8 text-red-600 font-semibold">{error}</div>
              ) : orders.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No delivered orders found.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-blue-100">
                    <thead className="bg-blue-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Order No</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Address</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Phone</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-blue-50">
                      {orders.map(order => (
                        <tr key={order.id} className="hover:bg-blue-50 transition">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-900">{order.orderNumber}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{order.address}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{order.phone}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-800 font-bold text-xs uppercase tracking-wide">{order.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
} 