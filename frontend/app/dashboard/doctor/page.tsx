"use client";
import Sidebar from '@/components/layout/Sidebar';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { CalendarCheck, User, Clock, Stethoscope, ArrowRight } from 'lucide-react';

import { useEffect, useState } from 'react';
import axios from 'axios';

export default function DoctorDashboardPage() {
  const [stats, setStats] = useState([
    { label: "Today's Appointments", value: 0, icon: <CalendarCheck className="w-8 h-8 text-blue-500" />, color: 'bg-blue-100', link: '/dashboard/doctor/appointments' },
    { label: 'Upcoming Appointments', value: 0, icon: <Clock className="w-8 h-8 text-green-500" />, color: 'bg-green-100', link: '/dashboard/doctor/appointments' },
    { label: 'Patients', value: 0, icon: <User className="w-8 h-8 text-purple-500" />, color: 'bg-purple-100', link: '/dashboard/doctor/appointments' },
    { label: 'My Availability', value: 'Unset', icon: <Stethoscope className="w-8 h-8 text-yellow-500" />, color: 'bg-yellow-100', link: '/dashboard/doctor/availability' },
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        // Fetch appointments
        const res = await axios.get("http://localhost:8000/api/appointment/doctor", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const appointments = res.data || [];
        const todayStr = new Date().toISOString().slice(0, 10);
  const todayCount = appointments.filter((a: any) => a.date === todayStr && a.status === 'confirmed').length;
  const upcomingCount = appointments.filter((a: any) => a.date > todayStr && a.status === 'confirmed').length;
  // Unique patients
  const patientIds = new Set(appointments.map((a: any) => a.customer?._id).filter(Boolean));
        // Fetch availability
        const availRes = await axios.get("http://localhost:8000/api/doctor/availability", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const avail = availRes.data || [];
        const availStatus = avail.length > 0 ? 'Set' : 'Unset';
        setStats([
          { label: "Today's Appointments", value: todayCount, icon: <CalendarCheck className="w-8 h-8 text-blue-500" />, color: 'bg-blue-100', link: '/dashboard/doctor/appointments' },
          { label: 'Upcoming Appointments', value: upcomingCount, icon: <Clock className="w-8 h-8 text-green-500" />, color: 'bg-green-100', link: '/dashboard/doctor/appointments' },
          { label: 'Patients', value: patientIds.size, icon: <User className="w-8 h-8 text-purple-500" />, color: 'bg-purple-100', link: '/dashboard/doctor/appointments' },
          { label: 'My Availability', value: availStatus, icon: <Stethoscope className="w-8 h-8 text-yellow-500" />, color: 'bg-yellow-100', link: '/dashboard/doctor/availability' },
        ]);
      } catch (err) {
        setError("Failed to fetch dashboard stats.");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const quickLinks = [
    {
      label: 'Profile',
      icon: <User className="w-5 h-5" />,
      href: '/dashboard/doctor/profile',
    },
    {
      label: 'Appointments',
      icon: <CalendarCheck className="w-5 h-5" />,
      href: '/dashboard/doctor/appointments',
    },
    {
      label: 'Availability',
      icon: <Stethoscope className="w-5 h-5" />,
      href: '/dashboard/doctor/availability',
    },
  ];

  return (
    <ProtectedRoute role="doctor">
      <div className="flex min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-200 relative overflow-hidden">
        <div className="absolute inset-0 bg-white/40 pointer-events-none z-0" />
        <div className="absolute -top-10 -left-32 w-96 h-96 bg-blue-400 opacity-30 rounded-full filter blur-3xl z-0" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-200 opacity-40 rounded-full filter blur-2xl z-0" />
        <div className="hidden md:block"><Sidebar role="doctor" /></div>
        <main className="flex-1 md:ml-64 p-0 sm:p-6 flex flex-col items-center justify-start relative z-10">
          {/* Welcome Banner */}
          <div className="w-full max-w-5xl mx-auto bg-gradient-to-r from-blue-600 via-blue-400 to-blue-300 rounded-3xl shadow-2xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between mb-10 mt-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">Welcome, Doctor!</h1>
              <p className="text-white/90 text-lg md:text-xl font-medium">Here's your dashboard overview and quick access to your tools.</p>
            </div>
            <div className="mt-6 md:mt-0 flex gap-4">
              {quickLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="flex items-center gap-2 bg-white/90 hover:bg-white text-blue-700 font-bold px-5 py-3 rounded-xl shadow transition text-base md:text-lg"
                >
                  {link.icon} {link.label} <ArrowRight className="w-4 h-4 ml-1" />
                </a>
              ))}
            </div>
          </div>
          {/* Stats Cards */}
          <div className="w-full max-w-5xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {stats.map((stat) => (
              <a
                key={stat.label}
                href={stat.link}
                className={`rounded-2xl shadow-xl p-6 flex flex-col items-center justify-center ${stat.color} hover:scale-105 transition-transform group`}
              >
                <div className="mb-3">{stat.icon}</div>
                <div className="text-3xl font-extrabold text-blue-900 group-hover:text-blue-700">{stat.value}</div>
                <div className="text-lg font-semibold text-blue-700 group-hover:text-blue-900 mt-1 text-center">{stat.label}</div>
              </a>
            ))}
          </div>
          {/* Recent Activity Placeholder */}
          <div className="w-full max-w-5xl bg-white/80 backdrop-blur-2xl rounded-3xl shadow-2xl border border-blue-100 p-6 md:p-10 mb-10">
            <h2 className="text-2xl font-bold text-blue-900 mb-4">Recent Activity</h2>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-blue-700 font-medium"><CalendarCheck className="w-5 h-5" /> You have 2 appointments scheduled for today.</li>
              <li className="flex items-center gap-3 text-blue-700 font-medium"><User className="w-5 h-5" /> 1 new patient registered this week.</li>
              <li className="flex items-center gap-3 text-blue-700 font-medium"><Stethoscope className="w-5 h-5" /> Your availability is up to date.</li>
            </ul>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
} 