import HeroSection from "@/components/HeroSection"
import FeaturesSection from "@/components/FeaturesSection"
import PromoSection from "@/components/PromoSection"
import FeaturedProductsSection from "@/components/FeaturedProductsSection"
import CategoryCards from "@/components/CategoryCards"
import CommitmentSection from "@/components/CommitmentSection"
//import ServicesSection from "@/components/ServicesSection"
//import TeamSection from "@/components/TeamSection"
import TestimonialSection from "@/components/TestimonialSection"
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ChatWidget from '@/components/ChatWidget';


export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <PromoSection />
      <FeaturedProductsSection />
      <CategoryCards />
      <CommitmentSection />
      {/*<ServicesSection />
      <TeamSection />*/}
      <TestimonialSection />
      <ChatWidget />
      <Footer />
    </div>
  )
}