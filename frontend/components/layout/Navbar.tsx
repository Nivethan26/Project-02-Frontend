"use client"
import Link from "next/link"
import { useEffect, useState, useRef } from "react"
import { useRouter, usePathname } from "next/navigation"
import authService, { User } from "@/services/auth"
import { useCart } from '@/context/CartContext'
import Image from "next/image"
import { User as LucideUser } from "lucide-react"
import LogoutConfirmModal from '@/components/LogoutConfirmModal'

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const { logout } = useCart()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  useEffect(() => {
    // Check for user data on mount and route changes
    const checkAuth = () => {
      const currentUser = authService.getCurrentUser()
      setUser(currentUser)
    }

    checkAuth()

    // Add event listener for storage changes
    const handleStorageChange = () => {
      checkAuth()
    }

    window.addEventListener('storage', handleStorageChange)
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [pathname])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false)
      }
    }
    if (profileOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [profileOpen])

  const handleLogout = () => {
    setShowLogoutModal(true);
    setProfileOpen(false);
  };

  const confirmLogout = () => {
    logout();
    setUser(null);
    setShowLogoutModal(false);
    router.push('/');
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  const isCustomer = user?.role === 'customer'
  const isStaff = ['admin', 'doctor', 'pharmacist', 'delivery'].includes(user?.role || '')

  // Hide navigation items for staff members
  const showPublicNav = !isStaff || pathname === '/'

  return (
    <nav className="sticky flex items-center px-4 md:px-16 py-4 bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-100 w-full top-0 z-50 shadow-lg border-b border-blue-200/50">
      <Link href="/" className="relative group">
        <Image src="/images/logo.png" alt="SK Medicals" width={160} height={15} className="transition-all duration-500 group-hover:scale-110 group-hover:drop-shadow-lg" />
      </Link>

      {/* Hamburger for mobile */}
      <button
        className="ml-auto md:hidden p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        onClick={() => setMenuOpen((open) => !open)}
        aria-label="Toggle menu"
      >
        <svg className="w-7 h-7 text-blue-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Centered navigation links (desktop) */}
      {showPublicNav && (
        <div className="hidden md:absolute md:left-1/2 md:top-1/2 md:transform md:-translate-x-1/2 md:-translate-y-1/2 md:flex md:items-center md:space-x-8">
          <div className="flex items-center space-x-8">
            <Link 
              href="/" 
              className={`relative px-4 py-3 font-semibold transition-all duration-500 ease-out transform ${
                pathname === "/" 
                  ? "text-blue-600 scale-110" 
                  : "text-gray-700 hover:text-blue-600 hover:scale-105"
              }`}
            >
              <span className="relative z-10">Home</span>
              {pathname === "/" && (
                <div className="absolute -top-2 -right-2 w-3 h-3 bg-blue-500 rounded-full animate-ping"></div>
              )}
            </Link>
            <Link 
              href="/about" 
              className={`relative px-4 py-3 font-semibold transition-all duration-500 ease-out transform ${
                pathname === "/about" 
                  ? "text-blue-600 scale-110" 
                  : "text-gray-700 hover:text-blue-600 hover:scale-105"
              }`}
            >
              <span className="relative z-10">About Us</span>
              {pathname === "/about" && (
                <div className="absolute -top-2 -right-2 w-3 h-3 bg-blue-500 rounded-full animate-ping"></div>
              )}
            </Link>
            <Link 
              href="/products" 
              className={`relative px-4 py-3 font-semibold transition-all duration-500 ease-out transform ${
                pathname === "/products" 
                  ? "text-blue-600 scale-110" 
                  : "text-gray-700 hover:text-blue-600 hover:scale-105"
              }`}
            >
              <span className="relative z-10">Products</span>
              {pathname === "/products" && (
                <div className="absolute -top-2 -right-2 w-3 h-3 bg-blue-500 rounded-full animate-ping"></div>
              )}
            </Link>
            <Link 
              href="/consultations" 
              className={`relative px-4 py-3 font-semibold transition-all duration-500 ease-out transform ${
                pathname === "/consultations" 
                  ? "text-blue-600 scale-110" 
                  : "text-gray-700 hover:text-blue-600 hover:scale-105"
              }`}
            >
              <span className="relative z-10">Services</span>
              {pathname === "/consultations" && (
                <div className="absolute -top-2 -right-2 w-3 h-3 bg-blue-500 rounded-full animate-ping"></div>
              )}
            </Link>
            <Link 
              href="/contact" 
              className={`relative px-4 py-3 font-semibold transition-all duration-500 ease-out transform ${
                pathname === "/contact" 
                  ? "text-blue-600 scale-110" 
                  : "text-gray-700 hover:text-blue-600 hover:scale-105"
              }`}
            >
              <span className="relative z-10">Contact Us</span>
              {pathname === "/contact" && (
                <div className="absolute -top-2 -right-2 w-3 h-3 bg-blue-500 rounded-full animate-ping"></div>
              )}
            </Link>
          </div>
        </div>
      )}

      {/* Right side: login/register or user info (desktop) */}
      <div className="hidden md:flex items-center space-x-4 ml-auto">
        {user && authService.getToken() ? (
          <div className="inline-flex items-center space-x-4">
            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen((open) => !open)}
                className="flex items-center focus:outline-none group"
                aria-label="Open profile menu"
              >
                <span className="text-gray-700 mr-3 font-medium group-hover:text-blue-600 transition-colors duration-300">Welcome, {user.firstName}</span>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full p-1 shadow-lg group-hover:shadow-blue-500/50 transition-all duration-300 transform group-hover:scale-110 group-hover:rotate-3">
                  <LucideUser className="w-full h-full text-white" />
                </div>
              </button>
              {profileOpen && (
                <div className="absolute right-0 mt-3 w-52 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-blue-100/50 z-50 overflow-hidden animate-fade-in">
                  <Link
                    href={isCustomer ? "/dashboard/customer" : `/dashboard/${user.role}`}
                    className="block px-5 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 border-b border-blue-100/50"
                    onClick={() => setProfileOpen(false)}
                  >
                    <span className="flex items-center">
                      <span className="mr-2">🚀</span>
                      Dashboard
                    </span>
                  </Link>
                  <Link
                    href="/dashboard/customer/profile"
                    className="block px-5 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 border-b border-blue-100/50"
                    onClick={() => setProfileOpen(false)}
                  >
                    <span className="flex items-center">
                      <span className="mr-2">👤</span>
                      Profile
                    </span>
                  </Link>
                  <button
                    onClick={() => { handleLogout(); setProfileOpen(false); }}
                    className="block w-full text-left px-5 py-3 text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 transition-all duration-300"
                  >
                    <span className="flex items-center">
                      <span className="mr-2">🚪</span>
                      Logout
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-6 py-2.5 rounded-full border-2 border-blue-600 text-blue-600 font-semibold bg-white hover:bg-blue-50 hover:border-blue-700 hover:text-blue-700 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="px-6 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
            >
              Register
            </Link>
          </div>
        )}
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div ref={menuRef} className="absolute top-full left-0 w-full bg-white/95 backdrop-blur-md shadow-2xl border-t border-blue-200/50 z-50 md:hidden animate-fade-in">
          <div className="flex flex-col items-center py-6 space-y-3">
            {showPublicNav && (
              <>
                <Link 
                  href="/" 
                  className={`w-full text-center py-3 px-6 rounded-xl font-medium transition-all duration-500 ${
                    pathname === "/" 
                      ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg transform scale-105" 
                      : "text-gray-700 hover:text-blue-600 hover:bg-blue-50/80"
                  }`} 
                  onClick={() => setMenuOpen(false)}
                >
                  Home
                </Link>
                <Link 
                  href="/about" 
                  className={`w-full text-center py-3 px-6 rounded-xl font-medium transition-all duration-500 ${
                    pathname === "/about" 
                      ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg transform scale-105" 
                      : "text-gray-700 hover:text-blue-600 hover:bg-blue-50/80"
                  }`} 
                  onClick={() => setMenuOpen(false)}
                >
                  About Us
                </Link>
                <Link 
                  href="/products" 
                  className={`w-full text-center py-3 px-6 rounded-xl font-medium transition-all duration-500 ${
                    pathname === "/products" 
                      ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg transform scale-105" 
                      : "text-gray-700 hover:text-blue-600 hover:bg-blue-50/80"
                  }`} 
                  onClick={() => setMenuOpen(false)}
                >
                  Products
                </Link>
                <Link 
                  href="/consultations" 
                  className={`w-full text-center py-3 px-6 rounded-xl font-medium transition-all duration-500 ${
                    pathname === "/consultations" 
                      ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg transform scale-105" 
                      : "text-gray-700 hover:text-blue-600 hover:bg-blue-50/80"
                  }`} 
                  onClick={() => setMenuOpen(false)}
                >
                  Services
                </Link>
                <Link 
                  href="/contact" 
                  className={`w-full text-center py-3 px-6 rounded-xl font-medium transition-all duration-500 ${
                    pathname === "/contact" 
                      ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg transform scale-105" 
                      : "text-gray-700 hover:text-blue-600 hover:bg-blue-50/80"
                  }`} 
                  onClick={() => setMenuOpen(false)}
                >
                  Contact Us
                </Link>
              </>
            )}
            <div className="border-t border-blue-100 w-full my-2" />
            {user && authService.getToken() ? (
              <>
                {isCustomer && (
                  <Link href="/dashboard/customer" className="text-black hover:text-blue-600 w-full text-center py-2" onClick={() => setMenuOpen(false)}>
                    Dashboard
                  </Link>
                )}
                {isStaff && (
                  <Link href={`/dashboard/${user.role}`} className="text-black hover:text-blue-600 w-full text-center py-2" onClick={() => setMenuOpen(false)}>
                    Dashboard
                  </Link>
                )}
                <div className="flex flex-col items-center space-y-2">
                  <span className="text-gray-700">Welcome, {user.firstName}</span>
                  <button
                    onClick={() => { handleLogout(); setMenuOpen(false); }}
                    className="text-red-600 hover:underline"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-full border border-blue-600 text-blue-600 font-semibold bg-white hover:bg-blue-50 shadow-sm transition flex items-center"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 rounded-full bg-blue-600 text-white font-semibold hover:bg-blue-700 shadow-md transition flex items-center"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
      <LogoutConfirmModal open={showLogoutModal} onConfirm={confirmLogout} onCancel={cancelLogout} />
    </nav>
  )
}