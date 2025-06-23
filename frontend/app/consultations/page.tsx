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

export default function ServicesPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  const handleBooking = () => {
    if (!user) {
      router.push("/login");
    } else {
      alert("Your booking request was sent successfully!");
    }
  };

  return (
    <>
      <Navbar />
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
                  <button
                    onClick={handleBooking}
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
