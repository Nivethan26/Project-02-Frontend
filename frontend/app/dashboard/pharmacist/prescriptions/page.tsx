/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Image from 'next/image';
import axios from 'axios';
import { useRouter } from 'next/navigation';

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
  rejectionReason?: string;
}

interface InventoryItem {
  _id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  description: string;
  status: "active" | "inactive";
  prescription: "required" | "not_required";
  image: string;
}

interface SelectedProduct {
  item: InventoryItem;
  quantity: number;
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
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [filteredInventory, setFilteredInventory] = useState<InventoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);
  const [showProductSelection, setShowProductSelection] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const router = useRouter();

  useEffect(() => {
    fetchPrescriptions();
    fetchInventory();
  }, []);

  useEffect(() => {
    // Extract unique categories from inventory
    const uniqueCategories = Array.from(new Set(inventory.map(item => item.category)));
    setCategories(uniqueCategories);
  }, [inventory]);

  useEffect(() => {
    // Filter inventory based on search term and category
    let filtered = inventory;
    
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }
    
    setFilteredInventory(filtered);
  }, [searchTerm, selectedCategory, inventory]);

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

  const fetchInventory = async () => {
    try {
      const token = sessionStorage.getItem('token') || sessionStorage.getItem('staffToken');
      const user = sessionStorage.getItem('user') || sessionStorage.getItem('staffUser');
      
      if (!token || !user) {
        showToast('Please login to access inventory', 'error');
        return;
      }

      const userData = JSON.parse(user);
      if (userData.role !== 'pharmacist') {
        showToast('Unauthorized access', 'error');
        return;
      }

      const response = await axios.get('http://localhost:8000/api/staff/inventory', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data) {
        setInventory(response.data);
      }
    } catch (error: any) {
      console.error('Error fetching inventory:', error);
      if (error.response?.status === 401) {
        showToast('Session expired. Please login again', 'error');
        // Optionally redirect to login
        // router.push('/login');
      } else {
        showToast(error.response?.data?.message || 'Failed to fetch inventory', 'error');
      }
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
    if (!rejectionReason.trim()) {
      showToast('Please provide a reason for rejection', 'error');
      return;
    }
    try {
      const response = await fetch(`http://localhost:8000/api/prescriptions/${id}/reject`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rejectionReason }),
      });
      if (!response.ok) throw new Error('Failed to reject prescription');
      await fetchPrescriptions();
      setShowModal(false);
      setShowRejectModal(false);
      setRejectionReason('');
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

  const handleProductSelection = (prescription: Prescription) => {
    setSelectedPrescription(prescription);
    setShowProductSelection(true);
    setSelectedProducts([]);
  };

  const handleQuantityChange = (item: InventoryItem, change: number) => {
    setSelectedProducts(prev => {
      const existing = prev.find(p => p.item._id === item._id);
      if (existing) {
        const newQuantity = existing.quantity + change;
        if (newQuantity <= 0) {
          return prev.filter(p => p.item._id !== item._id);
        }
        if (newQuantity > item.stock) {
          return prev; // Don't exceed stock
        }
        return prev.map(p => p.item._id === item._id ? { ...p, quantity: newQuantity } : p);
      } else {
        // If item doesn't exist and we're adding (change > 0), add it with quantity 1
        if (change > 0) {
          return [...prev, { item, quantity: 1 }];
        }
        return prev;
      }
    });
  };

  const calculateTotal = () => {
    return selectedProducts.reduce((total, { item, quantity }) => total + (item.price * quantity), 0);
  };

  const testModelSchema = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/orders/test-model');
      console.log('Order model schema:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error testing model schema:', error.response?.data);
      return null;
    }
  };

  const testAuthentication = async () => {
    try {
      const token = sessionStorage.getItem('token') || sessionStorage.getItem('staffToken');
      if (!token) {
        console.log('No token found');
        return false;
      }

      const response = await axios.get('http://localhost:8000/api/orders/test-auth', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Authentication test successful:', response.data);
      return true;
    } catch (error: any) {
      console.error('Authentication test failed:', error.response?.data);
      return false;
    }
  };

  const handleProceedToOrder = async () => {
    try {
      if (!selectedPrescription || selectedProducts.length === 0) {
        showToast('Please select products to order', 'error');
        return;
      }

      // Test authentication first
      const authTest = await testAuthentication();
      if (!authTest) {
        showToast('Authentication failed. Please login again.', 'error');
        return;
      }

      // Test model schema to see what fields are required
      const modelTest = await testModelSchema();
      if (modelTest) {
        console.log('Required fields:', modelTest.requiredPaths);
      }

      const token = sessionStorage.getItem('token') || sessionStorage.getItem('staffToken');
      if (!token) {
        showToast('Please login to create order', 'error');
        return;
      }

      const orderData = {
        prescriptionId: selectedPrescription._id,
        items: selectedProducts.map(product => ({
          productId: product.item._id,
          quantity: product.quantity
        })),
        paymentMethod: selectedPrescription.payment
      };

      console.log('Sending order data:', orderData);
      console.log('Using token:', token ? 'Token exists' : 'No token');

      const response = await axios.post('http://localhost:8000/api/orders', orderData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Order creation response:', response.data);

      if (response.data.success) {
        showToast('Order created successfully', 'success');
        setShowProductSelection(false);
        setSelectedProducts([]);
        // Optionally refresh the prescriptions list
        fetchPrescriptions();
      } else {
        showToast(response.data.message || 'Failed to create order', 'error');
      }
    } catch (error: any) {
      console.log('Error creating order:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Validation errors:', error.response?.data?.error);
      console.error('Full error response:', JSON.stringify(error.response?.data, null, 2));
      
      if (error.response?.status === 401) {
        showToast('Authentication failed. Please login again.', 'error');
        // Optionally redirect to login
        // router.push('/login');
      } else if (error.response?.status === 400) {
        const errorMessage = error.response.data.error 
          ? Array.isArray(error.response.data.error) 
            ? error.response.data.error.join(', ') 
            : error.response.data.error
          : error.response.data.message || 'Invalid order data';
        showToast(errorMessage, 'error');
      } else if (error.response?.status === 404) {
        showToast(error.response.data.message || 'Prescription or product not found', 'error');
      } else if (error.response?.status === 500) {
        showToast('Server error. Please try again later.', 'error');
      } else {
        showToast(error.response?.data?.message || 'Failed to create order', 'error');
      }
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
            {/* Header Section */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Prescriptions Management</h1>
              <p className="text-gray-600">Review and manage patient prescription requests</p>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {prescriptions.filter(p => p.status === 'pending').length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Processing</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {prescriptions.filter(p => p.status === 'processing').length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Approved</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {prescriptions.filter(p => p.status === 'approved').length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Rejected</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {prescriptions.filter(p => p.status === 'rejected').length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Prescriptions Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">All Prescriptions</h2>
                <p className="text-sm text-gray-600 mt-1">Total: {prescriptions.length} prescriptions</p>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Patient Information
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Contact Details
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Prescription Info
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {prescriptions.map((prescription) => (
                      <tr key={prescription._id} className="hover:bg-gray-50 transition-colors duration-200">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-gray-900">{prescription.name}</div>
                              <div className="text-sm text-gray-500">{prescription.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{prescription.phone}</div>
                          <div className="text-sm text-gray-500">{prescription.city}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{prescription.duration}</div>
                          <div className="text-sm text-gray-500">{prescription.frequency}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                            prescription.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            prescription.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                            prescription.status === 'approved' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            <span className={`w-2 h-2 rounded-full mr-2 ${
                              prescription.status === 'pending' ? 'bg-yellow-400' :
                              prescription.status === 'processing' ? 'bg-blue-400' :
                              prescription.status === 'approved' ? 'bg-green-400' :
                              'bg-red-400'
                            }`}></span>
                            {prescription.status.charAt(0).toUpperCase() + prescription.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleViewPrescription(prescription)}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              View
                            </button>
                            {prescription.status === 'approved' && (
                              <button
                                onClick={() => handleProductSelection(prescription)}
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                              >
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m6 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                                </svg>
                                Select Products
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {prescriptions.length === 0 && (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No prescriptions</h3>
                  <p className="mt-1 text-sm text-gray-500">No prescription requests found.</p>
                </div>
              )}
            </div>
          </div>

          {/* Prescription View Modal */}
          {showModal && selectedPrescription && (
            <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
              <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-400 text-white p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-2xl font-bold">Prescription Details</h3>
                      <p className="text-blue-100 mt-1">Patient: {selectedPrescription.name}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        selectedPrescription.status === 'pending' ? 'bg-yellow-500 text-yellow-900' :
                        selectedPrescription.status === 'processing' ? 'bg-blue-500 text-blue-900' :
                        selectedPrescription.status === 'approved' ? 'bg-green-500 text-green-900' :
                        'bg-red-500 text-red-900'
                      }`}>
                        {selectedPrescription.status.charAt(0).toUpperCase() + selectedPrescription.status.slice(1)}
                      </span>
                      <button
                        onClick={() => setShowModal(false)}
                        className="text-white hover:text-gray-200 transition-colors"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Patient Information */}
                    <div className="lg:col-span-1">
                      <div className="bg-gray-50 rounded-xl p-6">
                        <div className="flex items-center mb-4">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <h4 className="text-lg font-semibold text-gray-900">Patient Information</h4>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-600">Name:</span>
                            <span className="text-sm text-gray-900">{selectedPrescription.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-600">Email:</span>
                            <span className="text-sm text-gray-900">{selectedPrescription.email}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-600">Phone:</span>
                            <span className="text-sm text-gray-900">{selectedPrescription.phone}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-600">Address:</span>
                            <span className="text-sm text-gray-900">{selectedPrescription.address}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-600">City:</span>
                            <span className="text-sm text-gray-900">{selectedPrescription.city}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-600">Gender:</span>
                            <span className="text-sm text-gray-900 capitalize">{selectedPrescription.gender}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Prescription Details */}
                    <div className="lg:col-span-1">
                      <div className="bg-gray-50 rounded-xl p-6">
                        <div className="flex items-center mb-4">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <h4 className="text-lg font-semibold text-gray-900">Prescription Details</h4>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-600">Duration:</span>
                            <span className="text-sm text-gray-900">{selectedPrescription.duration}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-600">Frequency:</span>
                            <span className="text-sm text-gray-900">{selectedPrescription.frequency}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-600">Payment Method:</span>
                            <span className="text-sm text-gray-900 capitalize">{selectedPrescription.payment}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-600">Allergies:</span>
                            <span className="text-sm text-gray-900">
                              {selectedPrescription.hasAllergies === 'yes' ? selectedPrescription.allergies : 'None'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-600">Substitutes:</span>
                            <span className="text-sm text-gray-900 capitalize">{selectedPrescription.substitutes}</span>
                          </div>
                          {selectedPrescription.notes && (
                            <div className="pt-3 border-t border-gray-200">
                              <span className="text-sm font-medium text-gray-600 block mb-1">Notes:</span>
                              <span className="text-sm text-gray-900 bg-white p-2 rounded border">{selectedPrescription.notes}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Prescription Documents */}
                    <div className="lg:col-span-1">
                      <div className="bg-gray-50 rounded-xl p-6">
                        <div className="flex items-center mb-4">
                          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <h4 className="text-lg font-semibold text-gray-900">Documents</h4>
                        </div>
                        <div className="space-y-3">
                          {selectedPrescription.images.map((image, index) => (
                            <div 
                              key={index} 
                              className="relative h-32 cursor-pointer hover:opacity-90 transition-opacity bg-white rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-400"
                              onClick={() => handleImageClick(image)}
                            >
                              {isPdfFile(image) ? (
                                <div className="w-full h-full flex items-center justify-center">
                                  <div className="text-center">
                                    <svg className="w-8 h-8 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                    </svg>
                                    <span className="mt-1 block text-xs text-gray-600">Document {index + 1}</span>
                                  </div>
                                </div>
                              ) : (
                                <Image
                                  src={`http://localhost:8000${image}`}
                                  alt={`Prescription ${index + 1}`}
                                  fill
                                  className="object-cover rounded-lg"
                                />
                              )}
                              <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                                {index + 1}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                  <div className="flex justify-end space-x-3">
                    {selectedPrescription.status === 'pending' && (
                      <button
                        onClick={() => handleVerify(selectedPrescription._id)}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium"
                        disabled={isVerifying}
                      >
                        {isVerifying ? (
                          <div className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                          </div>
                        ) : 'Verify Document'}
                      </button>
                    )}
                    {selectedPrescription.status === 'processing' && (
                      <>
                        <button
                          onClick={() => setShowRejectModal(true)}
                          className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleApprove(selectedPrescription._id)}
                          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                        >
                          Approve
                        </button>
                      </>
                    )}
                    {(selectedPrescription.status === 'approved' || selectedPrescription.status === 'rejected') && (
                      <button
                        onClick={() => handleDelete(selectedPrescription._id)}
                        className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors font-medium"
                        disabled={isDeleting}
                      >
                        {isDeleting ? (
                          <div className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Deleting...
                          </div>
                        ) : 'Delete'}
                      </button>
                    )}
                    <button
                      onClick={() => setShowModal(false)}
                      className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                    >
                      Close
                    </button>
                  </div>
                </div>
                {/* Show rejection reason if rejected */}
                {selectedPrescription.status === 'rejected' && selectedPrescription.rejectionReason && (
                  <div className="px-6 py-2 text-red-700 bg-red-100 rounded mt-2">
                    <strong>Rejection Reason:</strong> {selectedPrescription.rejectionReason}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Product Selection Modal */}
          {showProductSelection && (
            <div className="fixed inset-0 bg-gray-700 bg-opacity-70 z-50 flex items-center justify-center">
              <div className="w-full h-full max-w-none max-h-none bg-white shadow-2xl rounded-none flex flex-col">
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                  <h3 className="text-2xl font-bold text-blue-800">Select Products</h3>
                  <button
                    onClick={() => setShowProductSelection(false)}
                    className="text-gray-400 hover:text-gray-600 text-3xl font-bold"
                  >
                    ✕
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-8">
                  <div className="flex flex-col md:flex-row gap-8 h-full">
                    {/* Left: Prescription Image Carousel */}
                    <div className="md:w-2/6 w-full flex flex-col items-center justify-center bg-blue-50 rounded-xl shadow-md p-6 border border-blue-100">
                      <h4 className="text-lg font-semibold text-blue-700 mb-4">Prescription Image</h4>
                      {selectedPrescription && selectedPrescription.images && selectedPrescription.images.length > 0 ? (
                        <div className="relative flex flex-col items-center w-full">
                          <div className="relative w-full max-w-lg h-[380px] flex items-center justify-center bg-white rounded-2xl shadow-lg border-2 border-blue-200">
                            {/* Left Arrow */}
                            {selectedPrescription.images.length > 1 && (
                              <button
                                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 hover:bg-blue-100 rounded-full p-2 shadow-md z-10"
                                onClick={() => setCurrentImageIdx((prev) => (prev === 0 ? selectedPrescription.images.length - 1 : prev - 1))}
                                aria-label="Previous image"
                              >
                                <svg className="w-6 h-6 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                              </button>
                            )}
                            {/* Image or PDF */}
                            <div
                              className="w-full h-full flex items-center justify-center cursor-pointer"
                              onClick={() => handleImageClick(selectedPrescription.images[currentImageIdx])}
                              title="Click to enlarge"
                            >
                              {isPdfFile(selectedPrescription.images[currentImageIdx]) ? (
                                <div className="flex flex-col items-center justify-center w-full h-full text-gray-500">
                                  <span className="mb-2">PDF</span>
                                  <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                  </svg>
                                </div>
                              ) : (
                                <img
                                  src={`http://localhost:8000${selectedPrescription.images[currentImageIdx]}`}
                                  alt={`Prescription ${currentImageIdx + 1}`}
                                  className="object-contain w-full h-full max-h-[400px] rounded-2xl"
                                />
                              )}
                            </div>
                            {/* Right Arrow */}
                            {selectedPrescription.images.length > 1 && (
                              <button
                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 hover:bg-blue-100 rounded-full p-2 shadow-md z-10"
                                onClick={() => setCurrentImageIdx((prev) => (prev === selectedPrescription.images.length - 1 ? 0 : prev + 1))}
                                aria-label="Next image"
                              >
                                <svg className="w-4 h-4 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                              </button>
                            )}
                          </div>
                          {/* Dots */}
                          {selectedPrescription.images.length > 1 && (
                            <div className="flex gap-2 mt-4">
                              {selectedPrescription.images.map((_, idx) => (
                                <button
                                  key={idx}
                                  className={`w-3 h-3 rounded-full border-2 ${currentImageIdx === idx ? 'bg-blue-600 border-blue-600' : 'bg-white border-blue-300'} transition-all`}
                                  onClick={() => setCurrentImageIdx(idx)}
                                  aria-label={`Go to image ${idx + 1}`}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-gray-400 text-sm">No images available</div>
                      )}
                    </div>

                    {/* Right: Product Selection and Order Summary */}
                    <div className="md:w-3/5 w-full flex flex-col">
                      {/* Search and Filter Section */}
                      <div className="mb-4 flex gap-4">
                        <div className="flex-1">
                          <input
                            type="text"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div className="w-48">
                          <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="all">All Categories</option>
                            {categories.map((category) => (
                              <option key={category} value={category}>
                                {category.charAt(0).toUpperCase() + category.slice(1)}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Products List */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto">
                        {filteredInventory.map((item) => (
                          <div key={item._id} className="border rounded-lg p-4">
                            <div className="flex items-start gap-4">
                              <div className="w-20 h-20 flex-shrink-0">
                                <img
                                  src={item.image || '/placeholder.png'}
                                  alt={item.name}
                                  className="w-full h-full object-cover rounded"
                                />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium">{item.name}</h4>
                                <p className="text-sm text-gray-600">{item.description}</p>
                                <p className="text-sm font-medium mt-1">Rs. {item.price}</p>
                                <p className="text-sm text-gray-500">Stock: {item.stock}</p>
                                {item.stock === 0 && (
                                  <span className="text-xs text-red-600 font-semibold">Out of Stock</span>
                                )}
                                <div className="mt-2 flex items-center gap-2">
                                  <button
                                    onClick={() => handleQuantityChange(item, -1)}
                                    className="px-2 py-1 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={item.stock === 0 || !selectedProducts.find(p => p.item._id === item._id) || 
                                             (selectedProducts.find(p => p.item._id === item._id)?.quantity ?? 0) <= 1}
                                  >
                                    -
                                  </button>
                                  <input
                                    type="number"
                                    min="0"
                                    max={item.stock}
                                    value={selectedProducts.find(p => p.item._id === item._id)?.quantity || 0}
                                    onChange={(e) => {
                                      const value = parseInt(e.target.value) || 0;
                                      if (value === 0) {
                                        handleQuantityChange(item, -(selectedProducts.find(p => p.item._id === item._id)?.quantity || 0));
                                      } else {
                                        const currentQuantity = selectedProducts.find(p => p.item._id === item._id)?.quantity || 0;
                                        handleQuantityChange(item, value - currentQuantity);
                                      }
                                    }}
                                    className="w-16 text-center border rounded px-2 py-1 text-sm"
                                    placeholder="0"
                                    disabled={item.stock === 0}
                                  />
                                  <button
                                    onClick={() => handleQuantityChange(item, 1)}
                                    className="px-2 py-1 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={item.stock === 0 || (selectedProducts.find(p => p.item._id === item._id)?.quantity ?? 0) >= item.stock}
                                  >
                                    +
                                  </button>
                                  {item.stock > 0 && item.stock <= 10 && (
                                    <span className="text-xs text-red-600 font-medium">Low Stock!</span>
                                  )}
                                </div>
                                {!selectedProducts.find(p => p.item._id === item._id) && (
                                  <button
                                    onClick={() => handleQuantityChange(item, 1)}
                                    className="mt-2 w-full px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                                    disabled={item.stock === 0}
                                  >
                                    Quick Add
                                  </button>
                                )}
                                {selectedProducts.find(p => p.item._id === item._id) && (
                                  <button
                                    onClick={() => handleQuantityChange(item, -(selectedProducts.find(p => p.item._id === item._id)?.quantity || 0))}
                                    className="mt-2 w-full px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                                  >
                                    Remove
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Order Summary */}
                      <div className="mt-4 border-t pt-4">
                        <h4 className="font-medium mb-2">Order Summary</h4>
                        {selectedProducts.length === 0 ? (
                          <p className="text-gray-500 text-sm">No items selected</p>
                        ) : (
                          <>
                            <div className="space-y-2 max-h-32 overflow-y-auto">
                              {selectedProducts.map((product) => {
                                const item = inventory.find(i => i._id === product.item._id);
                                return item ? (
                                  <div key={product.item._id} className="flex justify-between text-sm items-center">
                                    <div className="flex-1">
                                      <span className="font-medium">{item.name}</span>
                                      <span className="text-gray-500 ml-2">x {product.quantity}</span>
                                    </div>
                                    <div className="text-right">
                                      <span className="font-medium">Rs. {item.price * product.quantity}</span>
                                      <div className="text-xs text-gray-500">Rs. {item.price} each</div>
                                    </div>
                                  </div>
                                ) : null;
                              })}
                            </div>
                            <div className="border-t pt-3 mt-3">
                              <div className="flex justify-between text-sm mb-1">
                                <span>Items:</span>
                                <span>{selectedProducts.length}</span>
                              </div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>Total Quantity:</span>
                                <span>{selectedProducts.reduce((total, product) => total + product.quantity, 0)}</span>
                              </div>
                              <div className="flex justify-between font-medium text-lg border-t pt-2">
                                <span>Total Amount:</span>
                                <span className="text-blue-600">Rs. {selectedProducts.reduce((total, product) => {
                                  const item = inventory.find(i => i._id === product.item._id);
                                  return total + (item ? item.price * product.quantity : 0);
                                }, 0)}</span>
                              </div>
                            </div>
                          </>
                        )}
                      </div>

                      <div className="mt-4 flex justify-end gap-2">
                        <button
                          onClick={() => setShowProductSelection(false)}
                          className="px-4 py-2 border rounded hover:bg-gray-100"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleProceedToOrder}
                          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                          disabled={selectedProducts.length === 0}
                        >
                          Proceed to Order
                        </button>
                      </div>
                    </div>
                  </div>
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

          {/* Reject Reason Modal */}
          {showRejectModal && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                <h3 className="text-lg font-semibold mb-4">Reject Prescription</h3>
                <textarea
                  className="w-full border rounded p-2 mb-4"
                  rows={3}
                  placeholder="Enter reason for rejection..."
                  value={rejectionReason}
                  onChange={e => setRejectionReason(e.target.value)}
                />
                <div className="flex justify-end gap-2">
                  <button
                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                    onClick={() => { setShowRejectModal(false); setRejectionReason(''); }}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    onClick={() => selectedPrescription && handleReject(selectedPrescription._id)}
                    disabled={!selectedPrescription}
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
} 