/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { useRef, useState, useEffect } from "react";
import type React from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Loader from '@/components/Loader';

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
    duration: "",
    payment: "",
    gender: "",
    hasAllergies: "",
    allergies: "",
    substitutes: "",
    notes: "",
    agree: false,
  });
  const [userDetails, setUserDetails] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    address: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
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
    const token = sessionStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    const fetchProfile = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/auth/profile", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) {
          router.push("/login");
          return;
        }
        const data = await res.json();
        if (data.role && data.role !== "customer") {
          router.push("/dashboard");
          return;
        }
        setUserDetails({
          name: (data.firstName ? data.firstName + ' ' : '') + (data.lastName || ''),
          email: data.email || "",
          phone: data.phone || "",
          city: data.city || "",
          address: data.address || "",
        });
        setLoading(false);
      } catch {
        router.push("/login");
      }
    };
    fetchProfile();
  }, [router]);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    const filteredFiles = droppedFiles.filter(
      (file) => file.type.startsWith("image/") || file.type === "application/pdf",
    );
    if (files.length + filteredFiles.length <= 5) {
      setFiles([...files, ...filteredFiles]);
    } else {
      alert("You can upload a maximum of 5 files.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const filteredFiles = selectedFiles.filter(
      (file) => file.type.startsWith("image/") || file.type === "application/pdf",
    );
    if (files.length + filteredFiles.length <= 5) {
      setFiles([...files, ...filteredFiles]);
    } else {
      alert("You can upload a maximum of 5 files.");
    }
  };

  const handleRemoveFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setForm((prevForm) => ({
        ...prevForm,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setForm((prevForm) => ({
        ...prevForm,
        [name]: value,
    }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Require at least one prescription image
    if (files.length === 0) {
      showToast('Please upload at least one prescription image.', 'error');
      return;
    }

    // Validation for required fields (personal info is now fetched, not input)
    if (!userDetails.name.trim()) {
      showToast('Your Name is required.', 'error');
      return;
    }
    if (!userDetails.email.trim()) {
      showToast('Email Address is required.', 'error');
      return;
    }
    if (!userDetails.phone.trim()) {
      showToast('Phone Number is required.', 'error');
      return;
    }
    if (!userDetails.city.trim()) {
      showToast('City is required.', 'error');
      return;
    }
    if (!userDetails.address.trim()) {
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
    
    if (!form.agree) {
      showToast('You must agree to the delivery terms.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      // Create FormData object to handle file uploads
      const formData = new FormData();
      
      // Append prescription-specific fields only
      Object.entries(form).forEach(([key, value]) => {
        formData.append(key, value.toString());
      });
      // Append user details (from session)
      formData.append('name', userDetails.name);
      formData.append('email', userDetails.email);
      formData.append('phone', userDetails.phone);
      formData.append('city', userDetails.city);
      formData.append('address', userDetails.address);
      // Append prescription files
      files.forEach((file) => {
        formData.append('prescription', file);
      });
      // Automatically include customerId from sessionStorage
      const user = sessionStorage.getItem('user');
      if (user) {
        try {
          const userData = JSON.parse(user);
          if (userData._id) {
            formData.append('customerId', userData._id);
          }
        } catch {}
      }

      // Send the request directly to the backend
      const response = await fetch('http://localhost:8000/api/prescriptions', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload prescription');
      }

      const data = await response.json();
      showToast('Prescription submitted successfully!', 'success');
      
      // Reset only prescription-specific fields
      setForm({
        duration: "",
        payment: "",
        gender: "",
        hasAllergies: "",
        allergies: "",
        substitutes: "",
        notes: "",
        agree: false,
      });
      setFiles([]);
    } catch (error) {
      console.error('Error uploading prescription:', error);
      showToast('Failed to upload prescription. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loader />;
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
            <div className="mb-8">
              <button
                type="button"
                onClick={() => router.push('/dashboard/customer/prescriptions')}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-lg font-bold text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all duration-300 transform hover:scale-105"
              >
                Manage Prescriptions
              </button>
            </div>
            <button className="w-full text-blue-600 bg-blue-100 hover:bg-blue-200 py-2 rounded-lg font-semibold mb-4 transition-colors duration-300">
              How it works?
            </button>
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
              className="border-2 border-dashed border-blue-200 hover:border-blue-300 rounded-xl p-8 flex flex-col items-center justify-center mb-8 bg-gradient-to-br from-blue-50 to-indigo-50 relative transition-all duration-300 hover:shadow-md"
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
              <div className="flex flex-col items-center cursor-pointer group" onClick={() => fileInputRef.current?.click()}>
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors duration-300">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                </div>
                <span className="font-semibold text-gray-800 text-lg mb-1">Drag & Drop Files Here</span>
                <span className="text-blue-600 text-sm font-medium">or Browse Files</span>
              </div>

              {files.length > 0 && (
                <div className="mt-6 w-full">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Uploaded Files:</h4>
                  <div className="flex flex-wrap gap-2">
                  {files.map((file, idx) => (
                      <div
                        key={idx}
                        className="flex items-center bg-white border border-blue-200 px-3 py-2 rounded-lg text-sm shadow-sm"
                      >
                        <svg className="w-4 h-4 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        <span className="mr-2 text-gray-700 max-w-[150px] truncate">{file.name}</span>
                        <button
                          type="button"
                          className="text-red-500 hover:text-red-700 ml-1 p-1 rounded-full hover:bg-red-50 transition-colors duration-200"
                          onClick={() => handleRemoveFile(idx)}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                      </button>
                    </div>
                  ))}
                  </div>
                </div>
              )}

              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500 mb-1">
                  You can upload up to 5 pictures. Supported formats: JPG, PNG, PDF
                </p>
                <p className="text-xs text-amber-600 font-medium">
                  Please upload clear images of the whole prescription. Partial images will not be processed.
                </p>
              </div>
            </div>
            {/* Form */}
            <form onSubmit={handleSubmit} className="px-6 pb-6">
              <div className="space-y-6">
                {/* Personal Information Section */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    Personal Information
                  </h3>
                  

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Your Name
                      </label>
                      <input
                        name="name"
                        value={userDetails.name}
                        readOnly
                        className="w-full border border-gray-200 rounded-lg px-4 py-3 bg-gray-100 text-gray-800 cursor-not-allowed"
                        tabIndex={-1}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        name="email"
                        type="email"
                        value={userDetails.email}
                        readOnly
                        className="w-full border border-gray-200 rounded-lg px-4 py-3 bg-gray-100 text-gray-800 cursor-not-allowed"
                        tabIndex={-1}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        name="phone"
                        value={userDetails.phone}
                        readOnly
                        className="w-full border border-gray-200 rounded-lg px-4 py-3 bg-gray-100 text-gray-800 cursor-not-allowed"
                        tabIndex={-1}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        City
                      </label>
                      <input
                        name="city"
                        value={userDetails.city}
                        readOnly
                        className="w-full border border-gray-200 rounded-lg px-4 py-3 bg-gray-100 text-gray-800 cursor-not-allowed"
                        tabIndex={-1}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Address
                      </label>
                      <input
                        name="address"
                        value={userDetails.address}
                        readOnly
                        className="w-full border border-gray-200 rounded-lg px-4 py-3 bg-gray-100 text-gray-800 cursor-not-allowed"
                        tabIndex={-1}
                      />
                    </div>
                  </div>
                </div>

                {/* Medical Information Section */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Medical Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Duration<span className="text-red-500 ml-1">*</span>
                      </label>
                      <select
                        name="duration"
                        value={form.duration}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-gray-800"
                      >
                        <option value="">Please select duration</option>
                    <option value="1 week">1 week</option>
                    <option value="2 weeks">2 weeks</option>
                    <option value="1 month">1 month</option>
                    <option value="3 months">3 months</option>
                    <option value="6 months">6 months</option>
                    <option value="other">Other</option>
                  </select>
                  {form.duration === "other" && (
                        <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                          <p className="text-amber-800 text-sm font-medium">
                            Please mention in the notes section how many days you need the medicine.
                          </p>
                        </div>
                  )}
                </div>

                <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Payment Method<span className="text-red-500 ml-1">*</span>
                      </label>
                      <select
                        name="payment"
                        value={form.payment}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-gray-800"
                      >
                        <option value="">Please select payment method</option>
                    <option value="card_payment">Card</option>
                  </select>
                </div>

                <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Gender<span className="text-red-500 ml-1">*</span>
                      </label>
                      <div className="flex gap-6">
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name="gender"
                            value="male"
                            checked={form.gender === "male"}
                            onChange={handleChange}
                            required
                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-gray-700 font-medium">Male</span>
                        </label>
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name="gender"
                            value="female"
                            checked={form.gender === "female"}
                            onChange={handleChange}
                            required
                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-gray-700 font-medium">Female</span>
                        </label>
                  </div>
                </div>

                <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Medicine allergies?<span className="text-red-500 ml-1">*</span>
                      </label>
                      <div className="flex gap-6 mb-3">
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name="hasAllergies"
                            value="yes"
                            checked={form.hasAllergies === "yes"}
                            onChange={handleChange}
                            required
                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-gray-700 font-medium">Yes</span>
                        </label>
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name="hasAllergies"
                            value="no"
                            checked={form.hasAllergies === "no"}
                            onChange={handleChange}
                            required
                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-gray-700 font-medium">No</span>
                        </label>
                  </div>
                  {form.hasAllergies === "yes" && (
                        <input
                          name="allergies"
                          value={form.allergies}
                          onChange={handleChange}
                          placeholder="Please describe your allergies in detail"
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-gray-800"
                        />
                  )}
                </div>

                <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Ok to receive substitutes?<span className="text-red-500 ml-1">*</span>
                      </label>
                      <div className="flex gap-6">
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name="substitutes"
                            value="yes"
                            checked={form.substitutes === "yes"}
                            onChange={handleChange}
                            required
                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-gray-700 font-medium">Yes</span>
                        </label>
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name="substitutes"
                            value="no"
                            checked={form.substitutes === "no"}
                            onChange={handleChange}
                            required
                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-gray-700 font-medium">No</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Information Section */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <svg className="w-5 h-5 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    Additional Information
                  </h3>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Special Notes</label>
                    <textarea
                      name="notes"
                      value={form.notes}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-gray-800 resize-none"
                      rows={4}
                      placeholder="Please mention any specific instructions, preferred brands, or additional information..."
                    />
                  </div>
                </div>

                {/* Agreement Section */}
                <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      name="agree"
                      checked={form.agree}
                      onChange={handleChange}
                      required
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-0.5 mr-3"
                    />
                    <div>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        <span className="font-semibold">Terms & Conditions:</span> I have no obligation for getting my
                        medicines delivered by S K Medicals team on behalf of me. I understand that this is a prescription
                        delivery service and I agree to the terms of service.
                      </p>
              </div>
              </div>
              </div>

                {/* Submit Button */}
              <button
                type="submit"
                  className="w-full flex justify-center items-center py-4 px-6 border border-transparent rounded-xl shadow-lg text-lg font-bold text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none transform hover:scale-[1.02]"
                disabled={submitting}
              >
                  {submitting ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Submitting Prescription...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                        />
                      </svg>
                      Submit Prescription
                    </>
                  )}
              </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
