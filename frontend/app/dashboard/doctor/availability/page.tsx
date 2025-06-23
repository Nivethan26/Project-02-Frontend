/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import Sidebar from '@/components/layout/Sidebar';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useState, useEffect } from 'react';
import { Trash2, Calendar, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
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
  const lastDay = new Date(year, month + 1, 0);
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(new Date(year, month, d));
  }
  return days;
}

export default function AvailabilityPage() {
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const [availability, setAvailability] = useState<Record<string, string[]>>({});
  const [activeDate, setActiveDate] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const days = getMonthDays(year, month);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  useEffect(() => {
    async function fetchAvailability() {
      setLoading(true);
      try {
        const data = await userService.getDoctorAvailability();
        const today = getToday();
        const dates: Date[] = [];
        const avail: Record<string, string[]> = {};
        data.forEach(item => {
          const itemDate = new Date(item.date);
          itemDate.setUTCHours(0,0,0,0);
          if (itemDate >= today) {
            dates.push(itemDate);
            avail[item.date] = item.slots;
          }
        });
        const sortedDates = dates.sort((a, b) => a.getTime() - b.getTime());
        setSelectedDates(sortedDates);
        setAvailability(avail);
        if (sortedDates.length > 0) {
          setActiveDate(formatDate(sortedDates[0]));
        } else {
          setActiveDate(formatDate(getToday()));
        }
      } catch (err) {
        console.error("Failed to fetch availability", err);
        setActiveDate(formatDate(getToday()));
      } finally {
        setLoading(false);
      }
    }
    fetchAvailability();
  }, []);
  
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

  const handleDateClick = (date: Date) => {
    const dateKey = formatDate(date);
    setActiveDate(dateKey);
    if (!selectedDates.some(d => formatDate(d) === dateKey)) {
      const newSelectedDates = [...selectedDates, date].sort((a, b) => a.getTime() - b.getTime());
      setSelectedDates(newSelectedDates);
    }
  };

  const handleSlotToggle = async (slot: string) => {
    if (!activeDate) return;

    const currentSlots = availability[activeDate] || [];
    const isAdding = !currentSlots.includes(slot);
    
    setAvailability(prev => ({
      ...prev,
      [activeDate]: isAdding
        ? [...currentSlots, slot].sort()
        : currentSlots.filter(s => s !== slot)
    }));
    
    try {
      if (isAdding) {
        await userService.updateAvailabilitySlot(activeDate, slot);
      } else {
        await userService.deleteAvailabilitySlot(activeDate, slot);
      }
    } catch (error) {
      console.error("Failed to update slot:", error);
      setAvailability(prev => ({ ...prev, [activeDate]: currentSlots })); // Revert on error
    }
  };

  const handleDeleteDate = async (dateKey: string) => {
    const originalAvailability = { ...availability };
    const originalSelectedDates = [...selectedDates];
  
    // Optimistic update
    setAvailability(prev => {
        const newAvail = { ...prev };
        delete newAvail[dateKey];
        return newAvail;
    });
    setSelectedDates(prev => prev.filter(d => formatDate(d) !== dateKey));
  
    if (activeDate === dateKey) {
        const remainingDates = originalSelectedDates.filter(d => formatDate(d) !== dateKey);
        setActiveDate(remainingDates.length > 0 ? formatDate(remainingDates[0]) : formatDate(getToday()));
    }
  
    try {
        const slotsToDelete = originalAvailability[dateKey] || [];
        if (slotsToDelete.length > 0) {
            await Promise.all(slotsToDelete.map(slot => userService.deleteAvailabilitySlot(dateKey, slot)));
        }
    } catch (error) {
        console.error("Failed to delete date:", error);
        // Revert on error
        setAvailability(originalAvailability);
        setSelectedDates(originalSelectedDates);
    }
  };
  
  const selectedSlots = availability[activeDate] || [];

  return (
    <ProtectedRoute role="doctor">
      <div className="flex min-h-screen bg-gray-100/50">
        <Sidebar role="doctor" />
        <main className="flex-1 md:ml-64 p-6">
          <div className="w-full max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800">Manage Your Availability</h1>
            <p className="text-sm text-gray-500 mb-6">Select a date and then choose your available time slots. Changes are saved automatically.</p>
            
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Calendar Section */}
              <div className="xl:col-span-2 bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-gray-100"><ChevronLeft className="h-5 w-5 text-gray-600" /></button>
                  <span className="font-semibold text-lg text-gray-700">{new Date(year, month).toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                  <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-gray-100"><ChevronRight className="h-5 w-5 text-gray-600" /></button>
                </div>
                <div className="grid grid-cols-7">
                  {weekDays.map(d => <div key={d} className="text-center font-medium text-xs text-gray-500 py-2 uppercase">{d}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {Array(new Date(year, month, 1).getDay()).fill(null).map((_, i) => <div key={`empty-${i}`} />)}
                  {days.map(date => {
                    const dateKey = formatDate(date);
                    const isSelected = selectedDates.some(d => formatDate(d) === dateKey);
                    const isActive = activeDate === dateKey;
                    const isPast = date < getToday();
                    const dayNumber = date.getDate();

                    return (
                      <div key={date.toISOString()} className="p-1">
                        <button
                          onClick={() => !isPast && handleDateClick(date)}
                          className={`rounded-lg w-full h-12 text-sm font-medium transition-colors
                            ${isPast ? 'text-gray-400 cursor-not-allowed' : ''}
                            ${!isPast && (isActive ? 'bg-blue-600 text-white' : isSelected ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100')}
                          `}
                          disabled={isPast}
                        >
                          {dayNumber}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Side Panel */}
              <div className="space-y-6">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h2 className="font-semibold text-gray-800 mb-3 flex items-center"><Calendar className="mr-2 h-5 w-5 text-gray-500" /> Selected Dates</h2>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                    {selectedDates.length > 0 ? selectedDates.map(date => {
                      const dateKey = formatDate(date);
                      return (
                        <div 
                          key={dateKey} 
                          className={`flex justify-between items-center p-2.5 rounded-md cursor-pointer transition-colors ${activeDate === dateKey ? 'bg-blue-100' : 'hover:bg-gray-50'}`} 
                          onClick={() => setActiveDate(dateKey)}
                        >
                          <span className="font-medium text-sm text-gray-600">{new Date(date.getTime() + date.getTimezoneOffset() * 60000).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
                          <button onClick={(e) => {e.stopPropagation(); handleDeleteDate(dateKey);}} className="p-1 text-gray-400 hover:text-red-500 rounded-full"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      )
                    }) : <p className="text-sm text-gray-500 p-2">No dates selected.</p>}
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h2 className="font-semibold text-gray-800 mb-3 flex items-center"><Clock className="mr-2 h-5 w-5 text-gray-500" /> Time Slots for {activeDate ? new Date(activeDate.replace(/-/g, '/')).toLocaleDateString('en-US', {month: 'long', day: 'numeric'}) : '...'}</h2>
                  {activeDate && !isPast(new Date(activeDate.replace(/-/g, '/'))) ? (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {TIME_SLOTS.map(slot => (
                        <button
                          key={slot}
                          onClick={() => handleSlotToggle(slot)}
                          className={`p-2 rounded-md text-sm font-medium transition-colors text-center
                            ${selectedSlots.includes(slot) ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}
                          `}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  ) : <p className="text-sm text-gray-500 p-2">Select a future date to manage time slots.</p>}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

function isPast(date: Date): boolean {
    const today = getToday();
    // Compare date part only
    const normalizedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    return normalizedDate < today;
} 