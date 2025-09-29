/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
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
  const [showModal, setShowModal] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<any>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [search, setSearch] = useState("");

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
            <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-1 h-8 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full"></div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                      Manage Your Appointments
                    </h1>
                  </div>
                  <p className="text-gray-600 text-lg font-medium ml-4">
                    Please plan to arrive on time and keep your appointment. If you are unable to attend, provide a brief reason and then cancel the appointment.
                  </p>
                </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="mb-4 flex justify-end">
                <input
                  type="text"
                  className="border border-gray-300 rounded-lg px-4 py-2 w-64 focus:outline-none focus:ring focus:border-blue-400"
                  placeholder="Search by customer name..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
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
                        <th className="px-6 py-3 text-left text-sm font-bold text-black uppercase">Action</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 text-black">
                      {appointments
                        .filter(a => {
                          const name = `${a.customer?.firstName || ""} ${a.customer?.lastName || ""}`.toLowerCase();
                          return name.includes(search.toLowerCase());
                        })
                        .sort((a, b) => {
                          // Confirmed first, then by date/time ascending
                          if (a.status === 'confirmed' && b.status !== 'confirmed') return -1;
                          if (a.status !== 'confirmed' && b.status === 'confirmed') return 1;
                          // If both same status, sort by date/time
                          const aDate = new Date(`${a.date}T${(a.time || "00:00").padStart(5, '0')}:00`).getTime();
                          const bDate = new Date(`${b.date}T${(b.time || "00:00").padStart(5, '0')}:00`).getTime();
                          return aDate - bDate;
                        })
                        .map((a, idx) => {
                        const appointmentDate = new Date(`${a.date}T${(a.time || "00:00").padStart(5, '0')}:00`);
                        const now = new Date();
                        const isPast = appointmentDate.getTime() < now.getTime();
                        return (
                          <tr
                            key={a._id || idx}
                            className={`${isPast ? 'bg-gray-100 text-gray-400 opacity-60 pointer-events-none' : ''}`}
                            style={isPast ? { filter: 'blur(1px)' } : {}}
                          >
                            <td className="px-6 py-4">{a.customer?.firstName} {a.customer?.lastName}</td>
                            <td className="px-6 py-4">{a.date}</td>
                            <td className="px-6 py-4">{a.time}</td>
                            <td className="px-6 py-4 capitalize">
                              {a.status === 'cancelled' ? (
                                <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 border border-red-300 font-semibold">Cancelled</span>
                              ) : a.status === 'confirmed' ? (
                                <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 border-green-300 font-semibold">Confirmed</span>
                              ) : (
                                <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 border border-gray-300 font-semibold">{a.status}</span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              {a.status === 'confirmed' && (
                                <button
                                  disabled={isPast}
                                  className={`px-4 py-2 rounded-lg font-semibold border-2 transition-all ${isPast
                                    ? 'bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed'
                                    : 'bg-red-500 text-white border-red-600 hover:bg-red-600 hover:border-red-700'}`}
                                  onClick={() => {
                                    if (isPast) return;
                                    setCancelTarget(a);
                                    setShowModal(true);
                                  }}
                                >
                                  Cancel
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        {/* Cancel Confirmation Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
              <h2 className="text-xl font-bold mb-4">Cancel Appointment</h2>
              <p className="mb-4">Are you sure you want to cancel this appointment? The customer will be notified and refunded.</p>
              <textarea
                className="w-full border rounded-lg p-2 mb-4"
                rows={3}
                placeholder="Reason for cancellation (optional)"
                value={cancelReason}
                onChange={e => setCancelReason(e.target.value)}
              />
              <div className="flex gap-4 justify-end">
                <button
                  className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 font-semibold"
                  onClick={() => {
                    setShowModal(false);
                    setCancelTarget(null);
                    setCancelReason("");
                  }}
                >
                  No, Keep Appointment
                </button>
                <button
                  className="px-4 py-2 rounded-lg bg-red-500 text-white font-semibold"
                  onClick={async () => {
                    if (!cancelTarget) return;
                    setShowModal(false);
                    setLoading(true);
                    setError("");
                    try {
                      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
                      await axios.post(`http://localhost:8000/api/appointment/doctor/cancel/${cancelTarget._id}`, { reason: cancelReason }, {
                        headers: { Authorization: `Bearer ${token}` }
                      });
                      setAppointments(prev => prev.map(item => item._id === cancelTarget._id ? { ...item, status: 'cancelled' } : item));
                    } catch (err) {
                      setError("Failed to cancel appointment");
                    } finally {
                      setLoading(false);
                      setCancelTarget(null);
                      setCancelReason("");
                    }
                  }}
                >
                  Yes, Cancel & Notify
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
      </div>
    </ProtectedRoute>
  );
}
