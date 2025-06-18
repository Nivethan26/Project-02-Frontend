"use client"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import authService, { User } from "@/services/auth"

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)

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
    authService.logout()
    setUser(null)
    router.push('/')
  }

  const isCustomer = user?.role === 'customer'
  const isStaff = ['admin', 'doctor', 'pharmacist', 'delivery'].includes(user?.role || '')

  // Hide navigation items for staff members
  const showPublicNav = !isStaff || pathname === '/'

  return (
    <nav className="flex justify-between items-center px-6 py-4 shadow bg-white sticky top-0 z-50">
      <Link href="/" className="text-xl font-bold text-blue-600">S K Medicals</Link>
      <div className="space-x-4">
        {/* Public Navigation - Only show for customers or on home page */}
        {showPublicNav && (
          <>
        <Link href="/" className="text-black hover:text-blue-600">Home</Link>
        <Link href="/about" className="text-black hover:text-blue-600">About Us</Link>
        <Link href="/products" className="text-black hover:text-blue-600">Products</Link>
        <Link href="/consultations" className="text-black hover:text-blue-600">Services</Link>
        <Link href="/contact" className="text-black hover:text-blue-600">Contact Us</Link>
          </>
        )}
        
        {user && authService.getToken() ? (
          <div className="inline-flex items-center space-x-4">
            {/* Customer Dashboard Link */}
            {isCustomer && (
              <Link href="/dashboard/customer" className="text-blue-600 hover:underline">
                Dashboard
              </Link>
            )}
            
            {/* Staff Dashboard Link */}
            {isStaff && (
              <Link href={`/dashboard/${user.role}`} className="text-blue-600 hover:underline">
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
          <>
            <Link href="/login" className="text-black hover:text-blue-600">Login</Link>
            <Link href="/register" className="text-black hover:text-blue-600">Register</Link>
          </>
        )}
      </div>
    </nav>
  )
}