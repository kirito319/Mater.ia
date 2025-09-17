import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-teacher.jpg";
import pixelIcon from "@/assets/pixel-icon.png";
import { useState } from "react";
import EmailCollectionModal from "./EmailCollectionModal";

const HeroSection = () => {
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  return <section className="bg-pixel-light-gray min-h-screen flex items-center relative overflow-hidden">
      {/* Decorative pixel elements - hide on mobile */}
      <div className="absolute top-32 right-20 w-32 h-32 z-10 hidden lg:block">
        
      </div>
      
      <div className="absolute bottom-32 right-32 w-40 h-40 z-10 hidden lg:block">
        
      </div>

      <div className="max-w-7xl mx-auto container-padding section-spacing grid lg:grid-cols-2 gap-8 lg:gap-12 items-center relative z-20">
        <div className="space-y-6 sm:space-y-8 text-center lg:text-left">
          <h1 className="text-responsive-4xl font-montserrat font-bold text-pixel-dark leading-tight">
            Recupera tu{" "}
            <span className="text-pixel-orange">tiempo</span>. Aprende a enseñar{" "}
            <span className="text-pixel-mint">mejor</span>, con menos{" "}
            <span className="text-pixel-blue">esfuerzo</span>.
          </h1>
          
          <p className="font-montserrat text-pixel-dark/80 max-w-lg text-responsive-base font-medium mx-auto lg:mx-0">
            Aprende a utilizar las herramientas del ahora, en tu idioma, a tu ritmo, y a un precio accesible.
          </p>
          
          <div className="space-y-4">
            <p className="font-montserrat text-pixel-dark text-responsive-sm font-thin">
              ¿Eres de América Latina?
            </p>
            <Button 
              className="bg-pixel-dark text-white font-montserrat rounded-lg hover:bg-pixel-dark/90 transition-all transform hover:scale-105 text-sm sm:text-base px-6 sm:px-8 py-3 w-full sm:w-auto"
              onClick={() => setIsEmailModalOpen(true)}
            >
              ¡Obtén tu primer curso gratis ahora!
            </Button>
          </div>
        </div>
        
        <div className="relative order-first lg:order-last">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl">
            <img 
              src={heroImage} 
              alt="Hero Teacher" 
              className="w-full h-auto object-cover"
            />
          </div>
        </div>
      </div>

      <EmailCollectionModal 
        isOpen={isEmailModalOpen} 
        onClose={() => setIsEmailModalOpen(false)} 
      />
    </section>;
};
export default HeroSection;