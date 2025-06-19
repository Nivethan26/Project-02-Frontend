"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

function isCartChanged(original: CartItem[], current: CartItem[]) {
  if (original.length !== current.length) return true;
  for (let i = 0; i < original.length; i++) {
    if (
      original[i].id !== current[i].id ||
      original[i].quantity !== current[i].quantity
    ) {
      return true;
    }
  }
  return false;
}

export default function ViewCartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [inputValues, setInputValues] = useState<{ [id: string]: string }>({});
  const [originalCartItems, setOriginalCartItems] = useState<CartItem[]>([]);
  const [coupon, setCoupon] = useState("");
  const [hasHydrated, setHasHydrated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("cart");
      if (stored) {
        const parsed = JSON.parse(stored);
        setCartItems(parsed);
        setOriginalCartItems(parsed);
        // Initialize input values
        const inputObj: { [id: string]: string } = {};
        parsed.forEach((item: CartItem) => {
          inputObj[item.id] = String(item.quantity);
        });
        setInputValues(inputObj);
      }
      setHasHydrated(true);
      // Listen for storage events (cart updates in other tabs/components)
      const handleStorage = (e: StorageEvent) => {
        if (e.key === "cart") {
          const parsed = e.newValue ? JSON.parse(e.newValue) : [];
          setCartItems(parsed);
          setOriginalCartItems(parsed);
          // Update input values
          const inputObj: { [id: string]: string } = {};
          parsed.forEach((item: CartItem) => {
            inputObj[item.id] = String(item.quantity);
          });
          setInputValues(inputObj);
        }
      };
      window.addEventListener("storage", handleStorage);
      return () => window.removeEventListener("storage", handleStorage);
    }
  }, []);

  useEffect(() => {
    if (hasHydrated) {
      sessionStorage.setItem("cart", JSON.stringify(cartItems));
    }
  }, [cartItems, hasHydrated]);

  // Keep input values in sync with cartItems
  useEffect(() => {
    const inputObj: { [id: string]: string } = {};
    cartItems.forEach((item) => {
      inputObj[item.id] = String(item.quantity);
    });
    setInputValues(inputObj);
  }, [cartItems]);

  const handleRemove = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleQuantityChange = (id: string, newQty: number) => {
    setCartItems((prev) => {
      if (newQty <= 0) return prev.filter((item) => item.id !== id);
      return prev.map((item) =>
        item.id === id ? { ...item, quantity: newQty } : item
      );
    });
  };

  const handleInputChange = (id: string, value: string) => {
    setInputValues((prev) => ({ ...prev, [id]: value }));
  };

  const handleInputBlur = (id: string) => {
    const val = parseInt(inputValues[id], 10);
    if (!isNaN(val) && val > 0) {
      handleQuantityChange(id, val);
    } else {
      // Reset to current cart quantity if invalid
      const item = cartItems.find((item) => item.id === id);
      setInputValues((prev) => ({ ...prev, [id]: item ? String(item.quantity) : "1" }));
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, id: string) => {
    if (e.key === "Enter") {
      (e.target as HTMLInputElement).blur();
    }
  };

  const handleUpdateCart = () => {
    setOriginalCartItems(cartItems);
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartChanged = isCartChanged(originalCartItems, cartItems);

  if (!hasHydrated) return null;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12 px-4">
        <div className="w-full max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-slate-800 mb-2">Shopping Cart</h1>
            <p className="text-slate-600 text-lg">Review your items and proceed to checkout</p>
          </div>

          <div className="flex flex-col lg:flex-row gap-10 items-start justify-center">
            {/* Cart Items */}
            <div className="flex-1 min-w-0">
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 p-8">
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-gradient-to-r from-[#1A5CFF] to-[#4A7CFF] rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800">Your Items</h2>
                  <span className="ml-auto px-4 py-1 bg-slate-100 rounded-full text-sm font-medium text-slate-600">
                    {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
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
                      className="px-6 py-3 bg-gradient-to-r from-[#1A5CFF] to-[#4A7CFF] text-white rounded-xl font-semibold hover:from-[#4A7CFF] hover:to-[#1A5CFF] transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                      Continue Shopping
                    </button>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {cartItems.map((item, index) => (
                      <div 
                        key={item.id} 
                        className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100 hover:shadow-xl transition-all duration-300 flex items-center gap-8"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        {/* Product Image */}
                        <div className="relative flex-shrink-0">
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="w-20 h-20 object-cover rounded-xl shadow-md" 
                          />
                          <button
                            onClick={() => handleRemove(item.id)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors duration-200 shadow-lg"
                            title="Remove"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg text-slate-800 mb-2 truncate">{item.name}</h3>
                          <p className="text-slate-600 font-medium">LKR {item.price.toFixed(2)}</p>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-3">
                          <div className="flex items-center bg-slate-50 rounded-xl p-1">
                            <button
                              className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors duration-200 font-bold shadow-sm"
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                              aria-label="Decrease quantity"
                            >
                              -
                            </button>
                            <input
                              type="text"
                              value={inputValues[item.id] ?? ''}
                              onChange={e => handleInputChange(item.id, e.target.value.replace(/[^0-9]/g, ''))}
                              onBlur={() => handleInputBlur(item.id)}
                              onKeyDown={e => handleInputKeyDown(e, item.id)}
                              className="w-16 text-center border-0 bg-transparent focus:outline-none text-base font-semibold text-slate-800 quantity-input"
                              style={{ minWidth: 0 }}
                            />
                            <button
                              className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors duration-200 font-bold shadow-sm"
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              aria-label="Increase quantity"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Subtotal */}
                        <div className="text-right min-w-[120px] flex flex-col items-end">
                          <p className="font-bold text-lg text-slate-800">LKR {(item.price * item.quantity).toFixed(2)}</p>
                          <p className="text-sm text-slate-500">Qty: {item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Update Cart Button */}
                {cartItems.length > 0 && (
                  <div className="flex justify-end mt-10">
                    <button
                      className={`px-8 py-4 rounded-2xl font-bold transition-all duration-500 transform hover:scale-105 shadow-2xl hover:shadow-3xl backdrop-blur-md border border-white/20 relative overflow-hidden group ${
                        cartChanged
                          ? 'bg-gradient-to-r from-[#1A5CFF] via-[#4A7CFF] to-[#1A5CFF] text-white hover:from-[#4A7CFF] hover:via-[#1A5CFF] hover:to-[#4A7CFF]'
                          : 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-500 font-normal cursor-not-allowed'
                      }`}
                      disabled={!cartChanged}
                      onClick={handleUpdateCart}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                      <span className="relative z-10 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Update Cart
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:w-96 flex-shrink-0">
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 h-fit border border-white/50 sticky top-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">Order Summary</h3>
                </div>

                <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-6 mb-6 border border-slate-200/50">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-slate-700">Subtotal</span>
                      <span className="font-semibold text-slate-800 text-lg">LKR {subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="font-medium text-slate-700">Shipping</span>
                      <span className="text-slate-500 text-sm text-right max-w-[120px]">
                        Calculated at checkout
                      </span>
                    </div>
                    <div className="border-t border-slate-200 pt-4">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-lg text-slate-800">Total</span>
                        <span className="font-bold text-xl text-slate-900">LKR {subtotal.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  className="w-full bg-gradient-to-r from-[#1A5CFF] via-[#4A7CFF] to-[#1A5CFF] text-white py-4 rounded-2xl font-bold text-lg hover:from-[#4A7CFF] hover:via-[#1A5CFF] hover:to-[#4A7CFF] transition-all duration-500 transform hover:scale-105 shadow-2xl hover:shadow-3xl backdrop-blur-md border border-white/20 relative overflow-hidden group"
                  onClick={() => router.push("/checkout")}
                  disabled={cartItems.length === 0}
                  style={cartItems.length === 0 ? { 
                    background: 'linear-gradient(to right, #9ca3af, #6b7280, #9ca3af)', 
                    cursor: 'not-allowed', 
                    transform: 'none',
                    boxShadow: 'none',
                    opacity: 0.6
                  } : {}}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    Proceed to Checkout
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      <style jsx global>{`
        /* Chrome, Safari, Edge, Opera */
        .quantity-input::-webkit-outer-spin-button,
        .quantity-input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        /* Firefox */
        .quantity-input {
          -moz-appearance: textfield;
        }
      `}</style>
    </>
  );
} 