import { Truck, CreditCard, DollarSign, Headphones } from "lucide-react"

export default function FeaturesSection() {
  const features = [
    { icon: <Truck className="w-6 h-6 text-blue-600" />, title: "Free Shipping", text: "Order Over Rs. 1000" },
    { icon: <CreditCard className="w-6 h-6 text-blue-600" />, title: "Quick Payment", text: "100% Secure" },
    { icon: <DollarSign className="w-6 h-6 text-blue-600" />, title: "Big Cashback", text: "Over 50% Cashback" },
    { icon: <Headphones className="w-6 h-6 text-blue-600" />, title: "24/7 Support", text: "Ready for You" },
  ]

  return (
    <section className="container mx-auto px-4 py-12 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
      {features.map((f, i) => (
        <div key={i} className="text-center p-6 border-0 shadow-lg bg-white rounded-lg">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            {f.icon}
          </div>
          <h3 className="font-bold text-gray-900">{f.title}</h3>
          <p className="text-sm text-gray-600">{f.text}</p>
        </div>
      ))}
    </section>
  )
}