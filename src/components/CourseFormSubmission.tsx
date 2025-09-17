import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { FormQuestion } from '@/components/FormBuilder';

interface CourseForm {
  id: string;
  title: string;
  description: string;
  questions: FormQuestion[];
}

interface CourseFormSubmissionProps {
  courseId: string;
  courseForm: CourseForm;
  onSubmissionComplete: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export const CourseFormSubmission = ({ 
  courseId, 
  courseForm, 
  onSubmissionComplete, 
  isOpen, 
  onClose 
}: CourseFormSubmissionProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const validateForm = () => {
    const requiredQuestions = courseForm.questions.filter(q => q.required);
    const missingAnswers = requiredQuestions.filter(q => !answers[q.id] || answers[q.id].trim() === '');
    
    if (missingAnswers.length > 0) {
      toast({
        title: "Formulario incompleto",
        description: "Por favor completa todas las preguntas obligatorias.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Error",
          description: "Debes iniciar sesión para completar el formulario.",
          variant: "destructive",
        });
        return;
      }

      // Submit form answers
      const { error: submissionError } = await supabase
        .from('course_form_submissions')
        .insert([{
          user_id: user.id,
          course_id: courseId,
          form_id: courseForm.id,
          answers: answers
        }]);

      if (submissionError) throw submissionError;

      // Create enrollment
      const { error: enrollmentError } = await supabase
        .from('enrollments')
        .insert([{
          user_id: user.id,
          course_id: courseId,
          progreso: 0,
          completado: false
        }]);

      if (enrollmentError) throw enrollmentError;

      toast({
        title: "¡Formulario enviado exitosamente!",
        description: "Ya estás inscrito en el curso. Puedes comenzar ahora.",
      });

      onSubmissionComplete();
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Error",
        description: "No se pudo enviar el formulario. Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl text-pixel-dark">{courseForm.title}</DialogTitle>
          {courseForm.description && (
            <p className="text-pixel-light">{courseForm.description}</p>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {courseForm.questions.map((question, index) => (
            <Card key={question.id} className="border-pixel-light">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <Label className="text-base font-medium">
                    {index + 1}. {question.question}
                    {question.required && <span className="text-red-500 ml-1">*</span>}
                  </Label>

                  {question.type === 'text' ? (
                    <Textarea
                      value={answers[question.id] || ''}
                      onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                      placeholder={question.placeholder || 'Escribe tu respuesta aquí...'}
                      rows={3}
                      className="bg-white border-pixel-light"
                    />
                  ) : (
                    <RadioGroup
                      value={answers[question.id] || ''}
                      onValueChange={(value) => handleAnswerChange(question.id, value)}
                    >
                      {question.options?.map((option, optionIndex) => (
                        option.trim() && (
                          <div key={optionIndex} className="flex items-center space-x-2">
                            <RadioGroupItem value={option} id={`${question.id}_${optionIndex}`} />
                            <Label htmlFor={`${question.id}_${optionIndex}`} className="font-normal">
                              {option}
                            </Label>
                          </div>
                        )
                      ))}
                    </RadioGroup>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          <div className="flex justify-end space-x-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-pixel-orange hover:bg-pixel-dark text-white"
            >
              {loading ? 'Enviando...' : 'Enviar y Inscribirse'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};