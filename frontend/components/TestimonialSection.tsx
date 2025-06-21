import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Quote } from "lucide-react"

export default function TestimonialSection() {
  return (
    <section className="bg-gray-50 py-16">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header row: Badge, Title, Button */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <Badge className="bg-pink-100 text-pink-600">Review</Badge>

          <h2 className="text-3xl font-bold text-gray-900 text-right md:text-left">
            Testimonials That Inspire Us
          </h2>

          <Button
            variant="outline"
            className="rounded-full border-gray-400 text-gray-700 hover:bg-gray-100"
          >
            All Review
          </Button>
        </div>

        {/* Subtitle aligned with heading */}
        <p className="text-gray-600 max-w-4xl mb-12 md:ml-32">
          More than feedback, these are reminders of why we do what we do. Thank you for letting us be part of your health journey!
        </p>

        {/* Testimonial Card */}
        <div className="bg-white shadow-xl rounded-xl max-w-5xl mx-auto p-8 relative">
          <div className="flex items-start space-x-6">
            <Image
              src="/images/customer male.jpeg"
              alt="Jerome Raj"
              width={60}
              height={60}
              className="rounded-full"
            />
            <div className="flex-1 space-y-4">
              <Quote className="text-blue-600 w-6 h-6" />
              <p className="italic text-gray-700 text-lg">
                Pharmacy Store is my go-to for over-the-counter medications and health products. They have a wide selection, and their website makes it easy to order online. The only improvement I had suggest is expanding their beauty and skincare section.
              </p>
              <div>
                <p className="font-bold text-gray-900">Jerome Raj</p>
                <p className="text-sm text-gray-600">34 years old</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Dots */}
        <div className="mt-8 flex justify-center space-x-2">
          <span className="w-3 h-3 bg-black rounded-full"></span>
          <span className="w-3 h-3 bg-gray-300 rounded-full"></span>
        </div>
      </div>
    </section>
  )
}
