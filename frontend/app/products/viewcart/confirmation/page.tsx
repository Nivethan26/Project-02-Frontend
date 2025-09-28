/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import Loader from '@/components/Loader';

interface OrderConfirmationData {
  orderNumber: string;
  orderId: string;
  total: number;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
  }>;
  customer: {
    name: string;
    email: string;
    phone: string;
    billingAddress: string;
    city: string;
    postalCode: string;
  };
  paymentMethod: string;
  estimatedDelivery: string;
}

export default function OrderConfirmationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  useCart();
  const [orderData, setOrderData] = useState<OrderConfirmationData | null>(null);
  const [loading, setLoading] = useState(true);

  // Function to validate and get safe image URL
  const getSafeImageUrl = (imageUrl: string | null | undefined): string => {
    if (!imageUrl || imageUrl.trim() === '') {
      return '/images/package.png';
    }
    try {
      if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        new URL(imageUrl);
        return imageUrl;
      }
      if (imageUrl.startsWith('/')) {
        return imageUrl;
      }
      return `/${imageUrl}`;
    } catch {
      console.warn('Invalid image URL:', imageUrl);
      return '/images/package.png';
    }
  };

  // Function to get the correct image URL for products
  const getProductImage = (item: { image?: string }) => {
    const imagePath = item.image;
    if (!imagePath) {
      return '/images/package.png';
    }
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    const filename = imagePath.replace(/\\/g, '/').split('/').pop();
    const fullUrl = `http://localhost:8000/uploads/products/${filename}`;
    return fullUrl;
  };

  // Calculate estimated delivery date (2-3 weekdays from now)
  const calculateEstimatedDelivery = () => {
    const today = new Date();
    const deliveryDays = Math.floor(Math.random() * 2) + 2; // 2-3 days
    const deliveryDate = new Date(today);
    
    let addedDays = 0;
    while (addedDays < deliveryDays) {
      deliveryDate.setDate(deliveryDate.getDate() + 1);
      // Skip weekends (Saturday = 6, Sunday = 0)
      if (deliveryDate.getDay() !== 0 && deliveryDate.getDay() !== 6) {
        addedDays++;
      }
    }
    
    return deliveryDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  useEffect(() => {
    console.log('=== CONFIRMATION PAGE USE EFFECT ===');
    
    const loadOrderData = async () => {
      // Get order data from session storage or URL params
      const orderDataFromStorage = sessionStorage.getItem('orderConfirmationData');
      const orderId = searchParams.get('orderId');
      
      console.log('Order data from storage:', orderDataFromStorage);
      console.log('Order ID from URL:', orderId);
      
      if (orderDataFromStorage) {
        try {
          const parsedData = JSON.parse(orderDataFromStorage);
          console.log('Parsed order data:', parsedData);
          // Update order status to confirmed if not already
          if (parsedData.orderId) {
            try {
              await fetch(`http://localhost:8000/api/orders/${parsedData.orderId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'confirmed' })
              });
            } catch (err) {
              console.error('Failed to update order status to confirmed:', err);
            }
          }
          setOrderData({
            ...parsedData,
            estimatedDelivery: calculateEstimatedDelivery()
          });
          setLoading(false);
        } catch {
          console.error('Error parsing order data:');
          setLoading(false);
          router.push('/products');
        }
      } else if (orderId) {
        // If we have orderId but no stored data, redirect to orders page
        console.log('No stored data but orderId found, redirecting to orders');
        setLoading(false);
        router.push('/dashboard/customer/orders');
      } else {
        // No order data, redirect to products
        console.log('No order data found, redirecting to products');
        setLoading(false);
        router.push('/products');
      }
    };
    
    // Add a small delay to ensure proper loading
    const timer = setTimeout(loadOrderData, 100);
    
    return () => clearTimeout(timer);
  }, [router, searchParams]);

  const handleViewOrders = () => {
    // Clear the order data from session storage
    sessionStorage.removeItem('orderConfirmationData');
    router.push('/dashboard/customer/orders');
  };

  const handleContinueShopping = () => {
    // Clear the order data from session storage
    sessionStorage.removeItem('orderConfirmationData');
    router.push('/products');
  };

  if (loading) {
    return <Loader />;
  }

  if (!orderData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Order not found</h1>
          <p className="text-gray-600 mb-6">Please check your order history or contact support.</p>
          <button
            onClick={() => router.push('/dashboard/customer/orders')}
            className="px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-all duration-300"
          >
            View Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-blue-50 py-12 px-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Success Header with enhanced animations */}
        <div className="text-center mb-16">
          <div className="relative">
            {/* Animated success circle */}
            <div className="w-32 h-32 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce shadow-2xl">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-green-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            
            {/* Floating particles */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-4 h-4 bg-yellow-400 rounded-full animate-ping"></div>
            </div>
            <div className="absolute top-4 right-1/4 w-3 h-3 bg-pink-400 rounded-full animate-ping animation-delay-1000"></div>
            <div className="absolute top-8 left-1/4 w-2 h-2 bg-blue-400 rounded-full animate-ping animation-delay-2000"></div>
          </div>
          
          <h1 className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-700 mb-4 animate-fade-in">
            Order Confirmed!
          </h1>
          <p className="text-2xl text-green-700 mb-3 font-medium animate-fade-in animation-delay-300">
            Thank you for your purchase
          </p>
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/80 backdrop-blur-sm rounded-full shadow-lg animate-fade-in animation-delay-500">
            <span className="text-green-600 font-semibold">Order #{orderData.orderNumber}</span>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Order Summary with enhanced design */}
          <div className="lg:col-span-2">
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-10 mb-8 border border-white/20 animate-fade-in animation-delay-600">
              <div className="flex items-center gap-4 mb-8">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl p-4 shadow-lg">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-800">Order Summary</h2>
                  <p className="text-gray-600">Your order details and items</p>
                </div>
              </div>

              {/* Order Items with enhanced styling */}
              <div className="space-y-6 mb-8">
                {orderData.items.map((item, index) => (
                  <div 
                    key={item.id} 
                    className="flex items-center gap-6 p-6 bg-gradient-to-r from-gray-50 to-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 transform hover:scale-[1.02] animate-fade-in"
                    style={{ animationDelay: `${700 + index * 100}ms` }}
                  >
                    <div className="relative w-20 h-20 flex-shrink-0">
                    <Image
                          src={getProductImage(item)}
                          alt={item.name}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
                          priority={index < 4} // Prioritize loading for the first few images
                        />
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        {item.quantity}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-800 text-lg mb-1">{item.name}</h3>
                      <p className="text-gray-600">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-2xl text-blue-600">LKR {(item.price * item.quantity).toFixed(2)}</p>
                      <p className="text-sm text-gray-500">LKR {item.price.toFixed(2)} each</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Details with enhanced layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
                  <h3 className="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Order Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">Order Number:</span>
                      <span className="font-bold text-gray-800 bg-white px-3 py-1 rounded-lg">#{orderData.orderNumber}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">Payment Method:</span>
                      <span className="font-semibold text-gray-800">{orderData.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">Total Amount:</span>
                      <span className="font-bold text-2xl text-blue-600">LKR {orderData.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200">
                  <h3 className="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    Delivery Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">Estimated Delivery:</span>
                      <span className="font-bold text-green-600 bg-white px-3 py-1 rounded-lg">{orderData.estimatedDelivery}</span>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="text-gray-600 font-medium">Delivery Address:</span>
                      <span className="font-semibold text-gray-800 text-right bg-white px-3 py-2 rounded-lg max-w-[200px]">{orderData.customer.billingAddress}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Status & Actions with enhanced design */}
          <div className="lg:col-span-1">
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 sticky top-8 border border-white/20 animate-fade-in animation-delay-800">
              {/* Delivery Status with enhanced timeline */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-2xl p-3 shadow-lg">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">Delivery Status</h3>
                </div>
                
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-800">Order Confirmed</p>
                      <p className="text-sm text-gray-600">Payment received successfully</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-800">Processing</p>
                      <p className="text-sm text-gray-600">Preparing your order</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 opacity-50">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-600">Shipped</p>
                      <p className="text-sm text-gray-500">On its way to you</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 opacity-50">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-600">Delivered</p>
                      <p className="text-sm text-gray-500">Arrived at your door</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Estimated Delivery with enhanced design */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-6 mb-8 border border-green-200 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <h4 className="font-bold text-green-800 text-lg">Estimated Delivery</h4>
                </div>
                <p className="text-green-700 font-bold text-lg mb-2">{orderData.estimatedDelivery}</p>
                <p className="text-sm text-green-600">Your order will be delivered within 2-3 weekdays</p>
              </div>

              {/* Action Buttons with enhanced styling */}
              <div className="space-y-4">
                <button
                  onClick={handleViewOrders}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  View All Orders
                </button>
                <button
                  onClick={handleContinueShopping}
                  className="w-full bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-800 py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  Continue Shopping
                </button>
              </div>

              {/* Contact Info with enhanced design */}
              <div className="mt-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
                <div className="text-center">
                  <svg className="w-8 h-8 text-blue-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <p className="text-sm text-gray-700 font-medium mb-2">Need help?</p>
                  <a href="mailto:support@pharmacy.com" className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-colors">
                    support@pharmacy.com
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced CSS animations */}
      <style jsx global>{`
        .animate-fade-in {
          animation: fadeIn 0.8s ease-out forwards;
          opacity: 0;
        }
        
        .animation-delay-300 {
          animation-delay: 300ms;
        }
        
        .animation-delay-500 {
          animation-delay: 500ms;
        }
        
        .animation-delay-600 {
          animation-delay: 600ms;
        }
        
        .animation-delay-800 {
          animation-delay: 800ms;
        }
        
        .animation-delay-1000 {
          animation-delay: 1000ms;
        }
        
        .animation-delay-2000 {
          animation-delay: 2000ms;
        }
        
        .animation-delay-4000 {
          animation-delay: 4000ms;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
      `}</style>
    </div>
  );
} 