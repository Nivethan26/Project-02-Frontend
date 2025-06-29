import Image from "next/image"
import Link from "next/link"

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-100 overflow-hidden pt-0">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full opacity-20 blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-200 rounded-full opacity-15 blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-200 rounded-full opacity-10 blur-3xl animate-pulse delay-500" />
      </div>
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <p className="text-red-500 font-semibold text-lg tracking-wide">S K Medicals</p>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 leading-tight">
                Your <span className="text-blue-600 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Trusted</span><br />
                <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Pharmacy Store</span>
              </h1>
            </div>
            <p className="text-gray-600 text-lg sm:text-xl max-w-lg leading-relaxed">
              Your health is our priority. Experience compassionate care, fast service, and our team that treats you like family.
            </p>
            <div className="flex flex-col sm:flex-row items-center sm:space-x-6 space-y-4 sm:space-y-0">
              <Link 
                href="/products" 
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-full font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-center text-lg w-full sm:w-auto"
              >
                Shop Now
              </Link>
              <Link 
                href="/consultations" 
                className="bg-white text-blue-600 border-2 border-blue-600 px-8 py-4 rounded-full font-semibold shadow-lg hover:shadow-xl hover:bg-blue-50 transform hover:scale-105 transition-all duration-300 text-center text-lg w-full sm:w-auto"
              >
                Book Consultation
              </Link>
            </div>
            <div className="flex items-center space-x-6 mt-8">
              <div className="flex -space-x-3">
                <Image src="/images/poochi.jpg" alt="Profile 1" width={50} height={50} className="w-12 h-12 rounded-full border-3 border-white object-cover shadow-lg" />
                <Image src="/images/abiram.jpg" alt="Profile 2" width={50} height={50} className="w-12 h-12 rounded-full border-3 border-white object-cover shadow-lg" />
                <Image src="/images/sobi.jpg" alt="Profile 3" width={50} height={50} className="w-12 h-12 rounded-full border-3 border-white object-cover shadow-lg" />
                <Image src="/images/Rajee.jpg" alt="Profile 4" width={50} height={50} className="w-12 h-12 rounded-full border-3 border-white object-cover shadow-lg" />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-xl">10k+</p>
                <p className="text-sm text-gray-600">Satisfied Customers</p>
              </div>
            </div>
          </div>
          <div className="flex justify-center items-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-3xl blur-2xl opacity-30 transform rotate-3 scale-105"></div>
              <Image
                src="/images/about-pharmacy-1.jpeg"
                alt="Pharmacy interior"
                width={700}
                height={500}
                priority
                className="relative rounded-3xl shadow-2xl w-full max-w-sm sm:max-w-md lg:max-w-2xl drop-shadow-2xl transform hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-gray-400 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  )
}
