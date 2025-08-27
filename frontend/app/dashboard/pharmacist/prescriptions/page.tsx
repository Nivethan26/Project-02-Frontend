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
  image?: string;
  images?: string[];
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

const getProductImage = (product: InventoryItem) => {
  const imagePath = product.images && product.images.length > 0 ? product.images[0] : product.image;
  if (!imagePath) {
    return '/placeholder.png';
  }
  const filename = imagePath.replace(/\\/g, '/').split('/').pop();
  return `http://localhost:8000/uploads/products/${filename}`;
};

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
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
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
      setIsPlacingOrder(true);
      if (!selectedPrescription || selectedProducts.length === 0) {
        showToast('Please select products to order', 'error');
        setIsPlacingOrder(false);
        return;
      }

      // Test authentication first
      const authTest = await testAuthentication();
      if (!authTest) {
        showToast('Authentication failed. Please login again.', 'error');
        setIsPlacingOrder(false);
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
        setIsPlacingOrder(false);
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
        setIsPlacingOrder(false);
      } else {
        showToast(response.data.message || 'Failed to create order', 'error');
        setIsPlacingOrder(false);
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
      setIsPlacingOrder(false);
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
                                  priority
                                  sizes="(max-width: 768px) 100vw, 33vw"
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
                                <Image
                                  src={`http://localhost:8000${selectedPrescription.images[currentImageIdx]}`}
                                  alt={`Prescription ${currentImageIdx + 1}`}
                                  fill
                                  priority
                                  className="object-contain w-full h-full max-h-[400px] rounded-2xl"
                                  sizes="(max-width: 768px) 100vw, 50vw"
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
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 py-4 px-2">
                        {filteredInventory.map((product) => (
                          <div
                            key={product._id}
                            className={`relative flex flex-col items-center justify-between p-4 bg-white border border-gray-200 rounded-2xl shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                              product.stock === 0 ? 'opacity-60 bg-gray-100' : ''
                            }`}
                          >
                            <div className="relative w-full aspect-[4/5] mb-4 flex items-center justify-center bg-gray-50 rounded-lg overflow-hidden">
                              {getProductImage(product) ? (
                                <Image
                                  src={getProductImage(product)}
                                  alt={product.name}
                                  fill
                                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                                  className={`object-contain rounded-lg ${product.stock === 0 ? 'grayscale' : ''}`}
                                />
                              ) : (
                                <div className="flex items-center justify-center w-full h-full text-gray-300">
                                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a4 4 0 004 4h10a4 4 0 004-4V7a4 4 0 00-4-4H7a4 4 0 00-4 4z" />
                                  </svg>
                                </div>
                              )}
                            </div>
                            <div className="text-center w-full">
                              <h4 className="font-semibold text-gray-800 text-sm truncate w-full" title={product.name}>
                                {product.name}
                              </h4>
                              <p className="text-gray-700 font-bold mt-1">Rs. {product.price}</p>
                            </div>
                            <div className="w-full mt-3">
                              {product.stock > 0 ? (
                                <button
                                  onClick={() => handleQuantityChange(product, 1)}
                                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                                  aria-label={`Add ${product.name} to order`}
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                  </svg>
                                  Quick Add
                                </button>
                              ) : (
                                <span className="w-full block text-center px-4 py-2 bg-gray-300 text-gray-600 text-sm rounded-lg cursor-not-allowed">
                                  Out of Stock
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Order Summary */}
                      <div className="mt-6 border-t-2 border-gray-200 pt-6">
                        <h4 className="text-xl font-bold text-gray-800 mb-4">Order Summary</h4>
                        {selectedProducts.length === 0 ? (
                          <div className="text-center py-6 bg-gray-50 rounded-lg">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.5 5.25M12 13.75l-1.5 3M12 13.75l1.5 3M12 13.75V17m-4 4h8m-4-4v4" />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">Your cart is empty</h3>
                            <p className="mt-1 text-sm text-gray-500">Add products to get started.</p>
                          </div>
                        ) : (
                          <>
                            <div className="space-y-3 pr-2">
                              {selectedProducts.map(({ item, quantity }) => (
                                <div key={item._id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                                  <div className="flex items-center gap-3 flex-1">
                                    <div className="relative w-12 h-12 flex-shrink-0">
                                      <Image
                                        src={getProductImage(item)}
                                        alt={item.name}
                                        fill
                                        sizes="48px"
                                        className="object-cover rounded-md"
                                      />
                                    </div>
                                    <div>
                                      <p className="font-semibold text-sm text-gray-800">{item.name}</p>
                                      <p className="text-xs text-gray-500">Rs. {item.price.toFixed(2)} each</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => handleQuantityChange(item, -1)}
                                      className="px-2 py-1 border rounded-md text-gray-600 hover:bg-gray-200"
                                      aria-label="Decrease quantity"
                                    >
                                      -
                                    </button>
                                    <span className="font-semibold w-8 text-center">{quantity}</span>
                                    <button
                                      onClick={() => handleQuantityChange(item, 1)}
                                      className="px-2 py-1 border rounded-md text-gray-600 hover:bg-gray-200"
                                      disabled={quantity >= item.stock}
                                      aria-label="Increase quantity"
                                    >
                                      +
                                    </button>
                                  </div>
                                  <p className="w-20 text-right font-semibold text-gray-800">
                                    Rs. {(item.price * quantity).toFixed(2)}
                                  </p>
                                </div>
                              ))}
                            </div>
                            <div className="border-t pt-4 mt-4">
                              <div className="flex justify-between text-lg font-bold">
                                <span>Total Amount:</span>
                                <span className="text-blue-600">Rs. {calculateTotal().toFixed(2)}</span>
                              </div>
                            </div>
                          </>
                        )}
                      </div>

                      <div className="mt-6 flex justify-end gap-3 border-t pt-6">
                        <button
                          onClick={() => setShowProductSelection(false)}
                          className="px-4 py-2 border rounded hover:bg-gray-100"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleProceedToOrder}
                          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center justify-center gap-2"
                          disabled={selectedProducts.length === 0 || isPlacingOrder}
                        >
                          {isPlacingOrder ? (
                            <>
                              <svg className="animate-spin h-5 w-5 mr-2 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Placing Order...
                            </>
                          ) : (
                            'Proceed to Order'
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Rejection Reason Modal */}
          {showRejectModal && selectedPrescription && (
            <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
              <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Reason for Rejection</h3>
                <p className="text-sm text-gray-600 mb-6">
                  Please provide a clear reason for rejecting the prescription for patient <span className="font-semibold">{selectedPrescription.name}</span>.
                </p>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full h-24 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Unclear handwriting, invalid medication..."
                />
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => setShowRejectModal(false)}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleReject(selectedPrescription._id)}
                    className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    disabled={!rejectionReason.trim()}
                  >
                    Confirm Rejection
                  </button>
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
                      priority
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