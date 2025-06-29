import Image from "next/image"
import { Badge } from "@/components/ui/badge"

export default function CommitmentSection() {
  return (
    <section className="bg-white py-12 sm:py-16">
      <div className="max-w-6xl mx-auto px-2 sm:px-4 grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
        {/* Left content */}
        <div className="space-y-6">
          <Badge className="bg-red-100 text-red-600">Why Us</Badge>
          <h2 className="text-black text-3xl font-bold">Our Commitment to Quality</h2>
          <ul className="text-black space-y-6">
            <li>
              <h4 className="font-semibold text-lg">✔ Wide Product Range</h4>
              <p className="text-gray-700 text-sm mt-1">
                From everyday essentials to specialized medications—we carefully curate a diverse selection
                to meet all your health and wellness needs.
              </p>
            </li>
            <li>
              <h4 className="font-semibold text-lg">✔ Quality Assurance</h4>
              <p className="text-gray-700 text-sm mt-1">
                Every product on our shelves undergoes strict quality checks, so you receive only trusted,
                effective, and safe healthcare solutions.
              </p>
            </li>
            <li>
              <h4 className="font-semibold text-lg">✔ Eco-Friendly Practices</h4>
              <p className="text-gray-700 text-sm mt-1">
                We prioritize sustainability—from biodegradable packaging to ethical sourcing—because your health
                and the planet's future go hand in hand.
              </p>
            </li>
          </ul>
        </div>

        {/* Right image */}
        <div className="flex justify-center">
          <Image
            src="/images/about-pharmacy-3.jpg"
            alt="Commitment"
            width={300}
            height={350}
            className="rounded-xl object-cover"
          />
        </div>
      </div>
    </section>
  )
}
