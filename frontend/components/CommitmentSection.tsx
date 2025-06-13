import Image from "next/image"
import { Badge } from "@/components/ui/badge"

export default function CommitmentSection() {
  return (
    <section className="container mx-auto px-4 py-12 grid lg:grid-cols-2 gap-12 items-center">
      <div className="space-y-8">
        <Badge className="bg-red-100 text-red-600">Why Us</Badge>
        <h2 className="text-3xl font-bold">Our Commitment to Quality</h2>
        <ul className="space-y-4">
          <li><strong>✔</strong> Wide Product Range</li>
          <li><strong>✔</strong> Quality Assurance</li>
          <li><strong>✔</strong> Eco-Friendly Practices</li>
        </ul>
      </div>
      <div>
        <Image src="/images/pharmacy-commitment.png" alt="Commitment" width={600} height={400} className="rounded-xl" />
      </div>
    </section>
  )
}
