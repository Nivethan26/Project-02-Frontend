"use client";
import Sidebar from '@/components/layout/Sidebar';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useEffect, useState } from 'react';
import axios from 'axios';

interface Consultation {
  _id: string;
  doctor?: {
    firstName?: string;
    lastName?: string;
    speciality?: string;
  };
  date: string;
  time: string;
  status: string;
}

export default function CustomerConsultaionsPage() {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchConsultations = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        const response = await axios.get("http://localhost:8000/api/consultation/user", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setConsultations(response.data);
      } catch (err) {
        setError("Failed to load consultations");
      } finally {
        setLoading(false);
      }
    };
    fetchConsultations();
  }, []);

  return (
    <ProtectedRoute role="customer">
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar role="customer" />
        <main className="flex-1 ml-64 p-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl font-bold text-black mb-8">Consultation Bookings</h1>
            <div className="bg-white rounded-lg shadow p-6">
              {loading ? (
                <div className="text-black">Loading...</div>
              ) : error ? (
                <div className="text-red-600">{error}</div>
              ) : consultations.length === 0 ? (
                <div className="text-black">No bookings found.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-bold text-black uppercase">Doctor</th>
                        <th className="px-6 py-3 text-left text-sm font-bold text-black uppercase">Speciality</th>
                        <th className="px-6 py-3 text-left text-sm font-bold text-black uppercase">Date</th>
                        <th className="px-6 py-3 text-left text-sm font-bold text-black uppercase">Time</th>
                        <th className="px-6 py-3 text-left text-sm font-bold text-black uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 text-black">
                      {consultations.map((c, idx) => (
                        <tr
                          key={c._id || idx}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4">{c.doctor?.firstName} {c.doctor?.lastName}</td>
                          <td className="px-6 py-4">{c.doctor?.speciality || '-'}</td>
                          <td className="px-6 py-4">{c.date}</td>
                          <td className="px-6 py-4">{c.time}</td>
                          <td className="px-6 py-4 capitalize font-medium">{c.status}</td>
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
