'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import axios from 'axios';
import Sidebar from '@/components/layout/Sidebar';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
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

export default function PharmacistInventoryPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in and is pharmacist
    const storedUser = sessionStorage.getItem('user');
    if (!storedUser) {
      router.push('/login');
      return;
    }

    const userData = JSON.parse(storedUser);
    if (userData.role !== 'pharmacist') {
      toast.error('Unauthorized access');
      router.push('/login');
      return;
    }

    setUser(userData);
    fetchInventory();
  }, [router]);

  const fetchInventory = async () => {
    try {
      const token = sessionStorage.getItem('token');
      if (!token) {
        toast.error('Authentication token not found');
        router.push('/login');
        return;
      }

      const response = await axios.get('http://localhost:8000/api/staff/inventory', {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setInventory(response.data);
    } catch (error: any) {
      console.error('Fetch error:', error);
      console.error('Error response:', error.response);
      
      if (error.response?.status === 401) {
        toast.error('Authentication failed. Please login again.');
        router.push('/login');
        return;
      }
      
      toast.error('Failed to fetch inventory');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Sidebar role="pharmacist" />
        <div className="ml-64 p-8">
          <div>Loading inventory...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar role="pharmacist" />
      
      {/* Main Content */}
      <div className="ml-64 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Inventory View</h1>
          <p className="text-gray-600">View available inventory items (Read-only access)</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Available Items</h2>
            <span className="text-sm text-gray-500">Total: {inventory.length} items</span>
          </div>

          {/* Inventory List */}
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Image
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prescription
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {inventory.map((item) => (
                  <tr key={item._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <img 
                        src={item.image || '/placeholder.png'} 
                        alt={item.name}
                        className="h-12 w-12 object-cover rounded"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{item.name}</div>
                      <div className="text-sm text-gray-500">{item.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 capitalize">{item.category}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">Rs.{item.price}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${
                        item.stock > 10 ? 'text-green-900' : 
                        item.stock > 0 ? 'text-yellow-900' : 'text-red-900'
                      }`}>
                        {item.stock}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        item.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        item.prescription === 'required' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {item.prescription === 'required' ? 'Prescription Required' : 'No Prescription'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {inventory.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No inventory items found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 