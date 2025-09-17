import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MobileLayout } from '@/components/MobileLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
interface CourseProps {
  hideLayout?: boolean;
}
interface Course {
  id: string;
  titulo: string;
  descripcion: string;
  nivel: string;
  precio: number;
  duracion_horas: number;
  imagen_url: string;
  instructor_id: string;
  activo: boolean;
}
const Courses = ({
  hideLayout = false
}: CourseProps) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const {
    user
  } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const {
          data,
          error
        } = await supabase.from('courses').select('*').eq('activo', true).order('created_at', {
          ascending: false
        });
        if (error) {
          console.error('Error fetching courses:', error);
          return;
        }
        setCourses(data || []);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);
  const getLevelColor = (nivel: string) => {
    switch (nivel.toLowerCase()) {
      case 'básico':
        return 'bg-green-100 text-green-800';
      case 'intermedio':
        return 'bg-yellow-100 text-yellow-800';
      case 'avanzado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  const handleCourseClick = (courseId: string) => {
    navigate(`/course/${courseId}`);
  };
  const coursesList = <>
      {loading ? <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div> : courses.length === 0 ? <div className="text-center py-12">
          <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-muted-foreground text-lg">
            No hay cursos disponibles en este momento.
          </p>
        </div> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map(course => <Card key={course.id} className="bg-card border hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleCourseClick(course.id)}>
              <CardContent className="p-0">
                {course.imagen_url && <div className="aspect-video relative overflow-hidden rounded-t-lg">
                    <img src={course.imagen_url} alt={course.titulo} className="w-full h-full object-cover" />
                  </div>}
                <div className="p-4 bg-[#3d3d3d]">
                  <h3 className="font-semibold text-foreground text-lg mb-2 line-clamp-2">
                    {course.titulo}
                  </h3>
                  <p className="text-sm mb-3 line-clamp-2 text-gray-50">
                    {course.descripcion}
                  </p>
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="secondary" className={getLevelColor(course.nivel)}>
                      {course.nivel}
                    </Badge>
                    <span className="text-sm text-zinc-50">
                      {course.duracion_horas} horas
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-foreground">
                      ${course.precio}
                    </span>
                    <Button size="sm" onClick={e => {
                e.stopPropagation();
                handleCourseClick(course.id);
              }} className="touch-target">
                      Ver Detalles
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>)}
        </div>}
    </>;
  if (hideLayout) {
    return coursesList;
  }
  return <MobileLayout title="Cursos">
      <div className="container-padding section-spacing">
        <div className="mb-6">
          <h1 className="text-responsive-2xl font-bold text-foreground mb-2">
            Explorar Cursos
          </h1>
          <p className="text-responsive-base text-slate-50">
            Descubre nuevos conocimientos y habilidades
          </p>
        </div>
        {coursesList}
      </div>
    </MobileLayout>;
};
export default Courses;