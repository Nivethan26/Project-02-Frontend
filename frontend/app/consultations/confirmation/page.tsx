'use client';
import React from 'react';
import { useRouter } from 'next/navigation';

export default function DoctorBookingConfirmation() {
  const router = useRouter();
  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-lg flex flex-col items-center">
        <div className="bg-green-100 rounded-full p-4 mb-4">
          <svg width="56" height="56" fill="none" viewBox="0 0 56 56">
            <circle cx="28" cy="28" r="28" fill="#22C55E" fillOpacity="0.15"/>
            <path d="M18 29l7 7 13-13" stroke="#22C55E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-green-700 mb-2">Booking Confirmed!</h1>
        <p className="text-green-800 text-lg mb-4">Thank you for your booking</p>
        <button
          className="bg-green-100 text-green-700 font-bold text-base rounded-lg px-6 py-2 mb-2 hover:bg-green-200 transition"
          onClick={() => router.push('/dashboard/customer/consultations')}
        >
          Dashboard
        </button>
        <p className="text-gray-500 text-sm mt-2">You will receive a confirmation email with your consultation details.</p>
      </div>
    </div>
  );
} 