import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";

export default function FeaturedProductsSection() {
  const products = [
    {
      name: "Acetaminophen Pills",
      price: "Rs.1675",
      oldPrice: "Rs.1850",
      image: "/images/acetaminophen pills.jpg",
    },
    {
      name: "Throat Lozenges Syrup",
      price: "Rs.680",
      oldPrice: "Rs.765",
      image: "/images/syrup.jpg",
    },
    {
      name: "Multivitamin B6+",
      price: "Rs.5999",
      oldPrice: "Rs.7100",
      image: "/images/multivitamin B6+.jpg",
    },
  ];

  return (
    <section className="max-w-6xl mx-auto px-4 py-12">
      <h2 className="text-black text-3xl mb-8 text-left">
        Featured Pharmacy Essentials
      </h2>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
        {products.map((product, i) => (
          <Card key={i} className="overflow-hidden border-0 shadow-lg rounded-lg">
            <div className="w-full h-56 relative">
              <Image
                src={product.image}
                alt={product.name}
                layout="fill"
                objectFit="cover"
                className="rounded-t-lg"
              />
            </div>
            <CardContent className="p-4">
              <h3 className="font-bold text-gray-900 mb-2">{product.name}</h3>
              <div className="flex items-center space-x-2">
                <span className="text-gray-500 line-through">{product.oldPrice}</span>
                <span className="text-blue-600 font-bold">{product.price}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
