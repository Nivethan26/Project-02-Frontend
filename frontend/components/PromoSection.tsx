import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function PromoSection() {
  return (
    <section className="bg-white py-12">
      <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-6">
        {/* Box 1: Big Sale */}
        <div className="bg-blue-100 p-6 rounded-xl shadow-md flex items-center justify-between">
          <div className="flex-1">
            <Badge className="bg-purple-600 text-white text-xs font-bold mb-2">Big Sale</Badge>
            <h3 className="text-lg font-semibold text-black mb-1">
              Get an Extra <span className="text-blue-600 font-bold">10% Off</span>
            </h3>
            <p className="text-sm text-black">
              Beauty steals alert! Save an extra 10% on your favourite cosmetics today!
            </p>
          </div>
          <div className="ml-4">
            <Image
              src="/images/cosmetics sale.jpg"
              alt="Promo"
              width={120}
              height={150}
              className="rounded w-auto"
            />
          </div>
        </div>

        {/* Box 2: Discount Promo */}
        <div className="bg-blue-700 text-white p-6 rounded-xl shadow-md flex flex-col justify-between h-[260px] relative">
          {/* Top text */}
          <p className="text-sm mb-2">
            Take the discount for the first shopping on our website
          </p>

          {/* Dots - top right */}
          <div className="absolute top-6 right-6 flex space-x-1">
            <span className="w-2 h-2 bg-white rounded-full animate-bounce" />
            <span className="w-2 h-2 bg-white/70 rounded-full animate-bounce delay-100" />
            <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce delay-200" />
          </div>

          {/* Bottom row */}
          <div className="mt-auto flex items-center justify-between">
            <h3 className="text-6xl font-bold">15%</h3>
            <Button className="bg-gray-100 text-black hover:bg-black px-6 py-2 text-sm font-semibold border border-white">
  Shop Now
</Button>
          </div>
        </div>
      </div>
    </section>
  );
}
