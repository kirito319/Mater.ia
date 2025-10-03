import React from 'react';
import logoUrl from '@/assets/Isotipo-Materia.svg';

const LoadingScreen = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-white">
    <img src={logoUrl} alt="Isotipo Materia" className="w-24 h-24 object-contain mb-6" draggable={false} />
    <p className="text-lg text-gray-800 font-semibold">Cargando...</p>
  </div>
);

export default LoadingScreen;
