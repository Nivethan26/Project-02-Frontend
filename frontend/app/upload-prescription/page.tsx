"use client";
import { useRef, useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useRouter } from "next/navigation";
import Image from "next/image";

// Toast implementation with color
function showToast(message: string, type: 'success' | 'error' = 'error') {
  const toast = document.createElement('div');
  toast.textContent = message;
  toast.className = `fixed top-6 left-1/2 transform -translate-x-1/2 ${type === 'success' ? 'bg-green-600' : 'bg-red-600'} text-white px-6 py-3 rounded shadow-lg z-50 text-center`;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

export default function UploadPrescriptionPage() {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    duration: "",
    gender: "",
    allergies: "",
    hasAllergies: "",
    payment: "",
    substitutes: "",
    frequency: "",
    notes: "",
    agree: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const slides = [
    {
      image: "/images/mobile.png",
      heading: "Healthcare at Your Fingertips",
      description: (
        <>
          Order. Relax. Receive!<br />
          Your health essentials, just a click away!
        </>
      ),
    },
    {
      image: "/images/pills.png",
      heading: "Prescription Delivery Made Simple",
      description: (
        <>
          Upload. Confirm. Delivered.<br />
          Managing prescriptions has never been easier.
        </>
      ),
    },
    {
      image: "/images/package.png",
      heading: "Fast, Reliable Prescription Delivery",
      description: (
        <>
          Experience seamless prescription delivery<br />
          that prioritizes your privacy and convenience.
        </>
      ),
    },
  ];

  const [current, setCurrent] = useState(0);

  // Auto-advance slider
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 3000);
    return () => clearInterval(interval);
  }, [slides.length]);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      router.push("/login");
      return;
    }
    try {
      const userData = JSON.parse(user);
      if (userData.role !== "customer") {
        router.push("/dashboard");
        return;
      }
      setIsLoading(false);
    } catch {
      router.push("/login");
    }
  }, [router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).slice(0, 5 - files.length);
      setFiles((prev) => [...prev, ...newFiles].slice(0, 5));
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const newFiles = Array.from(e.dataTransfer.files).slice(0, 5 - files.length);
    setFiles((prev) => [...prev, ...newFiles].slice(0, 5));
  };

  const handleRemoveFile = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let fieldValue: string | boolean = value;
    if (type === "checkbox") {
      fieldValue = (e.target as HTMLInputElement).checked;
    }
    setForm((prev) => ({
      ...prev,
      [name]: fieldValue,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Require at least one prescription image
    if (files.length === 0) {
      showToast('Please upload at least one prescription image.', 'error');
      return;
    }

    // Validation for required fields
    if (!form.name.trim()) {
      showToast('Your Name is required.', 'error');
      return;
    }
    if (!form.email.trim()) {
      showToast('Email Address is required.', 'error');
      return;
    }
    if (!form.phone.trim()) {
      showToast('Phone Number is required.', 'error');
      return;
    }
    if (!form.city.trim()) {
      showToast('City is required.', 'error');
      return;
    }
    if (!form.address.trim()) {
      showToast('Address is required.', 'error');
      return;
    }
    if (!form.duration.trim()) {
      showToast('Duration is required.', 'error');
      return;
    }
    if (!form.payment.trim()) {
      showToast('Payment Method is required.', 'error');
      return;
    }
    if (!form.gender.trim()) {
      showToast('Gender is required.', 'error');
      return;
    }
    if (!form.hasAllergies.trim()) {
      showToast('Please select if you have medicine allergies.', 'error');
      return;
    }
    if (form.hasAllergies === 'yes' && !form.allergies.trim()) {
      showToast('Please describe your allergies.', 'error');
      return;
    }
    if (!form.substitutes.trim()) {
      showToast('Please select if you are ok to receive substitutes.', 'error');
      return;
    }
    if (!form.frequency.trim()) {
      showToast('Please select the frequency.', 'error');
      return;
    }
    if (!form.agree) {
      showToast('You must agree to the delivery terms.', 'error');
      return;
    }

    setSubmitting(true);
    // TODO: Implement actual upload logic
    setTimeout(() => {
      setSubmitting(false);
      showToast('Prescription submitted successfully!', 'success');
      setForm({
        name: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        duration: "",
        gender: "",
        allergies: "",
        hasAllergies: "",
        payment: "",
        substitutes: "",
        frequency: "",
        notes: "",
        agree: false,
      });
      setFiles([]);
    }, 1500);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white py-8 px-2 md:px-0">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-8 bg-white rounded-lg">
          {/* Left Column */}
          <div className="flex flex-col justify-start p-4 md:col-span-2">
            <h2 className="text-2xl font-bold mb-2 text-blue-700">Refill in Minutes, Not Hours.</h2>
            <div className="mb-6">
              <span
                className="block text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-blue-500 via-teal-400 to-blue-700 bg-clip-text text-transparent tracking-tight text-center md:text-left drop-shadow-sm"
                style={{ fontFamily: 'Poppins, Inter, Arial, sans-serif' }}
              >
                Upload Your Prescription and Get a <span className="underline decoration-wavy decoration-2 underline-offset-4">Free Price Quote Instantly!</span>
              </span>
            </div>
            <div className="relative mb-6">
              <div className="bg-white rounded-lg shadow flex items-center justify-center min-h-[220px]">
                <div className="flex flex-col md:flex-row items-center w-full justify-center gap-6 min-h-[180px]">
                  <Image
                    src={slides[current].image}
                    alt={slides[current].heading}
                    width={140}
                    height={140}
                    className="object-contain w-[140px] h-[140px]"
                    priority
                  />
                  <div className="text-center md:text-left flex flex-col justify-center min-h-[180px]">
                    <h3 className="text-2xl font-bold text-blue-900 mb-2">{slides[current].heading}</h3>
                    <div className="text-base text-gray-700">{slides[current].description}</div>
                  </div>
                </div>
              </div>
              <div className="flex justify-center mt-2 gap-2">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrent(idx)}
                    className={`w-3 h-3 rounded-full ${current === idx ? "bg-blue-600" : "bg-gray-300"}`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
            <button className="w-full bg-teal-500 text-white py-2 rounded font-semibold mb-2">MANAGE PRESCRIPTIONS</button>
            <button className="w-full border border-gray-400 py-2 rounded font-semibold mb-4">How it works?</button>
            <ul className="list-disc pl-5 space-y-1 text-sm mb-4">
              <li>You can upload up to 5 photos.</li>
              <li>Please upload a full clear photo of your prescription.</li>
              <li>If you have specific instructions or specific/preferable brands please mention in the &#39;Notes&#39; section.</li>
              <li>Please double check your mobile number before submitting the prescription. One of our pharmacists will contact you to confirm your order.</li>
              <li>Your prescription must be a valid prescription from a registered medical practitioner.</li>
            </ul>
          </div>
          {/* Right Column */}
          <div className="bg-gray-100 rounded-lg p-0 md:col-span-3">
            {/* Drag & Drop File Upload */}
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center mb-6 bg-white relative"
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
            >
              <input
                type="file"
                multiple
                accept="image/*,application/pdf"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
                disabled={files.length >= 5}
              />
              <div
                className="flex flex-col items-center cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <span className="text-5xl text-blue-400 mb-2">⬆️</span>
                <span className="font-semibold text-gray-700 text-lg">Drag & Drop Files Here</span>
                <span className="text-gray-500 text-sm">or Browse Files</span>
              </div>
              {files.length > 0 && (
                <div className="mt-4 w-full flex flex-wrap gap-2">
                  {files.map((file, idx) => (
                    <div key={idx} className="flex items-center bg-blue-50 px-2 py-1 rounded text-sm">
                      <span className="mr-2">{file.name}</span>
                      <button type="button" className="text-red-500 ml-1" onClick={() => handleRemoveFile(idx)}>
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <span className="text-xs text-gray-400 mt-2 text-center w-full">
                You can upload up to 5 pictures. Please upload clear images of the whole prescription. Partial Prescription images will not be processed.
              </span>
            </div>
            {/* Form */}
            <form onSubmit={handleSubmit} className="px-4 pb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Your Name<span className="text-red-600">*</span></label>
                  <input name="name" value={form.name} onChange={handleChange} required className="w-full border rounded px-3 py-2 bg-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email Address<span className="text-red-600">*</span></label>
                  <input name="email" type="email" value={form.email} onChange={handleChange} required className="w-full border rounded px-3 py-2 bg-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone Number<span className="text-red-600">*</span></label>
                  <input name="phone" value={form.phone} onChange={handleChange} required className="w-full border rounded px-3 py-2 bg-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">City<span className="text-red-600">*</span></label>
                  <input name="city" value={form.city} onChange={handleChange} required className="w-full border rounded px-3 py-2 bg-white" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Address<span className="text-red-600">*</span></label>
                  <input name="address" value={form.address} onChange={handleChange} required className="w-full border rounded px-3 py-2 bg-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Duration<span className="text-red-600">*</span></label>
                  <select name="duration" value={form.duration} onChange={handleChange} required className="w-full border rounded px-3 py-2 bg-white">
                    <option value="">Please select</option>
                    <option value="1 week">1 week</option>
                    <option value="2 weeks">2 weeks</option>
                    <option value="1 month">1 month</option>
                    <option value="3 months">3 months</option>
                    <option value="6 months">6 months</option>
                    <option value="other">Other</option>
                  </select>
                  {form.duration === "other" && (
                    <div className="text-red-600 text-xs font-semibold mt-1">**Please mention in the note how many days you need the medicine.**</div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Payment Method<span className="text-red-600">*</span></label>
                  <select name="payment" value={form.payment} onChange={handleChange} required className="w-full border rounded px-3 py-2 bg-white">
                    <option value="">Please select</option>
                    <option value="card">Card</option>
                    <option value="online">Online</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Gender<span className="text-red-600">*</span></label>
                  <div className="flex gap-4 mt-1">
                    <label><input type="radio" name="gender" value="male" checked={form.gender === "male"} onChange={handleChange} required /> Male</label>
                    <label><input type="radio" name="gender" value="female" checked={form.gender === "female"} onChange={handleChange} required /> Female</label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Medicine allergies?<span className="text-red-600">*</span></label>
                  <div className="flex gap-4 mt-1">
                    <label><input type="radio" name="hasAllergies" value="yes" checked={form.hasAllergies === "yes"} onChange={handleChange} required /> Yes</label>
                    <label><input type="radio" name="hasAllergies" value="no" checked={form.hasAllergies === "no"} onChange={handleChange} required /> No</label>
                  </div>
                  {form.hasAllergies === "yes" && (
                    <input name="allergies" value={form.allergies} onChange={handleChange} placeholder="Describe allergies" className="w-full border rounded px-3 py-2 bg-white mt-2" />
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Ok to receive substitutes?<span className="text-red-600">*</span></label>
                  <div className="flex gap-4 mt-1">
                    <label><input type="radio" name="substitutes" value="yes" checked={form.substitutes === "yes"} onChange={handleChange} required /> Yes</label>
                    <label><input type="radio" name="substitutes" value="no" checked={form.substitutes === "no"} onChange={handleChange} required /> No</label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Frequency<span className="text-red-600">*</span></label>
                  <div className="flex gap-4 mt-1">
                    <label><input type="radio" name="frequency" value="one" checked={form.frequency === "one"} onChange={handleChange} required /> One Time</label>
                    <label><input type="radio" name="frequency" value="ongoing" checked={form.frequency === "ongoing"} onChange={handleChange} required /> On Going</label>
                  </div>
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Special Notes</label>
                <textarea name="notes" value={form.notes} onChange={handleChange} className="w-full border rounded px-3 py-2 bg-white" rows={3} />
              </div>
              <div className="flex items-center mb-4">
                <input type="checkbox" name="agree" checked={form.agree} onChange={handleChange} required className="mr-2" />
                <span className="text-sm">I have no obligation for getting my medicines delivered by S K Medicals team on behalf of me.</span>
              </div>
              <button
                type="submit"
                className="w-full bg-teal-500 text-white py-2 rounded font-semibold hover:bg-teal-600 transition"
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "SUBMIT"}
              </button>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
