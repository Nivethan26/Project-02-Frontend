import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"

export default function TeamSection() {
  const team = [
    { name: "Dr. Siva Karan, PharmD", role: "Chief Pharmacist", img: "/placeholder.svg" },
    { name: "Dr. Mayoori, MD", role: "Medical Advisor", img: "/placeholder.svg" },
    { name: "Dr. Sathyan", role: "Health Services Manager", img: "/placeholder.svg" },
  ]

  return (
    <section className="container mx-auto px-4 py-16">
      <h2 className="text-3xl font-bold mb-8">The Heart of Our Pharmacy</h2>
      <div className="grid md:grid-cols-3 gap-8">
        {team.map((t, i) => (
          <Card key={i} className="border-0 shadow-lg overflow-hidden">
            <Image src={t.img} alt={t.name} width={300} height={300} className="w-full h-64 object-cover" />
            <CardContent className="p-6 text-center">
              <p className="text-sm text-gray-500 mb-2">{t.role}</p>
              <h3 className="font-bold text-gray-900 mb-2">{t.name}</h3>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
