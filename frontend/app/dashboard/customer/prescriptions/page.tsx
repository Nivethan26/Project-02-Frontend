"use client";
import { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import PaymentForm from '@/components/PaymentForm';

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

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  stock?: number;
}

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: string;
  total: number;
  items: OrderItem[];
  paymentMethod: string;
  orderType: string;
  customizationConfirmed: boolean;
  shipping?: number;
  tax?: number;
  totalAmount?: number; // Added for PaymentForm
  subtotal?: number; // Added for order summary
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
  const [order, setOrder] = useState<Order | null>(null);
  const [orderLoading, setOrderLoading] = useState(false);
  const router = useRouter();
  const [showReminderPopup, setShowReminderPopup] = useState(false);
  const [showDateTimePicker, setShowDateTimePicker] = useState(false);
  const [reminderDate, setReminderDate] = useState('');
  const [reminderTime, setReminderTime] = useState('');
  const [pendingOrderConfirmation, setPendingOrderConfirmation] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

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

  const fetchOrderForPrescription = async (prescription: Prescription) => {
    setOrderLoading(true);
    setOrder(null);
    try {
      const userInfo = sessionStorage.getItem('user');
      if (!userInfo) return;
      const user = JSON.parse(userInfo);
      const response = await fetch(
        `http://localhost:8000/api/orders/customer?email=${encodeURIComponent(user.email)}&prescriptionId=${prescription._id}`
      );
      const data = await response.json();
      if (data.success && data.data.length > 0) {
        setOrder(data.data[0]);
      } else {
        setOrder(null);
      }
    } catch (error) {
      setOrder(null);
    } finally {
      setOrderLoading(false);
    }
  };

  const handleViewPrescription = (prescription: Prescription) => {
    setSelectedPrescription(prescription);
    setShowModal(true);
    if (prescription.status === 'approved') {
      fetchOrderForPrescription(prescription);
    } else {
      setOrder(null);
    }
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

  const getProductImageUrl = (imagePath?: string) => {
    if (!imagePath) {
      return '/images/package.png';
    }
    if (imagePath.startsWith('http')) {
      return imagePath.replace(/\\/g, '/');
    }
    return `http://localhost:8000/${imagePath.replace(/\\/g, '/')}`;
  };

  // Add handlers for updating quantity and deleting products
  const handleUpdateQuantity = async (productId: string, newQuantity: number) => {
    if (!order) return;
    const item = order.items.find(i => i.id === productId);
    if (!item) return;
    if (typeof item.stock === 'number' && newQuantity > item.stock) {
      showToast(`Cannot exceed available stock (${item.stock}) for this product.`, 'error');
      return;
    }
    if (newQuantity < 1) return;
    const updatedItems = order.items.map(item =>
      item.id === productId ? { ...item, quantity: newQuantity } : item
    );
    await updateOrderItems(updatedItems);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!order) return;
    const updatedItems = order.items.filter(item => item.id !== productId);
    await updateOrderItems(updatedItems);
  };

  const updateOrderItems = async (updatedItems: OrderItem[]) => {
    if (!order) return;
    try {
      const response = await fetch(`http://localhost:8000/api/orders/${order.id}/items`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: updatedItems.map(item => ({
          product: item.id,
          quantity: item.quantity,
          price: item.price
        })) }),
      });
      if (!response.ok) throw new Error('Failed to update order');
      setOrder(prev => prev ? { ...prev, items: updatedItems } : prev);
      showToast('Order updated', 'success');
    } catch (error) {
      showToast('Failed to update order', 'error');
    }
  };

  const createReminder = async (date?: string, time?: string) => {
    if (!order) return;
    try {
      const response = await fetch('http://localhost:8000/api/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          reminderDate: date,
          reminderTime: time,
          // Add more fields as needed
        }),
      });
      if (!response.ok) throw new Error('Failed to create reminder');
      showToast('Reminder set!', 'success');
    } catch (error) {
      showToast('Failed to set reminder', 'error');
    }
  };

  const handleReminderResponse = async (wantsReminder: boolean, date?: string, time?: string) => {
    setShowReminderPopup(false);
    setShowDateTimePicker(false);
    if (!order) return;
    if (wantsReminder && date && time) {
      await createReminder(date, time);
    }
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = async () => {
    if (!order) return;
    try {
      // --- Save payment in backend payment database ---
      let orderId = order.id || (order as any)._id;
      if (!orderId) {
        // Recursively search for _id in the order object
        function findId(obj: any): string | undefined {
          if (!obj || typeof obj !== 'object') return undefined;
          if (obj._id) return obj._id;
          for (const key of Object.keys(obj)) {
            const found = findId(obj[key]);
            if (found) return found;
          }
          return undefined;
        }
        orderId = findId(order);
        if (orderId) {
          console.warn('OrderId found recursively:', orderId);
        } else {
          showToast('Could not find order ID. Payment will not be recorded.', 'error');
          return;
        }
      }
      try {
        // Calculate subtotal and shipping for payment amount
        const subtotal = order.subtotal ?? order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const shipping = order.shipping ?? 500;
        const paymentAmount = subtotal + shipping;
        await fetch('http://localhost:8000/api/payments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${sessionStorage.getItem('token')}`
          },
          body: JSON.stringify({
            orderId: orderId,
            paymentMethod: order.paymentMethod || 'card',
            amount: paymentAmount,
            paymentType: 'prescription'
          })
        });
        showToast('Payment recorded in database!', 'success');
      } catch (err) {
        showToast('Failed to record payment in database', 'error');
        console.error('Payment record error:', err);
        return;
      }
      // --- End payment save logic ---
      setPendingOrderConfirmation(true);
      const response = await fetch(`http://localhost:8000/api/orders/${orderId}/confirm`, { method: 'PATCH' });
      if (!response.ok) throw new Error('Failed to confirm order');
      showToast('Order confirmed!', 'success');
      setOrder({ ...order, customizationConfirmed: true } as typeof order);
      setShowPaymentModal(false);
      router.push('/dashboard/customer/orders');
    } catch (error) {
      showToast('Failed to confirm order', 'error');
    } finally {
      setPendingOrderConfirmation(false);
    }
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

  // Calculate subtotal and shipping for use in total calculation
  const subtotal = order?.subtotal ?? order?.items.reduce((sum, item) => sum + item.price * item.quantity, 0) ?? 0;
  const shipping = order?.shipping ?? 500;
  const total = subtotal + shipping;

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
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-blue-900/60 backdrop-blur-sm">
              <div className="relative w-full h-full max-w-none max-h-none bg-white rounded-none shadow-none overflow-auto animate-fadeIn">
                {/* Header */}
                <div className="flex items-center justify-between px-10 py-6 bg-gradient-to-r from-blue-700 via-blue-500 to-blue-400 shadow-md">
                  <div className="flex items-center gap-4">
                    <div className="bg-white/30 rounded-full p-3 shadow-md">
                      <svg className="w-10 h-10 text-blue-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2a4 4 0 014-4h2a4 4 0 014 4v2M9 17H7a4 4 0 01-4-4V7a4 4 0 014-4h10a4 4 0 014 4v6a4 4 0 01-4 4h-2M9 17v2a2 2 0 002 2h2a2 2 0 002-2v-2" />
                      </svg>
                    </div>
                    <h3 className="text-3xl font-bold text-white tracking-wide">Prescription Details</h3>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-white hover:bg-white/20 rounded-full p-3 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300"
                    title="Close"
                  >
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                {/* Content */}
                <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-10 bg-gray-50 min-h-[80vh]">
                  {/* Info Section */}
                  <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col gap-6 border border-blue-100">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-2 shadow ${getStatusColor(selectedPrescription.status)}`}> 
                        {selectedPrescription.status === 'approved' && <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                        {selectedPrescription.status === 'rejected' && <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>}
                        {selectedPrescription.status === 'processing' && <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3" /></svg>}
                        {selectedPrescription.status.charAt(0).toUpperCase() + selectedPrescription.status.slice(1)}
                      </span>
                      <span className="ml-3 text-xs text-gray-500">{formatDate(selectedPrescription.createdAt)}</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-blue-700 text-xl mb-3">Prescription Information</h4>
                      <div className="space-y-2 text-gray-700 text-base">
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
                  <div className="bg-white rounded-2xl shadow-lg p-8 border border-blue-100 flex flex-col gap-6">
                    <div>
                      <h4 className="font-semibold text-blue-700 text-xl mb-3">Prescription Documents</h4>
                      <div className="grid grid-cols-2 gap-4">
                        {selectedPrescription.images.map((image, index) => (
                          <div 
                            key={index} 
                            className="relative h-48 rounded-xl overflow-hidden cursor-pointer group shadow-lg hover:shadow-2xl transition-shadow duration-200 bg-white/60 hover:bg-blue-100/60"
                            onClick={() => handleImageClick(image)}
                          >
                            {isPdfFile(image) ? (
                              <div className="w-full h-full flex flex-col items-center justify-center bg-blue-50 rounded-xl group-hover:bg-blue-100 transition-colors">
                                <svg className="w-14 h-14 text-blue-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                                <span className="text-xs text-blue-700 font-medium">Click to view PDF</span>
                              </div>
                            ) : (
                              <Image
                                src={`http://localhost:8000${image}`}
                                alt={`Prescription ${index + 1}`}
                                fill
                                sizes="(max-width: 768px) 100vw, 50vw"
                                className="object-contain w-full h-full scale-100 group-hover:scale-105 transition-transform duration-200"
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  {/* Order Section (if approved) */}
                  {selectedPrescription.status === 'approved' && (
                    <div className="md:col-span-2 bg-white rounded-2xl shadow-lg p-8 border border-blue-100 mt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Order Summary Left */}
                        <div className="bg-blue-50 rounded-xl p-6 flex flex-col gap-3 border border-blue-100 shadow-sm">
                          <h5 className="font-semibold text-blue-700 text-lg mb-2 flex items-center gap-2">
                            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M3 12h18M3 17h18" /></svg>
                            Order Summary
                          </h5>
                          {orderLoading ? (
                            <div className="text-gray-500">Loading order details...</div>
                          ) : order ? (
                            <>
                              <div className="flex justify-between text-gray-700"><span>Order Number:</span> <span className="font-semibold">{order.orderNumber}</span></div>
                              <div className="flex justify-between text-gray-700"><span>Status:</span> <span className="font-semibold">{order.status}</span></div>
                              <div className="flex justify-between text-gray-700"><span>Order Type:</span> <span className="font-semibold">{order.orderType}</span></div>
                              <div className="flex justify-between text-gray-700"><span>Payment:</span> <span className="font-semibold">{order.paymentMethod}</span></div>
                              <div className="flex justify-between text-gray-700"><span>Date:</span> <span className="font-semibold">{formatDate(order.date)}</span></div>
                              <div className="flex justify-between text-gray-700"><span>Subtotal:</span> <span className="font-semibold">LKR {subtotal.toFixed(2)}</span></div>
                              <div className="flex justify-between text-gray-700"><span>Shipping Amount:</span> <span className="font-semibold">LKR {shipping.toFixed(2)}</span></div>

                              
                              <div className="flex justify-between text-gray-900 text-lg mt-4 border-t pt-4"><span>Total:</span> <span className="font-bold text-blue-700">LKR {total.toFixed(2)}</span></div>
                              {order && !order.customizationConfirmed && (
                                <button
                                  className="mt-6 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors font-semibold shadow"
                                  onClick={() => setShowReminderPopup(true)}
                                >
                                  Confirm Order
                                </button>
                              )}
                              <button
                                className="mt-6 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors font-semibold shadow"
                                onClick={async () => {
                                  if (!window.confirm('Are you sure you want to cancel and delete this order?')) return;
                                  try {
                                    const response = await fetch(`http://localhost:8000/api/orders/${order.id}`, { method: 'DELETE' });
                                    if (!response.ok) throw new Error('Failed to delete order');
                                    showToast('Order cancelled and deleted', 'success');
                                    setOrder(null);
                                    setShowModal(false);
                                    // Optionally, refresh prescriptions/orders list here
                                  } catch (error) {
                                    showToast('Failed to delete order', 'error');
                                  }
                                }}
                              >
                                Cancel Order
                              </button>
                            </>
                          ) : (
                            <div className="text-gray-500">No order found for this prescription.</div>
                          )}
                        </div>
                        {/* Products Right */}
                        <div className="bg-white rounded-xl p-6 flex flex-col gap-3 border border-blue-100 shadow-sm">
                          <h5 className="font-semibold text-blue-700 text-lg mb-2 flex items-center gap-2">
                            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M3 12h18M3 17h18" /></svg>
                            Products
                          </h5>
                          {orderLoading ? (
                            <div className="text-gray-500">Loading products...</div>
                          ) : order && order.items.length > 0 ? (
                            <div className="flex flex-col gap-4">
                              {order.items.map((item, idx) => (
                                <div key={item.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg shadow-sm">
                                  {item.image && (
                                    <Image
                                      src={getProductImageUrl(item.image)}
                                      alt={item.name}
                                      width={48}
                                      height={48}
                                      className="w-12 h-12 object-cover rounded-lg border"
                                    />
                                  )}
                                  <div className="flex-1">
                                    <div className="font-semibold text-gray-900">{item.name}</div>
                                    <div className="text-gray-600 flex items-center gap-2">
                                      <span>Unit Price: Rs. {item.price}</span>
                                      <span className="ml-4 flex items-center gap-1">
                                        <button
                                          className="px-2 py-1 bg-blue-100 rounded hover:bg-blue-200"
                                          onClick={() => item.quantity === 1 ? handleDeleteProduct(item.id) : handleUpdateQuantity(item.id, item.quantity - 1)}
                                          title={item.quantity === 1 ? 'Remove product' : 'Decrease quantity'}
                                          disabled={order?.customizationConfirmed}
                                        >
                                          -
                                        </button>
                                        <span className="mx-2">{item.quantity}</span>
                                        <button
                                          className="px-2 py-1 bg-blue-100 rounded hover:bg-blue-200"
                                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                          disabled={typeof item.stock === 'number' && item.quantity >= item.stock || order?.customizationConfirmed}
                                          title={typeof item.stock === 'number' && item.quantity >= item.stock ? 'Cannot exceed available stock' : 'Increase quantity'}
                                        >
                                          +
                                        </button>
                                      </span>
                                      <span className="ml-6 font-semibold text-blue-700">Total: Rs. {item.price * item.quantity}</span>
                                      {typeof item.stock === 'number' && item.quantity >= item.stock && (
                                        <span className="ml-2 text-xs text-red-500">Max stock reached</span>
                                      )}
                                    </div>
                                  </div>
                                  <button
                                    className="text-red-500 hover:text-red-700 ml-2"
                                    onClick={() => handleDeleteProduct(item.id)}
                                    title="Remove product"
                                    disabled={order?.customizationConfirmed}
                                  >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-gray-500">No products in this order.</div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
        
                </div>
              </div>
            </div>
          )}

          {/* Lightbox */}
          {showLightbox && selectedImage && (
            <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center" onClick={() => setShowLightbox(false)}>
              <div className="relative max-w-4xl max-h-[90vh]">
                <Image
                  src={selectedImage.startsWith('http') ? selectedImage : `http://localhost:8000${selectedImage}`}
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
          {showReminderPopup && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full text-center">
                <h2 className="text-xl font-semibold mb-4">Set a Reminder?</h2>
                <p className="mb-6">Do you want to set a reminder for these medicines again?</p>
                <div className="flex justify-center gap-4">
                  <button
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    onClick={() => {
                      setShowReminderPopup(false);
                      setShowDateTimePicker(true);
                    }}
                    disabled={pendingOrderConfirmation}
                  >
                    Yes
                  </button>
                  <button
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                    onClick={() => {
                      setShowReminderPopup(false);
                      setShowPaymentModal(true);
                    }}
                    disabled={pendingOrderConfirmation}
                  >
                    No
                  </button>
                </div>
              </div>
            </div>
          )}
          {showDateTimePicker && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full text-center">
                <h2 className="text-xl font-semibold mb-4">Set Reminder Date & Time</h2>
                <div className="mb-4">
                  <input
                    type="date"
                    className="border rounded px-3 py-2 w-full mb-2"
                    value={reminderDate}
                    onChange={e => setReminderDate(e.target.value)}
                  />
                  <input
                    type="time"
                    className="border rounded px-3 py-2 w-full"
                    value={reminderTime}
                    onChange={e => setReminderTime(e.target.value)}
                  />
                </div>
                <div className="flex justify-center gap-4">
                  <button
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    onClick={async () => {
                      setShowDateTimePicker(false);
                      await handleReminderResponse(true, reminderDate, reminderTime);
                    }}
                    disabled={!reminderDate || !reminderTime || pendingOrderConfirmation}
                  >
                    Set Reminder
                  </button>
                  <button
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                    onClick={() => setShowDateTimePicker(false)}
                    disabled={pendingOrderConfirmation}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
          {showPaymentModal && order && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <div className="bg-white rounded-2xl shadow-2xl p-0 max-w-3xl w-full flex flex-col md:flex-row overflow-hidden">
                {/* Left: Payment Form */}
                <div className="flex-1 p-8 flex flex-col justify-center">
                  <h2 className="text-2xl font-bold text-blue-700 mb-6 text-center md:text-left">Payment</h2>
                  <PaymentForm
                    total={order?.totalAmount || order?.total || 0}
                    shipping={order?.shipping ?? 500}
                    tax={order?.tax || 0}
                    onSuccess={handlePaymentSuccess}
                  />
                </div>
                {/* Right: Order Summary */}
                <div className="w-full md:w-96 bg-gradient-to-br from-blue-100/80 to-white/90 p-8 border-l border-blue-200 flex flex-col justify-center">
                  <h3 className="text-xl font-bold text-slate-800 mb-6 text-center md:text-left">Order Summary</h3>
                  <div className="space-y-4 mb-8 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 p-3 bg-white/80 rounded-xl shadow-sm border border-blue-50 hover:shadow-md transition-shadow">
                        <div className="relative w-12 h-12 flex-shrink-0">
                          
                           <Image
                        src={getProductImageUrl(item.image)}
                        alt={item.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover object-center group-hover:scale-105 transition-transform duration-300 rounded-lg"
                        priority={false}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/images/package.png';
                        }}
                      />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-slate-800 truncate">{item.name}</h4>
                          <p className="text-xs text-slate-600">Qty: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-blue-700">LKR {(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-white/80 rounded-2xl p-6 mb-6 border border-blue-100">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-slate-700">Subtotal</span>
                        <span className="font-semibold text-slate-800">LKR {subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-slate-700">Shipping</span>
                        <span className="font-semibold text-slate-800">LKR {shipping.toFixed(2)}</span>
                      </div>
                      {order.tax !== undefined && (
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-slate-700">Tax</span>
                          <span className="font-semibold text-slate-800">LKR {(order.tax || 0).toFixed(2)}</span>
                        </div>
                      )}
                      <div className="border-t border-slate-200 pt-3 flex justify-between items-center">
                        <span className="font-bold text-lg text-slate-800">Total</span>
                        <span className="font-bold text-2xl text-blue-700">LKR {total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-center mt-2">
                    <svg className="w-6 h-6 text-blue-400 animate-bounce mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-blue-500 font-medium">Secure card payment</span>
                  </div>
                </div>
              </div>
              <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                  width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                  background: #c7d2fe;
                  border-radius: 6px;
                }
              `}</style>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
