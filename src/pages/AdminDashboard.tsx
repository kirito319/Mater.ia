import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, BookOpen, Award, TrendingUp, Trash2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { UsersAndCertificationsTab } from '@/components/UsersAndCertificationsTab';
import { MobileLayout } from '@/components/MobileLayout';
interface AdminStats {
  totalCourses: number;
  totalUsers: number;
  totalEnrollments: number;
  totalCertificates: number;
}
interface Course {
  id: string;
  titulo: string;
  descripcion: string;
  nivel: string;
  precio: number;
  activo: boolean;
  created_at: string;
  enrollments?: {
    count: number;
  }[];
}
interface DeleteCourseButtonProps {
  courseId: string;
  courseName: string;
  onDelete: () => void;
}
const DeleteCourseButton = ({
  courseId,
  courseName,
  onDelete
}: DeleteCourseButtonProps) => {
  const [deleting, setDeleting] = useState(false);
  const deleteCourse = async () => {
    setDeleting(true);
    try {
      // Delete course forms first to avoid foreign key constraint violation
      await supabase.from('course_forms').delete().eq('course_id', courseId);

      // Delete other related data
      await supabase.from('course_form_submissions').delete().eq('course_id', courseId);
      await supabase.from('certifications').delete().eq('course_id', courseId);
      await supabase.from('enrollments').delete().eq('course_id', courseId);

      // Delete course slides and modules (will cascade)
      const {
        data: modules
      } = await supabase.from('course_modules').select('id').eq('course_id', courseId);
      if (modules) {
        for (const module of modules) {
          await supabase.from('course_slides').delete().eq('module_id', module.id);
        }
      }
      await supabase.from('course_modules').delete().eq('course_id', courseId);

      // Finally delete the course
      const {
        error
      } = await supabase.from('courses').delete().eq('id', courseId);
      if (error) throw error;
      toast.success('Curso eliminado correctamente');
      onDelete();
    } catch (error) {
      console.error('Error deleting course:', error);
      toast.error('Error al eliminar el curso');
    } finally {
      setDeleting(false);
    }
  };
  return <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm" className="bg-background/80 backdrop-blur text-red-600 hover:bg-red-50" disabled={deleting}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción eliminará permanentemente el curso "{courseName}" y todo su contenido 
            incluyendo módulos, slides, inscripciones y certificados. Esta acción no se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={deleteCourse} className="bg-red-600 hover:bg-red-700" disabled={deleting}>
            {deleting ? 'Eliminando...' : 'Eliminar'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>;
};
export default function AdminDashboard() {
  const {
    user
  } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminStats>({
    totalCourses: 0,
    totalUsers: 0,
    totalEnrollments: 0,
    totalCertificates: 0
  });
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    checkAdminAccess();
    fetchAdminData();
  }, [user]);
  const checkAdminAccess = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    try {
      const {
        data,
        error
      } = await supabase.from('user_roles').select('role').eq('user_id', user.id).eq('role', 'admin').single();
      if (error || !data) {
        toast.error('Acceso denegado. Se requieren permisos de administrador.');
        navigate('/dashboard');
        return;
      }
    } catch (error) {
      console.error('Error checking admin access:', error);
      navigate('/dashboard');
    }
  };
  const fetchAdminData = async () => {
    try {
      setLoading(true);

      // Fetch stats
      const [coursesRes, enrollmentsRes, certificatesRes] = await Promise.all([supabase.from('courses').select('id', {
        count: 'exact'
      }), supabase.from('enrollments').select('id', {
        count: 'exact'
      }), supabase.from('certifications').select('id', {
        count: 'exact'
      })]);

      // Count users (estimated from profiles table)
      const {
        count: usersCount
      } = await supabase.from('profiles').select('id', {
        count: 'exact'
      });
      setStats({
        totalCourses: coursesRes.count || 0,
        totalUsers: usersCount || 0,
        totalEnrollments: enrollmentsRes.count || 0,
        totalCertificates: certificatesRes.count || 0
      });

      // Fetch courses with enrollment counts
      const {
        data: coursesData,
        error: coursesError
      } = await supabase.from('courses').select(`
          *,
          enrollments(count)
        `).order('created_at', {
        ascending: false
      });
      if (coursesError) throw coursesError;
      setCourses(coursesData || []);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast.error('Error al cargar los datos del panel de administración');
    } finally {
      setLoading(false);
    }
  };
  if (loading) {
    return <MobileLayout hideHeader={true}>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center h-96">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </div>
        </div>
      </MobileLayout>;
  }
  const statCards = [{
    title: "Total Cursos",
    value: stats.totalCourses,
    icon: BookOpen,
    description: "Cursos en la plataforma"
  }, {
    title: "Total Usuarios",
    value: stats.totalUsers,
    icon: Users,
    description: "Usuarios registrados"
  }, {
    title: "Inscripciones",
    value: stats.totalEnrollments,
    icon: TrendingUp,
    description: "Inscripciones totales"
  }, {
    title: "Certificados",
    value: stats.totalCertificates,
    icon: Award,
    description: "Certificados emitidos"
  }];
  return <MobileLayout hideHeader={true}>
      <div className="container-padding section-spacing min-h-screen bg-[#555555] py-0">
        <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="space-y-4">
          <Button variant="outline" onClick={() => navigate('/dashboard')} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white">Panel de Administración</h1>
            <p className="text-lg text-white">
              Gestiona cursos, usuarios y contenido de la plataforma
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => <Card key={index} className="bg-ui-light-gray border-0 rounded-lg">
              <CardContent className="p-6 bg-[#3e3e3e] py-[5px] rounded-sm">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <stat.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="mb-2 text-slate-50 text-4xl font-bold">{stat.value}</p>
                    <p className="text-sm font-medium text-zinc-50">{stat.title}</p>
                    <p className="text-xs text-zinc-50">{stat.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>)}
        </div>

        {/* Admin Tabs */}
        <Tabs defaultValue="courses" className="space-y-6">
          <TabsList className="bg-ui-light-gray border-0 rounded-lg w-full grid grid-cols-3 bg-[#3e3e3e]">
            <TabsTrigger value="courses" className="text-xs sm:text-sm text-white">Cursos</TabsTrigger>
            <TabsTrigger value="users" className="text-xs sm:text-sm text-white">Usuarios</TabsTrigger>
            <TabsTrigger value="analytics" className="text-xs sm:text-sm text-white">Analíticas</TabsTrigger>
          </TabsList>

          <TabsContent value="courses" className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-xl sm:text-2xl font-semibold text-white">Gestión de Cursos</h2>
              <Button onClick={() => navigate('/admin/courses/new')} className="bg-primary/80 backdrop-blur hover:bg-primary w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Curso
              </Button>
            </div>

            <div className="grid gap-6">
              {courses.map(course => <Card key={course.id} className="bg-ui-light-gray border-0 rounded-lg bg-zinc-700">
                  <CardHeader className="bg-[#3e3e3e] py-[9px] rounded-sm">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                      <div className="flex-1">
                        <CardTitle className="text-white">{course.titulo}</CardTitle>
                        <CardDescription className="text-zinc-50">{course.descripcion}</CardDescription>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <Button variant="outline" size="sm" onClick={() => navigate(`/admin/courses/${course.id}/edit`)} className="bg-background/80 backdrop-blur w-full sm:w-auto text-slate-50">
                          Editar Info
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => navigate(`/admin/courses/${course.id}/content`)} className="bg-background/80 backdrop-blur w-full sm:w-auto text-gray-50">
                          Contenido
                        </Button>
                        <DeleteCourseButton courseId={course.id} courseName={course.titulo} onDelete={fetchAdminData} />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="bg-[#3e3e3e] p-8 rounded-sm">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-white">Nivel</p>
                        <p className="text-zinc-50">{course.nivel}</p>
                      </div>
                      <div>
                        <p className="font-medium text-white">Precio</p>
                        <p className="text-zinc-50">${course.precio}</p>
                      </div>
                      <div>
                        <p className="font-medium text-white">Estado</p>
                        <p className="text-zinc-50">
                          {course.activo ? 'Activo' : 'Inactivo'}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium text-white">Inscripciones</p>
                        <p className="text-zinc-50">
                          {course.enrollments?.[0]?.count || 0}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>)}
            </div>
          </TabsContent>

          <TabsContent value="users">
            <UsersAndCertificationsTab />
          </TabsContent>

          <TabsContent value="analytics">
            <Card className="bg-ui-light-gray border-0 rounded-lg">
              <CardContent className="p-8 text-center bg-[#3e3e3e] rounded-sm">
                <p className="text-zinc-50">
                  Dashboard de analíticas - En desarrollo
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        </div>
      </div>
    </MobileLayout>;
}