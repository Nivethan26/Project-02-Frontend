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
            <div className="fixed inset-0 bg-blue-900/30 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
              <div className="relative bg-white/95 backdrop-blur-md border border-blue-200/50 shadow-2xl rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-2xl font-bold">Prescription Details</h3>
                      <p className="text-blue-100 mt-1">Review your prescription information</p>
                    </div>
                    <button
                      onClick={() => setShowModal(false)}
                      className="text-white/80 hover:text-white transition-colors duration-200 p-2 rounded-full hover:bg-white/10"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-8 overflow-y-auto max-h-[calc(90vh-120px)]">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column - Prescription Information */}
                    <div className="space-y-6">
                      <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-6 border border-blue-100/50">
                        <h4 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                          <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Prescription Information
                        </h4>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-700">Status:</span>
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(selectedPrescription.status)}`}>
                              {selectedPrescription.status.charAt(0).toUpperCase() + selectedPrescription.status.slice(1)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-700">Upload Date:</span>
                            <span className="text-gray-600">{formatDate(selectedPrescription.createdAt)}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-700">Duration:</span>
                            <span className="text-gray-600">{selectedPrescription.duration}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-700">Frequency:</span>
                            <span className="text-gray-600">{selectedPrescription.frequency}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-700">Payment Method:</span>
                            <span className="text-gray-600">{selectedPrescription.payment}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-700">Substitutes Allowed:</span>
                            <span className="text-gray-600">{selectedPrescription.substitutes}</span>
                          </div>
                          {selectedPrescription.notes && (
                            <div className="pt-4 border-t border-gray-200">
                              <span className="font-medium text-gray-700 block mb-2">Notes:</span>
                              <p className="text-gray-600 bg-gray-50 rounded-lg p-3 text-sm">{selectedPrescription.notes}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Patient Information */}
                      <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-200/50">
                        <h4 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                          <svg className="w-5 h-5 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          Patient Information
                        </h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">Name:</span>
                            <p className="text-gray-600">{selectedPrescription.name}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Gender:</span>
                            <p className="text-gray-600">{selectedPrescription.gender}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Phone:</span>
                            <p className="text-gray-600">{selectedPrescription.phone}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">City:</span>
                            <p className="text-gray-600">{selectedPrescription.city}</p>
                          </div>
                          <div className="col-span-2">
                            <span className="font-medium text-gray-700">Address:</span>
                            <p className="text-gray-600">{selectedPrescription.address}</p>
                          </div>
                          <div className="col-span-2">
                            <span className="font-medium text-gray-700">Allergies:</span>
                            <p className="text-gray-600">{selectedPrescription.hasAllergies === 'yes' ? selectedPrescription.allergies : 'None'}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column - Prescription Documents */}
                    <div className="space-y-6">
                      <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-6 border border-blue-100/50">
                        <h4 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                          <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Prescription Documents
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {selectedPrescription.images.map((image, index) => (
                            <div 
                              key={index} 
                              className="relative h-48 cursor-pointer group rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-300 transition-all duration-200 hover:shadow-lg"
                              onClick={() => handleImageClick(image)}
                            >
                              {isPdfFile(image) ? (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-blue-50 group-hover:to-blue-100 transition-all duration-200">
                                  <div className="text-center">
                                    <svg className="w-12 h-12 mx-auto text-gray-400 group-hover:text-blue-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                    </svg>
                                    <span className="mt-2 block text-sm text-gray-600 group-hover:text-blue-600 transition-colors duration-200">Click to view PDF</span>
                                  </div>
                                </div>
                              ) : (
                                <Image
                                  src={`http://localhost:8000${image}`}
                                  alt={`Prescription ${index + 1}`}
                                  fill
                                  className="object-cover group-hover:scale-105 transition-transform duration-200"
                                />
                              )}
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-200 flex items-center justify-center">
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                  </svg>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <p className="text-sm text-gray-500 mt-4 text-center">
                          Click on any document to view in full size
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50/80 border-t border-gray-200 px-8 py-4">
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setShowModal(false)}
                      className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200 font-medium"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Lightbox */}
          {showLightbox && selectedImage && (
            <div className="fixed inset-0 bg-blue-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowLightbox(false)}>
              <div className="relative max-w-5xl max-h-[90vh] bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-blue-200/50 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Prescription Document</h3>
                  <button
                    className="text-white/80 hover:text-white transition-colors duration-200 p-1 rounded-full hover:bg-white/10"
                    onClick={() => setShowLightbox(false)}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="p-6">
                  <Image
                    src={`http://localhost:8000${selectedImage}`}
                    alt="Prescription"
                    width={800}
                    height={600}
                    className="object-contain max-h-[70vh] w-full rounded-lg"
                  />
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
} 