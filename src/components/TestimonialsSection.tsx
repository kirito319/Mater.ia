import { Button } from "@/components/ui/button";
const TestimonialsSection = () => {
  const testimonials = [{
    text: "Me quito el miedo a la tecnologia, es una ayuda increible para mi y mis alumnos.",
    name: "Martin Grajeda",
    role: "Maestro de Primaria",
    avatar: "👨‍🏫"
  }, {
    text: "No pense que aprender de tecnologia podia ser tan sencillo. Mi aula cambio mucho gracias a Pixel.",
    name: "Catalina Bloch",
    role: "Directora de Pre-Escolar",
    avatar: "👩‍💼"
  }, {
    text: "Aprender de IA me ayudo a recuperar mi tiempo y desocuparme de las tareas mas repetitivas.",
    name: "Paola Santander",
    role: "Administradora de Primaria",
    avatar: "👩‍💻"
  }];
  return <section className="bg-white section-spacing">
      <div className="max-w-7xl mx-auto container-padding">
        <h2 className="text-responsive-3xl font-montserrat font-bold text-pixel-dark text-center mb-4">
          Muchos ya comenzaron.
        </h2>
        <h3 className="text-responsive-3xl font-montserrat font-bold text-pixel-dark text-center mb-12 lg:mb-16">
          ¡No te quedes atrás!
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-12 lg:mb-16">
          {testimonials.map((testimonial, index) => <div key={index} className="bg-pixel-light-gray p-6 lg:p-8 rounded-2xl">
              <blockquote className="font-inter text-pixel-dark mb-6 text-responsive-base leading-relaxed">
                "{testimonial.text}"
              </blockquote>
              
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-pixel-orange to-pixel-blue rounded-full flex items-center justify-center text-lg lg:text-xl">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="font-inter font-bold text-pixel-dark text-responsive-sm">
                    {testimonial.name}
                  </p>
                  <p className="font-inter text-pixel-dark/70 text-xs lg:text-sm">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </div>)}
        </div>
        
        {/* Final CTA */}
        <div className="bg-pixel-dark rounded-lg p-8 lg:p-12 text-center">
          <h3 className="font-montserrat font-bold text-responsive-2xl text-white mb-6">
            Comienza ahora. No te pierdas la revolucion educativa mas grande de la historia.
          </h3>
          
          <Button className="text-white font-montserrat px-6 lg:px-8 py-3 lg:py-4 text-responsive-base rounded-lg transition-all transform hover:scale-105 font-thin bg-pixel-orange min-h-[44px]">
            ¡Obtén tu primera certificacion gratis ahora!
          </Button>
        </div>
      </div>
    </section>;
};
export default TestimonialsSection;