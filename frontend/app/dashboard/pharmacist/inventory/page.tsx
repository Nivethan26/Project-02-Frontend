/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
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
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStockLevel, setSelectedStockLevel] = useState('all');

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

  // Get unique categories for filter
  const categories = Array.from(new Set(inventory.map(item => item.category)));

  // Filter inventory based on search and filters
  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    
    const matchesStockLevel = selectedStockLevel === 'all' || 
      (selectedStockLevel === 'out-of-stock' && item.stock === 0) ||
      (selectedStockLevel === 'low-stock' && item.stock > 0 && item.stock <= 10) ||
      (selectedStockLevel === 'in-stock' && item.stock > 10);
    
    return matchesSearch && matchesCategory && matchesStockLevel;
  });

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

        {/* Out of Stock Warning */}
        {inventory.filter(item => item.stock === 0).length > 0 && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Out of Stock Alert
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>
                    {inventory.filter(item => item.stock === 0).length} item(s) are currently out of stock and need immediate attention.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6">
          {/* Stock Summary */}
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-gray-900">Stock Overview</h3>
              {filteredInventory.length !== inventory.length && (
                <span className="text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                  Showing {filteredInventory.length} of {inventory.length} items
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {filteredInventory.filter(item => item.stock > 10).length}
                </div>
                <div className="text-sm text-gray-600">In Stock</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {filteredInventory.filter(item => item.stock > 0 && item.stock <= 10).length}
                </div>
                <div className="text-sm text-gray-600">Low Stock</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {filteredInventory.filter(item => item.stock === 0).length}
                </div>
                <div className="text-sm text-gray-600">Out of Stock</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {filteredInventory.length}
                </div>
                <div className="text-sm text-gray-600">Total Items</div>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Available Items</h2>
            <div className="flex items-center space-x-4">
              {/* Color Legend */}
              <div className="flex items-center space-x-3 text-xs">
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
                  <span className="text-gray-600">In Stock</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-yellow-100 border border-yellow-300 rounded"></div>
                  <span className="text-gray-600">Low Stock</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-red-100 border border-red-300 rounded"></div>
                  <span className="text-gray-600">Out of Stock</span>
                </div>
              </div>
              <span className="text-sm text-gray-500">Total: {filteredInventory.length} items</span>
            </div>
          </div>

          {/* Search and Filter Section */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search Bar */}
              <div className="md:col-span-2">
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                  Search Items
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="search"
                    placeholder="Search by name, description, or category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  id="category"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Stock Level Filter */}
              <div>
                <label htmlFor="stockLevel" className="block text-sm font-medium text-gray-700 mb-1">
                  Stock Level
                </label>
                <select
                  id="stockLevel"
                  value={selectedStockLevel}
                  onChange={(e) => setSelectedStockLevel(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Stock Levels</option>
                  <option value="in-stock">In Stock</option>
                  <option value="low-stock">Low Stock</option>
                  <option value="out-of-stock">Out of Stock</option>
                </select>
              </div>
            </div>

            {/* Clear Filters Button */}
            {(searchTerm || selectedCategory !== 'all' || selectedStockLevel !== 'all') && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                    setSelectedStockLevel('all');
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  Clear Filters
                </button>
              </div>
            )}
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
                {filteredInventory.map((item) => {
                  // Determine stock level and styling
                  const isOutOfStock = item.stock === 0;
                  const isLowStock = item.stock > 0 && item.stock <= 10;
                  const isInStock = item.stock > 10;
                  
                  return (
                    <tr key={item._id} className={`${
                      isOutOfStock ? 'bg-red-50 hover:bg-red-100' : 
                      isLowStock ? 'bg-yellow-50 hover:bg-yellow-100' : 
                      'hover:bg-gray-50'
                    } transition-colors duration-200`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <img 
                          src={item.image || '/placeholder.png'} 
                          alt={item.name}
                          className={`h-12 w-12 object-cover rounded ${
                            isOutOfStock ? 'opacity-50' : ''
                          }`}
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
                        <div className="flex items-center space-x-2">
                          <div className={`text-sm font-bold ${
                            isOutOfStock ? 'text-red-600' : 
                            isLowStock ? 'text-yellow-600' : 
                            'text-green-600'
                          }`}>
                            {item.stock}
                          </div>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            isOutOfStock ? 'bg-red-100 text-red-800' : 
                            isLowStock ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-green-100 text-green-800'
                          }`}>
                            {isOutOfStock ? 'OUT OF STOCK' : 
                             isLowStock ? 'LOW STOCK' : 
                             'IN STOCK'}
                          </span>
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
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredInventory.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No inventory items found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 