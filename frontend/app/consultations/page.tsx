"use client";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ServicesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null); // any or a specific type

  useEffect(() => {
    if (typeof window !== "undefined") {
      const loggedInUser = localStorage.getItem("user");
      setUser(loggedInUser ? JSON.parse(loggedInUser) : null);
    }
  }, []);

  const handleBooking = () => {
    if (!user) {
      router.push("/login");
    } else {
      alert("Your booking request was sent successfully!");
    }
  };

  const doctors = [
    {
      id: 1,
      name: "Dr. Samantha Jeevan",
      specialty: "Cardiologist, General Physician",
      available: "Mon, Wed, Fri",
      time: "9:00 AM - 12:00 PM",
      image: "/images/doc2.jpg",
    },
    {
      id: 2,
      name: "Dr. Shalini Silva",
      specialty: "Dermatologist, Skin Specialist",
      available: "Tue, Thu, Sat",
      time: "2:00 PM - 5:00 PM",
      image: "/images/doc3.png",
    },
    {
      id: 3,
      name: "Dr. Kamal Fernando",
      specialty: "Pediatrician, Child Specialist",
      available: "Mon - Fri",
      time: "10:00 AM - 1:00 PM",
      image: "/images/doc4.jpg",
    },
    {
      id: 4,
      name: "Dr. Maaran Jayasuriya",
      specialty: "Neurologist, Brain & Spine Specialist",
      available: "Wed, Sat",
      time: "3:00 PM - 6:00 PM",
      image: "/images/doc5.jpeg",
    },
  ];

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
                className="rounded-xl w-full h-auto object-cover"
              />
            </div>
          </div>

          {/* Doctor Cards */}
          <div className="mt-12 grid md:grid-cols-2 gap-8">
            {doctors.map((doctor) => (
              <div
                key={doctor.id}
                className="flex bg-blue-50 rounded-xl p-6 shadow hover:shadow-lg transition"
              >
                <Image
                  src={doctor.image}
                  alt={doctor.name}
                  width={120}
                  height={120}
                  className="rounded-lg object-cover mr-6"
                />
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-black mb-1">{doctor.name}</h3>
                  <p className="text-blue-700">{doctor.specialty}</p>
                  <p className="text-gray-600 text-sm mt-1">Available: {doctor.available}</p>
                  <p className="text-gray-600 text-sm mb-3">Time: {doctor.time}</p>
                  <button
                    onClick={handleBooking}
                    className="bg-blue-100 text-blue-600 px-4 py-2 rounded hover:bg-blue-600 hover:text-white transition"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
