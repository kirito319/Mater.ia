import { useState, useEffect } from 'react';

const CertificateDisplaySection = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const certificateImages = [
    {
      src: "/lovable-uploads/c51ea407-d421-4721-b26a-49f3f8e74e57.png",
      alt: "Certificación Int. - Coach de Ciudadanía Digital y Ciberseguridad para Docentes"
    },
    {
      src: "/lovable-uploads/60d22d29-a447-4eda-9590-e1fd853b05bd.png", 
      alt: "Certificación Bas. - Inteligencia Artificial para la generación de contenido personalizado"
    },
    {
      src: "/lovable-uploads/7c3b296c-b57f-491d-85e4-9bce02d27c2e.png",
      alt: "Certificación Exp. - Automatización de Procesos Pedagógicos y Administrativos"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        (prevIndex + 1) % certificateImages.length
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [certificateImages.length]);

return (
    <section className="bg-white section-spacing">
      <div className="max-w-7xl mx-auto container-padding">
        <h2 className="text-responsive-3xl font-bold text-center text-gray-800 mb-8">¿Porque Certificarte?</h2>
        <div className="flex justify-center">
          <div className="w-full max-w-4xl relative">
            <div className="relative overflow-hidden rounded-lg shadow-lg mx-auto" style={{ width: '90%', maxWidth: '66.67%' }}>
              {certificateImages.map((image, index) => (
                <img 
                  key={index}
                  src={image.src} 
                  alt={image.alt}
                  className={`w-full h-auto transition-opacity duration-500 ${
                    index === currentImageIndex ? 'opacity-100' : 'opacity-0 absolute top-0 left-0'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CertificateDisplaySection;