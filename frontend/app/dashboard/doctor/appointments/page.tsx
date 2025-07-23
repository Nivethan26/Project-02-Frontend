"use client";
import Sidebar from '@/components/layout/Sidebar';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useEffect, useState } from 'react';
import axios from 'axios';

interface Appointment {
  _id: string;
  customer?: {
    firstName?: string;
    lastName?: string;
  };
  date: string;
  time: string;
  status: string;
}

export default function AppointmentPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        const res = await axios.get("http://localhost:8000/api/appointment/doctor", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAppointments(res.data);
      } catch (err) {
        setError("Failed to load appointments.");
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  return (
    <ProtectedRoute role="doctor">
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar role="doctor" />
        <main className="flex-1 ml-64 p-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl font-bold text-black mb-8">SK Medicals Appointments</h1>
            <div className="bg-white rounded-lg shadow p-6">
              {loading ? (
                <p className="text-black">Loading...</p>
              ) : error ? (
                <p className="text-red-600">{error}</p>
              ) : appointments.length === 0 ? (
                <p className="text-black">No appointments found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-bold text-black uppercase">Customer</th>
                        <th className="px-6 py-3 text-left text-sm font-bold text-black uppercase">Date</th>
                        <th className="px-6 py-3 text-left text-sm font-bold text-black uppercase">Time</th>
                        <th className="px-6 py-3 text-left text-sm font-bold text-black uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 text-black">
                      {appointments.map((a, idx) => (
                        <tr key={a._id || idx} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            {a.customer?.firstName} {a.customer?.lastName}
                          </td>
                          <td className="px-6 py-4">{a.date}</td>
                          <td className="px-6 py-4">{a.time}</td>
                          <td className="px-6 py-4 capitalize">{a.status}</td>
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
