// app/about/page.tsx

import Navbar from '@/components/layout/Navbar';
import Image from 'next/image';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="bg-[#f5f8ff]">
      <Navbar />

      {/* Header */}
      <header className="max-w-6xl mx-auto px-4 py-8 flex flex-col md:flex-row items-center gap-8">
        <div className="flex-1">
          <span className="text-[#e74c3c] font-semibold block mb-1">S K Medicals</span><br></br>
          <h1 className="text-black font-bold text-4xl md:text-5xl mb-4">Your Trusted<br />Pharmacy Store</h1>
          <p className="text-gray-600">
            Your health is our priority. Experience compassionate care, fast service, and our team that treats you like family.
          </p>
        </div>
        <div className="flex-1">
          <img
            src="/images/about-pharmacy-1.jpeg"
            alt="Pharmacy"
            className="rounded-xl shadow-lg w-full object-cover"
          />
        </div>
      </header>

      {/* Our Story / Featured Essentials Section */}
      <section className="bg-white py-12">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 relative">
            <span className="text-[#e74c3c] font-semibold block mb-1">Our Story</span>
            <h2 className="text-black text-2xl font-bold mb-4">Featured Pharmacy Essentials</h2>
            <p className="text-gray-700 mb-6">
              Founded with a mission to redefine community healthcare, S K Medicals has been serving Jaffna since 2020.
              What began as a small neighborhood pharmacy has grown into a trusted healthcare hub, thanks to our
              unwavering focus on quality, compassion, and innovation.
            </p>
          </div>
          <div className="flex-1 flex justify-center">
            <div className="relative w-40 h-40 rounded-full border border-black flex items-center justify-center">
              <Link href="#" className="text-blue-600 font-semibold text-sm text-center">All Our Story</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why Us */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 space-y-6 text-center md:text-left">
            <h3 className="text-[#e74c3c] font-semibold text-left">Why Us</h3>
            <div className="space-y-4">
              {[
                {
                  icon: '💊',
                  title: 'Expert Care',
                  desc: 'Our licensed pharmacists and healthcare professionals bring 5+ years of combined experience to provide personalized advice and solutions.',
                },
                {
                  icon: '🩺',
                  title: 'Patient-First Approach',
                  desc: 'You’re more than a prescription: we listen, educate, and empower you to make informed health decisions.',
                },
                {
                  icon: '✅',
                  title: 'Quality Guaranteed',
                  desc: 'Every product on our shelves is rigorously vetted for safety, efficacy, and affordability.',
                },
                {
                  icon: '🌱',
                  title: 'Community Roots',
                  desc: 'We’re proud to support local initiatives/programs, because your health is our shared priority.',
                },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <span className="text-blue-600 text-xl">{item.icon}</span>
                  </div>
                  <div>
                    <h4 className="text-black font-bold">{item.title}</h4>
                    <p className="text-gray-600 text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1 flex justify-center">
            <img
              src="/images/about-pharmacy-3.jpg"
              alt="Pharmacy Interior"
              className="rounded-xl shadow-lg w-80 object-cover"
            />
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="bg-blue-600 py-12 text-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <span className="text-white font-semibold">Our Services</span>
            <h3 className="text-2xl font-bold">Comprehensive Pharmacy Services</h3>
            <div className="w-32 h-32 rounded-full border border-white flex items-center justify-center">
              <Link href="#" className="text-white font-semibold text-sm">All Services</Link>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
  <div className="text-center">
    <img
      src="/images/prescription checking.jpeg"
      alt="Prescription Checking"
      className="mx-auto mb-4 rounded-xl shadow-md w-full h-48 object-cover"
    />
    <h4 className="font-semibold mb-2">01 Prescription Checking</h4>
    <p className="text-blue-100 text-sm">
      Accuracy you can trust—our pharmacists double-check every prescription for your safety.
    </p>
  </div>

  <div className="text-center">
    <img
      src="/images/homeDelivery.jpg"
      alt="Home Delivery"
      className="mx-auto mb-4 rounded-xl shadow-md w-full h-48 object-cover"
    />
    <h4 className="font-semibold mb-2">02 Home Delivery</h4>
    <p className="text-blue-100 text-sm">
      Skip the trip! Reliable, contact-free delivery for your family’s medications.
    </p>
  </div>

  <div className="text-center">
    <img
      src="/images/Healthclinic.jpeg"
      alt="Health Consultations"
      className="mx-auto mb-4 rounded-xl shadow-md w-full h-48 object-cover"
    />
    <h4 className="font-semibold mb-2">03 Health Consultations</h4>
    <p className="text-blue-100 text-sm">
      Specialized skin care advice from trusted professionals—personalized solutions for healthy, radiant skin.
    </p>
  </div>
</div>

        </div>
      </section>

      {/* Meet the Team */}
      <section className="py-12 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <span className="text-[#e74c3c] font-semibold">Meet the Team</span>
          <h3 className="text-black font-bold mt-2 mb-6">The Heart of Our Pharmacy</h3>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                img: '/images/team-1.jpeg',
                name: 'Dr. Siva Karan, PharmD',
                title: 'Chief Pharmacist',
                experience: '15 years',
              },
              {
                img: '/images/team-2.jpeg',
                name: 'Dr. Mayoori, MD',
                title: 'Medical Advisor',
                experience: '12 years',
              },
              {
                img: '/images/team-3.jpeg',
                name: 'Dr. Sathyan',
                title: 'Director of Health Services',
                experience: '8 years',
              },
            ].map((member, i) => (
              <div key={i} className="text-center">
                <img src={member.img} alt={member.name} className="mx-auto rounded-full w-32 h-32 object-cover mb-2" />
                <h4 className="text-black font-bold">{member.name}</h4>
                <p className="text-gray-500 text-sm">{member.title}<br />Work experience – {member.experience}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Visit Us */}
      <section className="bg-[#f5f8ff] py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <span className="text-[#e74c3c] font-semibold">Gratitude & Growth</span>
          <h3 className="text-black text-2xl font-bold mt-2 mb-4">Visit us</h3>
          <p className="text-gray-700">
            We’re honored to be your partners in health—thank you for trusting us. Together, we’ll keep building a healthier, happier community.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}

