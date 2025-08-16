"use client";
import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

interface Reminder {
  _id: string;
  orderId: string;
  userId: string;
  reminderDate: string;
  reminderTime: string;
  status: 'active' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
}

export default function CustomerRemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReminders = async () => {
    try {
      setLoading(true);
      setError(null);
      const userInfo = sessionStorage.getItem('user');
      if (!userInfo) {
        setError('User information not found. Please login again.');
        return;
      }

      const user = JSON.parse(userInfo);
      const response = await fetch(`http://localhost:8000/api/reminders/user/${user.email}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setReminders(data.data || []);
        } else {
          setError(data.message || 'Failed to fetch reminders');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.message || `Failed to fetch reminders (${response.status})`);
      }
    } catch (error) {
      console.error('Error fetching reminders:', error);
      setError('Error fetching reminders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    return timeString;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'completed':
        return (
          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'cancelled':
        return (
          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  if (loading) {
    return (
      <ProtectedRoute role="customer">
        <div className="flex min-h-screen bg-gray-50">
          <Sidebar role="customer" />
          <main className="flex-1 ml-64 p-8">
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute role="customer">
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar role="customer" />
        <main className="flex-1 ml-64 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My Reminders</h1>
                <p className="text-gray-600 mt-2">Manage your medication reminders and schedules</p>
              </div>
              <button
                onClick={fetchReminders}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow"
              >
                Refresh
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            {reminders.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No reminders yet</h3>
                <p className="text-gray-500">You haven't set any medication reminders yet.</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {reminders.map((reminder) => (
                  <div key={reminder._id} className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          {getStatusIcon(reminder.status)}
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(reminder.status)}`}>
                            {reminder.status.charAt(0).toUpperCase() + reminder.status.slice(1)}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-500">Reminder Date</p>
                            <p className="font-semibold text-gray-900">{formatDate(reminder.reminderDate)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Reminder Time</p>
                            <p className="font-semibold text-gray-900">{formatTime(reminder.reminderTime)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Created</p>
                            <p className="font-semibold text-gray-900">{formatDate(reminder.createdAt)}</p>
                          </div>
                        </div>
                        
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                          <div className="flex items-center gap-2 text-blue-700">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M3 8 l 7.89 5.26 a 2 2 0 0 0 2.22 0 L 21 8
                                  M5 19 h14 a 2 2 0 0 0 2 -2 V7 a 2 2 0 0 0 -2 -2 H5
                                  a 2 2 0 0 0 -2 2 v10 a 2 2 0 0 0 2 2 z"
                              />
                            </svg>
                            <span className="text-sm font-medium">Email Notification</span>
                          </div>
                          <p className="text-sm text-blue-600 mt-1">
                            You'll receive a reminder email on {formatDate(reminder.reminderDate)} at {reminder.reminderTime}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">Order ID</p>
                            <p className="font-semibold text-gray-900">{reminder.orderId}</p>
                          </div>
                          {reminder.notes && (
                            <div>
                              <p className="text-sm text-gray-500">Notes</p>
                              <p className="font-semibold text-gray-900">{reminder.notes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
