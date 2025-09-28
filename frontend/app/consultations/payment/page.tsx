"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import Loader from '@/components/Loader';
import Image from 'next/image';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
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
      const userStr = localStorage.getItem("user") || sessionStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  
      if (!user || !user.id) {
        setError("User not found. Please log in again.");
        setLoading(false);
        return;
      }
  
      // ✅ Generate a mock paymentIntentId
      const paymentIntentId = `pi_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
  
      const payload = {
        doctorId: booking.doctorId,
        date: booking.date,
        time: booking.time,
        amount: booking.fee,
        method: "card",
        paymentIntentId  // ✅ crucial for preventing duplicate error
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
    <>
      <Navbar />
      <div className="min-h-screen bg-blue-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8 items-stretch">
            {/* Left Side - Booking Details & Card Preview */}
            <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col">
              <h2 className="text-2xl font-bold text-blue-900 mb-6 text-center">Doctor Booking Payment</h2>
              
              {/* Booking Details */}
              <div className="mb-8 flex-grow">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg">{booking.doctorName}</h3>
                      <p className="text-blue-600 text-sm font-medium">{booking.speciality}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-3 border border-gray-100">
                      <div className="flex items-center space-x-2 mb-1">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Date</span>
                      </div>
                      <p className="text-sm font-semibold text-gray-800">{booking.date}</p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-3 border border-gray-100">
                      <div className="flex items-center space-x-2 mb-1">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Time</span>
                      </div>
                      <p className="text-sm font-semibold text-gray-800">{booking.time}</p>
                    </div>
                  </div>
                  
                  {/* <div className="mt-4 bg-blue-600 rounded-lg p-4 text-center">
                    <p className="text-white text-sm font-medium mb-1">Advance Payment Required</p>
                    <p className="text-white text-2xl font-bold">Rs {booking.fee}</p>
                  </div> */}
                </div>

                {/* Payment Instructions */}
                <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-r-xl p-5 shadow-sm">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-base font-bold text-gray-800 mb-3 flex items-center">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                        Payment Instructions
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-800">Advance Payment</p>
                            <p className="text-xs text-gray-600">Rs 1,000 (Required to confirm your booking)</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <svg className="w-3 h-3 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-800">Remaining Payment</p>
                            <p className="text-xs text-gray-600">Pay full consultation fee after your appointment</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <svg className="w-3 h-3 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-800">Refund Policy</p>
                            <p className="text-xs text-gray-600">Advance payment is non-refundable if cancelled within 24 hours</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Preview */}
              
            </div>

            {/* Right Side - Payment Form */}
            <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col">
              <div className="flex items-center space-x-3 mb-6">
{/*                 
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800">Payment Details</h3> */}
                <div className="w-full flex flex-col items-center">
                <div className="w-full max-w-sm bg-gradient-to-r from-slate-800 to-slate-600 rounded-xl p-6 shadow-lg">
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
              </div>
              
              <form onSubmit={handlePayment} className="space-y-6 flex-grow flex flex-col">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                      <svg className="w-4 h-4 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      Card Number
                    </label>
                    <input 
                      type="text" 
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                      maxLength={19} 
                      value={cardNumber} 
                      onChange={handleCardNumberChange} 
                      placeholder="1234 5678 9012 3456" 
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                        <svg className="w-4 h-4 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Expiry (MM/YY)
                      </label>
                      <input 
                        type="text" 
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                        maxLength={5} 
                        value={expiry} 
                        onChange={handleExpiryChange} 
                        placeholder="MM/YY" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                        <svg className="w-4 h-4 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        CVV
                      </label>
                      <input 
                        type="password" 
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                        maxLength={3} 
                        value={cvv} 
                        onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))} 
                        placeholder="123" 
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                      <svg className="w-4 h-4 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Cardholder Name
                    </label>
                    <input 
                      type="text" 
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                      value={cardholder} 
                      onChange={e => setCardholder(e.target.value)} 
                      placeholder="Name on card" 
                    />
                  </div>
                  
                  {error && (
                    <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-red-700">{error}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="space-y-4 mt-auto pt-6 border-t border-gray-100">
                  <button 
                    type="submit" 
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl font-bold text-lg shadow-lg hover:from-blue-700 hover:to-blue-600 transition-all duration-200 transform hover:scale-[1.02]" 
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <Loader />
                        <span className="ml-2">Processing...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        Pay Rs {booking.fee} - Confirm Booking
                      </div>
                    )}
                  </button>
                  
                  <button 
                    type="button" 
                    onClick={() => router.push('/consultations')}
                    className="w-full py-4 bg-gray-100 text-gray-700 rounded-xl font-semibold text-lg border-2 border-gray-200 hover:bg-gray-200 hover:border-gray-300 transition-all duration-200"
                  >
                    <div className="flex items-center justify-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Cancel Booking
                    </div>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
} 

