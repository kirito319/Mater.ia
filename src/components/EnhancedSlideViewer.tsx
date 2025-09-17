import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Check, Clock, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { QuizSlide } from '@/components/QuizSlide';
import { VideoPlayer } from '@/components/VideoPlayer';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';
interface Slide {
  id: string;
  titulo: string;
  imagen_url: string;
  video_url?: string;
  contenido: string;
  orden: number;
  duracion_estimada: number;
  tipo_contenido: 'imagen' | 'cuestionario' | 'video';
  cuestionario_data?: any;
}
interface Module {
  id: string;
  titulo: string;
  descripcion: string;
  orden: number;
  slides: Slide[];
}
interface EnhancedSlideViewerProps {
  courseId: string;
  enrollmentId: string;
  onProgressUpdate: (progressPercentage: number, moduleCompletionData?: {
    completedModules: number;
    totalModules: number;
    allModulesCompleted: boolean;
  }) => void;
}
export const EnhancedSlideViewer: React.FC<EnhancedSlideViewerProps> = ({
  courseId,
  enrollmentId,
  onProgressUpdate
}) => {
  const {
    user
  } = useAuth();
  const isMobile = useIsMobile();
  const [modules, setModules] = useState<Module[]>([]);
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [completedSlides, setCompletedSlides] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [slideStartTime, setSlideStartTime] = useState<Date>(new Date());
  const [showModuleContinueDialog, setShowModuleContinueDialog] = useState(false);
  const [videoCompleted, setVideoCompleted] = useState<Set<string>>(new Set());
  useEffect(() => {
    if (courseId && user) {
      fetchCourseContent();
      fetchUserProgress();
    }
  }, [courseId, user]);
  useEffect(() => {
    setSlideStartTime(new Date());
  }, [currentModuleIndex, currentSlideIndex]);
  useEffect(() => {
    if (modules.length > 0) {
      // Calculate module-based progress
      const completedModules = modules.filter(module => module.slides.every(slide => completedSlides.has(slide.id))).length;
      const totalModules = modules.length;
      const allModulesCompleted = completedModules === totalModules;

      // Calculate slide progress for display
      const totalSlides = modules.reduce((acc, module) => acc + module.slides.length, 0);
      const progressPercentage = totalSlides > 0 ? completedSlides.size / totalSlides * 100 : 0;
      onProgressUpdate(progressPercentage, {
        completedModules,
        totalModules,
        allModulesCompleted
      });
    }
  }, [completedSlides, modules, onProgressUpdate]);
  const fetchCourseContent = async () => {
    try {
      const {
        data: modulesData,
        error: modulesError
      } = await supabase.from('course_modules').select('*').eq('course_id', courseId).eq('activo', true).order('orden');
      if (modulesError) throw modulesError;
      const modulesWithSlides = await Promise.all(modulesData.map(async module => {
        const {
          data: slidesData,
          error: slidesError
        } = await supabase.from('course_slides').select('*').eq('module_id', module.id).eq('activo', true).order('orden');
        if (slidesError) throw slidesError;
        return {
          ...module,
          slides: slidesData
        };
      }));
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
      const {
        data,
        error
      } = await supabase.from('user_progress').select('slide_id').eq('user_id', user.id).eq('enrollment_id', enrollmentId).eq('completado', true);
      if (error) throw error;
      setCompletedSlides(new Set(data.map(p => p.slide_id)));
    } catch (error) {
      console.error('Error fetching user progress:', error);
    }
  };
  const markSlideComplete = async (slideId: string) => {
    if (!user) return;
    const endTime = new Date();
    const timeSpent = Math.floor((endTime.getTime() - slideStartTime.getTime()) / 1000);
    try {
      const {
        error
      } = await supabase.from('user_progress').upsert({
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
    } catch (error) {
      console.error('Error marking slide complete:', error);
      toast.error('Error al marcar el slide como completado');
    }
  };
  const navigateSlide = (direction: 'next' | 'prev') => {
    const currentModule = modules[currentModuleIndex];
    if (!currentModule) return;
    if (direction === 'next') {
      if (currentSlideIndex < currentModule.slides.length - 1) {
        setCurrentSlideIndex(currentSlideIndex + 1);
      } else if (currentModuleIndex < modules.length - 1) {
        // Moving to next module - show confirmation dialog
        setShowModuleContinueDialog(true);
        return;
      }
    } else {
      if (currentSlideIndex > 0) {
        setCurrentSlideIndex(currentSlideIndex - 1);
      } else if (currentModuleIndex > 0) {
        setCurrentModuleIndex(currentModuleIndex - 1);
        const prevModule = modules[currentModuleIndex - 1];
        setCurrentSlideIndex(prevModule.slides.length - 1);
      }
    }
    setSlideStartTime(new Date());
  };
  const continueToNextModule = () => {
    setCurrentModuleIndex(currentModuleIndex + 1);
    setCurrentSlideIndex(0);
    setShowModuleContinueDialog(false);
    setSlideStartTime(new Date());
  };
  const canGoNext = () => {
    const currentModule = modules[currentModuleIndex];
    if (!currentModule) return false;

    // Block next button if current slide is not completed in database
    const currentSlide = currentModule.slides[currentSlideIndex];
    if (!completedSlides.has(currentSlide.id)) {
      return false;
    }
    return currentSlideIndex < currentModule.slides.length - 1 || currentModuleIndex < modules.length - 1;
  };
  const canGoPrev = () => {
    return currentSlideIndex > 0 || currentModuleIndex > 0;
  };
  const handleQuizComplete = (slideId: string) => {
    markSlideComplete(slideId);

    // Allow navigation to next slide after short delay
    setTimeout(() => {
      if (canGoNext()) {
        navigateSlide('next');
      }
    }, 1000);
  };
  const handleQuizFailure = () => {
    // Find the slide immediately after the last questionnaire, or first slide of module
    const allSlides: {
      slide: Slide;
      moduleIndex: number;
      slideIndex: number;
    }[] = [];
    modules.forEach((module, moduleIndex) => {
      module.slides.forEach((slide, slideIndex) => {
        allSlides.push({
          slide,
          moduleIndex,
          slideIndex
        });
      });
    });
    const currentGlobalIndex = allSlides.findIndex(item => item.moduleIndex === currentModuleIndex && item.slideIndex === currentSlideIndex);

    // Look backwards for the last questionnaire
    let lastQuestionnaireIndex = -1;
    for (let i = currentGlobalIndex - 1; i >= 0; i--) {
      if (allSlides[i].slide.tipo_contenido === 'cuestionario') {
        lastQuestionnaireIndex = i;
        break;
      }
    }
    if (lastQuestionnaireIndex >= 0) {
      // Go to the slide immediately after the last questionnaire
      const nextSlideIndex = lastQuestionnaireIndex + 1;
      if (nextSlideIndex < allSlides.length) {
        setCurrentModuleIndex(allSlides[nextSlideIndex].moduleIndex);
        setCurrentSlideIndex(allSlides[nextSlideIndex].slideIndex);
        toast.info('Regresando al contenido después del último cuestionario');
        return;
      }
    }

    // If no questionnaire found, go to the first slide of current module
    setCurrentModuleIndex(currentModuleIndex);
    setCurrentSlideIndex(0);
    toast.info('Regresando al inicio del módulo para revisar');
  };
  if (loading) {
    return <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>;
  }
  const currentModule = modules[currentModuleIndex];
  const currentSlide = currentModule?.slides[currentSlideIndex];
  if (!currentSlide) {
    return <Card className="bg-background/80 backdrop-blur border-border/50">
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">No hay contenido disponible para este curso.</p>
        </CardContent>
      </Card>;
  }
  const totalSlides = modules.reduce((acc, module) => acc + module.slides.length, 0);
  const progressPercentage = totalSlides > 0 ? completedSlides.size / totalSlides * 100 : 0;
  return <div className="space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span className="text-slate-50">Avance del Curso</span>
          <span className="text-slate-50">{completedSlides.size} de {totalSlides} slides</span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </div>

      {/* Module and Slide Info */}
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold text-slate-50">{currentModule.titulo}</h2>
        
        <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground bg-[#000a0e]/0">
          <span className="text-slate-50">Slide {currentSlideIndex + 1} de {currentModule.slides.length}</span>
          
          
        </div>
      </div>

      {/* Slide Content */}
      <Card className="bg-background/80 backdrop-blur border-border/50">
        <CardContent className={isMobile ? "p-0" : "p-6"}>
          <div className="space-y-4">
            {!isMobile && <h3 className="text-lg font-semibold text-gray-900 px-6 pt-6">{currentSlide.titulo}</h3>}
            
            {currentSlide.tipo_contenido === 'imagen' ? <div className="space-y-6">
                <div className={isMobile ? "bg-background/80 backdrop-blur" : "bg-background/80 backdrop-blur rounded-lg p-8 border border-border/50"}>
                  <img src={currentSlide.imagen_url} alt={currentSlide.titulo} className={isMobile ? "w-full h-auto" : "w-full h-auto rounded-lg shadow-lg"} />
                </div>
                {currentSlide.contenido && <div className={isMobile ? "bg-background/80 backdrop-blur p-6" : "bg-background/80 backdrop-blur rounded-lg p-6 border border-border/50"}>
                    <p className="text-muted-foreground leading-relaxed">
                      {currentSlide.contenido}
                    </p>
                  </div>}
                
                {/* Central completion handled in bottom nav */}
              </div> : currentSlide.tipo_contenido === 'video' ? <div className="space-y-6">
                <div className={isMobile ? "" : "p-6"}>
                  {isMobile && <h3 className="text-lg font-semibold text-gray-900 px-6 pt-6 pb-4">{currentSlide.titulo}</h3>}
                  <VideoPlayer src={currentSlide.video_url || ''} title={currentSlide.titulo} onVideoEnd={() => setVideoCompleted(prev => new Set([...prev, currentSlide.id]))} />
                </div>
                {currentSlide.contenido && <div className={isMobile ? "bg-background/80 backdrop-blur p-6" : "bg-background/80 backdrop-blur rounded-lg p-6 border border-border/50"}>
                    <p className="text-muted-foreground leading-relaxed">
                      {currentSlide.contenido}
                    </p>
                  </div>}
                
                {/* Central completion handled in bottom nav */}
              </div> : <div className={isMobile ? "p-6" : ""}>
                <QuizSlide slideId={currentSlide.id} enrollmentId={enrollmentId} titulo={currentSlide.titulo} cuestionarioData={currentSlide.cuestionario_data} onQuizComplete={() => handleQuizComplete(currentSlide.id)} onQuizFailure={handleQuizFailure} isCompleted={completedSlides.has(currentSlide.id)} />
              </div>}
          </div>
        </CardContent>
      </Card>

      {/* Navigation Controls */}
      <div className="relative flex items-center justify-between py-2">
        <Button
          variant="outline"
          onClick={() => navigateSlide('prev')}
          disabled={!canGoPrev()}
          className="bg-background/80 backdrop-blur"
          size="icon"
          aria-label="Anterior"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        {/* Center check button */}
        {!completedSlides.has(currentSlide.id) && (
          (currentSlide.tipo_contenido === 'imagen') ||
          (currentSlide.tipo_contenido === 'video' && videoCompleted.has(currentSlide.id))
        ) && (
          <div className="absolute left-1/2 -translate-x-1/2">
            <Button
              onClick={() => markSlideComplete(currentSlide.id)}
              className="bg-primary/80 backdrop-blur hover:bg-primary"
              size="icon"
              aria-label="Marcar como completado"
            >
              <Check className="h-5 w-5" />
            </Button>
          </div>
        )}

        <Button
          variant="outline"
          onClick={() => navigateSlide('next')}
          disabled={!canGoNext()}
          className="bg-background/80 backdrop-blur"
          size="icon"
          aria-label="Siguiente"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
      {/* Module Continue Dialog */}
      {showModuleContinueDialog && <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 max-w-md w-full mx-4 border border-border">
            <h3 className="text-lg font-semibold mb-4">¿Continuar al siguiente módulo?</h3>
            <p className="text-muted-foreground mb-6">
              Has completado el módulo "{modules[currentModuleIndex]?.titulo}". 
              ¿Deseas continuar con el siguiente módulo?
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowModuleContinueDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={continueToNextModule}>
                Continuar
              </Button>
            </div>
          </div>
        </div>}
    </div>;
};