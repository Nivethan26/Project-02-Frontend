import Image from "next/image"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ServicesSection() {
  const services = [
    {
      title: "Prescription Checking",
      description: "Accuracy you can trust—our pharmacists double-check every prescription for your safety.",
      image: "/images/service-prescription.jpg",
      number: "01",
    },
    {
      title: "Home Delivery",
      description: "Skip the trip! Reliable, contact-free delivery for your family’s medications.",
      image: "/images/service-delivery.jpg",
      number: "02",
    },
    {
      title: "Health Consultations",
      description: "Specialized skin care advice from trusted professionals—personalized solutions for healthy, radiant skin.",
      image: "/images/service-consultation.jpg",
      number: "03",
    },
  ]

  return (
    <section className="bg-blue-600 text-white py-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <p className="text-blue-100 mb-1">Services</p>
            <h2 className="text-3xl font-bold">Comprehensive Pharmacy Services</h2>
            <p className="text-blue-100 max-w-md mt-2">
              One-stop healthcare solutions. Accurate, compassionate, and convenient services for every patient.
            </p>
          </div>
          <div>
            <Button variant="outline" className="rounded-full border-white text-white hover:bg-white hover:text-blue-600">
              All Services
            </Button>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <div key={index} className="bg-white rounded-xl overflow-hidden text-gray-900 shadow-md">
              <div className="relative">
                <Image
                  src={service.image}
                  alt={service.title}
                  width={400}
                  height={250}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-4 right-4 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <ArrowRight className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="p-6">
                <p className="text-sm text-blue-600 font-bold mb-1">{service.number}</p>
                <h3 className="font-bold text-lg mb-2">{service.title}</h3>
                <p className="text-sm text-gray-600">{service.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
