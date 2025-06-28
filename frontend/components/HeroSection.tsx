import Image from "next/image"
import Link from "next/link"

export default function HeroSection() {
  return (
    <section className="container mx-auto px-4 py-12">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <p className="text-red-500 font-medium">S K Medicals</p>
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
            Your <span className="text-blue-600">Trusted</span><br />Pharmacy Store
          </h1>
          <p className="text-gray-600 text-base sm:text-lg">
            Your health is our priority. Experience compassionate care, fast service, and our team that treats you like family.
          </p>
          <div className="flex flex-col sm:flex-row items-center sm:space-x-4 space-y-2 sm:space-y-0">
            <Link href="/products" className="bg-blue-600 text-white px-6 py-3 rounded-full font-semibold shadow hover:bg-blue-700 transition text-center">Shop Now</Link>
            <Link href="/consultations" className="bg-white text-blue-600 border border-blue-600 px-6 py-3 rounded-full font-semibold shadow hover:bg-blue-50 transition text-center">Book Consultation</Link>
          </div>
          <div className="flex items-center space-x-4 mt-4">
            <div className="flex -space-x-2">
              <Image src="/images/poochi.jpg" alt="Profile 1" width={40} height={40} className="w-10 h-10 rounded-full border-2 border-white object-cover" />
              <Image src="/images/abiram.jpg" alt="Profile 2" width={40} height={40} className="w-10 h-10 rounded-full border-2 border-white object-cover" />
              <Image src="/images/sobi.jpg" alt="Profile 3" width={40} height={40} className="w-10 h-10 rounded-full border-2 border-white object-cover" />
              <Image src="/images/Rajee.jpg" alt="Profile 4" width={40} height={40} className="w-10 h-10 rounded-full border-2 border-white object-cover" />
            </div>
            <div>
              <p className="font-bold text-gray-900">10k+</p>
              <p className="text-sm text-gray-600">Satisfied Customers</p>
            </div>
          </div>
        </div>
        <div className="flex justify-center">
          <Image
            src="/images/about-pharmacy-1.jpeg"
            alt="Pharmacy interior"
            width={600}
            height={400}
            priority
            className="rounded-2xl shadow-2xl w-full max-w-xs sm:max-w-md lg:max-w-xl drop-shadow-2xl"
          />
        </div>
      </div>
      {/* Decorative gradient blob */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-200 rounded-full opacity-30 blur-3xl z-0" />
    </section>
  )
}
