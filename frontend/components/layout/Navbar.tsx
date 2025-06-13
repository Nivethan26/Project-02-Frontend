"use client"
import Link from "next/link"

export default function Navbar() {
  return (
    <nav className="flex justify-between items-center px-6 py-4 shadow bg-white sticky top-0 z-50">
      <Link href="/" className="text-xl font-bold text-blue-600">S K Medicals</Link>
      <div className="space-x-4">
        <Link href="/products" className="hover:underline">Products</Link>
        <Link href="/consultations" className="hover:underline">Consultations</Link>
        <Link href="/contact" className="hover:underline">Contact Us</Link>
        <Link href="/login" className="hover:underline">Login</Link>
        <Link href="/register" className="hover:underline">Register</Link>
      </div>
    </nav>
  )
}