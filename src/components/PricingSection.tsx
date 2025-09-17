import { Button } from "@/components/ui/button";
const PricingSection = () => {
  const plans = [{
    name: "Bit",
    price: "10$ USD",
    features: ["Certificacion en Conceptos y Principios en IA", "3 Certificaciones Básicas", "3 Certificaciones Intermedias", "1 Certificacion Experta"],
    popular: false
  }, {
    name: "Pixel",
    price: "25$ USD",
    features: ["Certificacion en Conceptos y Principios en IA", "Todas las Certificaciones Básicas (8)", "Todas las Certificaciones Intermedias (8)", "Todas las Certificaciones Experta (4)"],
    popular: true
  }, {
    name: "Giga",
    price: "Personalizado",
    features: ["Hasta 60 Cuentas Pixel a un precio reducido", "Capacitacion Presencial (Según Disponibilidad)", "Capacitacion Presencial Ciudadania Digital a Estudiantes y Maestros"],
    popular: false
  }];
  return <section className="bg-white section-spacing relative overflow-hidden">
      {/* Background decorative rectangles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-10 rounded-lg opacity-20" style={{
        backgroundColor: '#FB9304'
      }} />
        <div className="absolute top-40 right-20 w-24 h-8 rounded-lg opacity-20" style={{
        backgroundColor: '#046CBC'
      }} />
        <div className="absolute bottom-40 left-20 w-36 h-12 rounded-lg opacity-20" style={{
        backgroundColor: '#EC4C24'
      }} />
        <div className="absolute bottom-20 right-10 w-28 h-9 rounded-lg opacity-20" style={{
        backgroundColor: '#C3D3D3'
      }} />
        <div className="absolute top-60 left-1/2 transform -translate-x-1/2 w-40 h-13 rounded-lg opacity-15" style={{
        backgroundColor: '#FB9304'
      }} />
        <div className="absolute top-32 right-1/3 w-20 h-7 rounded-lg opacity-15" style={{
        backgroundColor: '#046CBC'
      }} />
      </div>

      <div className="max-w-7xl mx-auto container-padding relative z-10">
        <h2 className="text-responsive-3xl font-montserrat font-bold text-gray-900 text-center mb-12 lg:mb-16">
          Paquetes
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-8 lg:mb-12">
          {plans.map((plan, index) => <div key={index} className="relative">
              {plan.popular && <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-3 py-1 rounded-full text-xs lg:text-sm font-inter font-medium z-20">
                  Más Popular
                </div>}
              
              <div className="bg-white/20 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden border border-white/30 relative">
                {/* Header with translucent background */}
                <div className="bg-white/10 backdrop-blur-sm p-6 lg:p-8 text-center">
                  <h3 className="text-responsive-2xl font-montserrat font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-responsive-xl font-inter font-bold text-gray-900">
                    {plan.price}
                  </p>
                </div>
                
                {/* Features */}
                <div className="p-6 lg:p-8">
                  <ul className="space-y-3 lg:space-y-4 mb-6 lg:mb-8">
                    {plan.features.map((feature, featureIndex) => <li key={featureIndex} className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-gray-900 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="font-inter text-gray-900 text-responsive-xs">
                          {feature}
                        </span>
                      </li>)}
                  </ul>
                  
                </div>
              </div>
            </div>)}
        </div>
        
        {/* Call to action */}
        <div className="text-center">
          <p className="font-inter text-gray-900 mb-6 text-responsive-base">¿Eres de América Latina?</p>
          <Button 
            className="bg-gray-900 font-inter font-medium px-6 lg:px-8 py-3 lg:py-4 text-responsive-base rounded-lg hover:bg-gray-800 transition-all transform hover:scale-105 min-h-[44px] text-zinc-100"
            onClick={() => window.location.href = '/auth'}
          >
            ¡Obtén tu primer curso gratis!
          </Button>
        </div>
      </div>
    </section>;
};
export default PricingSection;