import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Book } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { EnhancedSlideViewer } from '@/components/EnhancedSlideViewer';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { toast } from 'sonner';
import { MobileLayout } from '@/components/MobileLayout';
interface Course {
  id: string;
  titulo: string;
  descripcion: string;
}
interface Enrollment {
  id: string;
  progreso: number;
  completado: boolean;
}
export default function CourseLearn() {
  const {
    id
  } = useParams<{
    id: string;
  }>();
  const navigate = useNavigate();
  const {
    user
  } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (id && user) {
      fetchCourseAndEnrollment();
    }
  }, [id, user]);
  const fetchCourseAndEnrollment = async () => {
    if (!id || !user) return;
    try {
      // Fetch course details
      const {
        data: courseData,
        error: courseError
      } = await supabase.from('courses').select('id, titulo, descripcion').eq('id', id).eq('activo', true).single();
      if (courseError) throw courseError;

      // Check enrollment
      const {
        data: enrollmentData,
        error: enrollmentError
      } = await supabase.from('enrollments').select('id, progreso, completado').eq('user_id', user.id).eq('course_id', id).single();
      if (enrollmentError) {
        toast.error('No estás inscrito en este curso');
        navigate(`/course/${id}`);
        return;
      }
      setCourse(courseData);
      setEnrollment(enrollmentData);
    } catch (error) {
      console.error('Error fetching course:', error);
      toast.error('Error al cargar el curso');
      navigate('/courses');
    } finally {
      setLoading(false);
    }
  };
  const handleProgressUpdate = async (progressPercentage: number, moduleCompletionData?: {
    completedModules: number;
    totalModules: number;
    allModulesCompleted: boolean;
  }) => {
    if (!enrollment) return;
    try {
      const {
        error
      } = await supabase.from('enrollments').update({
        progreso: Math.round(progressPercentage),
        completado: moduleCompletionData?.allModulesCompleted || false
      }).eq('id', enrollment.id);
      if (error) throw error;
      setEnrollment(prev => prev ? {
        ...prev,
        progreso: Math.round(progressPercentage),
        completado: moduleCompletionData?.allModulesCompleted || false
      } : null);

      // Generate certificate ONLY if ALL modules are completed
      if (moduleCompletionData?.allModulesCompleted) {
        // Check if certificate already exists before generating
        const {
          data: existingCert
        } = await supabase.from('certifications').select('id').eq('user_id', user?.id).eq('course_id', course?.id).single();
        if (!existingCert) {
          await generateCertificate();
        }
      }
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };
  const generateCertificate = async () => {
    if (!user || !course || !enrollment) return;
    try {
      // Check if certificate already exists
      const {
        data: existingCert,
        error: checkError
      } = await supabase.from('certifications').select('id').eq('user_id', user.id).eq('course_id', course.id).single();
      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      // If certificate already exists, don't create another one
      if (existingCert) {
        toast.success('¡Felicitaciones! Ya tienes un certificado para este curso.');
        setTimeout(() => {
          navigate(`/course/${course.id}`);
        }, 2000);
        return;
      }
      const certificateNumber = `CERT-${Date.now()}-${user.id.slice(0, 8)}`;
      const {
        error
      } = await supabase.from('certifications').insert({
        user_id: user.id,
        course_id: course.id,
        enrollment_id: enrollment.id,
        numero_certificado: certificateNumber,
        verificado: true
      });
      if (error) {
        // Handle unique constraint violation (duplicate certificate)
        if (error.code === '23505') {
          toast.success('¡Felicitaciones! Ya tienes un certificado para este curso.');
          setTimeout(() => {
            navigate(`/course/${course.id}`);
          }, 2000);
          return;
        }
        throw error;
      }
      toast.success('¡Felicitaciones! Has completado el curso y obtenido tu certificado.');

      // Redirect back to course detail page
      setTimeout(() => {
        navigate(`/course/${course.id}`);
      }, 2000);
    } catch (error) {
      console.error('Error generating certificate:', error);
      toast.error('Error al generar el certificado');
    }
  };
  if (loading) {
    return <MobileLayout hideHeader={true}>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </MobileLayout>;
  }
  if (!course || !enrollment) {
    return <MobileLayout hideHeader={true}>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <Card className="bg-background/80 backdrop-blur border-border/50 p-8">
            <CardContent className="text-center">
              <p className="text-muted-foreground">No se pudo cargar el curso</p>
            </CardContent>
          </Card>
        </div>
      </MobileLayout>;
  }
  return <MobileLayout hideHeader={true}>
      <div className="min-h-screen p-4 bg-[hsl(var(--ui-medium-gray))]">
        <div className="max-w-6xl mx-auto space-y-6">
          
          {/* Navigation Header */}
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={() => navigate(`/course/${course.id}`)} className="bg-background/80 backdrop-blur border-border/50">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Curso
            </Button>
            
            
          </div>

          {/* Enhanced Slide Viewer */}
          <EnhancedSlideViewer courseId={course.id} enrollmentId={enrollment.id} onProgressUpdate={handleProgressUpdate} />
        </div>
      </div>
    </MobileLayout>;
}