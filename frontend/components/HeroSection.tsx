import Image from "next/image"

export default function HeroSection() {
  return (
    <section className="container mx-auto px-4 py-12">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <p className="text-red-500 font-medium">S K Medicals</p>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
            Your Trusted<br />Pharmacy Store
          </h1>
          <p className="text-gray-600 text-lg">
            Your health is our priority. Experience compassionate care, fast service, and our team that treats you like family.
          </p>
          <div className="flex items-center space-x-4">
            <div className="flex -space-x-2">
              <div className="w-10 h-10 bg-blue-500 rounded-full border-2 border-white"></div>
              <div className="w-10 h-10 bg-green-500 rounded-full border-2 border-white"></div>
              <div className="w-10 h-10 bg-purple-500 rounded-full border-2 border-white"></div>
            </div>
            <div>
              <p className="font-bold text-gray-900">10k+</p>
              <p className="text-sm text-gray-600">Satisfied Customers</p>
            </div>
          </div>
        </div>
        <div>
          <Image
            src="/images/pharmacy-interior.png"
            alt="Pharmacy interior"
            width={600}
            height={400}
            className="rounded-2xl shadow-2xl"
          />
        </div>
      </div>
    </section>
  )
}
