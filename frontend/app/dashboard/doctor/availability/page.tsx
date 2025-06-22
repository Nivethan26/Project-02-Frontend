"use client";
import Sidebar from '@/components/layout/Sidebar';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useState } from 'react';
import { CheckCircle } from 'lucide-react';
import userService from '@/services/user';

const TIME_SLOTS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
  '20:00', '20:30', '21:00', '21:30',
];

function getToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

function formatDate(date: Date) {
  return date.toISOString().split('T')[0];
}

function getMonthDays(year: number, month: number) {
  const days = [];
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(new Date(year, month, d));
  }
  return days;
}

export default function AvailabilityPage() {
  const [selectedDates, setSelectedDates] = useState<Date[]>([getToday()]);
  const [month, setMonth] = useState(getToday().getMonth());
  const [year, setYear] = useState(getToday().getFullYear());
  const [availability, setAvailability] = useState<Record<string, string[]>>({});
  const [activeDate, setActiveDate] = useState<string>(formatDate(getToday()));
  const [showModal, setShowModal] = useState(false);
  const [modalSummary, setModalSummary] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitResult, setSubmitResult] = useState<string | null>(null);

  const days = getMonthDays(year, month);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handlePrevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };
  const handleNextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  // Toggle date selection
  const handleDateClick = (date: Date) => {
    const dateKey = formatDate(date);
    setSelectedDates((prev) => {
      const exists = prev.some((d) => formatDate(d) === dateKey);
      if (exists) {
        // Remove date and its slots
        setAvailability((slots) => {
          const newSlots = { ...slots };
          delete newSlots[dateKey];
          return newSlots;
        });
        // If removing the active date, switch to another selected date if any
        if (activeDate === dateKey) {
          const others = prev.filter((d) => formatDate(d) !== dateKey);
          setActiveDate(others.length > 0 ? formatDate(others[0]) : '');
        }
        return prev.filter((d) => formatDate(d) !== dateKey);
      } else {
        setActiveDate(dateKey);
        return [...prev, date];
      }
    });
  };

  // Set which date's slots are being edited
  const handleSetActiveDate = (dateKey: string) => {
    setActiveDate(dateKey);
  };

  // Toggle slot for the active date
  const handleSlotToggle = (slot: string) => {
    if (!activeDate) return;
    setAvailability((prev) => {
      const slots = prev[activeDate] || [];
      if (slots.includes(slot)) {
        return { ...prev, [activeDate]: slots.filter((s) => s !== slot) };
      } else {
        return { ...prev, [activeDate]: [...slots, slot].sort() };
      }
    });
  };

  const selectedDatesSorted = [...selectedDates].sort((a, b) => a.getTime() - b.getTime());
  const selectedSlots = availability[activeDate] || [];

  async function handleConfirmSchedule() {
    setSubmitLoading(true);
    setSubmitResult(null);
    try {
      const payload = selectedDatesSorted.map((d) => ({
        date: formatDate(d),
        slots: availability[formatDate(d)] || [],
      }));
      const res = await userService.submitDoctorAvailability(payload);
      setSubmitResult(res.message || 'Schedule submitted successfully!');
    } catch (err: any) {
      setSubmitResult(err?.message || 'Failed to submit schedule.');
    } finally {
      setSubmitLoading(false);
    }
  }

  return (
    <ProtectedRoute role="doctor">
      <div className="flex min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-200 relative overflow-hidden">
        <div className="absolute inset-0 bg-white/40 pointer-events-none z-0" />
        <div className="absolute -top-10 -left-32 w-96 h-96 bg-blue-400 opacity-30 rounded-full filter blur-3xl z-0" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-200 opacity-40 rounded-full filter blur-2xl z-0" />
        <div className="hidden md:block"><Sidebar role="doctor" /></div>
        <main className="flex-1 md:ml-64 p-0 sm:p-4 flex flex-col items-center justify-start relative z-10">
          <div className="w-full max-w-5xl mx-auto bg-white/80 backdrop-blur-2xl rounded-3xl shadow-2xl border border-blue-100 p-4 sm:p-10 md:p-16 md:py-12 animate-fadeInUp mt-10">
            <h1 className="text-4xl font-bold text-blue-900 mb-2 text-center tracking-tight font-sans">Doctor Availability</h1>
            <p className="text-center text-blue-500 mb-8 text-lg font-medium tracking-normal font-sans">Select multiple dates and assign available time slots for each</p>
            <div className="flex flex-col md:flex-row gap-10 md:gap-16">
              {/* Calendar */}
              <div className="w-full md:w-1/2 flex flex-col items-center">
                <div className="flex items-center justify-between w-full mb-2">
                  <button onClick={handlePrevMonth} className="text-blue-600 hover:text-blue-800 font-bold text-xl">&#8592;</button>
                  <span className="font-semibold text-lg text-blue-800">{new Date(year, month).toLocaleString('default', { month: 'long' })} {year}</span>
                  <button onClick={handleNextMonth} className="text-blue-600 hover:text-blue-800 font-bold text-xl">&#8594;</button>
                </div>
                <div className="grid grid-cols-7 gap-1 w-full">
                  {weekDays.map((d) => (
                    <div key={d} className="text-center font-bold text-blue-500 py-1">{d}</div>
                  ))}
                  {Array(days[0].getDay()).fill(null).map((_, i) => (
                    <div key={i} />
                  ))}
                  {days.map((date) => {
                    const dateKey = formatDate(date);
                    const isSelected = selectedDates.some((d) => formatDate(d) === dateKey);
                    const isToday = dateKey === formatDate(getToday());
                    const isPast = date < getToday();
                    return (
                      <button
                        key={date.toISOString()}
                        onClick={() => !isPast && handleDateClick(date)}
                        className={`rounded-lg w-10 h-10 flex items-center justify-center font-semibold transition border-2
                          ${isSelected ? 'bg-blue-600 text-white border-blue-700 shadow-lg' : isToday ? 'border-blue-300 text-blue-700 bg-blue-100' : isPast ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'border-transparent text-gray-700 hover:bg-blue-50'}
                        `}
                        disabled={isPast}
                        title={isPast ? 'Cannot select past dates' : 'Select date'}
                      >
                        {date.getDate()}
                      </button>
                    );
                  })}
                </div>
                {/* List selected dates for quick access */}
                {selectedDates.length > 0 && (
                  <div className="mt-6 w-full">
                    <h3 className="font-bold text-blue-800 mb-2 text-sm">Selected Dates:</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedDatesSorted.map((d) => {
                        const dateKey = formatDate(d);
                        return (
                          <button
                            key={dateKey}
                            onClick={() => handleSetActiveDate(dateKey)}
                            className={`px-3 py-1 rounded-full border font-semibold text-sm transition
                              ${activeDate === dateKey ? 'bg-blue-600 text-white border-blue-700' : 'bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-200'}
                            `}
                          >
                            {d.toLocaleDateString()}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
              {/* Time Slots for active date */}
              <div className="w-full md:w-1/2">
                {activeDate ? (
                  <>
                    <div className="mb-4 flex items-center gap-2">
                      <span className="font-semibold text-blue-700 text-lg">{new Date(activeDate).toLocaleDateString()}</span>
                      <span className="text-gray-400">|</span>
                      <span className="text-blue-400 text-sm">Select your available slots</span>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                      {TIME_SLOTS.map((slot) => (
                        <button
                          key={slot}
                          onClick={() => handleSlotToggle(slot)}
                          className={`rounded-xl px-3 py-2 font-semibold border transition text-base
                            ${selectedSlots.includes(slot)
                              ? 'bg-blue-600 text-white border-blue-700 shadow-md scale-105'
                              : 'bg-white text-blue-700 border-blue-200 hover:bg-blue-100'}
                          `}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                    <div className="mt-6">
                      <h3 className="font-bold text-blue-800 mb-2">Selected Slots:</h3>
                      {selectedSlots.length === 0 ? (
                        <span className="text-gray-400">No slots selected.</span>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {selectedSlots.map((slot) => (
                            <span key={slot} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-semibold text-sm border border-blue-300">
                              {slot}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-gray-400 text-center mt-10">Select a date to assign slots</div>
                )}
              </div>
            </div>
            {/* Summary of all selected dates and slots */}
            <div className="mt-10">
              <h2 className="text-2xl font-bold text-blue-900 mb-4">Summary</h2>
              {selectedDatesSorted.length === 0 ? (
                <div className="text-gray-400">No dates selected.</div>
              ) : (
                <div className="space-y-4">
                  {selectedDatesSorted.map((d) => {
                    const dateKey = formatDate(d);
                    const slots = availability[dateKey] || [];
                    return (
                      <div key={dateKey} className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                        <div className="font-semibold text-blue-800 mb-2">{d.toLocaleDateString()}</div>
                        {slots.length === 0 ? (
                          <span className="text-gray-400">No slots selected.</span>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {slots.map((slot) => (
                              <span key={slot} className="bg-blue-200 text-blue-800 px-3 py-1 rounded-full font-semibold text-sm border border-blue-300">
                                {slot}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
              {/* Complete Schedule Button */}
              <div className="flex justify-center mt-8">
                <button
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-2xl text-lg shadow-lg transition disabled:opacity-60"
                  onClick={() => {
                    if (selectedDatesSorted.length === 0) {
                      setModalSummary('Please select at least one date and time slot.');
                      setShowModal(true);
                      return;
                    }
                    const summary = selectedDatesSorted.map((d) => {
                      const dateKey = formatDate(d);
                      const slots = availability[dateKey] || [];
                      return `${d.toLocaleDateString()}: ${slots.length ? slots.join(', ') : 'No slots selected'}`;
                    }).join('<br/>');
                    setModalSummary(summary);
                    setShowModal(true);
                  }}
                  disabled={selectedDatesSorted.length === 0}
                >
                  <CheckCircle className="w-6 h-6" /> Complete Schedule
                </button>
              </div>
            </div>
          </div>
          {/* Modal Popup */}
          {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-blue-900/40 animate-fadeIn">
              <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative animate-scaleIn">
                <button onClick={() => setShowModal(false)} className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl">&times;</button>
                <h2 className="text-2xl font-bold text-blue-700 mb-6 text-center">Your Schedule</h2>
                <div className="text-blue-900 text-base font-medium whitespace-pre-line text-center mb-4" dangerouslySetInnerHTML={{ __html: modalSummary }} />
                {submitResult && (
                  <div className={`mb-4 text-center font-semibold ${submitResult.toLowerCase().includes('success') ? 'text-green-600' : 'text-red-600'}`}>{submitResult}</div>
                )}
                <div className="flex justify-center gap-4 mt-4">
                  <button
                    onClick={handleConfirmSchedule}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-xl transition flex items-center gap-2 disabled:opacity-60"
                    disabled={submitLoading}
                  >
                    {submitLoading ? 'Submitting...' : (<><CheckCircle className="w-5 h-5" /> Confirm</>)}
                  </button>
                  <button onClick={() => setShowModal(false)} className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold px-6 py-2 rounded-xl transition">Close</button>
                </div>
              </div>
            </div>
          )}
          <style jsx global>{`
            @keyframes fadeInUp {
              from { opacity: 0; transform: translateY(40px); }
              to { opacity: 1; transform: translateY(0); }
            }
            .animate-fadeInUp {
              animation: fadeInUp 0.8s cubic-bezier(0.4,0,0.2,1);
            }
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            .animate-fadeIn {
              animation: fadeIn 0.4s ease;
            }
            @keyframes scaleIn {
              from { opacity: 0; transform: scale(0.95); }
              to { opacity: 1; transform: scale(1); }
            }
            .animate-scaleIn {
              animation: scaleIn 0.3s cubic-bezier(0.4,0,0.2,1);
            }
          `}</style>
        </main>
      </div>
    </ProtectedRoute>
  );
} 