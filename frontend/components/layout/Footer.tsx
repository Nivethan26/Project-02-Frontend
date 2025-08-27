"use client"
import Image from "next/image"
import Link from "next/link"

export default function Footer() {
  return (
    <footer className="relative bg-gradient-to-b from-[#1a3ab8] via-[#183893] to-[#0a1740] text-white pt-16 pb-8 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-10 w-2 h-2 bg-white rounded-full animate-pulse"></div>
          <div className="absolute top-40 right-20 w-1 h-1 bg-blue-200 rounded-full animate-ping"></div>
          <div className="absolute bottom-32 left-1/4 w-1.5 h-1.5 bg-white rounded-full animate-pulse delay-1000"></div>
          <div className="absolute top-60 right-1/3 w-1 h-1 bg-blue-100 rounded-full animate-ping delay-500"></div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-y-1"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Logo and Brand */}
          <div className="space-y-6 animate-fade-in-up">
            <div className="flex items-center space-x-3 group cursor-pointer">
              <div className="relative overflow-hidden rounded-full">
                <Image
                  src="/images/logo.png"
                  alt="SK Medicals Logo"
                  width={110}
                  height={72}
                  className="rounded-full bg-white p-2 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/30 to-purple-400/30 rounded-full scale-0 group-hover:scale-110 transition-transform duration-500"></div>
              </div>
              
            </div>
            <p className="text-blue-100 text-sm leading-relaxed pr-4 opacity-90 hover:opacity-100 transition-all duration-300 hover:translate-x-1">
              Your trusted pharmacy for quality healthcare, wellness, and personal care products. Serving you with care
              and expertise since 2020.
            </p>
          </div>

          {/* Company Links */}
          <div className="space-y-6 animate-fade-in-up animation-delay-200">
            <h3 className="font-bold text-lg relative group">
              <span className="relative z-10">Company</span>
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-300 to-purple-300 group-hover:w-full transition-all duration-500"></div>
              <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-blue-200/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </h3>
            <ul className="space-y-3">
              {["About Us", "Products", "Services", "Blog & News"].map((item, index) => (
                <li
                  key={item}
                  className="transform transition-all duration-300 hover:translate-x-3"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <a
                    href="#"
                    className="text-blue-100 hover:text-white transition-all duration-300 relative group text-sm flex items-center"
                  >
                    <span className="w-0 h-0.5 bg-gradient-to-r from-blue-300 to-purple-300 group-hover:w-4 transition-all duration-300 mr-0 group-hover:mr-2"></span>
                    <span className="relative z-10">{item}</span>
                    <div className="absolute inset-0 bg-white/5 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-md -mx-2 px-2"></div>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-6 animate-fade-in-up animation-delay-400">
            <h3 className="font-bold text-lg relative group">
              <span className="relative z-10">Resources</span>
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-300 to-purple-300 group-hover:w-full transition-all duration-500"></div>
              <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-blue-200/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </h3>
            <ul className="space-y-3">
              {["Medication Guides", "Mental Health Resources", "Nutrition"].map((item, index) => (
                <li
                  key={item}
                  className="transform transition-all duration-300 hover:translate-x-3"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <a
                    href="#"
                    className="text-blue-100 hover:text-white transition-all duration-300 relative group text-sm flex items-center"
                  >
                    <span className="w-0 h-0.5 bg-gradient-to-r from-blue-300 to-purple-300 group-hover:w-4 transition-all duration-300 mr-0 group-hover:mr-2"></span>
                    <span className="relative z-10">{item}</span>
                    <div className="absolute inset-0 bg-white/5 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-md -mx-2 px-2"></div>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Media */}
          <div className="space-y-6 animate-fade-in-up animation-delay-600">
            <h3 className="font-bold text-lg relative group">
              <span className="relative z-10">Follow Us</span>
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-300 to-purple-300 group-hover:w-full transition-all duration-500"></div>
              <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-blue-200/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </h3>
            <div className="flex flex-wrap gap-4">
              {[
                {
                  name: "Instagram",
                  color: "hover:text-pink-300 hover:shadow-pink-300/50",
                  bgColor: "hover:bg-gradient-to-r hover:from-pink-500/20 hover:to-purple-500/20",
                  icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <rect width="20" height="20" x="2" y="2" rx="5" />
                      <circle cx="12" cy="12" r="5" />
                      <circle cx="17.5" cy="6.5" r="1.5" />
                    </svg>
                  ),
                },
                {
                  name: "YouTube",
                  color: "hover:text-red-400 hover:shadow-red-400/50",
                  bgColor: "hover:bg-gradient-to-r hover:from-red-500/20 hover:to-orange-500/20",
                  icon: (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M21.8 8.001a2.75 2.75 0 0 0-1.94-1.94C18.2 6 12 6 12 6s-6.2 0-7.86.06a2.75 2.75 0 0 0-1.94 1.94A28.6 28.6 0 0 0 2 12a28.6 28.6 0 0 0 .2 3.999 2.75 2.75 0 0 0 1.94 1.94C5.8 18 12 18 12 18s6.2 0 7.86-.06a2.75 2.75 0 0 0 1.94-1.94A28.6 28.6 0 0 0 22 12a28.6 28.6 0 0 0-.2-3.999zM10 15V9l6 3-6 3z" />
                    </svg>
                  ),
                },
                {
                  name: "Facebook",
                  color: "hover:text-blue-300 hover:shadow-blue-300/50",
                  bgColor: "hover:bg-gradient-to-r hover:from-blue-500/20 hover:to-indigo-500/20",
                  icon: (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M22 12c0-5.522-4.477-10-10-10S2 6.478 2 12c0 4.991 3.657 9.128 8.438 9.877v-6.987h-2.54v-2.89h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.242 0-1.63.771-1.63 1.562v1.875h2.773l-.443 2.89h-2.33v6.987C18.343 21.128 22 16.991 22 12z" />
                    </svg>
                  ),
                },
                {
                  name: "LinkedIn",
                  color: "hover:text-blue-200 hover:shadow-blue-200/50",
                  bgColor: "hover:bg-gradient-to-r hover:from-blue-400/20 hover:to-cyan-400/20",
                  icon: (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.761 0 5-2.239 5-5v-14c0-2.761-2.239-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.268c-.966 0-1.75-.784-1.75-1.75s.784-1.75 1.75-1.75 1.75.784 1.75 1.75-.784 1.75-1.75 1.75zm13.5 11.268h-3v-5.604c0-1.337-.025-3.063-1.868-3.063-1.868 0-2.154 1.459-2.154 2.968v5.699h-3v-10h2.881v1.367h.041c.401-.761 1.381-1.563 2.841-1.563 3.039 0 3.6 2.001 3.6 4.601v5.595z" />
                    </svg>
                  ),
                },
                {
                  name: "Twitter",
                  color: "hover:text-blue-100 hover:shadow-blue-100/50",
                  bgColor: "hover:bg-gradient-to-r hover:from-sky-500/20 hover:to-blue-500/20",
                  icon: (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 4.557a9.93 9.93 0 0 1-2.828.775 4.932 4.932 0 0 0 2.165-2.724c-.951.564-2.005.974-3.127 1.195a4.92 4.92 0 0 0-8.384 4.482C7.691 8.095 4.066 6.13 1.64 3.161c-.542.929-.856 2.01-.857 3.17 0 2.188 1.115 4.117 2.823 5.254a4.904 4.904 0 0 1-2.229-.616c-.054 2.281 1.581 4.415 3.949 4.89a4.936 4.936 0 0 1-2.224.084c.627 1.956 2.444 3.377 4.6 3.417A9.867 9.867 0 0 1 0 21.543a13.94 13.94 0 0 0 7.548 2.212c9.057 0 14.009-7.496 14.009-13.986 0-.213-.005-.425-.014-.636A9.936 9.936 0 0 0 24 4.557z" />
                    </svg>
                  ),
                },
              ].map((social, index) => (
                <a
                  key={social.name}
                  href="#"
                  aria-label={social.name}
                  className={`relative p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 transition-all duration-500 ${social.color} ${social.bgColor} hover:scale-110 hover:-translate-y-1 hover:shadow-lg group`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="transition-all duration-300 group-hover:scale-110 group-hover:rotate-12">
                    {social.icon}
                  </div>
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="relative animate-fade-in-up animation-delay-800">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent h-px"></div>
          <div className="pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-blue-100 text-sm flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-2">
              <span className="hover:text-white transition-colors duration-300">Copyright © 2025 S K Medicals</span>
              <span className="hidden md:inline text-blue-300">|</span>
              <span className="flex items-center space-x-1">
                <span>Design by</span>
                <span className="font-semibold bg-gradient-to-r from-blue-200 via-white to-purple-200 bg-clip-text text-transparent hover:from-purple-200 hover:to-blue-200 transition-all duration-300 cursor-pointer">
                  CST-09
                </span>
              </span>
            </p>
            <div className="flex space-x-6 text-blue-100 text-sm">
            {["Terms of Use", "Privacy Policy"].map((item, index) => (
              <Link
                key={item}
                href="/terms"
                className="hover:text-white transition-all duration-300 relative group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <span className="relative z-10">{item}</span>
                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-300 to-purple-300 group-hover:w-full transition-all duration-500"></div>
                <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-blue-200/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
            ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }
        
        .animation-delay-200 {
          animation-delay: 200ms;
        }
        
        .animation-delay-400 {
          animation-delay: 400ms;
        }
        
        .animation-delay-600 {
          animation-delay: 600ms;
        }
        
        .animation-delay-800 {
          animation-delay: 800ms;
        }
      `}</style>
    </footer>
  )
}
