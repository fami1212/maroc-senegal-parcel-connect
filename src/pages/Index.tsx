import AppLayout from "@/components/AppLayout";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import UserTypesSection from "@/components/UserTypesSection";
import StatsSection from "@/components/StatsSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <AppLayout>
      <HeroSection />
      <FeaturesSection />
      <UserTypesSection />
      <StatsSection />
      <Footer />
    </AppLayout>
  );
};

export default Index;
