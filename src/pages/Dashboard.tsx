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
    return <MobileLayout title="Dashboard" hideHeader={true}>
        <div className="container-padding">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          </div>
        </div>
      </MobileLayout>;
  }
  return <MobileLayout title="Dashboard" hideHeader={true}>
      <div className="container-padding section-spacing min-h-screen bg-[#555555] py-0">
        {/* Welcome Section */}
        <div className="mb-8">
          {/* Text box above Bienvenidos */}
          <div className="rounded-lg p-4 mb-4 text-center bg-[#3e3e3e]/0 py-0">
            <p className="text-white font-semibold text-base my-[21px]">El futuro de la educacion es ahora.
¡Felicidades por ser parte!</p>
          </div>
          
          {/* Bienvenidos */}
          <div className="text-center mb-4">
            <h1 className="text-4xl font-bold text-white mb-3">Bienvenida/o</h1>
            
            {/* User's name and account status */}
            <div className="flex items-center justify-center gap-3 mx-[8px] px-0 my-0 py-0">
              <span className="font-semibold text-white text-lg">
                {user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'Usuario'}
              </span>
              <Badge className="bg-ui-medium-dark text-ui-light-gray border-0 px-3 py-1 text-sm">
                Estándar
              </Badge>
            </div>
          </div>
        </div>

        {/* Estadísticas Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4 text-left">Estadísticas</h2>
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-ui-light-gray border-0 rounded-lg">
              <CardContent className="p-6 bg-[#3e3e3e] py-[5px] rounded-sm">
                <div className="text-center">
                  <p className="mb-2 text-slate-50 text-4xl font-bold">{stats.certificates}</p>
                  <p className="text-sm font-medium text-ui-medium-gray text-zinc-50">Certificaciones Obtenidas</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-ui-light-gray border-0 rounded-lg">
              <CardContent className="p-6 bg-[#3e3e3e] py-[5px] rounded-sm">
                <div className="text-center">
                  <p className="mb-2 text-slate-50 text-4xl font-bold">{stats.calculatedHours}</p>
                  <p className="text-sm font-medium text-ui-medium-gray text-zinc-50">Horas Certificadas</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Enrolled Courses */}
        <div className="space-y-6 mb-8">
          <h2 className="mb-4 text-xl font-semibold text-white">Mis Cursos</h2>
          {enrollments.length === 0 ? <div className="bg-[#3e3e3e] p-6 text-center rounded-sm">
              <BookOpen className="h-12 w-12 text-ui-medium-gray mx-auto mb-4" />
              <p className="text-ui-light-gray mb-4">
                Aún no te has inscrito en ningún curso
              </p>
              <Link to="/education?tab=explorar">
                <Button className="bg-ui-blue text-white hover:bg-ui-blue/90">Explorar Cursos</Button>
              </Link>
            </div> : <div className="space-y-3">
              {enrollments.map(enrollment => <div key={enrollment.id} className="p-6 rounded-lg bg-ui-medium-dark bg-[#3e3e3e] py-[15px] px-[13px]">
                  {/* Top row with status, percentage, and level */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex-shrink-0">
                      {enrollment.completado ? <Badge className="bg-ui-green text-ui-dark hover:bg-ui-green text-xs px-2 py-1">
                          Completado
                        </Badge> : <Badge className="bg-ui-medium-gray text-white text-xs px-2 py-1">
                          Cursando
                        </Badge>}
                    </div>
                    
                    <div className="flex-1 text-center">
                      <span className="text-2xl font-bold text-white">
                        {enrollment.progreso}%
                      </span>
                    </div>
                    
                    <div className="flex-shrink-0">
                      <Badge className="bg-ui-medium-gray text-white border-0 text-xs px-2 py-1">
                        {enrollment.courses.nivel}
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Course title */}
                  <h3 className="font-semibold text-white mb-4 text-center">
                    {enrollment.courses.titulo}
                  </h3>
                  
                  {/* Progress bar */}
                  <div className="mb-4">
                    <Progress value={enrollment.progreso} className="h-3 bg-ui-medium-gray [&>div]:bg-ui-blue" />
                  </div>

                  {/* Continue button - centered */}
                  <div className="flex justify-center">
                    <Link to={`/course/${enrollment.course_id}/learn`}>
                      <Button size="sm" className="touch-target bg-ui-light-gray text-ui-dark hover:bg-ui-light-gray my-0 mx-0 py-0 px-[113px] font-semibold">Continuar </Button>
                    </Link>
                  </div>
                </div>)}
            </div>}

          {/* Centro de Control */}
          <h2 className="text-xl font-semibold text-white mb-4 text-left">Centro de Control</h2>
          <Card className="bg-ui-light-gray border-0 rounded-lg">
            <CardContent className="grid grid-cols-2 gap-3 bg-[#3e3e3e] p-6 rounded-sm my-0 py-[12px]">
              <Link to="/profile">
                <Button variant="outline" className="w-full touch-target text-sm border-ui-medium-gray hover:bg-ui-light-gray h-6 text-zinc-50 bg-[#0c96de]">
                  Perfil
                </Button>
              </Link>
              <Link to="/education">
                <Button variant="outline" className="w-full touch-target text-sm border-ui-medium-gray hover:bg-ui-light-gray h-6 text-gray-50 bg-[#0c96de]">
                  Educación
                </Button>
              </Link>
              {isAdmin && <Link to="/admin">
                  <Button variant="outline" className="w-full touch-target text-sm bg-white border-ui-medium-gray text-ui-dark hover:bg-ui-light-gray h-6">
                    Admin Panel
                  </Button>
                </Link>}
              <Button variant="outline" onClick={handleSignOut} disabled={authLoading} className="w-full touch-target text-sm border-ui-medium-gray hover:bg-ui-light-gray h-6 text-slate-50 bg-[#0c96de]">
                <LogOut className="h-4 w-4 mr-2" />
                {authLoading ? 'Cerrando...' : 'Cerrar Sesión'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </MobileLayout>;
};
export default Dashboard;