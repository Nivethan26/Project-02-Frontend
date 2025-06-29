"use client"
import Link from "next/link"
import { useEffect, useState, useRef } from "react"
import { useRouter, usePathname } from "next/navigation"
import authService, { User } from "@/services/auth"
import { useCart } from '@/context/CartContext'
import Image from "next/image"

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const { logout } = useCart()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

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

  const handleLogout = () => {
    logout()
    setUser(null)
    router.push('/')
  }

  const isCustomer = user?.role === 'customer'
  const isStaff = ['admin', 'doctor', 'pharmacist', 'delivery'].includes(user?.role || '')

  // Hide navigation items for staff members
  const showPublicNav = !isStaff || pathname === '/'

  return (
    <nav className="relative flex items-center px-4 md:px-16 py-4 bg-[#e3edff] w-full sticky top-0 z-50">
      <Link href="/">
        <Image src="/images/logo.png" alt="SK Medicals" width={160} height={15} />
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
        <div className="hidden md:absolute md:left-1/2 md:top-1/2 md:transform md:-translate-x-1/2 md:-translate-y-1/2 md:flex md:space-x-8">
          <Link href="/" className="text-black hover:text-blue-600">Home</Link>
          <Link href="/about" className="text-black hover:text-blue-600">About Us</Link>
          <Link href="/products" className="text-black hover:text-blue-600">Products</Link>
          <Link href="/consultations" className="text-black hover:text-blue-600">Services</Link>
          <Link href="/contact" className="text-black hover:text-blue-600">Contact Us</Link>
        </div>
      )}

      {/* Right side: login/register or user info (desktop) */}
      <div className="hidden md:flex items-center space-x-4 ml-auto">
        {user && authService.getToken() ? (
          <div className="inline-flex items-center space-x-4">
            {/* Customer Dashboard Link */}
            {isCustomer && (
              <Link href="/dashboard/customer" className="text-blue-600">
                Dashboard
              </Link>
            )}
            {/* Staff Dashboard Link */}
            {isStaff && (
              <Link href={`/dashboard/${user.role}`} className="text-blue-600">
                Dashboard
              </Link>
            )}
            {/* User Info and Logout */}
            <div className="flex items-center space-x-2">
              <span className="text-gray-700">
                Welcome, {user.firstName}
              </span>
              <button
                onClick={handleLogout}
                className="text-red-600 hover:underline"
              >
                Logout
              </button>
            </div>
          </div>
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

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div ref={menuRef} className="absolute top-full left-0 w-full bg-white shadow-lg border-t border-blue-100 z-50 md:hidden animate-fade-in">
          <div className="flex flex-col items-center py-4 space-y-2">
            {showPublicNav && (
              <>
                <Link href="/" className="text-black hover:text-blue-600 w-full text-center py-2" onClick={() => setMenuOpen(false)}>Home</Link>
                <Link href="/about" className="text-black hover:text-blue-600 w-full text-center py-2" onClick={() => setMenuOpen(false)}>About Us</Link>
                <Link href="/products" className="text-black hover:text-blue-600 w-full text-center py-2" onClick={() => setMenuOpen(false)}>Products</Link>
                <Link href="/consultations" className="text-black hover:text-blue-600 w-full text-center py-2" onClick={() => setMenuOpen(false)}>Services</Link>
                <Link href="/contact" className="text-black hover:text-blue-600 w-full text-center py-2" onClick={() => setMenuOpen(false)}>Contact Us</Link>
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
    </nav>
  )
}