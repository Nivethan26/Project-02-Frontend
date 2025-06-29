/* eslint-disable @typescript-eslint/no-unused-vars */
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function PromoSection() {
  return (
    <section className="bg-white py-8 sm:py-12 sm:px-2">
      <div className="max-w-6xl mx-auto px-2 sm:px-4 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {/* Box 1: Big Sale */}
        <div className="relative bg-blue-100 rounded-2xl shadow-md flex items-stretch overflow-visible min-h-[250px]">
          {/* Text content */}
          <div className="flex-1 pl-8 pr-56 py-10 flex flex-col justify-left">
            <span className="font-bold text-lg mb-2">Big Sale</span>
            <h3 className="text-4xl font-bold text-black mb-2">
              Get an Extra <span className="text-blue-600">10% Off</span>
            </h3>
            <p className="text-base text-gray-700">
              Beauty steals alert! Save an extra 10% on your favourite cosmetics today!
            </p>
          </div>
          {/* Overlapping image */}
          <div className="absolute right-0 -top-1/3 translate-y-1/10 z-10 drop-shadow-2xl">
            <Image
              src="/images/cosmetics sale.jpg"
              alt="Promo"
              width={220}
              height={320}
              className="rounded-2xl w-[220px] h-[320px] object-cover"
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
            <Button className="bg-black-100 text-black hover:bg-black px-6 py-2 text-sm font-semibold border border-white">
  Shop Now
</Button>
          </div>
        </div>
      </div>
    </section>
  );
}
