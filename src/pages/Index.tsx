import Header from "@/components/Header";
import CertificateDisplaySection from "@/components/CertificateDisplaySection";
import HeroSection from "@/components/HeroSection";
import LevelCoursesSection from "@/components/LevelCoursesSection";
import CoursesSection from "@/components/CoursesSection";
import CertificationsSection from "@/components/CertificationsSection";
import PricingSection from "@/components/PricingSection";
import ToolsSection from "@/components/ToolsSection";
import TestimonialsSection from "@/components/TestimonialsSection";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <HeroSection />
      <div id="inicio">
        <CoursesSection />
      </div>
      <div id="cursos">
        <LevelCoursesSection />
      </div>
      <CertificateDisplaySection />
      <div id="certificaciones">
        <CertificationsSection />
      </div>
      <div id="paquetes">
        <PricingSection />
      </div>
      <ToolsSection />
      <TestimonialsSection />
    </div>
  );
};

export default Index;
