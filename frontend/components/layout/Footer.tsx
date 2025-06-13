"use client"
import { Button } from "@/components/ui/button"

export default function Footer() {
  return (
    <footer className="bg-blue-600 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Logo and Brand */}
          <div>
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold text-sm">SK</span>
              </div>
              <span className="font-bold text-lg">S K Medicals</span>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-bold mb-4">Company</h3>
            <ul className="space-y-2 text-blue-100">
              <li><a href="#" className="hover:text-white">About Us</a></li>
              <li><a href="#" className="hover:text-white">Products</a></li>
              <li><a href="#" className="hover:text-white">Services</a></li>
              <li><a href="#" className="hover:text-white">Blog & News</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-bold mb-4">Resources</h3>
            <ul className="space-y-2 text-blue-100">
              <li><a href="#" className="hover:text-white">Medication Guides</a></li>
              <li><a href="#" className="hover:text-white">Mental Health Resources</a></li>
              <li><a href="#" className="hover:text-white">Nutrition</a></li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="font-bold mb-4">Follow Our Social Media</h3>
            <div className="grid grid-cols-3 gap-2">
              <Button size="sm" className="bg-black hover:bg-white hover:text-black">Instagram</Button>
              <Button size="sm" className="bg-black hover:bg-white hover:text-black">Youtube</Button>
              <Button size="sm" className="bg-black hover:bg-white hover:text-black">Facebook</Button>
              <Button size="sm" className="bg-black hover:bg-white hover:text-black">LinkedIn</Button>
              <Button size="sm" className="bg-black hover:bg-white hover:text-black">Twitter</Button>
              <Button size="sm" className="bg-black hover:bg-white hover:text-black">Tik Tok</Button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-blue-500 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-blue-100 text-sm">
            Copyright © 2025 S K Medicals | Design by <span className="text-white">CST-09</span>
          </p>
          <div className="flex space-x-4 text-blue-100 text-sm mt-4 md:mt-0">
            <a href="#" className="hover:text-white">Terms of Use</a>
            <a href="#" className="hover:text-white">Privacy Policy</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
