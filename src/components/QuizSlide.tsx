import React, { useState } from 'react';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { toast } from 'sonner';

interface QuizOption {
  id: number;
  texto: string;
}

interface QuizData {
  pregunta: string;
  opciones: QuizOption[];
  respuesta_correcta: string;
  explicacion?: string;
}

interface QuizSlideProps {
  slideId: string;
  enrollmentId: string;
  titulo: string;
  cuestionarioData: QuizData;
  onQuizComplete: (success: boolean) => void;
  onQuizFailure: () => void;
  isCompleted: boolean;
}

export const QuizSlide: React.FC<QuizSlideProps> = ({
  slideId,
  enrollmentId,
  titulo,
  cuestionarioData,
  onQuizComplete,
  onQuizFailure,
  isCompleted
}) => {
  const { user } = useAuth();
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [loading, setLoading] = useState(false);
  const [startTime] = useState(new Date());

  // Get the selected option text for display
  const getSelectedOptionText = () => {
    const selectedOption = cuestionarioData.opciones.find(opcion => opcion.id.toString() === selectedAnswer);
    return selectedOption?.texto || selectedAnswer;
  };

  // Get the correct option text for display
  const getCorrectOptionText = () => {
    const correctOption = cuestionarioData.opciones.find(opcion => opcion.id.toString() === cuestionarioData.respuesta_correcta);
    return correctOption?.texto || cuestionarioData.respuesta_correcta;
  };

  const handleRevisar = async () => {
    if (!selectedAnswer) {
      toast.error('Por favor selecciona una respuesta');
      return;
    }

    setLoading(true);
    const endTime = new Date();
    const timeSpent = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
    
    // Fix: Compare by converting both to string for consistent comparison
    // The selectedAnswer is the option ID, respuesta_correcta should match this ID
    const correct = selectedAnswer.toString() === cuestionarioData.respuesta_correcta.toString();
    
    try {
      // Store quiz attempt
      const { error } = await supabase
        .from('slide_attempts')
        .insert({
          user_id: user?.id,
          enrollment_id: enrollmentId,
          slide_id: slideId,
          respuesta_seleccionada: selectedAnswer,
          es_correcta: correct,
          puntuacion: correct ? 100 : 0,
          tiempo_respuesta: timeSpent
        });

      if (error) throw error;

      setIsCorrect(correct);
      setShowResult(true);
      
      if (correct) {
        toast.success('¡Respuesta correcta!');
        setTimeout(() => {
          onQuizComplete(true);
        }, 2000);
      } else {
        toast.error('Respuesta incorrecta');
        setTimeout(() => {
          onQuizFailure();
        }, 3000);
      }
    } catch (error) {
      console.error('Error saving quiz attempt:', error);
      toast.error('Error al procesar la respuesta');
    } finally {
      setLoading(false);
    }
  };

  if (showResult || isCompleted) {
    return (
      <Card className="bg-background/80 backdrop-blur border-border/50">
        <CardContent className="p-8 text-center space-y-6">
          <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center ${
            isCorrect ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
          }`}>
            {isCorrect ? (
              <CheckCircle className="h-8 w-8" />
            ) : (
              <XCircle className="h-8 w-8" />
            )}
          </div>
          
          <div className="space-y-2">
            <h3 className={`text-2xl font-bold ${
              isCorrect ? 'text-green-600' : 'text-red-600'
            }`}>
              {isCorrect ? '¡Felicitaciones!' : 'Respuesta Incorrecta'}
            </h3>
            <p className="text-muted-foreground">
              {isCorrect 
                ? 'Has respondido correctamente. Puedes continuar al siguiente contenido.'
                : 'La respuesta no es correcta. Te redirigiremos para revisar el contenido anterior.'
              }
            </p>
          </div>

          {cuestionarioData.explicacion && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-left">
                  <h4 className="font-medium text-blue-900 mb-1">Explicación:</h4>
                  <p className="text-blue-800 text-sm">{cuestionarioData.explicacion}</p>
                </div>
              </div>
            </div>
          )}

          <div className="text-sm text-muted-foreground">
            <p>Respuesta correcta: <span className="font-medium text-green-600">{getCorrectOptionText()}</span></p>
            <p>Tu respuesta: <span className={`font-medium ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>{getSelectedOptionText()}</span></p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-background/80 backdrop-blur border-border/50">
      <CardHeader>
        <CardTitle className="text-xl text-gray-900">{titulo}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-lg font-medium text-gray-900">
          {cuestionarioData.pregunta}
        </div>

        <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer}>
          <div className="space-y-3">
            {cuestionarioData.opciones.map((opcion, index) => (
              <div key={opcion.id || index} className="flex items-center space-x-2">
                <RadioGroupItem value={opcion.id.toString()} id={`option-${opcion.id || index}`} />
                <Label 
                  htmlFor={`option-${opcion.id || index}`} 
                  className="text-sm font-normal cursor-pointer flex-1 py-2"
                >
                  {opcion.texto}
                </Label>
              </div>
            ))}
          </div>
        </RadioGroup>

        <div className="flex justify-center pt-4">
          <Button 
            onClick={handleRevisar}
            disabled={!selectedAnswer || loading}
            className="bg-primary/80 backdrop-blur hover:bg-primary px-8"
          >
            {loading ? 'Procesando...' : 'Revisar Respuesta'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};