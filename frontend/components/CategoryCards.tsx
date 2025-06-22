import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"

export default function CategoryCards() {
  const categories = [
    {
      title: "Pain Relievers",
      desc: "From headaches to muscle aches, we’ve got effective relief options for every need.",
      image: "/images/pain relievers.jpeg"
    },
    {
      title: "Allergy Medications",
      desc: "Don’t let allergies hold you back.\nFind trusted solutions for indoor, outdoor, and year-round relief.",
      image: "/images/allergy.jpeg"
    },
    {
      title: "First Aid Supplies",
      desc: "Be ready for any emergency—shop our comprehensive first aid collection.",
      image: "/images/first aid.jpg"
    },
    {
      title: "Dental Care",
      desc: "Maintain a healthy smile with our dentist-recommended oral care essentials.",
      image: "/images/dental.jpg"
    }
  ];

  return (
    <section className="py-12 bg-[#f9f9f9]">
      <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((c, i) => (
          <Card key={i} className="bg-white shadow-md overflow-hidden flex flex-col">
            <Image
              src={c.image}
              alt={c.title}
              width={400}
              height={250}
              className="w-full h-40 object-cover"
            />
            <CardContent className="flex flex-col justify-between flex-grow p-6">
              <div>
                <h3 className="text-black font-bold text-lg mb-2">{c.title}</h3>
                <p className="text-sm text-gray-600 whitespace-pre-line mb-4">{c.desc}</p>
              </div>
              <Button
                variant="outline"
                className="text-blue-600 border-blue-600 hover:bg-blue-50 mt-auto"
              >
                Explore Category →
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
