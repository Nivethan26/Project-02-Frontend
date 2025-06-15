"use client";
import Sidebar from '@/components/layout/Sidebar';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function AvailabilityPage() {
  return (
    <ProtectedRoute role="doctor">
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar role="doctor" />
        <main className="flex-1 ml-64 p-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Availabilty Setting</h1>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600">This is  page.</p>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
} 