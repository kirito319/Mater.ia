import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Upload, Image } from 'lucide-react';
import { FormBuilder, FormData } from '@/components/FormBuilder';

const CreateCourse = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { courseId } = useParams();
  
  const [loading, setLoading] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [isFree, setIsFree] = useState(false);
  const [requiresForm, setRequiresForm] = useState(false);
  
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    nivel: '',
    precio: 0,
    duracion_horas: 0
  });

  const [learningObjectives, setLearningObjectives] = useState<string[]>(['']);

  const isEditMode = !!courseId;

  const [courseForm, setCourseForm] = useState<FormData>({
    title: '',
    description: '',
    questions: []
  });

  // Load course data if editing
  useEffect(() => {
    if (isEditMode && courseId) {
      loadCourseData();
    }
  }, [courseId, isEditMode]);

  const loadCourseData = async () => {
    try {
      setLoading(true);
      
      // Load course basic data
      const { data: course, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();

      if (courseError) throw courseError;

      setFormData({
        titulo: course.titulo,
        descripcion: course.descripcion || '',
        nivel: course.nivel,
        precio: course.precio,
        duracion_horas: course.duracion_horas
      });

      setIsFree(course.is_free || false);
      setRequiresForm(course.requires_form || false);
      
      // Load learning objectives
      if (course.learning_objectives && Array.isArray(course.learning_objectives)) {
        const objectives = course.learning_objectives as string[];
        setLearningObjectives(objectives.length > 0 ? objectives : ['']);
      }

      if (course.imagen_url) {
        setThumbnailPreview(course.imagen_url);
      }

      // Load course form if exists
      if (course.requires_form) {
        const { data: form, error: formError } = await supabase
          .from('course_forms')
          .select('*')
          .eq('course_id', courseId)
          .single();

        if (!formError && form) {
          setCourseForm({
            title: form.title,
            description: form.description || '',
            questions: form.questions as any
          });
        }
      }
    } catch (error) {
      console.error('Error loading course data:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar la información del curso.",
        variant: "destructive",
      });
      navigate('/admin');
    } finally {
      setLoading(false);
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setThumbnailPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadThumbnail = async (courseId: string) => {
    if (!thumbnailFile) return null;

    const fileExt = thumbnailFile.name.split('.').pop();
    const fileName = `${courseId}/thumbnail.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('course-thumbnails')
      .upload(fileName, thumbnailFile);

    if (uploadError) {
      console.error('Error uploading thumbnail:', uploadError);
      return null;
    }

    const { data } = supabase.storage
      .from('course-thumbnails')
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate form data
      if (requiresForm && (!courseForm.title || courseForm.questions.length === 0)) {
        toast({
          title: "Error",
          description: "Debes completar el formulario de pre-registro con al menos una pregunta.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      let course;
      
      if (isEditMode) {
        // Update existing course
        const { data: updatedCourse, error: courseError } = await supabase
          .from('courses')
          .update({
            ...formData,
            is_free: isFree,
            requires_form: requiresForm,
            learning_objectives: learningObjectives.filter(obj => obj.trim() !== '')
          })
          .eq('id', courseId)
          .select()
          .single();

        if (courseError) throw courseError;
        course = updatedCourse;
      } else {
        // Create new course as draft
        const { data: newCourse, error: courseError } = await supabase
          .from('courses')
          .insert([{
            ...formData,
            is_free: isFree,
            requires_form: requiresForm,
            status: 'draft',
            activo: true,
            learning_objectives: learningObjectives.filter(obj => obj.trim() !== '')
          }])
          .select()
          .single();

        if (courseError) throw courseError;
        course = newCourse;
      }

      // Upload thumbnail if provided
      let imagen_url = null;
      if (thumbnailFile) {
        imagen_url = await uploadThumbnail(course.id);
        
        // Update course with thumbnail URL
        if (imagen_url) {
          const { error: updateError } = await supabase
            .from('courses')
            .update({ imagen_url })
            .eq('id', course.id);

          if (updateError) throw updateError;
        }
      }

      // Handle course form
      if (requiresForm && courseForm.questions.length > 0) {
        if (isEditMode) {
          // Update or create course form
          const { data: existingForm } = await supabase
            .from('course_forms')
            .select('id')
            .eq('course_id', course.id)
            .single();

          if (existingForm) {
            const { error: formError } = await supabase
              .from('course_forms')
              .update({
                title: courseForm.title,
                description: courseForm.description,
                questions: courseForm.questions as any,
                active: true
              })
              .eq('id', existingForm.id);

            if (formError) throw formError;
          } else {
            const { error: formError } = await supabase
              .from('course_forms')
              .insert([{
                course_id: course.id,
                title: courseForm.title,
                description: courseForm.description,
                questions: courseForm.questions as any,
                active: true
              }]);

            if (formError) throw formError;
          }
        } else {
          // Create new course form
          const { error: formError } = await supabase
            .from('course_forms')
            .insert([{
              course_id: course.id,
              title: courseForm.title,
              description: courseForm.description,
              questions: courseForm.questions as any,
              active: true
            }]);

          if (formError) throw formError;
        }
      } else if (isEditMode && !requiresForm) {
        // Remove course form if no longer required
        await supabase
          .from('course_forms')
          .delete()
          .eq('course_id', course.id);
      }

      toast({
        title: isEditMode ? "¡Curso actualizado!" : "¡Borrador de curso creado!",
        description: isEditMode 
          ? "La información del curso se ha actualizado correctamente."
          : "Ahora puedes agregar módulos y contenido. El curso se publicará cuando agregues el primer módulo.",
      });

      // Navigate appropriately
      if (isEditMode) {
        navigate('/admin');
      } else {
        navigate(`/admin/courses/${course.id}/content`);
      }
    } catch (error) {
      console.error('Error creating course:', error);
      toast({
        title: "Error",
        description: "No se pudo crear el curso. Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pixel-light via-white to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate('/admin')}
            className="mr-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <h1 className="text-3xl font-bold text-pixel-dark">
            {isEditMode ? 'Editar Curso' : 'Crear Nuevo Curso'}
          </h1>
        </div>

        <Card className="bg-white/80 backdrop-blur-sm border-pixel-light shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl text-pixel-dark">Información del Curso</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Course Info */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="titulo">Título del Curso *</Label>
                    <Input
                      id="titulo"
                      value={formData.titulo}
                      onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                      placeholder="Ej: Introducción a Python"
                      required
                      className="bg-white border-pixel-light"
                    />
                  </div>

                  <div>
                    <Label htmlFor="nivel">Nivel *</Label>
                    <Select 
                      value={formData.nivel} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, nivel: value }))}
                    >
                      <SelectTrigger className="bg-white border-pixel-light">
                        <SelectValue placeholder="Selecciona el nivel" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Básico">Básico</SelectItem>
                        <SelectItem value="Intermedio">Intermedio</SelectItem>
                        <SelectItem value="Avanzado">Avanzado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="gratis"
                        checked={isFree}
                        onCheckedChange={(checked) => {
                          setIsFree(checked as boolean);
                          if (checked) {
                            setFormData(prev => ({ ...prev, precio: 0 }));
                          }
                        }}
                      />
                      <Label htmlFor="gratis" className="text-sm font-medium">
                        Curso Gratis
                      </Label>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="precio">Precio (USD) *</Label>
                        <Input
                          id="precio"
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.precio}
                          onChange={(e) => setFormData(prev => ({ ...prev, precio: parseFloat(e.target.value) || 0 }))}
                          placeholder="0.00"
                          required
                          disabled={isFree}
                          className="bg-white border-pixel-light"
                        />
                      </div>
                      <div>
                        <Label htmlFor="duracion">Duración (horas) *</Label>
                        <Input
                          id="duracion"
                          type="number"
                          min="1"
                          value={formData.duracion_horas}
                          onChange={(e) => setFormData(prev => ({ ...prev, duracion_horas: parseInt(e.target.value) || 0 }))}
                          placeholder="1"
                          required
                          className="bg-white border-pixel-light"
                        />
                      </div>
                    </div>

                    {isFree && (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="requiresForm"
                          checked={requiresForm}
                          onCheckedChange={(checked) => setRequiresForm(checked as boolean)}
                        />
                        <Label htmlFor="requiresForm" className="text-sm font-medium">
                          Requiere formulario antes de inscripción
                        </Label>
                      </div>
                    )}
                  </div>
                </div>

                {/* Thumbnail Upload */}
                <div className="space-y-4">
                  <div>
                    <Label>Imagen de Portada</Label>
                    <div className="border-2 border-dashed border-pixel-light rounded-lg p-6 text-center bg-white/50">
                      {thumbnailPreview ? (
                        <div className="space-y-4">
                          <img 
                            src={thumbnailPreview} 
                            alt="Vista previa" 
                            className="max-h-40 mx-auto rounded-lg object-cover"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setThumbnailFile(null);
                              setThumbnailPreview(null);
                            }}
                          >
                            Cambiar Imagen
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Image className="w-12 h-12 mx-auto text-pixel-light" />
                          <div className="text-sm text-pixel-dark">
                            <label htmlFor="thumbnail" className="cursor-pointer">
                              <span className="text-pixel-orange hover:underline">
                                Haz clic para subir
                              </span>
                              <span className="text-pixel-light"> o arrastra una imagen aquí</span>
                            </label>
                          </div>
                          <p className="text-xs text-pixel-light">PNG, JPG hasta 10MB</p>
                        </div>
                      )}
                      <input
                        id="thumbnail"
                        type="file"
                        accept="image/*"
                        onChange={handleThumbnailChange}
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                  id="descripcion"
                  value={formData.descripcion}
                  onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                  placeholder="Describe el contenido y objetivos del curso..."
                  rows={4}
                  className="bg-white border-pixel-light"
                />
              </div>

              {/* Learning Objectives */}
              <div className="space-y-4">
                <Label>Lo que aprenderás (máximo 5 puntos)</Label>
                <div className="space-y-3">
                  {learningObjectives.map((objective, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <span className="text-sm text-pixel-light">•</span>
                      <Input
                        value={objective}
                        onChange={(e) => {
                          const newObjectives = [...learningObjectives];
                          newObjectives[index] = e.target.value.slice(0, 80); // Limit to 80 characters
                          setLearningObjectives(newObjectives);
                        }}
                        placeholder={`Objetivo de aprendizaje ${index + 1}`}
                        maxLength={80}
                        className="bg-white border-pixel-light"
                      />
                      {learningObjectives.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newObjectives = learningObjectives.filter((_, i) => i !== index);
                            setLearningObjectives(newObjectives);
                          }}
                          className="text-red-600 hover:text-red-800"
                        >
                          ×
                        </Button>
                      )}
                    </div>
                  ))}
                  {learningObjectives.length < 5 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (learningObjectives.length < 5) {
                          setLearningObjectives([...learningObjectives, '']);
                        }
                      }}
                      className="text-pixel-orange hover:text-pixel-dark"
                    >
                      + Agregar objetivo
                    </Button>
                  )}
                </div>
                <p className="text-xs text-pixel-light">
                  Cada punto debe ser conciso (máximo 80 caracteres por línea)
                </p>
              </div>

              {/* Form Builder */}
              {isFree && requiresForm && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-pixel-dark">
                    Configurar Formulario de Pre-registro
                  </h3>
                  <FormBuilder formData={courseForm} onChange={setCourseForm} />
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/admin')}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={loading || !formData.titulo || !formData.nivel}
                  className="bg-pixel-orange hover:bg-pixel-dark text-white"
                >
                  {loading ? (
                    <>
                      <Upload className="w-4 h-4 mr-2 animate-spin" />
                      Creando...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      {isEditMode ? 'Actualizar Curso' : 'Crear Curso'}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateCourse;