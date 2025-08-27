'use client';

import type React from "react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Mail, Phone, Clock, CheckCircle, AlertCircle, Send, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");
    setError("");

    try {
      const res = await fetch('http://localhost:8000/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setSuccess("Your message has been sent! Thank you.");
        setForm({ name: "", email: "", phone: "", message: "" });
      } else {
        const data = await res.json();
        setError(data.message || "Failed to send message.");
      }
    } catch {
      setError("Failed to send message.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <Navbar />
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="pt-20 pb-12 px-4"
      >
        <div className="max-w-6xl mx-auto text-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-blue-600 text-lg font-semibold mb-4"
          >
            Get Started
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6"
          >
            Get in touch with us.
            <br />
            <span className="text-blue-600">We&apos;re here to assist you.</span>
          </motion.h1>
        </div>
      </motion.section>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 pb-20">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="shadow-2xl border-0 bg-white/60 backdrop-blur-lg rounded-2xl p-10 relative overflow-hidden">
              <div className="absolute left-0 top-0 h-full w-2 bg-gradient-to-b from-blue-500 to-purple-500 rounded-l-2xl" />
              <CardContent className="p-0">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a message</h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <motion.div whileFocus={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
                      <Input
                        type="text"
                        name="name"
                        placeholder="Your Name"
                        value={form.name}
                        onChange={handleChange}
                        required
                        className="w-full h-12 border-0 bg-white/70 rounded-xl px-4 shadow focus:ring-2 focus:ring-blue-400 focus:bg-white transition"
                      />
                    </motion.div>
                    <motion.div whileFocus={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
                      <Input
                        type="email"
                        name="email"
                        placeholder="Email Address"
                        value={form.email}
                        onChange={handleChange}
                        required
                        className="w-full h-12 border-0 bg-white/70 rounded-xl px-4 shadow focus:ring-2 focus:ring-blue-400 focus:bg-white transition"
                      />
                    </motion.div>
                  </div>

                  <motion.div whileFocus={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
                    <div className="flex items-center h-12 bg-white/70 rounded-xl shadow focus-within:ring-2 focus-within:ring-blue-400 transition overflow-hidden">
                      <span className="px-3 text-blue-600 font-semibold bg-blue-50 h-full flex items-center border-r border-blue-100">+94</span>
                      <input
                        type="tel"
                        name="phone"
                        placeholder="Phone Number"
                        value={form.phone}
                        onChange={e => setForm({ ...form, phone: e.target.value.replace(/[^0-9]/g, '').slice(0,9) })}
                        className="flex-1 h-full border-none outline-none bg-transparent px-2 text-gray-900"
                        maxLength={9}
                        pattern="[0-9]{9}"
                        required
                        autoComplete="tel"
                      />
                    </div>
                  </motion.div>

                  <motion.div className="md:col-span-2" whileFocus={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
                    <Textarea
                      name="message"
                      placeholder="Your Message"
                      value={form.message}
                      onChange={handleChange}
                      required
                      rows={5}
                      className="w-full border-0 bg-white/70 rounded-xl px-4 py-2 text-gray-900 shadow focus:ring-2 focus:ring-blue-400 focus:bg-white transition resize-none"
                    />
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-500 hover:from-blue-700 hover:to-purple-600 text-white font-bold rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        />
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          Leave us a Message
                        </>
                      )}
                    </Button>
                  </motion.div>

                  <AnimatePresence>
                    {success && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg"
                      >
                        <CheckCircle className="w-5 h-5" />
                        {success}
                      </motion.div>
                    )}
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg"
                      >
                        <AlertCircle className="w-5 h-5" />
                        {error}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-8"
          >
            {/* Company Info */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">SK MEDICALS</h3>
                    <p className="text-gray-600 mb-1">Pharmacy</p>
                    <p className="text-gray-600">Junction, Semnthankulam Road, Ilavalai, Jaffna 40000</p>
                  </div>
                </div>

                {/* Map */}
                <div className="w-full h-64 rounded-lg overflow-hidden shadow-lg">
                  <iframe
                    src="https://www.openstreetmap.org/export/embed.html?bbox=79.9632%2C9.7921%2C79.9632%2C9.7921&amp;layer=mapnik&amp;marker=9.7921%2C79.9632"
                    className="w-full h-full"
                    loading="lazy"
                    title="SK MEDICALS Location"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Contact Details */}
            <div className="grid gap-4">
              <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Mail className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">Email Address</h4>
                      <a href="mailto:skmedical@info.com" className="text-blue-600 font-medium hover:underline block">
                        skmedical@info.com
                      </a>
                      <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                        <Clock className="w-4 h-4" />
                        We respond within 24 hours
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Phone className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Phone Number</h4>
                        <p className="text-blue-600 font-medium">076 963 2748</p>
                        <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                          <Clock className="w-4 h-4" />
                          Monday – Friday 7.30 am to 9.30 pm 
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="mt-14 flex justify-center"
        >
          <div className="relative w-full max-w-5xl">
            {/* Floating Icon */}
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-10">
              <div className="bg-blue-100 border-4 border-white rounded-full p-5 shadow-lg flex items-center justify-center">
                <Users className="w-12 h-12 text-blue-600" />
              </div>
            </div>
            {/* Card */}
            <div className="bg-white rounded-2xl border-2 border-blue-400 shadow-xl pt-16 pb-10 px-6 md:px-16 text-center">
              <h3 className="text-4xl md:text-5xl font-bold mb-4 text-blue-600 drop-shadow-sm">
                We are always happy to assist you
              </h3>
              <p className="text-lg md:text-xl text-blue-500 font-medium">
                Get in touch with us for any questions about our pharmacy services, prescriptions, or health consultations.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}