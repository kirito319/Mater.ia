import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Image, HelpCircle, Upload, Save, Eye, Plus, Trash2, Video } from 'lucide-react';
import { ModuleManager } from '@/components/ModuleManager';

interface CourseData {
  id: string;
  titulo: string;
  descripcion: string;
}

interface SlideContent {
  id?: string;
  orden: number;
  titulo: string;
  tipo_contenido: 'imagen' | 'cuestionario' | 'video';
  imagen_url?: string;
  video_url?: string;
  contenido?: string;
  cuestionario_data?: {
    pregunta: string;
    opciones: { id: string; texto: string }[];
    respuesta_correcta: string;
    explicacion: string;
    puntos: number;
  };
  puntuacion_minima?: number;
  duracion_estimada: number;
}

const CourseContent = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [course, setCourse] = useState<CourseData | null>(null);
  const [slides, setSlides] = useState<SlideContent[]>([]);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);

  // Initialize 20 empty slide slots
  useEffect(() => {
    const initialSlides = Array.from({ length: 20 }, (_, index) => ({
      orden: index + 1,
      titulo: '',
      tipo_contenido: 'imagen' as const,
      imagen_url: undefined,
      video_url: undefined,
      contenido: '',
      duracion_estimada: 5
    }));
    setSlides(initialSlides);
  }, []);

  useEffect(() => {
    if (courseId) {
      fetchCourseData();
    }
  }, [courseId]);

  useEffect(() => {
    if (selectedModuleId) {
      fetchModuleSlides();
    } else {
      setSlides(Array.from({ length: 20 }, (_, index) => ({
        orden: index + 1,
        titulo: '',
        tipo_contenido: 'imagen' as const,
        imagen_url: undefined,
        video_url: undefined,
        contenido: '',
        duracion_estimada: 5
      })));
    }
  }, [selectedModuleId]);

  const fetchCourseData = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('id, titulo, descripcion')
        .eq('id', courseId)
        .single();

      if (error) throw error;
      setCourse(data);
    } catch (error) {
      console.error('Error fetching course:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar la información del curso.",
        variant: "destructive",
      });
    }
  };

  const fetchModuleSlides = async () => {
    if (!selectedModuleId) return;

    try {
      const { data: existingSlides, error: slidesError } = await supabase
        .from('course_slides')
        .select('*')
        .eq('module_id', selectedModuleId)
        .order('orden');

      if (slidesError) throw slidesError;

      // Merge existing slides with empty slots
      const mergedSlides = Array.from({ length: 20 }, (_, index) => {
        const existingSlide = existingSlides.find(slide => slide.orden === index + 1);
        if (existingSlide) {
          return {
            id: existingSlide.id,
            orden: existingSlide.orden,
            titulo: existingSlide.titulo,
            tipo_contenido: existingSlide.tipo_contenido as 'imagen' | 'cuestionario' | 'video',
            imagen_url: existingSlide.imagen_url,
            video_url: existingSlide.video_url,
            contenido: existingSlide.contenido,
            cuestionario_data: existingSlide.cuestionario_data as any,
            puntuacion_minima: existingSlide.puntuacion_minima,
            duracion_estimada: existingSlide.duracion_estimada || 5
          };
        }
        return {
          orden: index + 1,
          titulo: '',
          tipo_contenido: 'imagen' as const,
          imagen_url: undefined,
          video_url: undefined,
          contenido: '',
          duracion_estimada: 5
        };
      });

      setSlides(mergedSlides);
    } catch (error) {
      console.error('Error fetching slides:', error);
    }
  };

  const handleImageUpload = async (slideIndex: number, file: File) => {
    if (!courseId) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${courseId}/slide-${slideIndex + 1}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('course-content')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('course-content')
        .getPublicUrl(fileName);

      const updatedSlides = [...slides];
      updatedSlides[slideIndex].imagen_url = data.publicUrl;
      setSlides(updatedSlides);

      toast({
        title: "Imagen subida",
        description: "La imagen se ha subido correctamente.",
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error",
        description: "No se pudo subir la imagen.",
        variant: "destructive",
      });
    }
  };

  const handleVideoUpload = async (slideIndex: number, file: File) => {
    if (!courseId) return;

    // Check file size (max 100MB)
    const maxSize = 100 * 1024 * 1024; // 100MB in bytes
    if (file.size > maxSize) {
      toast({
        title: "Error",
        description: "El archivo de video no puede superar los 100MB.",
        variant: "destructive",
      });
      return;
    }

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${courseId}/video-${slideIndex + 1}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('course-videos')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('course-videos')
        .getPublicUrl(fileName);

      const updatedSlides = [...slides];
      updatedSlides[slideIndex].video_url = data.publicUrl;
      setSlides(updatedSlides);

      toast({
        title: "Video subido",
        description: "El video se ha subido correctamente.",
      });
    } catch (error) {
      console.error('Error uploading video:', error);
      toast({
        title: "Error",
        description: "No se pudo subir el video.",
        variant: "destructive",
      });
    }
  };

  const updateSlide = (index: number, field: keyof SlideContent, value: any) => {
    const updatedSlides = [...slides];
    updatedSlides[index] = { ...updatedSlides[index], [field]: value };
    setSlides(updatedSlides);
  };

  const addQuizOption = (slideIndex: number) => {
    const slide = slides[slideIndex];
    if (!slide.cuestionario_data) {
      updateSlide(slideIndex, 'cuestionario_data', {
        pregunta: '',
        opciones: [{ id: 'A', texto: '' }],
        respuesta_correcta: '',
        explicacion: '',
        puntos: 10
      });
    } else {
      const newOption = {
        id: String.fromCharCode(65 + slide.cuestionario_data.opciones.length),
        texto: ''
      };
      const updatedData = {
        ...slide.cuestionario_data,
        opciones: [...slide.cuestionario_data.opciones, newOption]
      };
      updateSlide(slideIndex, 'cuestionario_data', updatedData);
    }
  };

  const removeQuizOption = (slideIndex: number, optionIndex: number) => {
    const slide = slides[slideIndex];
    if (slide.cuestionario_data && slide.cuestionario_data.opciones.length > 1) {
      const updatedData = {
        ...slide.cuestionario_data,
        opciones: slide.cuestionario_data.opciones.filter((_, i) => i !== optionIndex)
      };
      updateSlide(slideIndex, 'cuestionario_data', updatedData);
    }
  };

  const saveContent = async () => {
    if (!courseId || !selectedModuleId) {
      toast({
        title: "Error",
        description: "Selecciona un módulo para guardar el contenido.",
        variant: "destructive",
      });
      return;
    }
    setSaveLoading(true);

    try {

      // Save slides that have content
      const slidesToSave = slides.filter(slide => 
        slide.titulo.trim() !== '' || 
        slide.imagen_url || 
        slide.video_url ||
        (slide.cuestionario_data && slide.cuestionario_data.pregunta.trim() !== '')
      );

      for (const slide of slidesToSave) {
        const slideData = {
          module_id: selectedModuleId,
          titulo: slide.titulo || `Slide ${slide.orden}`,
          orden: slide.orden,
          tipo_contenido: slide.tipo_contenido,
          imagen_url: slide.imagen_url || '',
          video_url: slide.video_url || null,
          contenido: slide.contenido || '',
          cuestionario_data: slide.cuestionario_data || null,
          puntuacion_minima: slide.puntuacion_minima || 0,
          duracion_estimada: slide.duracion_estimada,
          activo: true
        };

        if (slide.id) {
          const { error } = await supabase
            .from('course_slides')
            .update(slideData)
            .eq('id', slide.id);
          
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('course_slides')
            .insert(slideData);
          
          if (error) throw error;
        }
      }

      // If this is the first content being added, publish the course
      if (slidesToSave.length > 0) {
        const { error: publishError } = await supabase
          .from('courses')
          .update({ status: 'published' })
          .eq('id', courseId);
        
        if (publishError) {
          console.error('Error publishing course:', publishError);
        }
      }

      toast({
        title: "¡Contenido guardado!",
        description: "El contenido del curso se ha guardado correctamente.",
      });

      // Refresh content to get IDs for new slides
      await fetchModuleSlides();
    } catch (error) {
      console.error('Error saving content:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar el contenido.",
        variant: "destructive",
      });
    } finally {
      setSaveLoading(false);
    }
  };

  if (!course) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pixel-light via-white to-blue-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Button 
              variant="outline" 
              onClick={() => navigate('/admin')}
              className="mr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-pixel-dark">{course.titulo}</h1>
              <p className="text-pixel-light">Gestión de Contenido</p>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => navigate(`/courses/${courseId}`)}
            >
              <Eye className="w-4 h-4 mr-2" />
              Vista Previa
            </Button>
            <Button
              onClick={saveContent}
              disabled={saveLoading}
              className="bg-pixel-orange hover:bg-pixel-dark text-white"
            >
              {saveLoading ? (
                <>
                  <Upload className="w-4 h-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Todo
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Module Manager */}
        <ModuleManager
          courseId={courseId!}
          selectedModuleId={selectedModuleId}
          onSelectModule={setSelectedModuleId}
          onModulesUpdate={() => {
            // Refresh any module-related data if needed
          }}
        />

        {/* Content Slides */}
        {selectedModuleId ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {slides.map((slide, index) => (
            <Card key={index} className="bg-white/80 backdrop-blur-sm border-pixel-light shadow-lg">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-pixel-dark">
                    Slide {slide.orden}
                  </CardTitle>
                  <Badge variant={slide.tipo_contenido === 'imagen' ? 'default' : slide.tipo_contenido === 'video' ? 'outline' : 'secondary'}>
                    {slide.tipo_contenido === 'imagen' ? (
                      <><Image className="w-3 h-3 mr-1" /> Imagen</>
                    ) : slide.tipo_contenido === 'video' ? (
                      <><Video className="w-3 h-3 mr-1" /> Video</>
                    ) : (
                      <><HelpCircle className="w-3 h-3 mr-1" /> Quiz</>
                    )}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Título</Label>
                  <Input
                    value={slide.titulo}
                    onChange={(e) => updateSlide(index, 'titulo', e.target.value)}
                    placeholder="Título del slide"
                    className="bg-white border-pixel-light"
                  />
                </div>

                <div>
                  <Label>Tipo de Contenido</Label>
                  <Select 
                    value={slide.tipo_contenido} 
                    onValueChange={(value: 'imagen' | 'cuestionario' | 'video') => 
                      updateSlide(index, 'tipo_contenido', value)
                    }
                  >
                    <SelectTrigger className="bg-white border-pixel-light">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="imagen">
                        <div className="flex items-center">
                          <Image className="w-4 h-4 mr-2" />
                          Imagen
                        </div>
                      </SelectItem>
                      <SelectItem value="video">
                        <div className="flex items-center">
                          <Video className="w-4 h-4 mr-2" />
                          Video
                        </div>
                      </SelectItem>
                      <SelectItem value="cuestionario">
                        <div className="flex items-center">
                          <HelpCircle className="w-4 h-4 mr-2" />
                          Cuestionario
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {slide.tipo_contenido === 'imagen' ? (
                  <div className="space-y-2">
                    <Label>Imagen del Slide</Label>
                    {slide.imagen_url ? (
                      <div className="space-y-2">
                        <img 
                          src={slide.imagen_url} 
                          alt="Preview" 
                          className="w-full h-32 object-cover rounded"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateSlide(index, 'imagen_url', undefined)}
                        >
                          Cambiar
                        </Button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-pixel-light rounded p-4 text-center">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload(index, file);
                          }}
                          className="hidden"
                          id={`image-${index}`}
                        />
                        <label htmlFor={`image-${index}`} className="cursor-pointer">
                          <Upload className="w-8 h-8 mx-auto text-pixel-light mb-2" />
                          <p className="text-sm text-pixel-light">Subir imagen</p>
                        </label>
                      </div>
                    )}
                    <div>
                      <Label>Descripción</Label>
                      <Textarea
                        value={slide.contenido}
                        onChange={(e) => updateSlide(index, 'contenido', e.target.value)}
                        placeholder="Descripción del contenido..."
                        rows={2}
                        className="bg-white border-pixel-light"
                      />
                    </div>
                  </div>
                ) : slide.tipo_contenido === 'video' ? (
                  <div className="space-y-2">
                    <Label>Video del Slide (max 100MB)</Label>
                    {slide.video_url ? (
                      <div className="space-y-2">
                        <video 
                          src={slide.video_url} 
                          controls
                          className="w-full h-32 object-cover rounded"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateSlide(index, 'video_url', undefined)}
                        >
                          Cambiar
                        </Button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-pixel-light rounded p-4 text-center">
                        <input
                          type="file"
                          accept="video/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleVideoUpload(index, file);
                          }}
                          className="hidden"
                          id={`video-${index}`}
                        />
                        <label htmlFor={`video-${index}`} className="cursor-pointer">
                          <Video className="w-8 h-8 mx-auto text-pixel-light mb-2" />
                          <p className="text-sm text-pixel-light">Subir video</p>
                          <p className="text-xs text-pixel-light/60">Máximo 100MB</p>
                        </label>
                      </div>
                    )}
                    <div>
                      <Label>Descripción</Label>
                      <Textarea
                        value={slide.contenido}
                        onChange={(e) => updateSlide(index, 'contenido', e.target.value)}
                        placeholder="Descripción del video..."
                        rows={2}
                        className="bg-white border-pixel-light"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <Label>Pregunta</Label>
                      <Textarea
                        value={slide.cuestionario_data?.pregunta || ''}
                        onChange={(e) => {
                          const currentData = slide.cuestionario_data || {
                            pregunta: '',
                            opciones: [{ id: 'A', texto: '' }, { id: 'B', texto: '' }],
                            respuesta_correcta: '',
                            explicacion: '',
                            puntos: 10
                          };
                          updateSlide(index, 'cuestionario_data', {
                            ...currentData,
                            pregunta: e.target.value
                          });
                        }}
                        placeholder="Escribe la pregunta del quiz..."
                        rows={2}
                        className="bg-white border-pixel-light"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>Opciones</Label>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => addQuizOption(index)}
                          disabled={slide.cuestionario_data?.opciones.length >= 4}
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Agregar
                        </Button>
                      </div>
                      
                      <div className="space-y-2">
                        {(slide.cuestionario_data?.opciones || []).map((option, optIndex) => (
                          <div key={option.id} className="flex items-center space-x-2">
                            <span className="text-sm font-medium min-w-[20px]">{option.id}.</span>
                            <Input
                              value={option.texto}
                              onChange={(e) => {
                                const currentData = slide.cuestionario_data!;
                                const updatedOptions = [...currentData.opciones];
                                updatedOptions[optIndex].texto = e.target.value;
                                updateSlide(index, 'cuestionario_data', {
                                  ...currentData,
                                  opciones: updatedOptions
                                });
                              }}
                              placeholder={`Opción ${option.id}`}
                              className="bg-white border-pixel-light"
                            />
                            {slide.cuestionario_data!.opciones.length > 1 && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => removeQuizOption(index, optIndex)}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label>Respuesta Correcta</Label>
                      <RadioGroup
                        value={slide.cuestionario_data?.respuesta_correcta || ''}
                        onValueChange={(value) => {
                          const currentData = slide.cuestionario_data!;
                          updateSlide(index, 'cuestionario_data', {
                            ...currentData,
                            respuesta_correcta: value
                          });
                        }}
                      >
                        {(slide.cuestionario_data?.opciones || []).map((option) => (
                          <div key={option.id} className="flex items-center space-x-2">
                            <RadioGroupItem value={option.id} id={`correct-${index}-${option.id}`} />
                            <Label htmlFor={`correct-${index}-${option.id}`}>{option.id}. {option.texto}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  </div>
                )}

                <div>
                  <Label>Duración Estimada (minutos)</Label>
                  <Input
                    type="number"
                    min="1"
                    value={slide.duracion_estimada}
                    onChange={(e) => updateSlide(index, 'duracion_estimada', parseInt(e.target.value) || 5)}
                    className="bg-white border-pixel-light"
                  />
                </div>
              </CardContent>
            </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-white/80 backdrop-blur-sm border-pixel-light shadow-xl">
            <CardContent className="p-8 text-center">
              <p className="text-pixel-dark text-lg">
                Selecciona un módulo para editar su contenido
              </p>
              <p className="text-pixel-light mt-2">
                Crea un nuevo módulo o selecciona uno existente para comenzar a añadir slides
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CourseContent;