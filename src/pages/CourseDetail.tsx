import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, Users, Award, ArrowLeft, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { toast } from 'sonner';
import { MobileLayout } from '@/components/MobileLayout';
import { CourseFormSubmission } from '@/components/CourseFormSubmission';
import { FormQuestion } from '@/components/FormBuilder';
interface Course {
  id: string;
  titulo: string;
  descripcion: string;
  nivel: string;
  precio: number;
  duracion_horas: number;
  imagen_url: string;
  instructor_id: string;
  is_free: boolean;
  requires_form: boolean;
  learning_objectives: string[];
}
interface CourseForm {
  id: string;
  title: string;
  description: string;
  questions: FormQuestion[];
}
interface Enrollment {
  id: string;
  progreso: number;
  completado: boolean;
}
interface Module {
  id: string;
  titulo: string;
  descripcion: string;
  orden: number;
  slides_count: number;
}
export default function CourseDetail() {
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
  const [modules, setModules] = useState<Module[]>([]);
  const [courseForm, setCourseForm] = useState<CourseForm | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  useEffect(() => {
    if (id) {
      fetchCourseDetails();
      fetchModules();
      if (user) {
        checkEnrollment();
      }
    }
  }, [id, user]);
  useEffect(() => {
    if (course?.requires_form) {
      fetchCourseForm();
    }
  }, [course]);
  const fetchCourseDetails = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('courses').select('*').eq('id', id).eq('activo', true).single();
      if (error) throw error;

      // Type the learning objectives properly
      const typedCourse = {
        ...data,
        learning_objectives: Array.isArray(data.learning_objectives) ? data.learning_objectives as string[] : []
      };
      setCourse(typedCourse);
    } catch (error) {
      console.error('Error fetching course:', error);
      toast.error('Error al cargar el curso');
      navigate('/courses');
    } finally {
      setLoading(false);
    }
  };
  const fetchModules = async () => {
    if (!id) return;
    try {
      const {
        data: modulesData,
        error
      } = await supabase.from('course_modules').select(`
          *,
          course_slides(count)
        `).eq('course_id', id).eq('activo', true).order('orden');
      if (error) throw error;
      const modulesWithCounts = modulesData.map(module => ({
        ...module,
        slides_count: module.course_slides?.[0]?.count || 0
      }));
      setModules(modulesWithCounts);
    } catch (error) {
      console.error('Error fetching modules:', error);
    }
  };
  const fetchCourseForm = async () => {
    if (!id) return;
    try {
      const {
        data,
        error
      } = await supabase.from('course_forms').select('*').eq('course_id', id).eq('active', true).single();
      if (error) throw error;
      setCourseForm({
        ...data,
        questions: data.questions as unknown as FormQuestion[]
      });
    } catch (error) {
      console.error('Error fetching course form:', error);
    }
  };
  const checkEnrollment = async () => {
    if (!user || !id) return;
    try {
      const {
        data,
        error
      } = await supabase.from('enrollments').select('id, progreso, completado').eq('user_id', user.id).eq('course_id', id).single();
      if (!error && data) {
        setEnrollment(data);
      }
    } catch (error) {
      // No enrollment found - this is expected for new users
    }
  };
  const handleEnrollment = async () => {
    if (!user) {
      toast.error('Debes iniciar sesión para inscribirte');
      navigate('/auth');
      return;
    }
    if (!course) return;

    // Check if form is required and show modal
    if (course.requires_form && courseForm) {
      setShowFormModal(true);
      return;
    }

    // Direct enrollment for courses without forms
    setEnrolling(true);
    try {
      const {
        data,
        error
      } = await supabase.from('enrollments').insert({
        user_id: user.id,
        course_id: course.id,
        progreso: 0,
        completado: false
      }).select().single();
      if (error) throw error;
      setEnrollment(data);
      toast.success('¡Te has inscrito al curso exitosamente!');
    } catch (error) {
      console.error('Error enrolling in course:', error);
      toast.error('Error al inscribirse al curso');
    } finally {
      setEnrolling(false);
    }
  };
  const handleFormSubmissionComplete = () => {
    // Refresh enrollment status after form submission
    checkEnrollment();
  };
  const handleProgressUpdate = async (progressPercentage: number) => {
    if (!enrollment) return;
    try {
      const {
        error
      } = await supabase.from('enrollments').update({
        progreso: Math.round(progressPercentage),
        completado: progressPercentage >= 100
      }).eq('id', enrollment.id);
      if (error) throw error;
      setEnrollment(prev => prev ? {
        ...prev,
        progreso: Math.round(progressPercentage),
        completado: progressPercentage >= 100
      } : null);

      // Generate certificate if course completed
      if (progressPercentage >= 100 && !enrollment.completado) {
        await generateCertificate();
      }
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };
  const generateCertificate = async () => {
    if (!user || !course || !enrollment) return;
    try {
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
      if (error) throw error;
      toast.success('¡Felicitaciones! Has completado el curso y obtenido tu certificado.');
    } catch (error) {
      console.error('Error generating certificate:', error);
      toast.error('Error al generar el certificado');
    }
  };
  const getLevelColor = (nivel: string) => {
    switch (nivel.toLowerCase()) {
      case 'principiante':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'intermedio':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'avanzado':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  if (loading) {
    return <MobileLayout hideHeader={true}>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </MobileLayout>;
  }
  if (!course) {
    return <MobileLayout hideHeader={true}>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <p className="text-gray-600">Curso no encontrado</p>
        </div>
      </MobileLayout>;
  }
  return <MobileLayout hideHeader={true}>
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-4 bg-slate-800">
        <div className="max-w-6xl mx-auto space-y-6">
          
          {/* Back Button */}
          <Button variant="outline" onClick={() => navigate('/courses')} className="bg-background/80 backdrop-blur border-border/50">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Cursos
          </Button>

          {/* Course Header */}
          <Card className="bg-background/80 backdrop-blur border-border/50">
            <CardContent className="p-0">
              <div className="grid md:grid-cols-2 gap-0">
                {/* Course Image */}
                <div className="aspect-video md:aspect-square overflow-hidden">
                  <img src={course.imagen_url || "/placeholder.svg"} alt={course.titulo} className="w-full h-full object-cover" />
                </div>
                
                {/* Course Info */}
                <div className="p-8 space-y-6">
                  <div>
                    <Badge className={`mb-3 ${getLevelColor(course.nivel)}`}>
                      {course.nivel}
                    </Badge>
                    <h1 className="text-3xl font-bold mb-4 text-gray-50">{course.titulo}</h1>
                    <p className="text-lg text-zinc-50">{course.descripcion}</p>
                  </div>

                  {/* Course Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm text-slate-50">{course.duracion_horas} horas</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm text-slate-50">Estudiantes activos</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm text-zinc-50">Certificado incluido</span>
                    </div>
                    <div className="text-2xl font-bold text-primary">
                      {course.is_free ? <span className="text-green-600">Gratis</span> : `$${course.precio}`}
                    </div>
                  </div>

                  {/* Enrollment Status */}
                  {enrollment ? <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">Progreso del curso</span>
                        <span className="text-sm text-muted-foreground">{enrollment.progreso}%</span>
                      </div>
                      <Progress value={enrollment.progreso} className="h-2" />
                      {enrollment.completado && <div className="flex items-center gap-2 text-green-600">
                          <Award className="h-5 w-5" />
                          <span className="font-medium">¡Curso completado!</span>
                        </div>}
                      <Button className="w-full bg-primary/80 backdrop-blur hover:bg-primary" onClick={() => navigate(`/course/${course.id}/learn`)}>
                        <Play className="h-4 w-4 mr-2" />
                        {enrollment.completado ? 'Revisar Curso' : enrollment.progreso > 0 ? 'Continuar Curso' : 'Iniciar Curso'}
                      </Button>
                    </div> : <Button className="w-full bg-primary/80 backdrop-blur hover:bg-primary" onClick={handleEnrollment} disabled={enrolling}>
                      {enrolling ? 'Inscribiendo...' : course.requires_form ? 'Completar Formulario y Inscribirse' : 'Inscribirse al Curso'}
                    </Button>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Course Form Modal */}
          {courseForm && <CourseFormSubmission courseId={course.id} courseForm={courseForm} onSubmissionComplete={handleFormSubmissionComplete} isOpen={showFormModal} onClose={() => setShowFormModal(false)} />}

          {/* Course Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-background/80 backdrop-blur border border-border/50">
              <TabsTrigger value="overview" className="text-gray-50">Información General</TabsTrigger>
              <TabsTrigger value="modules" className="text-zinc-50">Módulos</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="bg-background/80 backdrop-blur border-border/50">
                  <CardHeader>
                    <CardTitle className="text-gray-50">Lo que aprenderás</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-muted-foreground">
                      {course.learning_objectives && course.learning_objectives.length > 0 ? course.learning_objectives.map((objective, index) => <li key={index} className="">• {objective}</li>) : <>
                          <li>• Conceptos fundamentales del curso</li>
                          <li>• Aplicación práctica de conocimientos</li>
                          <li>• Desarrollo de habilidades técnicas</li>
                        </>}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-background/80 backdrop-blur border-border/50">
                  <CardHeader>
                    <CardTitle className="text-zinc-50">Certificación</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Award className="h-5 w-5 text-primary" />
                        <span className="text-sm text-zinc-50">Certificado digital</span>
                      </div>
                      <p className="text-sm text-zinc-50">
                        Recibe un certificado verificable al completar el curso.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>


            <TabsContent value="modules" className="space-y-6">
              <div className="space-y-4">
                {modules.length > 0 ? modules.map((module, index) => <Card key={module.id} className="bg-background/80 backdrop-blur border-border/50">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-gray-50">
                              Módulo {index + 1}: {module.titulo}
                            </CardTitle>
                            <CardDescription className="text-gray-50">{module.descripcion}</CardDescription>
                          </div>
                          
                        </div>
                      </CardHeader>
                    </Card>) : <Card className="bg-background/80 backdrop-blur border-border/50">
                    <CardContent className="p-8 text-center">
                      <p className="text-muted-foreground">
                        El contenido del curso se está preparando. ¡Vuelve pronto!
                      </p>
                    </CardContent>
                  </Card>}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MobileLayout>;
}