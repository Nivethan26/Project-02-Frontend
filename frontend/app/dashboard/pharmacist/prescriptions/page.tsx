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

  const handleProductSelection = (prescription: Prescription) => {
    setSelectedPrescription(prescription);
    setShowProductSelection(true);
    setSelectedProducts([]);
  };

  const handleQuantityChange = (item: InventoryItem, quantity: number) => {
    setSelectedProducts(prev => {
      const existing = prev.find(p => p.item._id === item._id);
      if (existing) {
        if (quantity === 0) {
          return prev.filter(p => p.item._id !== item._id);
        }
        return prev.map(p => p.item._id === item._id ? { ...p, quantity } : p);
      } else {
        return [...prev, { item, quantity }];
      }
    });
  };

  const calculateTotal = () => {
    return selectedProducts.reduce((total, { item, quantity }) => total + (item.price * quantity), 0);
  };

  const handleProceedToOrder = async () => {
    try {
      if (!selectedPrescription || selectedProducts.length === 0) {
        showToast('Please select products to order', 'error');
        return;
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

      const response = await axios.post('http://localhost:8000/api/orders', orderData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        showToast('Order created successfully', 'success');
        setShowProductSelection(false);
        setSelectedProducts([]);
        // Optionally refresh the prescriptions list
        fetchPrescriptions();
      }
    } catch (error: any) {
      console.error('Error creating order:', error);
      showToast(error.response?.data?.message || 'Failed to create order', 'error');
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
                          {prescription.status === 'approved' && (
                            <button
                              onClick={() => handleProductSelection(prescription)}
                              className="text-green-600 hover:text-green-900"
                            >
                              Select Products
                            </button>
                          )}
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

          {/* Product Selection Modal */}
          {showProductSelection && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
              <div className="relative top-20 mx-auto p-5 border w-4/5 shadow-lg rounded-md bg-white">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Select Products</h3>
                  <button
                    onClick={() => setShowProductSelection(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    ✕
                  </button>
                </div>

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
                          <div className="mt-2 flex items-center gap-2">
                            <button
                              onClick={() => handleQuantityChange(item, -1)}
                              className="px-2 py-1 border rounded hover:bg-gray-100"
                              disabled={!selectedProducts.find(p => p.item._id === item._id)}
                            >
                              -
                            </button>
                            <span className="w-8 text-center">
                              {selectedProducts.find(p => p.item._id === item._id)?.quantity || 0}
                            </span>
                            <button
                              onClick={() => handleQuantityChange(item, 1)}
                              className="px-2 py-1 border rounded hover:bg-gray-100"
                              disabled={(selectedProducts.find(p => p.item._id === item._id)?.quantity ?? 0) >= item.stock}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Summary */}
                <div className="mt-4 border-t pt-4">
                  <h4 className="font-medium mb-2">Order Summary</h4>
                  <div className="space-y-2">
                    {selectedProducts.map((product) => {
                      const item = inventory.find(i => i._id === product.item._id);
                      return item ? (
                        <div key={product.item._id} className="flex justify-between text-sm">
                          <span>{item.name} x {product.quantity}</span>
                          <span>Rs. {item.price * product.quantity}</span>
                        </div>
                      ) : null;
                    })}
                    <div className="border-t pt-2 font-medium">
                      <div className="flex justify-between">
                        <span>Total:</span>
                        <span>Rs. {selectedProducts.reduce((total, product) => {
                          const item = inventory.find(i => i._id === product.item._id);
                          return total + (item ? item.price * product.quantity : 0);
                        }, 0)}</span>
                      </div>
                    </div>
                  </div>
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