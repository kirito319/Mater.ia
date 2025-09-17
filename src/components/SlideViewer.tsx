import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Check, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { toast } from 'sonner';

interface Slide {
  id: string;
  titulo: string;
  imagen_url: string;
  contenido: string;
  orden: number;
  duracion_estimada: number;
}

interface Module {
  id: string;
  titulo: string;
  descripcion: string;
  orden: number;
  slides: Slide[];
}

interface SlideViewerProps {
  courseId: string;
  enrollmentId: string;
  onProgressUpdate: (progress: number) => void;
}

export const SlideViewer: React.FC<SlideViewerProps> = ({ 
  courseId, 
  enrollmentId, 
  onProgressUpdate 
}) => {
  const { user } = useAuth();
  const [modules, setModules] = useState<Module[]>([]);
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [completedSlides, setCompletedSlides] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [slideStartTime, setSlideStartTime] = useState<Date | null>(null);

  const currentModule = modules[currentModuleIndex];
  const currentSlide = currentModule?.slides[currentSlideIndex];
  const totalSlides = modules.reduce((total, module) => total + module.slides.length, 0);
  const completedCount = completedSlides.size;
  const progressPercentage = totalSlides > 0 ? (completedCount / totalSlides) * 100 : 0;

  useEffect(() => {
    fetchCourseContent();
    fetchUserProgress();
  }, [courseId, user]);

  useEffect(() => {
    if (currentSlide) {
      setSlideStartTime(new Date());
    }
  }, [currentSlide]);

  useEffect(() => {
    onProgressUpdate(progressPercentage);
  }, [progressPercentage, onProgressUpdate]);

  const fetchCourseContent = async () => {
    try {
      const { data: modulesData, error: modulesError } = await supabase
        .from('course_modules')
        .select('*')
        .eq('course_id', courseId)
        .eq('activo', true)
        .order('orden');

      if (modulesError) throw modulesError;

      const modulesWithSlides = await Promise.all(
        modulesData.map(async (module) => {
          const { data: slidesData, error: slidesError } = await supabase
            .from('course_slides')
            .select('*')
            .eq('module_id', module.id)
            .eq('activo', true)
            .order('orden');

          if (slidesError) throw slidesError;

          return {
            ...module,
            slides: slidesData
          };
        })
      );

      setModules(modulesWithSlides);
    } catch (error) {
      console.error('Error fetching course content:', error);
      toast.error('Error al cargar el contenido del curso');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProgress = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_progress')
        .select('slide_id')
        .eq('user_id', user.id)
        .eq('enrollment_id', enrollmentId)
        .eq('completado', true);

      if (error) throw error;

      setCompletedSlides(new Set(data.map(p => p.slide_id)));
    } catch (error) {
      console.error('Error fetching user progress:', error);
    }
  };

  const markSlideComplete = async (slideId: string) => {
    if (!user || !slideStartTime) return;

    const endTime = new Date();
    const timeSpent = Math.floor((endTime.getTime() - slideStartTime.getTime()) / 1000);

    try {
      const { error } = await supabase
        .from('user_progress')
        .upsert({
          user_id: user.id,
          enrollment_id: enrollmentId,
          slide_id: slideId,
          completado: true,
          tiempo_inicio: slideStartTime.toISOString(),
          tiempo_completado: endTime.toISOString(),
          tiempo_total_segundos: timeSpent
        });

      if (error) throw error;

      setCompletedSlides(prev => new Set([...prev, slideId]));
      toast.success('Slide completado');
    } catch (error) {
      console.error('Error marking slide complete:', error);
      toast.error('Error al marcar el slide como completado');
    }
  };

  const navigateSlide = (direction: 'next' | 'prev') => {
    if (!currentModule) return;

    if (direction === 'next') {
      if (currentSlideIndex < currentModule.slides.length - 1) {
        setCurrentSlideIndex(currentSlideIndex + 1);
      } else if (currentModuleIndex < modules.length - 1) {
        setCurrentModuleIndex(currentModuleIndex + 1);
        setCurrentSlideIndex(0);
      }
    } else {
      if (currentSlideIndex > 0) {
        setCurrentSlideIndex(currentSlideIndex - 1);
      } else if (currentModuleIndex > 0) {
        setCurrentModuleIndex(currentModuleIndex - 1);
        setCurrentSlideIndex(modules[currentModuleIndex - 1].slides.length - 1);
      }
    }
  };

  const canGoNext = () => {
    if (!currentModule) return false;
    return currentSlideIndex < currentModule.slides.length - 1 || 
           currentModuleIndex < modules.length - 1;
  };

  const canGoPrev = () => {
    return currentSlideIndex > 0 || currentModuleIndex > 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!currentSlide) {
    return (
      <Card className="bg-background/80 backdrop-blur border-border/50">
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">No hay contenido disponible para este curso.</p>
        </CardContent>
      </Card>
    );
  }

  const isSlideCompleted = completedSlides.has(currentSlide.id);

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Progreso del Curso</span>
          <span>{completedCount} de {totalSlides} slides</span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </div>

      {/* Module and Slide Info */}
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold text-gray-900">{currentModule.titulo}</h2>
        <p className="text-muted-foreground">{currentModule.descripcion}</p>
        <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
          <span>Slide {currentSlideIndex + 1} de {currentModule.slides.length}</span>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{currentSlide.duracion_estimada} min</span>
          </div>
        </div>
      </div>

      {/* Slide Content */}
      <Card className="bg-background/80 backdrop-blur border-border/50">
        <CardContent className="p-0">
          <div className="aspect-video relative overflow-hidden rounded-lg">
            <img 
              src={currentSlide.imagen_url} 
              alt={currentSlide.titulo}
              className="w-full h-full object-cover"
            />
            {isSlideCompleted && (
              <div className="absolute top-4 right-4 bg-green-500 text-white rounded-full p-2">
                <Check className="h-4 w-4" />
              </div>
            )}
          </div>
          {currentSlide.contenido && (
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">{currentSlide.titulo}</h3>
              <p className="text-muted-foreground">{currentSlide.contenido}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between">
        <Button 
          variant="outline" 
          onClick={() => navigateSlide('prev')}
          disabled={!canGoPrev()}
          className="bg-background/80 backdrop-blur"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Anterior
        </Button>

        <div className="flex gap-2">
          {!isSlideCompleted && (
            <Button 
              onClick={() => markSlideComplete(currentSlide.id)}
              className="bg-primary/80 backdrop-blur hover:bg-primary"
            >
              <Check className="h-4 w-4 mr-2" />
              Marcar Completado
            </Button>
          )}
        </div>

        <Button 
          variant="outline" 
          onClick={() => navigateSlide('next')}
          disabled={!canGoNext()}
          className="bg-background/80 backdrop-blur"
        >
          Siguiente
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};