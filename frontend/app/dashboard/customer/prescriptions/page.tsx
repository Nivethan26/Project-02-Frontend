"use client";
import { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Image from 'next/image';

interface Prescription {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  duration: string;
  gender: string;
  allergies: string;
  hasAllergies: string;
  payment: string;
  substitutes: string;
  frequency: string;
  notes: string;
  images: string[];
  status: 'pending' | 'processing' | 'approved' | 'rejected';
  createdAt: string;
}

// Toast implementation
function showToast(message: string, type: 'success' | 'error' = 'error') {
  const toast = document.createElement('div');
  toast.textContent = message;
  toast.className = `fixed top-6 left-1/2 transform -translate-x-1/2 ${type === 'success' ? 'bg-green-600' : 'bg-red-600'} text-white px-6 py-3 rounded shadow-lg z-50 text-center`;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

export default function CustomerPrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showLightbox, setShowLightbox] = useState(false);
  const [notifications, setNotifications] = useState<string[]>([]);

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const userInfo = sessionStorage.getItem('user');
      if (!userInfo) {
        showToast('User information not found. Please login again.', 'error');
        return;
      }

      const user = JSON.parse(userInfo);
      const response = await fetch(`http://localhost:8000/api/prescriptions/customer/${user.email}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        let data: Prescription[] = await response.json();
        // Explicitly sort by createdAt descending (newest first)
        data = data.sort((a: Prescription, b: Prescription) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        // Check for status changes and show notifications
        if (prescriptions.length > 0) {
          data.forEach((newPrescription: Prescription) => {
            const oldPrescription = prescriptions.find((p: Prescription) => p._id === newPrescription._id);
            if (oldPrescription && oldPrescription.status !== newPrescription.status) {
              if (newPrescription.status === 'approved') {
                setNotifications(prev => [...prev, `✅ Prescription approved! You can now place your order.`]);
              } else if (newPrescription.status === 'rejected') {
                setNotifications(prev => [...prev, `❌ Prescription rejected. Check details for more information.`]);
              } else if (newPrescription.status === 'processing') {
                setNotifications(prev => [...prev, `⏳ Prescription is now being processed.`]);
              }
            }
          });
        }
        setPrescriptions(data);
      } else {
        showToast('Failed to fetch prescriptions', 'error');
      }
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      showToast('Error fetching prescriptions', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleViewPrescription = (prescription: Prescription) => {
    setSelectedPrescription(prescription);
    setShowModal(true);
  };

  const handleImageClick = (image: string) => {
    if (isPdfFile(image)) {
      window.open(`http://localhost:8000${image}`, '_blank');
    } else {
      setSelectedImage(image);
      setShowLightbox(true);
    }
  };

  const isPdfFile = (filename: string) => {
    return filename.toLowerCase().endsWith('.pdf');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <ProtectedRoute role="customer">
        <div className="flex min-h-screen bg-gray-50">
          <Sidebar role="customer" />
          <main className="flex-1 ml-64 p-8">
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute role="customer">
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar role="customer" />
        <main className="flex-1 ml-64 p-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">My Prescriptions</h1>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Upload Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Duration
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {prescriptions.map((prescription) => (
                      <tr key={prescription._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(prescription.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {prescription.duration}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(prescription.status)}`}>
                            {prescription.status.charAt(0).toUpperCase() + prescription.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleViewPrescription(prescription)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Prescription View Modal */}
          {showModal && selectedPrescription && (
            <div className="fixed inset-0 flex items-center justify-center z-50 bg-blue-900/40 backdrop-blur-sm">
              <div className="relative w-full max-w-3xl mx-auto p-0 rounded-2xl shadow-2xl border border-blue-200 bg-white/70 backdrop-blur-lg animate-fadeIn overflow-hidden">
                {/* Gradient Header */}
                <div className="flex items-center gap-3 px-8 py-5 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400">
                  <div className="bg-white/30 rounded-full p-2 shadow-md">
                    <svg className="w-8 h-8 text-blue-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2a4 4 0 014-4h2a4 4 0 014 4v2M9 17H7a4 4 0 01-4-4V7a4 4 0 014-4h10a4 4 0 014 4v6a4 4 0 01-4 4h-2M9 17v2a2 2 0 002 2h2a2 2 0 002-2v-2" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white tracking-wide flex-1">Prescription Details</h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-white hover:bg-white/20 rounded-full p-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300"
                    title="Close"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Info Section */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow ${getStatusColor(selectedPrescription.status)}`}> 
                        {selectedPrescription.status === 'approved' && <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                        {selectedPrescription.status === 'rejected' && <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>}
                        {selectedPrescription.status === 'processing' && <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3" /></svg>}
                        {selectedPrescription.status.charAt(0).toUpperCase() + selectedPrescription.status.slice(1)}
                      </span>
                      <span className="ml-2 text-xs text-gray-500">{formatDate(selectedPrescription.createdAt)}</span>
                    </div>
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="block w-1.5 h-6 bg-blue-500 rounded-full"></span>
                        <h4 className="font-semibold text-blue-700 text-lg">Prescription Information</h4>
                      </div>
                      <div className="space-y-2 text-gray-700">
                        <p><span className="font-medium">Duration:</span> {selectedPrescription.duration}</p>
                        <p><span className="font-medium">Frequency:</span> {selectedPrescription.frequency}</p>
                        <p><span className="font-medium">Payment Method:</span> {selectedPrescription.payment}</p>
                        <p><span className="font-medium">Substitutes Allowed:</span> {selectedPrescription.substitutes}</p>
                        {selectedPrescription.notes && (
                          <p><span className="font-medium">Notes:</span> {selectedPrescription.notes}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* Documents Section */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="block w-1.5 h-6 bg-blue-500 rounded-full"></span>
                      <h4 className="font-semibold text-blue-700 text-lg">Prescription Documents</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {selectedPrescription.images.map((image, index) => (
                        <div 
                          key={index} 
                          className="relative h-40 rounded-xl overflow-hidden cursor-pointer group shadow-lg hover:shadow-2xl transition-shadow duration-200 bg-white/60 hover:bg-blue-100/60"
                          onClick={() => handleImageClick(image)}
                        >
                          {isPdfFile(image) ? (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-blue-50 rounded-xl group-hover:bg-blue-100 transition-colors">
                              <svg className="w-12 h-12 text-blue-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              </svg>
                              <span className="text-xs text-blue-700 font-medium">Click to view PDF</span>
                            </div>
                          ) : (
                            <img
                              src={`http://localhost:8000${image}`}
                              alt={`Prescription ${index + 1}`}
                              className="object-contain w-full h-full scale-100 group-hover:scale-105 transition-transform duration-200"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Lightbox */}
          {showLightbox && selectedImage && (
            <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center" onClick={() => setShowLightbox(false)}>
              <div className="relative max-w-4xl max-h-[90vh]">
                <Image
                  src={`http://localhost:8000${selectedImage}`}
                  alt="Prescription"
                  width={800}
                  height={600}
                  className="object-contain"
                />
                <button
                  className="absolute top-4 right-4 text-white text-2xl hover:text-gray-300"
                  onClick={() => setShowLightbox(false)}
                >
                  ✕
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
} 