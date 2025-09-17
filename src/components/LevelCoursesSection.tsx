const LevelCoursesSection = () => {
  const courseBoxes = [
  // Row 1 (1 box)
  {
    title: "Introduccion a la Ed Tech y Conceptos IA",
    color: "#fc9404"
  },
  // Row 2 (2 boxes)
  {
    title: "Comunicar y Ordenar con IA/EdTech",
    color: "#046cbc"
  }, {
    title: "Creacion de contenido pedagogico con IA",
    color: "#fc9404"
  },
  // Row 3 (3 boxes)
  {
    title: "Herramientas de Evaluacion Digital",
    color: "#046cbc"
  }, {
    title: "Alfabetizacion Digital y Diseño de Clase",
    color: "#e5e7eb",
    textColor: "text-gray-600"
  }, {
    title: "Ciudadania Digital y Seguridad Online",
    color: "#046cbc"
  },
  // Row 4 (4 boxes)
  {
    title: "Diseño de Proyectos STEAM en Primaria",
    color: "#eb4c23"
  }, {
    title: "Analitica del Aprendizaje Asistida",
    color: "#eb4c23"
  }, {
    title: "Inclusion y Tecnologias",
    color: "#e5e7eb",
    textColor: "text-gray-600"
  }, {
    title: "Autamotizacion de Tareas Docente con IA",
    color: "#eb4c23"
  }];
  const renderPyramidRow = (startIndex: number, count: number, rowIndex: number) => {
    const boxes = courseBoxes.slice(startIndex, startIndex + count);
    const totalWidth = count * 300 + (count - 1) * 40; // 300px per box + 40px gaps
    const startX = (100 - totalWidth / 12) / 2; // Center the row

    return boxes.map((course, index) => <div key={startIndex + index} className="absolute transition-all hover:scale-105 cursor-pointer rounded-xl" style={{
      backgroundColor: course.color,
      left: `${startX + index * 340 / 12}%`,
      // 340px includes gap
      top: `${20 + rowIndex * 120}px`,
      width: '300px',
      height: '80px'
    }}>
        <div className={`px-6 py-4 h-full flex items-center justify-center rounded-xl ${course.textColor || 'text-white'}`}>
          <p className="font-montserrat font-semibold text-center text-sm lg:text-base">
            {course.title}
          </p>
        </div>
      </div>);
  };
  return <section className="bg-gray-800 section-spacing relative overflow-hidden">
      <div className="max-w-7xl mx-auto container-padding h-full flex flex-col">
        {/* Header Content */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start space-y-6 lg:space-y-0 mb-8">
          <div className="space-y-4 max-w-xl">
            <h2 className="text-responsive-3xl font-montserrat font-bold text-white leading-tight">
              Cursos de Nivel
            </h2>
            
            <p className="font-montserrat text-white text-responsive-base font-medium leading-relaxed">
              Avanza a <span className="font-bold">tu ritmo</span>, y profundiza cuanto quieras! Cada curso esta diseñado{" "}
              <span className="font-bold">para educadores, por educadores.</span>
            </p>
          </div>
          
          {/* Level Buttons - Responsive */}
          <div className="flex flex-row lg:flex-col space-x-2 lg:space-x-0 lg:space-y-2 justify-center lg:justify-start">
            <button className="flex-1 lg:flex-none py-2 px-4 lg:px-6 rounded-lg text-white font-montserrat font-bold text-xs lg:text-sm transition-all transform hover:scale-105" style={{
            backgroundColor: '#fc9404'
          }}>
              Básico
            </button>
            
            <button className="flex-1 lg:flex-none py-2 px-4 lg:px-6 rounded-lg text-white font-montserrat font-bold text-xs lg:text-sm transition-all transform hover:scale-105" style={{
            backgroundColor: '#046cbc'
          }}>
              Intermedio
            </button>
            
            <button className="flex-1 lg:flex-none py-2 px-4 lg:px-6 rounded-lg text-white font-montserrat font-bold text-xs lg:text-sm transition-all transform hover:scale-105" style={{
            backgroundColor: '#eb4c23'
          }}>
              Experto
            </button>
          </div>
        </div>

        {/* Course Boxes - Mobile Grid, Desktop Pyramid */}
        <div className="block md:hidden">
          {/* Mobile: Simple Grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {courseBoxes.slice(0, 4).map((course, index) => <div key={index} className="h-20 rounded-lg flex items-center justify-center text-white font-montserrat font-bold text-xs text-center px-2" style={{
            backgroundColor: course.color,
            color: course.textColor || 'white'
          }}>
                {course.title}
              </div>)}
          </div>
          <div className="grid grid-cols-3 gap-3">
            {courseBoxes.slice(4).map((course, index) => <div key={index + 4} className="h-20 rounded-lg flex items-center justify-center text-white font-montserrat font-bold text-xs text-center px-2" style={{
            backgroundColor: course.color,
            color: course.textColor || 'white'
          }}>
                {course.title}
              </div>)}
          </div>
        </div>

        {/* Desktop: Pyramid Layout */}
        <div className="hidden md:block relative flex-1 min-h-[300px] lg:min-h-[400px]">
          {/* Row 1: 1 box */}
          {renderPyramidRow(0, 1, 0)}
          {/* Row 2: 2 boxes */}
          {renderPyramidRow(1, 2, 1)}
          {/* Row 3: 3 boxes */}
          {renderPyramidRow(3, 3, 2)}
          {/* Row 4: 4 boxes */}
          {renderPyramidRow(6, 4, 3)}
        </div>

        {/* Bottom Text */}
        <div className="text-center mt-6 lg:mt-8">
          <p className="text-white font-montserrat text-responsive-lg font-medium py-[70px] my-[50px] mx-0 px-0">
            Nuestros Cursos te preparan para ser mejor<br className="hidden sm:block" />
            <span className="sm:hidden"> </span>maestro y capacitar a otros en como serlo!
          </p>
        </div>
      </div>
    </section>;
};
export default LevelCoursesSection;