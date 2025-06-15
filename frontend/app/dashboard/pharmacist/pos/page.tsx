"use client";
import Sidebar from '@/components/layout/Sidebar';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function POSPage() {
  return (
    <ProtectedRoute role="pharmacist">
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar role="pharmacist" />
        <main className="flex-1 ml-64 p-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">POS System</h1>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600">This is the POS (Point of Sale) page.</p>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
} 