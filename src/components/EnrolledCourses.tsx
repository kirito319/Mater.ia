import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
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
    learning_objectives: string[];
  };
}
export const EnrolledCourses = () => {
  const {
    user
  } = useAuth();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (user) {
      fetchEnrollments();
    }
  }, [user]);
  const fetchEnrollments = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('enrollments').select(`
          *,
          courses (
            titulo,
            descripcion,
            duracion_horas,
            nivel,
            imagen_url,
            learning_objectives
          )
        `).eq('user_id', user?.id);
      if (error) throw error;

      // Map and type the data properly
      const typedEnrollments = (data || []).map(enrollment => ({
        ...enrollment,
        courses: {
          ...enrollment.courses,
          learning_objectives: Array.isArray(enrollment.courses.learning_objectives) ? enrollment.courses.learning_objectives as string[] : []
        }
      }));
      setEnrollments(typedEnrollments);
    } catch (error) {
      console.error('Error fetching enrollments:', error);
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
  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>;
  }
  if (enrollments.length === 0) {
    return <div className="text-center py-8">
        <div className="bg-[#3e3e3e] p-6 rounded-lg max-w-md mx-auto">
          <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-white/90 mb-4">
            Aún no te has inscrito en ningún curso
          </p>
          <Link to="/education?tab=explorar">
            <Button>Explorar Cursos</Button>
          </Link>
        </div>
      </div>;
  }
  return <div className="space-y-4">
      {enrollments.map(enrollment => <Card key={enrollment.id} className="bg-ui-card-dark border-0 p-4 bg-[#3d3d3d]">
          <CardContent className="p-0">
            {/* Top row: Progress %, Status, Level */}
            <div className="flex items-center justify-between mb-4">
              {/* Progress percentage (left) */}
              <div className="flex-shrink-0">
                <span className="text-white text-lg font-montserrat font-extrabold">
                  {enrollment.progreso}%
                </span>
              </div>
              
              {/* Status (center) */}
              <div className="flex-1 flex justify-center">
                {enrollment.completado && <Badge className="text-black text-xs px-3 py-1 rounded-full bg-[#6bfbc3]">
                    Completado
                  </Badge>}
              </div>
              
              {/* Level (right) */}
              <div className="flex-shrink-0">
                <Badge className="text-white text-xs px-3 py-1 rounded-full bg-[#545454]">
                  {enrollment.courses.nivel}
                </Badge>
              </div>
            </div>
            
            {/* Course title */}
            <h3 className="text-ui-text-light font-semibold text-base mb-3 font-montserrat text-center text-slate-50">
              {enrollment.courses.titulo}
            </h3>
            
            {/* Progress bar */}
            <div className="mb-4">
              <Progress value={enrollment.progreso} className="h-2 bg-ui-secondary [&>div]:bg-ui-primary" />
            </div>

            {/* Continue button (centered) */}
            <div className="flex justify-center">
              <Link to={`/course/${enrollment.course_id}/learn`}>
                <Button className="bg-ui-primary hover:bg-ui-primary px-6 py-2 text-sm font-montserrat bg-[#ebebeb] text-zinc-950">
                  Continuar &gt;&gt;
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>)}
    </div>;
};