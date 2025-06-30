/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { FiSearch, FiMail, FiUser, FiPhone, FiClock, FiMessageSquare, FiEye, FiEyeOff, FiTrash2 } from 'react-icons/fi';

type ContactMessage = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  createdAt: string;
  isRead?: boolean;
};

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'unread' | 'read'>('all');

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const token = sessionStorage.getItem('token');
        if (!token) {
          setError('Authentication token not found. Please login again.');
          setLoading(false);
          return;
        }
        const res = await fetch("http://localhost:8000/api/admin/messages", {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (!res.ok) throw new Error("Failed to fetch messages");
        const data = await res.json();
        setMessages(data);
      } catch (err: any) {
        console.error("Fetch error:", err);
        setError("Failed to load messages. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  const filteredMessages = messages.filter(msg => {
    const matchesSearch = 
      msg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      filterStatus === 'all' || 
      (filterStatus === 'unread' && !msg.isRead) ||
      (filterStatus === 'read' && msg.isRead);

    return matchesSearch && matchesStatus;
  });

  const markMessageAsRead = async (messageId: string) => {
    try {
      const token = sessionStorage.getItem('token');
      const res = await fetch(`http://localhost:8000/api/contact/admin/notifications/${messageId}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (res.ok) {
        setMessages(prev => prev.map(msg => 
          msg._id === messageId ? { ...msg, isRead: true } : msg
        ));
      }
    } catch (err) {
      console.error("Error marking message as read:", err);
    }
  };

  const handleMessageClick = (message: ContactMessage) => {
    setSelectedMessage(message);
    setShowMessageModal(true);
    // Mark as read if not already read
    if (!message.isRead) {
      markMessageAsRead(message._id);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      try {
        const token = sessionStorage.getItem('token');
        const res = await fetch(`http://localhost:8000/api/admin/messages/${messageId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (res.ok) {
          setMessages(prev => prev.filter(msg => msg._id !== messageId));
        }
      } catch (err) {
        console.error("Delete error:", err);
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const unreadCount = messages.filter(msg => !msg.isRead).length;

  return (
    <ProtectedRoute role="admin">
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar role="admin" />
        <main className="flex-1 ml-64 p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Contact Messages</h1>
                  <p className="text-gray-600 mt-1">Manage customer inquiries and feedback</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg border border-blue-200">
                    <span className="font-semibold">{unreadCount}</span> unread messages
                  </div>
                </div>
              </div>

              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search messages by name, email, or content..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <select
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as 'all' | 'unread' | 'read')}
                >
                  <option value="all">All Messages</option>
                  <option value="unread">Unread Only</option>
                  <option value="read">Read Only</option>
                </select>
              </div>
            </div>

            {/* Messages Grid */}
            {loading ? (
              <div className="bg-white rounded-xl shadow-sm p-8">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600">Loading messages...</span>
                </div>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error loading messages</h3>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            ) : filteredMessages.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiMessageSquare className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No messages found</h3>
                <p className="text-gray-600">
                  {searchTerm || filterStatus !== 'all' 
                    ? 'Try adjusting your search or filter criteria.' 
                    : 'You\'re all caught up! No new messages at the moment.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredMessages.map((msg) => (
                  <div
                    key={msg._id}
                    className={`bg-white rounded-xl shadow-sm border-2 transition-all duration-200 hover:shadow-md cursor-pointer ${
                      msg.isRead ? 'border-gray-100' : 'border-blue-200 bg-blue-50'
                    }`}
                    onClick={() => handleMessageClick(msg)}
                  >
                    <div className="p-6">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            msg.isRead ? 'bg-gray-100' : 'bg-blue-100'
                          }`}>
                            <FiUser className={`w-5 h-5 ${msg.isRead ? 'text-gray-600' : 'text-blue-600'}`} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{msg.name}</h3>
                            <p className="text-sm text-gray-500">{msg.email}</p>
                          </div>
                        </div>
                        {!msg.isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>

                      {/* Message Preview */}
                      <div className="mb-4">
                        <p className="text-gray-700 line-clamp-3 text-sm">
                          {msg.message.length > 150 
                            ? `${msg.message.substring(0, 150)}...` 
                            : msg.message
                          }
                        </p>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <FiClock className="w-3 h-3" />
                            <span>{formatDate(msg.createdAt)}</span>
                          </div>
                          {msg.phone && (
                            <div className="flex items-center gap-1">
                              <FiPhone className="w-3 h-3" />
                              <span>{msg.phone}</span>
                            </div>
                          )}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteMessage(msg._id);
                          }}
                          className="text-red-500 hover:text-red-700 transition-colors"
                          title="Delete message"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Message Detail Modal */}
          {showMessageModal && selectedMessage && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'linear-gradient(120deg, rgba(37,99,235,0.7) 0%, rgba(255,255,255,0.7) 100%)' }}>
              <div className="relative max-w-2xl w-full mx-auto rounded-2xl shadow-2xl bg-white" style={{ borderTop: '6px solid #2563eb' }}>
                {/* Blue accent bar */}
                <div className="w-full h-2 rounded-t-2xl" style={{ background: 'linear-gradient(90deg, #2563eb 0%, #60a5fa 100%)' }} />
                <div className="p-6 sm:p-8">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <FiUser className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{selectedMessage.name}</h3>
                        <p className="text-gray-600">{selectedMessage.email}</p>
                        {selectedMessage.phone && (
                          <p className="text-gray-600 flex items-center gap-1">
                            <FiPhone className="w-4 h-4" />
                            {selectedMessage.phone}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => setShowMessageModal(false)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Message Content */}
                  <div className="bg-gray-50 rounded-xl p-6 mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <FiMessageSquare className="w-5 h-5 text-blue-600" />
                      Message
                    </h4>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {selectedMessage.message}
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <FiClock className="w-4 h-4" />
                      <span>Sent on {new Date(selectedMessage.createdAt).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedMessage.isRead ? (
                        <span className="flex items-center gap-1 text-green-600">
                          <FiEye className="w-4 h-4" />
                          Read
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-blue-600">
                          <FiEyeOff className="w-4 h-4" />
                          Unread
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                    <button
                      onClick={() => setShowMessageModal(false)}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-200 font-semibold transition-colors"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => {
                        handleDeleteMessage(selectedMessage._id);
                        setShowMessageModal(false);
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 font-semibold transition-colors"
                    >
                      Delete Message
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
