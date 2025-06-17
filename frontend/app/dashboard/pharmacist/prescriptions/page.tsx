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
  createdAt: string;
  status: 'pending' | 'processing' | 'approved' | 'rejected';
  verified?: boolean;
  verificationStatus?: 'pending' | 'processing' | 'verified';
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

export default function PrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showLightbox, setShowLightbox] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/prescriptions');
      if (!response.ok) throw new Error('Failed to fetch prescriptions');
      const data = await response.json();
      setPrescriptions(data);
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
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

  const handleVerify = async (id: string) => {
    try {
      setIsVerifying(true);
      const response = await fetch(`http://localhost:8000/api/prescriptions/${id}/verify`, {
        method: 'PUT',
      });
      if (!response.ok) throw new Error('Failed to verify prescription');
      await fetchPrescriptions();
      setShowModal(false);
    } catch (error) {
      console.error('Error verifying prescription:', error);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:8000/api/prescriptions/${id}/approve`, {
        method: 'PUT',
      });
      if (!response.ok) throw new Error('Failed to approve prescription');
      await fetchPrescriptions();
      setShowModal(false);
    } catch (error) {
      console.error('Error approving prescription:', error);
    }
  };

  const handleReject = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:8000/api/prescriptions/${id}/reject`, {
        method: 'PUT',
      });
      if (!response.ok) throw new Error('Failed to reject prescription');
      await fetchPrescriptions();
      setShowModal(false);
    } catch (error) {
      console.error('Error rejecting prescription:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this prescription?')) {
      return;
    }

    try {
      setIsDeleting(true);
      const response = await fetch(`http://localhost:8000/api/prescriptions/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete prescription');
      }

      await fetchPrescriptions();
      setShowModal(false);
      showToast('Prescription deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting prescription:', error);
      showToast('Failed to delete prescription', 'error');
    } finally {
      setIsDeleting(false);
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

  if (loading) {
    return (
      <ProtectedRoute role="pharmacist">
        <div className="flex min-h-screen bg-gray-50">
          <Sidebar role="pharmacist" />
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
    <ProtectedRoute role="pharmacist">
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar role="pharmacist" />
        <main className="flex-1 ml-64 p-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Prescriptions</h1>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Patient Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
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
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{prescription.name}</div>
                          <div className="text-sm text-gray-500">{prescription.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{prescription.phone}</div>
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
                            className="text-blue-600 hover:text-blue-900 mr-4"
                          >
                            View
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
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
              <div className="relative top-20 mx-auto p-5 border w-4/5 shadow-lg rounded-md bg-white">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Prescription Details</h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    ✕
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Patient Information</h4>
                    <div className="space-y-2">
                      <p><span className="font-medium">Name:</span> {selectedPrescription.name}</p>
                      <p><span className="font-medium">Email:</span> {selectedPrescription.email}</p>
                      <p><span className="font-medium">Phone:</span> {selectedPrescription.phone}</p>
                      <p><span className="font-medium">Address:</span> {selectedPrescription.address}</p>
                      <p><span className="font-medium">City:</span> {selectedPrescription.city}</p>
                      <p><span className="font-medium">Gender:</span> {selectedPrescription.gender}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Prescription Details</h4>
                    <div className="space-y-2">
                      <p><span className="font-medium">Duration:</span> {selectedPrescription.duration}</p>
                      <p><span className="font-medium">Frequency:</span> {selectedPrescription.frequency}</p>
                      <p><span className="font-medium">Payment Method:</span> {selectedPrescription.payment}</p>
                      <p><span className="font-medium">Allergies:</span> {selectedPrescription.hasAllergies === 'yes' ? selectedPrescription.allergies : 'None'}</p>
                      <p><span className="font-medium">Substitutes Allowed:</span> {selectedPrescription.substitutes}</p>
                      {selectedPrescription.notes && (
                        <p><span className="font-medium">Notes:</span> {selectedPrescription.notes}</p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Prescription Documents</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedPrescription.images.map((image, index) => (
                      <div 
                        key={index} 
                        className="relative h-64 cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => handleImageClick(image)}
                      >
                        {isPdfFile(image) ? (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded">
                            <div className="text-center">
                              <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              </svg>
                              <span className="mt-2 block text-sm text-gray-600">Click to view PDF</span>
                            </div>
                          </div>
                        ) : (
                          <Image
                            src={`http://localhost:8000${image}`}
                            alt={`Prescription ${index + 1}`}
                            fill
                            className="object-contain"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-4">
                  {selectedPrescription.status === 'pending' && (
                    <button
                      onClick={() => handleVerify(selectedPrescription._id)}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                      disabled={isVerifying}
                    >
                      {isVerifying ? 'Processing...' : 'Verify Document'}
                    </button>
                  )}
                  {selectedPrescription.status === 'processing' && (
                    <>
                      <button
                        onClick={() => handleReject(selectedPrescription._id)}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleApprove(selectedPrescription._id)}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        Approve
                      </button>
                    </>
                  )}
                  {(selectedPrescription.status === 'approved' || selectedPrescription.status === 'rejected') && (
                    <button
                      onClick={() => handleDelete(selectedPrescription._id)}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                      disabled={isDeleting}
                    >
                      {isDeleting ? 'Deleting...' : 'Delete'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Document Viewer Modal */}
          {showLightbox && selectedImage && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
              onClick={() => setShowLightbox(false)}
            >
              <div className="relative w-full h-full flex items-center justify-center">
                <button
                  onClick={() => setShowLightbox(false)}
                  className="absolute top-4 right-4 text-white text-2xl hover:text-gray-300"
                >
                  ✕
                </button>
                <div className="relative w-4/5 h-4/5">
                  {isPdfFile(selectedImage) ? (
                    <iframe
                      src={`http://localhost:8000${selectedImage}`}
                      className="w-full h-full"
                      title="PDF Viewer"
                    />
                  ) : (
                    <Image
                      src={`http://localhost:8000${selectedImage}`}
                      alt="Prescription"
                      fill
                      className="object-contain"
                    />
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
} 