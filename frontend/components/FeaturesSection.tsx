import { Truck, CreditCard, DollarSign, Headphones } from "lucide-react"

export default function FeaturesSection() {
  const features = [
    {
      icon: <Truck className="w-6 h-6 text-blue-600" />,
      title: "Free Shipping",
      text: "Order Over Rs. 15000",
    },
    {
      icon: <CreditCard className="w-6 h-6 text-blue-600" />,
      title: "Quick Payment",
      text: "100% Secure",
    },
    {
      icon: <DollarSign className="w-6 h-6 text-blue-600" />,
      title: "Big Cashback",
      text: "Over 50% Cashback",
    },
    {
      icon: <Headphones className="w-6 h-6 text-blue-600" />,
      title: "24/7 Support",
      text: "Ready for You",
    },
  ]

  return (
    <section className="bg-white py-8 sm:py-10 px-2 sm:px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {features.map((f, i) => (
          <div
            key={i}
            className="text-center p-6 border border-gray-200 shadow-sm rounded-xl transition hover:shadow-md"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              {f.icon}
            </div>
            <h3 className="font-semibold text-gray-900 text-lg">{f.title}</h3>
            <p className="text-sm text-gray-600">{f.text}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
