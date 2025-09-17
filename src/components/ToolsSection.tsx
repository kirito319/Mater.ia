import { Button } from "@/components/ui/button";
const ToolsSection = () => {
  const PixelDecoration = ({
    className,
    colors = ["#FB9304", "#046CBC", "#EC4C24", "#C3D3D3"]
  }: {
    className?: string;
    colors?: string[];
  }) => <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {Array.from({
      length: 8
    }).map((_, i) => <div key={i} className="absolute opacity-20" style={{
      backgroundColor: colors[i % colors.length],
      width: `${120 + i * 20}px`,
      height: `${40 + i * 7}px`,
      left: `${10 + i * 15}%`,
      top: `${5 + i * 12}%`,
      transform: `rotate(${i * 15}deg)`
    }} />)}
    </div>;
  return <section className="section-spacing relative overflow-hidden">
      
      <div className="max-w-7xl mx-auto container-padding relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-3 h-3" style={{
            backgroundColor: "#FB9304"
          }}></div>
            <div className="w-3 h-3" style={{
            backgroundColor: "#046CBC"
          }}></div>
            <div className="w-3 h-3" style={{
            backgroundColor: "#EC4C24"
          }}></div>
            <div className="w-3 h-3" style={{
            backgroundColor: "#C3D3D3"
          }}></div>
          </div>
          <h2 className="text-responsive-3xl font-bold text-gray-900 mb-2">
            Muy pronto accederás al aula del futuro...
          </h2>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Mater X */}
          <div className="relative overflow-hidden rounded-lg">
            <div className="p-8 h-48 flex items-center justify-center relative" style={{
            backgroundColor: "#C3D3D3"
          }}>
              <img src="/lovable-uploads/420b12e9-64c6-47f8-929e-3f3719fddc1f.png" alt="Mater X" className="max-w-full max-h-full object-contain" />
            </div>
          </div>

          {/* Audaz.IA */}
          <div className="relative overflow-hidden rounded-lg">
            <div className="p-8 h-48 flex items-center justify-center relative" style={{
            backgroundColor: "#EC4C24"
          }}>
              <img src="/lovable-uploads/7078ebeb-3567-4447-a2a7-d137753db771.png" alt="Audaz.IA" className="max-w-full max-h-full object-contain" />
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center rounded-lg p-8 bg-zinc-950">
          <h3 className="text-responsive-2xl font-bold text-white mb-2">
            Solicita Acceso Anticipado Ahora.
          </h3>
          <p className="text-gray-300 text-responsive-base mb-6">
            Obtén acceso exclusivo a probar nuestras nuevas herramientas.
          </p>
          <Button className="text-black font-semibold px-8 py-3 rounded-full" style={{
          backgroundColor: "#FB9304"
        }}>
            ¡Comienza aquí!
          </Button>
        </div>
      </div>
    </section>;
};
export default ToolsSection;