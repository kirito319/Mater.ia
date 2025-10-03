import { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Award, Clock, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/MobileLayout';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { useAuthHook } from '@/hooks/useAuth';
interface Enrollment {
  id: string;
  course_id: string;
  progreso: number;
  completado: boolean;
  fecha_inscripcion: string;
  fecha_completado: string | null;
  courses: {
    titulo: string;
    descripcion: string;
    duracion_horas: number;
    nivel: string;
    imagen_url: string;
  };
}
interface DashboardStats {
  calculatedHours: number;
  certificates: number;
}
const Dashboard = () => {
  const {
    user
  } = useAuth();
  const {
    isAdmin
  } = useAdminCheck();
  const navigate = useNavigate();
  const {
    signOut,
    loading: authLoading
  } = useAuthHook();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    calculatedHours: 0,
    certificates: 0
  });
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);
  const fetchDashboardData = async () => {
    try {
      // Fetch enrollments with course details
      const {
        data: enrollmentsData,
        error: enrollmentsError
      } = await supabase.from('enrollments').select(`
          *,
          courses (
            titulo,
            descripcion,
            duracion_horas,
            nivel,
            imagen_url
          )
        `).eq('user_id', user?.id);
      if (enrollmentsError) throw enrollmentsError;

      // Fetch certificates count
      const {
        count: certificatesCount,
        error: certificatesError
      } = await supabase.from('certifications').select('*', {
        count: 'exact',
        head: true
      }).eq('user_id', user?.id);
      if (certificatesError) throw certificatesError;
      setEnrollments(enrollmentsData || []);

      // Calculate hours using the formula: (Duration × Progress) for each course
      const calculatedHours = enrollmentsData?.reduce((sum, e) => {
        return sum + e.courses.duracion_horas * e.progreso / 100;
      }, 0) || 0;
      setStats({
        calculatedHours: Math.round(calculatedHours * 10) / 10,
        // Round to 1 decimal place
        certificates: certificatesCount || 0
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };
  const getLevelColor = (nivel: string) => {
    switch (nivel.toLowerCase()) {
      case 'principiante':
        return 'bg-green-500/20 text-green-700';
      case 'intermedio':
        return 'bg-yellow-500/20 text-yellow-700';
      case 'avanzado':
        return 'bg-red-500/20 text-red-700';
      default:
        return 'bg-gray-500/20 text-gray-700';
    }
  };
  const handleSignOut = async () => {
    const result = await signOut();
    if (!result.error) {
      navigate('/auth');
    }
  };
  if (loading) {
    return (
      <MobileLayout title="Dashboard" hideHeader={true}>
        <div className="container-padding">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          </div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title="Dashboard" hideHeader={true}>
      <div className="container-padding section-spacing min-h-screen bg-white py-4">
        {/* Welcome Section */}
        <div className="mb-8">
          {/* Header text */}
          <div className="mb-6">
            <p className="text-black font-bold text-base text-center">
              El futuro de la educación es ahora. ¡Felicidades por ser parte!
            </p>
          </div>
          
          {/* Bienvenido section */}
          <div className="text-left mb-6">
            <h1 className="text-4xl font-bold text-black mb-2">Bienvenido</h1>
            
            {/* User's name and account status */}
            <div className="flex items-center gap-3">
              <span className="font-normal text-black text-lg">
                {user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'User\'s First Name'}
              </span>
              <Badge className="bg-gray-600 text-white text-xs px-2 py-1 rounded font-medium">
                Estándar
              </Badge>
            </div>
          </div>
        </div>

        {/* Estadísticas Section */}
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-black mb-4 text-left">Estadísticas</h2>
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-gray-200 border border-blue-500 rounded-lg">
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="mb-2 text-black text-4xl font-bold">{stats.certificates}</p>
                  <p className="text-sm font-medium text-black">Certificaciones</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-200 border border-gray-700 rounded-lg">
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="mb-2 text-black text-4xl font-bold">{stats.calculatedHours}</p>
                  <p className="text-sm font-medium text-black">Horas Ahorradas</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Enrolled Courses */}
        <div className="space-y-6 mb-8">
          <h2 className="mb-4 text-xl font-semibold text-black">Mis Cursos</h2>
          {enrollments.length === 0 ? (
            <div className="bg-gray-200 p-6 text-center rounded-lg border border-black">
              <BookOpen className="h-12 w-12 text-black mx-auto mb-4" />
              <p className="text-black mb-4">
                Aún no te has inscrito en ningún curso
              </p>
              <Link to="/education?tab=explorar">
                <Button className="bg-blue-600 text-white hover:bg-blue-700">Explorar Cursos</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {enrollments.map(enrollment => (
                <Card key={enrollment.id} className="bg-gray-200 border border-black rounded-lg">
                  <CardContent className="p-6">
                    {/* Top row with status, percentage, and level */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2">
                        {enrollment.completado && (
                          <Badge className="bg-green-500 text-white text-xs px-2 py-1 rounded">
                            Completado
                          </Badge>
                        )}
                        {enrollment.progreso > 0 && !enrollment.completado && (
                          <span className="text-xl font-bold text-black">
                            {enrollment.progreso}%
                          </span>
                        )}
                      </div>
                      
                      <div className="flex-shrink-0">
                        <Badge className="bg-gray-400 text-black border-0 text-xs px-2 py-1 rounded">
                          {enrollment.courses.nivel === 'principiante' ? 'Básico' : enrollment.courses.nivel}
                        </Badge>
                      </div>
                    </div>
                    
                    {/* Course title */}
                    <h3 className="font-bold text-black mb-4">
                      {enrollment.courses.titulo}
                    </h3>
                    
                    {/* Progress bar */}
                    <div className="mb-6">
                      <div className="w-full bg-gray-400 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${enrollment.progreso}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Continue button - centered */}
                    <div className="flex justify-center">
                      <Link to={`/course/${enrollment.course_id}/learn`}>
                        <Button 
                          size="sm" 
                          className="bg-gray-300 text-black hover:bg-gray-400 border border-gray-500 px-4 py-2 rounded font-normal flex items-center gap-1"
                        >
                          Continuar >> 
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Centro de Control */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-black mb-4 text-left">Centro de Control</h2>
          <Card className="bg-gray-200 border border-black rounded-lg">
            <CardContent className="grid grid-cols-2 gap-3 p-6">
              <Link to="/profile">
                <Button className="w-full text-black bg-white border border-black hover:bg-gray-100 h-10 text-sm font-normal rounded">
                  Perfil
                </Button>
              </Link>
              <Button
                onClick={handleSignOut}
                disabled={authLoading}
                className="w-full text-black bg-white border border-black hover:bg-gray-100 h-10 text-sm font-normal rounded flex items-center justify-center"
              >
                Cerrar Sesión
              </Button>
              <Link to="/education">
                <Button className="w-full text-black bg-white border border-black hover:bg-gray-100 h-10 text-sm font-normal rounded">
                  Educación
                </Button>
              </Link>
              {isAdmin && (
                <Link to="/admin">
                  <Button className="w-full text-black bg-white border border-black hover:bg-gray-100 h-10 text-sm font-normal rounded">
                    Admin Panel
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        </div>

      </div>
    </MobileLayout>
  );
};
export default Dashboard;
