import HeroSection from "@/components/HeroSection"
import FeaturesSection from "@/components/FeaturesSection"
import PromoSection from "@/components/PromoSection"
import FeaturedProductsSection from "@/components/FeaturedProductsSection"
import CategoryCards from "@/components/CategoryCards"
import CommitmentSection from "@/components/CommitmentSection"
import ServicesSection from "@/components/ServicesSection"
import TeamSection from "@/components/TeamSection"
import TestimonialSection from "@/components/TestimonialSection"


export default function Home() {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50">
      <HeroSection />
      <FeaturesSection />
      <PromoSection />
      <FeaturedProductsSection />
      <CategoryCards />
      <CommitmentSection />
      <ServicesSection />
      <TeamSection />
      <TestimonialSection />
    </div>
  )
}