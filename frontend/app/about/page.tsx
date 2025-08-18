"use client"

import { motion } from "framer-motion"
import {
  Heart,
  Shield,
  Users,
  Clock,
  Award,
  Stethoscope,
  Truck,
  CheckCircle,
  ArrowRight,
  Phone,
  MapPin,
  Star,
  Mail,
} from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { useRouter } from "next/navigation"

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

export default function AboutUs() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      {/* Hero Section */}
      <section className="relative flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-100 overflow-hidden pt-0">
        {/* Background decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full opacity-20 blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-200 rounded-full opacity-15 blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-200 rounded-full opacity-10 blur-3xl animate-pulse delay-500" />
        </div>
        <div className="relative container mx-auto px-4 py-10 lg:py-27 z-10">
          <motion.div
            className="grid lg:grid-cols-2 gap-12 items-center"
            initial="initial"
            animate="animate"
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="space-y-6">
              <Badge className="bg-blue-100 text-blue-700 border-none">Trusted Since 2020</Badge>
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight text-gray-900">
                Your <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Trusted</span>
                <span className="block font-bold leading-tight text-gray-900">Smart Pharmacy</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Revolutionizing healthcare with cutting-edge pharmacy management technology, compassionate care, and
                unwavering commitment to your well-being.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-full font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 cursor-pointer"
                  onClick={() => router.push("/consultations")}
                >
                  Our Services <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-white text-blue-600 border-2 border-blue-600 px-8 py-4 rounded-full font-semibold shadow-lg hover:shadow-xl hover:bg-blue-50 transform hover:scale-105 transition-all duration-300 cursor-pointer"
                  onClick={() => router.push("/contact")}
                >
                  Contact Us
                </Button>
              </div>
            </motion.div>
            <motion.div variants={fadeInUp} className="relative flex justify-center items-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-3xl blur-2xl opacity-30 transform rotate-3 scale-105"></div>
                <Image
                  src="/images/about-pharmacy-1.webp"
                  alt="Modern Pharmacy Interior"
                  width={600}
                  height={400}
                  className="relative rounded-3xl shadow-2xl w-full max-w-sm sm:max-w-md lg:max-w-2xl drop-shadow-2xl transform hover:scale-105 transition-transform duration-500"
                />
              </div>
              <motion.div
                className="absolute -bottom-6 -left-6 bg-white rounded-xl p-4 shadow-lg"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
              >
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">24/7 Available</p>
                    <p className="text-sm text-gray-600">Always here for you</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            className="grid grid-cols-2 lg:grid-cols-4 gap-8"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {[
              { number: "10K+", label: "Happy Customers", icon: Users },
              { number: "5+", label: "Years Experience", icon: Award },
              { number: "24/7", label: "Support Available", icon: Clock },
              { number: "99.9%", label: "Accuracy Rate", icon: Shield },
            ].map((stat, index) => (
              <motion.div key={index} variants={fadeInUp} className="text-center group">
                <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <stat.icon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</h3>
                <p className="text-gray-600">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-20 bg-gradient-to-r from-gray-50 to-blue-50">
        <div className="container mx-auto px-4">
          <motion.div
            className="grid lg:grid-cols-2 gap-16 items-center"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="space-y-6">
              <Badge className="bg-blue-100 text-blue-700">Our Story</Badge>
              <h2 className="text-4xl font-bold text-gray-900">Pioneering Smart Pharmacy Solutions</h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                Founded in 2020 with a vision to transform healthcare delivery, S K Medicals has evolved from a
                neighborhood pharmacy into a technology-driven healthcare hub. Our smart pharmacy management system
                ensures precision, efficiency, and personalized care.
              </p>
              <div className="space-y-4">
                {[
                  "Advanced inventory management with AI predictions",
                  "Real-time prescription tracking and verification",
                  "Seamless integration with healthcare providers",
                  "Personalized medication counseling services",
                ].map((feature, index) => (
                  <motion.div key={index} className="flex items-center gap-3" variants={fadeInUp}>
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            <motion.div variants={fadeInUp} className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-xl">
                <Image
                  src="/images/about-pharmacy-3.jpg"
                  alt="Smart Pharmacy Technology"
                  width={500}
                  height={400}
                  className="w-full h-auto object-cover max-h-100"
                />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <Badge className="bg-green-100 text-green-700 mb-4">Why Choose Us</Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Excellence in Every Aspect</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our commitment to innovation, quality, and patient care sets us apart in the healthcare industry.
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {[
              {
                icon: Heart,
                title: "Patient-First Care",
                description: "Every decision we make prioritizes patient health and well-being above all else.",
                color: "from-red-500 to-pink-500",
              },
              {
                icon: Shield,
                title: "Quality Guaranteed",
                description: "Rigorous quality control ensures every medication meets the highest safety standards.",
                color: "from-blue-500 to-cyan-500",
              },
              {
                icon: Stethoscope,
                title: "Expert Consultation",
                description: "Licensed pharmacists provide personalized medication counseling and health advice.",
                color: "from-green-500 to-emerald-500",
              },
              {
                icon: Clock,
                title: "24/7 Availability",
                description: "Round-the-clock service ensures you get the care you need, when you need it.",
                color: "from-purple-500 to-violet-500",
              },
              {
                icon: Truck,
                title: "Fast Delivery",
                description: "Quick and reliable delivery service brings your medications right to your doorstep.",
                color: "from-orange-500 to-red-500",
              },
              {
                icon: Users,
                title: "Community Focus",
                description: "Deeply rooted in the community, supporting local health initiatives and programs.",
                color: "from-teal-500 to-green-500",
              },
            ].map((feature, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
                  <CardContent className="p-8 text-center">
                    <motion.div
                      className={`w-16 h-16 rounded-full bg-gradient-to-r ${feature.color} flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <feature.icon className="h-8 w-8 text-white" />
                    </motion.div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="py-20 bg-gradient-to-br from-blue-50 via-white to-indigo-100 text-black">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-4xl font-bold mb-4">Comprehensive Healthcare Services</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From prescription management to health consultations, we provide complete healthcare solutions.
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-8"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {[
              {
                title: "Smart Prescription Management",
                description: "AI-powered prescription verification and automated refill reminders.",
                image: "/images/prescription checking.jpeg?height=200&width=300",
              },
              {
                title: "Home Delivery Service",
                description: "Contactless delivery with real-time tracking and temperature control.",
                image: "/images/homeDelivery.jpg?height=200&width=300",
              },
              {
                title: "Health Consultations",
                description: "Virtual and in-person consultations with certified healthcare professionals.",
                image: "/images/Healthclinic.jpeg?height=200&width=300",
              },
            ].map((service, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-white border border-blue-100 shadow-lg rounded-2xl p-6 hover:shadow-2xl transition-all duration-300"
              >
                <div className="rounded-xl overflow-hidden mb-6">
                  <Image
                    src={service.image || ""}
                    alt={service.title}
                    width={300}
                    height={200}
                    className="w-full h-48 object-cover"
                  />
                </div>
                <h3 className="text-xl font-bold mb-3">{service.title}</h3>
                <p className="text-gray-600 mb-4">{service.description}</p>
                <Button
                  variant="outline"
                  className="border-blue text-black  hover:text-blue-600 bg-transparent"
                >
                  Learn More
                </Button>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <Badge className="bg-blue-100 text-blue-700 mb-4">Our Team</Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Meet Our Healthcare Experts</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our dedicated team of professionals brings years of experience and passion for healthcare excellence.
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-8"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {[
              {
                name: "Dr. Shiva Karan, PharmD",
                role: "Chief Pharmacist",
                experience: "15+ years",
                image: "/images/team-1.png",
                specialties: ["Clinical Pharmacy", "Medication Therapy"],
              },
              {
                name: "Dr. Mayoori, MD",
                role: "Medical Advisor",
                experience: "12+ years",
                image: "/images/team-2.png",
                specialties: ["Internal Medicine", "Patient Care"],
              },
              {
                name: "Dr. Sathyan",
                role: "Director of Health Services",
                experience: "8+ years",
                image: "/images/team-3.png",
                specialties: ["Health Management", "Digital Health"],
              },
            ].map((member, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
                  <div className="relative h-80 overflow-hidden">
                    <Image
                      src={member.image || ""}
                      alt={member.name}
                      width={300}
                      height={300}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <CardContent className="p-6 text-center">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{member.name}</h3>
                    <p className="text-blue-600 font-semibold mb-2">{member.role}</p>
                    <p className="text-gray-600 mb-4">{member.experience} experience</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {member.specialties.map((specialty, idx) => (
                        <Badge key={idx} className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-transparent">
        <div className="container mx-auto px-4 flex justify-center">
          <div className="relative w-full h-auto">
            {/* Floating Icon */}
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-10">
              <div className="bg-blue-100 border-4 border-white rounded-full p-5 shadow-lg flex items-center justify-center">
                <Users className="w-12 h-12 text-blue-600" />
              </div>
            </div>
            {/* Card */}
            <div className="bg-white rounded-2xl border-2 border-blue-400 shadow-xl pt-16 pb-10 px-6 md:px-16 text-center">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-blue-600 drop-shadow-sm">
                Ready to Experience Smart Healthcare?
              </h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed text-center">
                Join thousands of satisfied customers who trust us with their health. Experience the future <br/>
                of pharmacy services today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  variant="outline"
                  className="border border-blue-500 text-blue-500 bg-white rounded-xl px-8 py-3 text-2xl font-normal hover:bg-white hover:border-blue-700 hover:text-blue-700 transition-colors duration-200 cursor-pointer"
                  onClick={() => router.push("/contact")}
                >
                  <Phone className="mr-2 h-5 w-5" />
                  Contact Us Today
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border border-blue-500 text-blue-500 bg-white rounded-xl px-8 py-3 text-2xl font-normal hover:bg-white hover:border-blue-700 hover:text-blue-700 transition-colors duration-200 cursor-pointer"
                  onClick={() => window.open('https://www.google.com/maps/search/?api=1&query=Semnthankulam+Road,+Ilavalai,+Jaffna+40000', '_blank')}
                >
                  <MapPin className="mr-2 h-5 w-5" />
                  Visit Our Store
                </Button>
              </div>
              <div className="mt-12 grid md:grid-cols-3 gap-8 text-center">
                <div className="flex items-center justify-center gap-3">
                  <Phone className="h-6 w-6 text-blue-500" />
                  <span>24/7 Support</span>
                </div>
                <div className="flex items-center justify-center gap-3">
                  <Mail className="h-6 w-6 text-blue-500" />
                  <span>Quick Response</span>
                </div>
                <div className="flex items-center justify-center gap-3">
                  <Star className="h-6 w-6 text-blue-500" />
                  <span>5-Star Service</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  )
}