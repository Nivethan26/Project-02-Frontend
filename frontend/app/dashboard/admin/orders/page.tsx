"use client";
import { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { FiSearch, FiEye, FiCheck, FiX } from 'react-icons/fi';

interface Order {
  id: string;
  customerName: string;
  date: string;
  total: number;
  status: 'pending' | 'completed' | 'cancelled' | 'processing';
  items: number;
  paymentMethod: string;
}

// Mock data - replace with actual API calls
const mockOrders: Order[] = [
  {
    id: "ORD001",
    customerName: "John Doe",
    date: "2024-03-15",
    total: 299.99,
    status: "pending",
    items: 3,
    paymentMethod: "Credit Card"
  },
  {
    id: "ORD002",
    customerName: "Jane Smith",
    date: "2024-03-14",
    total: 149.50,
    status: "completed",
    items: 2,
    paymentMethod: "PayPal"
  },
  // Add more mock orders as needed
];

const statusColors: Record<Order['status'], string> = {
  pending: "bg-yellow-100 text-yellow-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  processing: "bg-blue-100 text-blue-800"
};

export default function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<Order['status'] | 'all'>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState<Order['status']>('pending');
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'approve' | 'cancel' | null>(null);
  const [confirmMessage, setConfirmMessage] = useState('');

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleUpdateStatus = () => {
    if (!selectedOrder) return;
    setOrders(prev => prev.map(order => order.id === selectedOrder.id ? { ...order, status: newStatus } : order));
    setSelectedOrder(selectedOrder ? { ...selectedOrder, status: newStatus } : null);
    setShowStatusModal(false);
  };

  const handleApproveOrder = (order: Order) => {
    setSelectedOrder(order);
    setConfirmAction('approve');
    setConfirmMessage('Are you sure you want to approve this order?');
    setShowConfirmModal(true);
  };

  const handleCancelOrder = (order: Order) => {
    setSelectedOrder(order);
    setConfirmAction('cancel');
    setConfirmMessage('Are you sure you want to cancel this order?');
    setShowConfirmModal(true);
  };

  const handleConfirmAction = () => {
    if (!selectedOrder) return;

    const newStatus = confirmAction === 'approve' ? 'completed' : 'cancelled';
    setOrders(prev => prev.map(order => 
      order.id === selectedOrder.id ? { ...order, status: newStatus } : order
    ));
    setShowConfirmModal(false);
    setConfirmAction(null);
    setSelectedOrder(null);
  };

  return (
    <ProtectedRoute role="admin">
      <div className="flex h-screen bg-gray-50">
        <div className="fixed inset-y-0 left-0 w-64">
          <Sidebar role="admin" />
        </div>
        <main className="flex-1 ml-64 p-8 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <div className="relative w-full sm:w-64">
                  <input
                    type="text"
                    placeholder="Search orders..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <FiSearch className="absolute left-3 top-3 text-gray-400" />
                </div>
                <select
                  className="w-full sm:w-48 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as Order['status'] | 'all')}
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="processing">Processing</option>
                </select>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.customerName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.date}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${order.total.toFixed(2)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[order.status]}`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.items}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-2">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="p-2 rounded-full hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-300"
                            aria-label="View order"
                          >
                            <FiEye className="text-blue-600 w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleApproveOrder(order)}
                            className="p-2 rounded-full hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-300"
                            aria-label="Approve order"
                          >
                            <FiCheck className="text-green-600 w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleCancelOrder(order)}
                            className="p-2 rounded-full hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-300"
                            aria-label="Cancel order"
                          >
                            <FiX className="text-red-600 w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Order Details Modal */}
            {selectedOrder && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Order Details - {selectedOrder.id}</h2>
                    <button
                      onClick={() => setSelectedOrder(null)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <FiX className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Customer Name</p>
                        <p className="font-medium">{selectedOrder.customerName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Order Date</p>
                        <p className="font-medium">{selectedOrder.date}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Total Amount</p>
                        <p className="font-medium">${selectedOrder.total.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Payment Method</p>
                        <p className="font-medium">{selectedOrder.paymentMethod}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Status</p>
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[selectedOrder.status]}`}>
                          {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    <div className="border-t pt-4">
                      <h3 className="font-medium mb-2">Order Items</h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-500">Item details will be displayed here</p>
                      </div>
                    </div>
                    <div className="flex justify-end gap-4 mt-6">
                      <button
                        onClick={() => setSelectedOrder(null)}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                      >
                        Close
                      </button>
                      <button
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        onClick={() => {
                          setNewStatus(selectedOrder.status);
                          setShowStatusModal(true);
                        }}
                      >
                        Update Status
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Update Status Modal */}
            {showStatusModal && selectedOrder && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold">Update Order Status</h2>
                    <button
                      onClick={() => setShowStatusModal(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <FiX className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select new status:</label>
                    <select
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={newStatus}
                      onChange={e => setNewStatus(e.target.value as Order['status'])}
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div className="flex justify-end gap-4">
                    <button
                      onClick={() => setShowStatusModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUpdateStatus}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Update
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Confirmation Modal */}
            {showConfirmModal && selectedOrder && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold">
                      {confirmAction === 'approve' ? 'Approve Order' : 'Cancel Order'}
                    </h2>
                    <button
                      onClick={() => {
                        setShowConfirmModal(false);
                        setConfirmAction(null);
                      }}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <FiX className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="mb-4">
                    <p className="text-gray-700">{confirmMessage}</p>
                  </div>
                  <div className="flex justify-end gap-4">
                    <button
                      onClick={() => {
                        setShowConfirmModal(false);
                        setConfirmAction(null);
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      No, Cancel
                    </button>
                    <button
                      onClick={handleConfirmAction}
                      className={`px-4 py-2 text-white rounded-lg ${
                        confirmAction === 'approve' 
                          ? 'bg-green-600 hover:bg-green-700' 
                          : 'bg-red-600 hover:bg-red-700'
                      }`}
                    >
                      Yes, {confirmAction === 'approve' ? 'Approve' : 'Cancel'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
} 