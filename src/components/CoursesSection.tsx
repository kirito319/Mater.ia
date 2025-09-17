import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

const CoursesSection = () => {
  const PixelDecoration = ({
    className
  }: {
    className?: string;
  }) => {
    return (
      <img 
        src="/lovable-uploads/0aceb57f-f2f1-468d-bc93-024ef470f17d.png" 
        alt="Pixel decoration" 
        className={`w-12 h-12 ${className}`} 
      />
    );
  };

  const cards = [
    {
      text: "Aprende a dominar las herramientas digitales mas relevantes de ahora y del futuro, sin experiencia previa requerida.",
      decorationClass: "absolute -top-2 -right-2 z-0 opacity-30"
    },
    {
      text: "Ahorra tiempo en planificacion y evaluacion gracias a cursos practicos diseñados para aplicarse en el aula de inmediato",
      decorationClass: "absolute -top-2 -left-2 z-0 opacity-30"
    },
    {
      text: "Accede a formacion pensada especificamente en las necesidades de latino america. Aprende en tu idioma, a tu ritmo y gratis!",
      decorationClass: "absolute -bottom-2 -right-2 z-0 opacity-30"
    },
    {
      text: "Conviértete en un referente de innovación educativa en tu institución al dominar EdTech y prácticas pedagógicas modernas.",
      decorationClass: "absolute -bottom-2 -left-2 z-0 opacity-30"
    }
  ];

  return <section className="bg-white section-spacing relative overflow-hidden">
      <div className="max-w-7xl mx-auto container-padding text-center">
        <h2 className="text-responsive-4xl font-montserrat font-bold text-pixel-dark mb-12 lg:mb-16 leading-tight">Nuestros cursos permiten volverte un experto. Sin importar donde comiences.</h2>
        
        {/* Desktop Grid */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-12 lg:mb-16">
          {cards.map((card, index) => (
            <div key={index} className="bg-muted p-6 lg:p-8 rounded-2xl relative">
              <PixelDecoration className="w-8 h-8 lg:w-12 lg:h-12 absolute -top-2 -right-2 z-0 opacity-30" />
              <p className="font-inter text-pixel-dark font-medium relative z-10 text-responsive-sm">{card.text}</p>
            </div>
          ))}
        </div>

        {/* Mobile Carousel */}
        <div className="md:hidden mb-12 lg:mb-16">
          <Carousel className="w-full max-w-sm mx-auto">
            <CarouselContent>
              {cards.map((card, index) => (
                <CarouselItem key={index}>
                  <div className="bg-muted p-6 rounded-2xl relative mx-2">
                    <PixelDecoration className="w-8 h-8 absolute -top-2 -right-2 z-0 opacity-30" />
                    <p className="font-inter text-pixel-dark font-medium relative z-10 text-responsive-sm">{card.text}</p>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="flex justify-center gap-4 mt-6">
              <CarouselPrevious className="relative inset-auto translate-x-0 translate-y-0" />
              <CarouselNext className="relative inset-auto translate-x-0 translate-y-0" />
            </div>
          </Carousel>
        </div>
        
        <h3 className="text-responsive-3xl font-montserrat font-bold text-pixel-dark mb-8">Descubre nuestros cursos...</h3>
      </div>
      
      {/* Background decorative pixels - hide on mobile */}
      <PixelDecoration className="absolute top-20 left-10 opacity-20 z-0 hidden lg:block" />
      <PixelDecoration className="absolute top-40 right-20 opacity-20 z-0 hidden lg:block" />
      <PixelDecoration className="absolute bottom-20 left-20 opacity-20 z-0 hidden lg:block" />
      <PixelDecoration className="absolute bottom-40 right-10 opacity-20 z-0 hidden lg:block" />
      
      
    </section>;
};
export default CoursesSection;