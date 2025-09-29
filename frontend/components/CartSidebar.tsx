/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image?: string;
  images?: string[];
  quantity: number;
}

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

// Helper to build product image URL
function getProductImage(item: { image?: string; images?: string[] }) {
  const imagePath =
    item.images && item.images.length > 0 ? item.images[0] : item.image;
  if (!imagePath) return "/placeholder.png";
  const filename = imagePath.replace(/\\/g, "/").split("/").pop();
  return `http://localhost:8000/uploads/products/${filename}`;
}

export default function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const router = useRouter();
  const { cartItems, removeFromCart, updateQuantity } = useCart();
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  return (
    <div
      className={`fixed top-0 right-0 h-full w-80 bg-gradient-to-b from-slate-50 via-white to-slate-100 shadow-2xl z-50 transform transition-all duration-500 ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
      style={{ maxWidth: 380 }}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-blue-900 px-6 py-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-full backdrop-blur-sm">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <div>
              <span className="font-bold text-xl text-white">Your Cart</span>
              <p className="text-white/70 text-sm">{cartItems.length} items</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-all duration-200 text-white hover:text-red-300 text-2xl"
            aria-label="Close cart"
          >
            ×
          </button>
        </div>
      </div>

      {/* Cart Items */}
      <div className="p-6 flex-1 overflow-y-auto" style={{ maxHeight: "calc(100vh - 280px)" }}>
        {cartItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <p className="text-slate-600 font-medium text-lg mb-2">Your cart is empty</p>
            <p className="text-slate-500 text-sm">Add some products to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {cartItems.map((item, index) => (
              <div
                key={item.id}
                className="bg-white rounded-xl p-4 shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-1.5 hover:bg-red-50 rounded-full transition-colors duration-200 text-red-500 hover:text-red-600 flex-shrink-0 self-start mt-1"
                    title="Remove"
                    aria-label={`Remove ${item.name}`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>

                  <div className="w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center">
                    <Image
                      src={getProductImage(item)}
                      alt={item.name}
                      width={56}
                      height={56}
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
                      priority={index < 4}
                    />
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col gap-1">
                    <div className="flex items-center justify-between w-full">
                      <h3 className="font-semibold text-slate-800 text-base truncate max-w-[120px]">
                        {item.name}
                      </h3>
                      <div className="text-right ml-2">
                        <span className="block font-bold text-base text-slate-800">
                          LKR {item.price.toFixed(2)}
                        </span>
                        <span className="block text-xs text-slate-500">
                          Total: LKR {(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                      <button
                        className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm transition-all duration-200
                          ${
                            item.quantity <= 1
                              ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                              : "bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 hover:from-slate-200 hover:to-slate-300"
                          }`}
                        disabled={item.quantity <= 1}
                        onClick={() =>
                          updateQuantity(item.id, Math.max(1, item.quantity - 1))
                        }
                        aria-label={`Decrease ${item.name} quantity`}
                      >
                        −
                      </button>

                      <span className="px-3 py-1 bg-slate-100 rounded-lg font-semibold text-slate-800 min-w-[40px] text-center text-sm">
                        {item.quantity}
                      </span>

                      <button
                        className="w-8 h-8 bg-gradient-to-r from-slate-100 to-slate-200 rounded-lg flex items-center justify-center text-slate-700 hover:from-slate-200 hover:to-slate-300 transition-all duration-200 font-bold text-sm"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        aria-label={`Increase ${item.name} quantity`}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-gradient-to-r from-slate-800 to-blue-900 px-6 py-6 border-t border-white/10">
        <div className="flex justify-between items-center mb-6">
          <span className="text-white/80 font-medium text-base">Subtotal:</span>
          <span className="text-white font-bold text-xl">LKR {subtotal.toFixed(2)}</span>
        </div>

        <button
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-bold mb-3 hover:from-indigo-600 hover:to-blue-600 transition-all duration-500 transform hover:scale-105 shadow-lg hover:shadow-blue-500/25 flex items-center justify-center gap-2 border border-white/20 backdrop-blur-md relative overflow-hidden group"
          onClick={() => router.push("/products/viewcart")}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          <svg className="w-5 h-5 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <span className="relative z-10">View Cart</span>
        </button>

        <button
          className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 rounded-xl font-bold hover:from-teal-600 hover:to-emerald-600 transition-all duration-500 transform hover:scale-105 shadow-lg hover:shadow-emerald-500/25 flex items-center justify-center gap-2 border border-white/20 backdrop-blur-md relative overflow-hidden group disabled:opacity-60 disabled:cursor-not-allowed"
          disabled={cartItems.length === 0}
          onClick={() => router.push("/checkout")}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          <svg className="w-5 h-5 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          <span className="relative z-10">Checkout</span>
        </button>
      </div>
    </div>
  );
}
