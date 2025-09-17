import { Globe, Phone, Smartphone } from "lucide-react";
const CertificationsSection = () => {
  const certificates = [{
    level: "Int.",
    title: "Certificacion",
    subtitle: "Coach de Ciudadania Digital y Ciberseguridad para Docentes",
    name: "Mejores Oportunidades. Mas Opciones.",
    description: "Certificarte en practicas tecnologicas te permite subir un escalon en el mercado laboral. Un estudio realizado en la Universidad de Harvard descubrio que son las habilidades mas buscadas por empleadores el 2025.",
    icon: <Globe className="w-8 h-8" />,
    color: "bg-pixel-blue"
  }, {
    level: "Exp.",
    title: "Certificacion",
    subtitle: "Automatizacion de Procesos Pedagogicos y Administrativos",
    name: "Cientos de Colegios Saben de Nosotros.",
    description: "Al certificarte, tendras la opcion de registrarte en una base de datos a la cual cientos de colegios en latino america tienen acceso. Ofertas laborales pueden llegar en cualquier momento a traves de un correo.",
    icon: <Phone className="w-8 h-8" />,
    color: "bg-pixel-orange"
  }, {
    level: "Bas.",
    title: "Certificacion",
    subtitle: "Inteligencia Artificial para la generacion de contenido personalizado",
    name: "Muestra que estas a la Vanguardia.",
    description: "Los empleadores buscan personas con habilidades modernas y relevantes. Nuestra certificacion valida tus conocimientos y te posiciona por encima del 95% de los maestros. No seas ese 5%.",
    icon: <Smartphone className="w-8 h-8" />,
    color: "bg-pixel-dark"
  }];
  return <section className="bg-pixel-light-gray section-spacing">
      <div className="max-w-7xl mx-auto container-padding">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mb-12 lg:mb-16">
          {certificates.map((cert, index) => (
            <div key={index} className="bg-white p-6 lg:p-8 rounded-2xl shadow-lg">
              <h4 className="font-montserrat font-bold text-responsive-base text-pixel-dark mb-3">
                {cert.name}
              </h4>
              
              <p className="font-inter text-responsive-sm text-pixel-dark/80 mb-6">
                {cert.description}
              </p>
              
              <div className="flex justify-center text-pixel-dark">
                {cert.icon}
              </div>
            </div>
          ))}
        </div>
        
        {/* Newsletter Section */}
        <div className="bg-pixel-dark rounded-lg text-center p-6 lg:py-9 lg:px-6">
          <h3 className="font-montserrat font-bold text-responsive-2xl text-white mb-4">
            Mantente informado.
          </h3>
          <p className="font-inter text-white/80 mb-6 lg:mb-8 text-responsive-sm">
            Recibe las ultimas tendencias en Ed-Tech una vez al mes con nuestro boletin informativo.
          </p>
          
          <div className="flex flex-col sm:flex-row max-w-md mx-auto space-y-3 sm:space-y-0 sm:space-x-4">
            <input type="email" placeholder="Tu email aquí" className="flex-1 px-4 py-3 rounded-lg font-inter text-sm" />
            <button className="bg-pixel-orange text-white px-4 sm:px-6 py-3 rounded-lg font-inter font-medium hover:bg-pixel-orange/90 transition-colors text-sm min-h-[44px]">
              ¡Comienza aquí!
            </button>
          </div>
        </div>
      </div>
    </section>;
};
export default CertificationsSection;