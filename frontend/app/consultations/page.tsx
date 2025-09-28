/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";

// Add Modal component
interface BookingModalProps {
  doctor: any;
  open: boolean;
  onClose: () => void;
  user: any;
}
function BookingModal({ doctor, open, onClose, user }: BookingModalProps & { user: any }) {
  const [step, setStep] = useState(1);
  const [slots, setSlots] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  useEffect(() => {
    if (open && doctor && doctor._id && user) {
      setLoading(true);
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      axios.get(`http://localhost:8000/api/doctor/availability?doctorId=${doctor._id}`,
        token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
      )
        .then(res => {
          // Filter slots: only exclude slots with status 'confirmed', allow 'cancelled' and others
          const filteredSlots = res.data.map((slotObj: any) => ({
            ...slotObj,
            slots: Array.isArray(slotObj.slots)
              ? slotObj.slots.filter((time: string) => {
                  // If slotObj.bookings exists, check status for each time
                  if (slotObj.bookings && Array.isArray(slotObj.bookings)) {
                    const booking = slotObj.bookings.find((b: any) => b.time === time);
                    return !booking || booking.status !== 'confirmed';
                  }
                  // If no bookings info, keep all times
                  return true;
                })
              : slotObj.slots
          }));
          setSlots(filteredSlots);
        })
        .catch(() => setSlots([]))
        .finally(() => setLoading(false));
    }
  }, [open, doctor, user]);
  if (!open || !doctor || !user) return null;

  // Redirect to payment page with booking details
  const handleConfirmBooking = () => {
    console.log('Booking params:', {
      doctorId: doctor._id,
      doctorName: `${doctor.firstName} ${doctor.lastName}`,
      speciality: doctor.speciality || 'General Practitioner',
      date: selectedDate,
      time: selectedTime,
      fee: '1000',
    });
    if (!selectedDate || !selectedTime) {
      alert('Please select both date and time.');
      return;
    }
    const params = new URLSearchParams({
      doctorId: doctor._id,
      doctorName: `${doctor.firstName} ${doctor.lastName}`,
      speciality: doctor.speciality || 'General Practitioner',
      date: selectedDate,
      time: selectedTime,
      fee: '1000',
    });
    console.log('Redirecting to:', `/consultations/payment?${params.toString()}`);
    router.push(`/consultations/payment?${params.toString()}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(173, 216, 255, 0.25)' }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md min-h-[200px] flex flex-row relative animate-fadeIn p-0">
        {/* Close Icon */}
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-gray-400 hover:text-blue-600 text-2xl font-bold focus:outline-none transition"
          aria-label="Close"
        >
          ×
        </button>
        {/* Left: Doctor Image Only */}
        <div className="flex items-center justify-center w-1/3 bg-blue-50 rounded-l-2xl p-2 min-h-[160px]">
          <img
            src={doctor.profilePhoto ? `http://localhost:8000/${doctor.profilePhoto.replace(/^uploads\//, 'uploads/')}` : "/images/doc1.webp"}
            alt="Doctor"
            className="w-24 h-32 object-cover rounded-lg border-2 border-blue-200 shadow-md"
            style={{ minHeight: 0, minWidth: 0 }}
          />
        </div>
        {/* Right: Details stacked vertically */}
        <div className="flex-1 flex flex-col justify-center px-4 py-6">
          <div className="mb-2">
            <div className="text-lg font-bold text-blue-900 leading-tight">{doctor.firstName} {doctor.lastName}</div>
            <div className="text-blue-600 text-sm font-semibold mb-2">{doctor.speciality || 'General Practitioner'}</div>
          </div>
          <div className="mb-2">
            <div className="text-gray-700 text-sm font-semibold">Available Dates:</div>
            <div className="flex flex-wrap gap-2 mt-1 mb-2">
              {doctor.availableDates && doctor.availableDates.length > 0 ? doctor.availableDates.map((date: string) => (
                <button key={date} className={`px-2 py-1 rounded text-xs border font-medium transition ${selectedDate === date ? 'bg-blue-600 text-white shadow' : 'bg-white text-blue-700 border-blue-200 hover:bg-blue-50'}`} onClick={() => setSelectedDate(date)}>{date}</button>
              )) : <span className="text-gray-400 text-xs">No dates</span>}
            </div>
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
          <div className="mb-3">
            <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded px-3 py-2 text-xs font-semibold shadow-sm">
            A fee of Rs.1000 will be charged for your booking. Do you want to confirm your appointment?
            </div>
          </div>
          <button className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg font-bold text-base shadow hover:from-blue-700 hover:to-blue-600 transition mt-2" disabled={!selectedDate || !selectedTime} onClick={handleConfirmBooking}>
            Confirm Booking
          </button>
        </div>
      </div>
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.97); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.32s cubic-bezier(0.4,0,0.2,1);
        }
      `}</style>
    </div>
  );
}

export default function ServicesPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  const getDayWithSuffix = (day: number) => {
    if (day > 3 && day < 21) return `${day}th`;
    switch (day % 10) {
      case 1:
        return `${day}st`;
      case 2:
        return `${day}nd`;
      case 3:
        return `${day}rd`;
      default:
        return `${day}th`;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const dayOfWeek = date.toLocaleDateString("en-US", { weekday: "short" });
    const month = date.toLocaleDateString("en-US", { month: "short" });
    const day = getDayWithSuffix(date.getDate());
    return `${dayOfWeek} - ${month} ${day}`;
  };

  useEffect(() => {
    const loggedInUser = localStorage.getItem("user");
    setUser(loggedInUser ? JSON.parse(loggedInUser) : null);
    async function fetchDoctors() {
      try {
        const res = await axios.get("http://localhost:8000/api/doctor/list");
        setDoctors(res.data);
      } catch (err) {
        setDoctors([]);
      } finally {
        setLoading(false);
      }
    }
    fetchDoctors();
  }, []);

  const handleBooking = (doctor: any) => {
    const loggedInUser = localStorage.getItem("user");
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!loggedInUser || !token) {
      router.push("/login");
      return;
    }
    setUser(JSON.parse(loggedInUser));
    setSelectedDoctor(doctor);
    setModalOpen(true);
  };

  // Sync user state with localStorage when modalOpen changes
  useEffect(() => {
    if (modalOpen) {
      const loggedInUser = localStorage.getItem("user");
      setUser(loggedInUser ? JSON.parse(loggedInUser) : null);
    }
  }, [modalOpen]);

  return (
    <>
      <Navbar />
      {/* Only show modal if user is logged in */}
      <BookingModal doctor={selectedDoctor} open={modalOpen && !!user} onClose={() => setModalOpen(false)} user={user} />
      <div className="bg-white">
        <div className="max-w-6xl mx-auto px-4 py-12">
          {/* Intro Section */}
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-3xl font-bold text-black mb-4">Doctor Channeling</h1>
              <p className="text-black text-base leading-relaxed">
                Book appointments with top doctors easily and quickly. Our platform
                ensures you connect with qualified specialists across a range of
                fields. Select your doctor, choose a time, and you're done—all
                from the comfort of your home.
              </p>
            </div>
            <div>
              <Image
                src="/images/doc1.webp"
                alt="Doctor Channeling"
                width={600}
                height={400}
                className="rounded-xl w-full h-auto"
              />
            </div>
          </div>

          {/* Doctor Cards */}
          <div className="mt-12 grid md:grid-cols-2 gap-8">
            {loading ? (
              <div className="text-center text-blue-600 py-10 text-lg font-semibold">Loading doctors...</div>
            ) : doctors.length === 0 ? (
              <div className="text-center text-gray-500 py-10 text-lg">No doctors available at the moment.</div>
            ) : (
              doctors.map((doctor) => (
                <div
                  key={doctor._id}
                  className="flex bg-blue-50 rounded-xl p-6 shadow hover:shadow-lg transition"
                >
                  <Image
                    src={doctor.profilePhoto ? `http://localhost:8000/${doctor.profilePhoto.replace(/^uploads\//, 'uploads/')}` : "/images/doc1.webp"}
                    alt={doctor.firstName + ' ' + doctor.lastName}
                    width={120}
                    height={120}
                    className="rounded-lg object-cover mr-6"
                  />
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-black mb-1">{doctor.firstName} {doctor.lastName}</h3>
                    <p className="text-blue-700">{doctor.speciality || 'General Practitioner'}</p>
                    {/* Available Dates */}
                    {doctor.availableDates && doctor.availableDates.length > 0 && (
                      <div className="my-3 text-sm">
                        <span className="font-semibold text-gray-700">Available on: </span>
                        <span className="text-gray-600">
                          {doctor.availableDates
                            .map((date: string) => formatDate(date))
                            .join(", ")}
                        </span>
                      </div>
                    )}
                    {doctor.availableSlots && doctor.availableSlots.length > 0 ? (
                      <div>
                        <div className="text-xs text-gray-600">
                          Next available: {doctor.availableSlots[0].date} at{" "}
                          {doctor.availableSlots[0].slots && doctor.availableSlots[0].slots.length > 0
                            ? doctor.availableSlots[0].slots.join(", ")
                            : "No times"}
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-gray-400">No slots available</div>
                    )}
                    <button
                      onClick={() => handleBooking(doctor)}
                      className="bg-blue-100 text-blue-600 px-4 py-2 rounded hover:bg-blue-600 hover:text-white transition"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
