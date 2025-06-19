"use client";
import { useRouter } from "next/navigation";
import { useCart } from '@/context/CartContext';
import { useEffect, useState } from 'react';

export default function ViewCartPage() {
  const { cartItems: contextCartItems, removeFromCart, updateQuantity } = useCart();
  const [cartItems, setCartItems] = useState(contextCartItems);
  const [hasHydrated, setHasHydrated] = useState(false);
  const router = useRouter();

  // On mount and when contextCartItems changes, update cartItems based on login state
  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = sessionStorage.getItem("token");
      if (token) {
        setCartItems(contextCartItems);
      } else {
        const stored = sessionStorage.getItem("cart");
        setCartItems(stored ? JSON.parse(stored) : []);
      }
      setHasHydrated(true);
    }
  }, [contextCartItems]);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (!hasHydrated) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f7fafd] to-[#e9f0fa] py-12 px-2 md:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-slate-800 mb-2">Shopping Cart</h1>
        <p className="text-center text-slate-500 mb-10 text-lg">Review your items and proceed to checkout</p>
        <div className="flex flex-col md:flex-row gap-8 items-start justify-center">
          {/* Left: Cart Items */}
          <div className="flex-1 w-full max-w-2xl">
            <div className="bg-white rounded-3xl shadow-2xl p-8 mb-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-blue-600 text-white rounded-xl p-3 flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7V6a4 4 0 014-4h10a4 4 0 014 4v1" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18v13a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-slate-800">Your Items</h2>
                <span className="ml-auto px-4 py-1 bg-slate-100 rounded-full text-sm font-medium text-slate-600">
                  {cartItems.length} {cartItems.length === 1 ? "item" : "items"}
                </span>
              </div>
              {cartItems.length === 0 ? (
                <div className="text-center py-16 flex flex-col items-center justify-center">
                  <div className="w-24 h-24 mb-6 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full flex items-center justify-center">
                    <svg className="w-12 h-12 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-700 mb-2">Your cart is empty</h3>
                  <p className="text-slate-500 mb-6">Add some products to get started</p>
                  <button
                    onClick={() => router.push('/products')}
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <div>
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center bg-white rounded-2xl shadow p-4 mb-6"
                    >
                      <div className="relative w-20 h-20 flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-20 h-20 object-cover rounded-xl border"
                        />
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors duration-200 shadow-lg"
                          title="Remove"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      <div className="flex-1 min-w-0 ml-6">
                        <h3 className="font-semibold text-lg text-slate-800 mb-1">{item.name}</h3>
                        <p className="text-slate-600 font-medium mb-2">LKR {item.price.toFixed(2)}</p>
                        <div className="flex items-center gap-2">
                          <button
                            className="w-10 h-10 bg-white border rounded-lg flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors duration-200 font-bold text-xl"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            -
                          </button>
                          <span className="px-4 py-2 bg-slate-50 border rounded-lg font-semibold text-slate-800 text-lg">
                            {item.quantity}
                          </span>
                          <button
                            className="w-10 h-10 bg-white border rounded-lg flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors duration-200 font-bold text-xl"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-col items-end ml-6">
                        <span className="text-lg font-bold text-slate-800 mb-1">LKR {(item.price * item.quantity).toFixed(2)}</span>
                        <span className="text-slate-400 text-sm">Qty: {item.quantity}</span>
                      </div>
                    </div>
                  ))}
                  <button
                    className="w-full mt-2 py-3 rounded-xl font-semibold bg-gray-200 text-gray-500 flex items-center justify-center gap-2 cursor-not-allowed"
                    disabled
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Update Cart
                  </button>
                </div>
              )}
            </div>
          </div>
          {/* Right: Order Summary */}
          <div className="w-full md:w-96 flex-shrink-0">
            <div className="bg-white rounded-3xl shadow-2xl p-8 sticky top-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-emerald-500 text-white rounded-xl p-3 flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2a4 4 0 014-4h4" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v2a4 4 0 004 4h4" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-800">Order Summary</h3>
              </div>
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-6 mb-6 border border-slate-200/50">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-medium text-slate-700">Subtotal</span>
                  <span className="font-semibold text-slate-800 text-lg">LKR {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <span className="font-medium text-slate-700">Shipping</span>
                  <span className="text-slate-500 text-sm">Calculated at checkout</span>
                </div>
                <div className="border-t border-slate-200 pt-4 flex justify-between items-center">
                  <span className="font-bold text-lg text-slate-800">Total</span>
                  <span className="font-bold text-xl text-slate-900">LKR {subtotal.toFixed(2)}</span>
                </div>
              </div>
              <button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300 transform hover:scale-105 shadow-lg"
                // onClick={handleCheckout}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 