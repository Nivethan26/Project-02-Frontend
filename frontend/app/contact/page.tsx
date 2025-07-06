'use client';

import React, { useState } from 'react';
import Head from 'next/head';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function ContactPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');
    try {
      const res = await fetch('http://localhost:8000/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSuccess('Your message has been sent! Thank you.');
        setForm({ name: '', email: '', phone: '', message: '' });
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to send message.');
      }
    } catch {
      setError('Failed to send message.');
    }
    setLoading(false);
  };

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
            Get in touch with us.<br />We&apos;re here to assist you.
          </h1>
        </section>

        {/* Contact Form */}
        <form className="max-w-4xl mx-auto grid gap-4 mb-12" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              value={form.name}
              onChange={handleChange}
              required
              className="border border-black placeholder-black text-black rounded px-4 py-2"
            />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={form.email}
              onChange={handleChange}
              required
              className="border border-black placeholder-black text-black rounded px-4 py-2"
            />
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={form.phone}
              onChange={handleChange}
              className="border border-black placeholder-black text-black rounded px-4 py-2"
            />
          </div>
          <textarea
            name="message"
            placeholder="Message"
            value={form.message}
            onChange={handleChange}
            required
            className="border border-black placeholder-black text-black rounded px-4 py-2 h-24"
          />
          <div className="text-left">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-full font-semibold"
            >
              {loading ? 'Sending...' : 'Leave us a Message'}
            </button>
          </div>
          {success && <div className="text-green-600">{success}</div>}
          {error && <div className="text-red-600">{error}</div>}
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