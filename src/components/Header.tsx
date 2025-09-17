import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";
import { useAuthHook } from "@/hooks/useAuth";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { User, LogOut, Settings } from "lucide-react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useAuth();
  const { signOut } = useAuthHook();
  const { isAdmin } = useAdminCheck();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return <header className="w-full bg-white py-3 sm:py-4 px-4 sm:px-6 border-b">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <img src="/lovable-uploads/d63261e5-5b0b-42ad-9352-c544cab4fd72.png" alt="Pixel Ed-Tech Logo" className="h-10 sm:h-12 md:h-14" />
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
          {user ? (
            <>
              <Link to="/dashboard" className="font-inter text-sm lg:text-base text-pixel-dark hover:text-pixel-orange transition-colors">
                Hogar
              </Link>
              <Link to="/education" className="font-inter text-sm lg:text-base text-pixel-dark hover:text-pixel-orange transition-colors">
                Educación
              </Link>
              <Link to="/ai" className="font-inter text-sm lg:text-base text-pixel-dark hover:text-pixel-orange transition-colors">
                IA
              </Link>
              <Link to="/subscription" className="font-inter text-sm lg:text-base text-pixel-dark hover:text-pixel-orange transition-colors">
                Suscripción
              </Link>
            </>
          ) : (
            <>
              <a href="#inicio" className="font-inter text-sm lg:text-base text-pixel-dark hover:text-pixel-orange transition-colors" onClick={(e) => {
                e.preventDefault();
                document.getElementById('inicio')?.scrollIntoView({ behavior: 'smooth' });
              }}>
                Inicio
              </a>
              <a href="#cursos" className="font-inter text-sm lg:text-base text-pixel-dark hover:text-pixel-orange transition-colors" onClick={(e) => {
                e.preventDefault();
                document.getElementById('cursos')?.scrollIntoView({ behavior: 'smooth' });
              }}>
                Cursos
              </a>
              <a href="#certificaciones" className="font-inter text-sm lg:text-base text-pixel-dark hover:text-pixel-orange transition-colors" onClick={(e) => {
                e.preventDefault();
                document.getElementById('certificaciones')?.scrollIntoView({ behavior: 'smooth' });
              }}>
                Certificaciones
              </a>
              <a href="#paquetes" className="font-inter text-sm lg:text-base text-pixel-dark hover:text-pixel-orange transition-colors" onClick={(e) => {
                e.preventDefault();
                document.getElementById('paquetes')?.scrollIntoView({ behavior: 'smooth' });
              }}>
                Paquetes
              </a>
            </>
          )}
        </nav>
        
        {/* Mobile Menu Button */}
        <button 
          className="md:hidden p-2 text-pixel-dark"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>
        
        {user ? (
          <div className="hidden md:flex items-center space-x-3">
            <span className="text-sm text-pixel-dark">
              Hola, {user.user_metadata?.nombre || user.email?.split('@')[0]}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="bg-pixel-dark text-white border-pixel-dark hover:bg-pixel-orange hover:text-white hover:border-pixel-orange"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        ) : (
          <Link to="/auth">
            <Button className="hidden md:block bg-pixel-dark text-white font-inter font-medium text-sm lg:text-base px-4 lg:px-6 py-2 rounded-lg hover:bg-pixel-orange transition-colors">
              ¡Comienza aquí!
            </Button>
          </Link>
        )}
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b shadow-lg z-50">
          <nav className="flex flex-col space-y-4 p-4">
            {user ? (
              <>
                <Link 
                  to="/dashboard"
                  className="font-inter text-base text-pixel-dark hover:text-pixel-orange transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Hogar
                </Link>
                <Link 
                  to="/education"
                  className="font-inter text-base text-pixel-dark hover:text-pixel-orange transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Educación
                </Link>
                <Link 
                  to="/ai"
                  className="font-inter text-base text-pixel-dark hover:text-pixel-orange transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  IA
                </Link>
                <Link 
                  to="/subscription"
                  className="font-inter text-base text-pixel-dark hover:text-pixel-orange transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Suscripción
                </Link>
                <div className="space-y-2 pt-2 border-t">
                  <div className="text-sm text-pixel-dark">
                    Hola, {user.user_metadata?.nombre || user.email?.split('@')[0]}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSignOut}
                    className="w-full bg-pixel-dark text-white border-pixel-dark hover:bg-pixel-orange hover:text-white hover:border-pixel-orange"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Cerrar Sesión
                  </Button>
                </div>
              </>
            ) : (
              <>
                <a href="#inicio" className="font-inter text-base text-pixel-dark hover:text-pixel-orange transition-colors" onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('inicio')?.scrollIntoView({ behavior: 'smooth' });
                  setIsMenuOpen(false);
                }}>
                  Inicio
                </a>
                <a href="#cursos" className="font-inter text-base text-pixel-dark hover:text-pixel-orange transition-colors" onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('cursos')?.scrollIntoView({ behavior: 'smooth' });
                  setIsMenuOpen(false);
                }}>
                  Cursos
                </a>
                <a href="#certificaciones" className="font-inter text-base text-pixel-dark hover:text-pixel-orange transition-colors" onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('certificaciones')?.scrollIntoView({ behavior: 'smooth' });
                  setIsMenuOpen(false);
                }}>
                  Certificaciones
                </a>
                <a href="#paquetes" className="font-inter text-base text-pixel-dark hover:text-pixel-orange transition-colors" onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('paquetes')?.scrollIntoView({ behavior: 'smooth' });
                  setIsMenuOpen(false);
                }}>
                  Paquetes
                </a>
              </>
            )}
            {!user && (
              <Link to="/auth">
                <Button className="bg-pixel-dark text-white font-inter font-medium text-sm px-6 py-2 rounded-lg hover:bg-pixel-orange transition-colors mt-2 w-full">
                  ¡Comienza aquí!
                </Button>
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>;
};
export default Header;