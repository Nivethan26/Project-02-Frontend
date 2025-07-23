"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import Loader from '@/components/Loader';
import Image from 'next/image';
import axios from 'axios';

interface BookingDetails {
  doctorId: string;
  doctorName: string;
  speciality: string;
  date: string;
  time: string;
  fee: number;
}

export default function DoctorPaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardholder, setCardholder] = useState("");
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [slots, setSlots] = useState<{date: string; slots: string[]}[]>([]);

  // Get booking details from query params
  const booking: BookingDetails = {
    doctorId: searchParams.get("doctorId") || "",
    doctorName: searchParams.get("doctorName") || "",
    speciality: searchParams.get("speciality") || "",
    date: searchParams.get("date") || "",
    time: searchParams.get("time") || "",
    fee: Number(searchParams.get("fee") || 1000),
  };

  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(.{4})/g, '$1 ')
      .trim();
  };

  // Format expiry as MM/YY and validate
  const formatExpiry = (value: string) => {
    let v = value.replace(/\D/g, '');
    if (v.length > 4) v = v.slice(0, 4);
    if (v.length > 2) v = v.slice(0, 2) + '/' + v.slice(2);
    return v;
  };

  const validateExpiry = (value: string) => {
    if (!/^\d{2}\/\d{2}$/.test(value)) return false;
    const [mm, yy] = value.split('/').map(Number);
    if (mm < 1 || mm > 12) return false;
    const now = new Date();
    const currentYear = now.getFullYear() % 100;
    const currentMonth = now.getMonth() + 1;
    if (yy < currentYear) return false;
    if (yy === currentYear && mm < currentMonth) return false;
    return true;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCardNumber(formatCardNumber(e.target.value));
  };
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setExpiry(formatExpiry(e.target.value));
  };

  // Card preview values
  const previewCardNumber = cardNumber.padEnd(19, '•');
  const previewCardholder = cardholder || 'YOUR NAME';
  const previewExpiry = expiry || 'MM/YY';

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
  
    if (!cardNumber || cardNumber.replace(/\s/g, "").length !== 16) {
      setError("Card number must be 16 digits.");
      return;
    }
    if (!expiry || !validateExpiry(expiry)) {
      setError("Check your expiry date sir");
      return;
    }
    if (!cvv || cvv.length !== 3) {
      setError("CVV must be 3 digits.");
      return;
    }
    if (!cardholder) {
      setError("Cardholder name is required.");
      return;
    }
  
    setLoading(true);
  
    try {
      // Get the logged-in user (customer)
      const userStr = localStorage.getItem("user") || sessionStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      console.log("User object from storage:", user);
      if (!user || !user.id) {
        setError("User not found. Please log in again.");
        setLoading(false);
        return;
      }

      // Build the payload with correct user and doctorId
      const payload = {
        doctorId: booking.doctorId,
        date: booking.date,
        time: booking.time,
        amount: booking.fee,
        method: "card"
      };
      console.log("Booking payload:", JSON.stringify(payload, null, 2));
  
      const response = await axios.post("http://localhost:8000/api/consultation/confirmation", payload, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.status === 201) {
        const bookingId = response.data.consultation?._id || response.data.bookingId;
        router.push(`/consultations/confirmation?bookingId=${bookingId}`);
      } else {
        setError("Booking failed. Please try again.");
        console.log("Booking failed response:", response);
      }
    } catch (err: any) {
      console.error("Booking error:", err);
      if (err?.response) {
        setError(err.response.data?.message || "Booking failed. Please try again.");
        console.log("Backend error response:", err.response.data);
      } else {
        setError("Booking failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };
  

  // Find the slot object for the selected date
  const matchingSlot = slots.find((s: any) => String(s.date) === String(selectedDate));

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md flex flex-col items-center">
        {/* Card Preview */}
        <div className="w-full flex flex-col items-center mb-6">
          <div className="w-full max-w-xs bg-gradient-to-r from-slate-800 to-slate-600 rounded-xl p-5 shadow-lg mb-2 relative">
            <div className="flex justify-between items-center mb-4">
              <span className="text-white text-sm font-semibold flex items-center gap-2">
                <svg width="20" height="20" fill="none" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" fill="#fff" fillOpacity="0.2"/><path d="M5 10l3 3 7-7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Credit Card
              </span>
              <span className="text-white text-xs font-semibold">•••••••</span>
            </div>
            <div className="text-white text-lg tracking-widest font-mono mb-4">{previewCardNumber}</div>
            <div className="flex justify-between items-center">
              <div className="text-white text-xs">
                <div className="opacity-60">Cardholder Name</div>
                <div className="font-semibold">{previewCardholder}</div>
              </div>
              <div className="text-white text-xs text-right">
                <div className="opacity-60">Expires</div>
                <div className="font-semibold">{previewExpiry}</div>
              </div>
            </div>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-blue-900 mb-2">Doctor Booking Payment</h2>
        <div className="mb-4 w-full">
          <div className="font-semibold text-blue-800">{booking.doctorName}</div>
          <div className="text-blue-600 text-sm mb-1">{booking.speciality}</div>
          <div className="text-gray-700 text-sm">Date: <span className="font-medium">{booking.date}</span></div>
          <div className="text-gray-700 text-sm mb-1">Time: <span className="font-medium">{booking.time}</span></div>
          <div className="text-blue-700 font-bold text-lg mt-2">Fee: Rs {booking.fee}</div>
        </div>
        <form onSubmit={handlePayment} className="space-y-4 w-full">
          <div>
            <label className="block text-sm font-medium text-gray-700">Card Number</label>
            <input type="text" className="w-full border rounded px-3 py-2 mt-1 text-black" maxLength={19} value={cardNumber} onChange={handleCardNumberChange} placeholder="1234 5678 9012 3456" />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">Expiry (MM/YY)</label>
              <input type="text" className="w-full border rounded px-3 py-2 mt-1 text-black" maxLength={5} value={expiry} onChange={handleExpiryChange} placeholder="MM/YY" />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">CVV</label>
              <input type="password" className="w-full border rounded px-3 py-2 mt-1 text-black" maxLength={3} value={cvv} onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))} placeholder="123" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Cardholder Name</label>
            <input type="text" className="w-full border rounded px-3 py-2 mt-1 text-black" value={cardholder} onChange={e => setCardholder(e.target.value)} placeholder="Name on card" />
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <button type="submit" className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg font-bold text-lg shadow hover:from-blue-700 hover:to-blue-600 transition mt-2" disabled={loading}>
            {loading ? <Loader /> : `Payment for Booking Confirmation`}
          </button>
        </form>
        {selectedDate && (
          <>
            <div className="text-gray-700 text-xs mt-1">Available Times:</div>
            <div className="flex flex-wrap gap-2 mt-1 mb-2">
              {(() => {
                const matchingSlot = slots.find((s: any) => String(s.date) === String(selectedDate));
                return matchingSlot && matchingSlot.slots.length > 0 ? (
                  matchingSlot.slots.map((time: string) => (
                    <label key={time} className={`cursor-pointer px-2 py-1 rounded text-xs border font-medium transition flex items-center gap-1 ${selectedTime === time ? 'bg-blue-600 text-white shadow border-blue-600' : 'bg-white text-blue-700 border-blue-200 hover:bg-blue-50'}`}>
                      <input
                        type="radio"
                        name="booking-time"
                        checked={selectedTime === time}
                        onChange={() => setSelectedTime(time)}
                        className="accent-blue-600 w-3 h-3"
                        style={{ marginRight: 4 }}
                      />
                      {time}
                    </label>
                  ))
                ) : (
                  <span className="text-gray-400 text-xs">No times</span>
                );
              })()}
            </div>
          </>
        )}
      </div>
    </div>
  );
} 

