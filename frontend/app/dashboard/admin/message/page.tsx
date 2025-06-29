"use client";
import React, { useEffect, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

type ContactMessage = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  createdAt: string;
};

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  return (
    <ProtectedRoute role="admin">
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar role="admin" />
        <main className="flex-1 ml-64 p-8">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              Contact Messages
            </h1>
            <div className="bg-white rounded-lg shadow p-6">
              {loading ? (
                <p className="text-gray-600">Loading messages...</p>
              ) : error ? (
                <p className="text-red-600">{error}</p>
              ) : messages.length === 0 ? (
                <p className="text-gray-600">No messages found.</p>
              ) : (
                <ul className="space-y-6">
                  {messages.map((msg) => (
                    <li key={msg._id} className="border-b pb-4">
                      <div className="font-semibold text-lg text-gray-800">
                        {msg.name}
                        <span className="text-sm text-gray-500 ml-2">
                          ({msg.email}{msg.phone ? `, ${msg.phone}` : ""})
                        </span>
                      </div>
                      <div className="text-gray-700 mt-2">{msg.message}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        Sent on: {new Date(msg.createdAt).toLocaleString()}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
