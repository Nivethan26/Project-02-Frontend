import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default function PromoSection() {
  return (
    <section className="container mx-auto px-4 py-12 grid md:grid-cols-2 gap-6">
      <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-8 rounded-xl shadow-md">
        <Badge className="bg-purple-600 mb-2">Big Sale</Badge>
        <h3 className="text-2xl font-bold">Get an Extra <span className="text-blue-600">10% Off</span></h3>
        <p className="text-sm text-gray-600 mb-4">Beauty essentials and Save an extra 10% on your favourite cosmetics today!</p>
        <Image src="/placeholder.svg" alt="Promo" width={150} height={200} />
      </div>
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-8 rounded-xl shadow-md">
        <p className="text-blue-100 mb-2">Take the discount for first shopping</p>
        <h3 className="text-6xl font-bold mb-4">15%</h3>
        <Button className="bg-white text-blue-600 hover:bg-gray-100">Shop Now</Button>
      </div>
    </section>
  )
}