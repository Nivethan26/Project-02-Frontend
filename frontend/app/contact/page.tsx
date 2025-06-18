

import Head from 'next/head';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function ContactPage() {
  return (
    <>
      <Head>
        <title>Contact Us | S.K. MEDICALS</title>
      </Head>
      <Navbar />
      <main className="bg-white px-4 py-12">
        {/* Headings */}
        <section className="max-w-4xl mx-auto text-left mb-10">
          <p className="text-gray-600 text-lg font-semibold mb-1">Get Started</p>
          <h1 className="text-4xl font-bold text-black leading-tight">
            Get in touch with us.<br />We're here to assist you.
          </h1>
        </section>

        {/* Contact Form */}
        <form className="max-w-4xl mx-auto grid gap-4 mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input type="text" placeholder="Your Name" className="border border-black placeholder-black text-black rounder px-4 py-2" />
            <input type="email" placeholder="Email Address" className="border border-black placeholder-black text-black rounder px-4 py-2" />
            <input type="tel" placeholder="Phone Number" className="border border-black placeholder-black text-black rounder px-4 py-2" />
          </div>
          <textarea placeholder="Message" className="border border-black placeholder-black text-black rounder px-4 py-2 h-24" />
          <div className="text-left">
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-full font-semibold">
              Leave us a Message
            </button>
          </div>
        </form>

        {/* Map & Address */}
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8 items-start mb-16">
          {/* Address Info */}
          <div className="md:w-1/2">
            <h2 className="text-black font-bold text-xl mb-2">SK MEDICALS</h2>
            <p className="text-gray-700">Pharmacy</p>
            <p className="text-gray-700 mb-4">Assistance Route, Someplace, City, Country</p>
          </div>

          {/* Map */}
          <div className="w-full md:w-1/2 mx-auto">
            <iframe
              src="https://www.openstreetmap.org/export/embed.html?bbox=77.5946%2C12.9716%2C77.5946%2C12.9716&amp;layer=mapnik&amp;marker=12.9716%2C77.5946"
              className="w-full h-64 rounded shadow"
              loading="lazy"
              title="SK MEDICALS Location"
            ></iframe>
          </div>
        </div>

        {/* Contact Info Section */}
        <div className="bg-gray-50 rounded-lg p-8 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div>
            <h3 className="font-bold text-xl text-black mb-2">We are always happy to assist you</h3>
          </div>
          <div>
            <h4 className="font-semibold text-black mb-1">Email Address</h4>
            <p className="text-gray-600">skmedical@info.com</p>
            <p className="text-gray-500 text-sm">Assistance hours: Monday – Friday 9 am to 6 pm EST</p>
          </div>
          <div>
            <h4 className="font-semibold text-black mb-1">Number</h4>
            <p className="text-gray-600">021 232 2600</p>
            <p className="text-gray-500 text-sm">Assistance hours: Monday – Friday 9 am to 6 pm EST</p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

