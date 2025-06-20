import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function CategoryCards() {
  const categories = [
    { title: "Pain Relievers", desc: "Relief when you need it most.", variant: "blue" },
    { title: "Allergy Medications", desc: "Trusted allergy relief solutions.", variant: "light" },
    { title: "First Aid Supplies", desc: "Be prepared for emergencies.", variant: "gray" },
    { title: "Dental Care", desc: "Top-quality oral health care.", variant: "yellow" },
  ]

  return (
    <section className="container mx-auto px-4 py-12 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
      {categories.map((c, i) => (
        <Card key={i} className="bg-white p-6 shadow-md">
          <CardContent>
            <h3 className="text-black font-bold text-lg mb-2">{c.title}</h3>
            <p className="text-sm text-gray-600 mb-4">{c.desc}</p>
            <Button variant="outline"  className="text-blue-600 border-blue-600 hover:bg-blue-50">
              Explore Category →
            </Button>
          </CardContent>
        </Card>
      ))}
    </section>
  )
}
