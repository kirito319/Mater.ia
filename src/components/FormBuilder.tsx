import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Plus, MoveUp, MoveDown } from 'lucide-react';

export interface FormQuestion {
  id: string;
  type: 'multiple_choice' | 'text';
  question: string;
  required: boolean;
  options?: string[];
  placeholder?: string;
  order: number;
}

export interface FormData {
  title: string;
  description: string;
  questions: FormQuestion[];
}

interface FormBuilderProps {
  formData: FormData;
  onChange: (formData: FormData) => void;
}

export const FormBuilder = ({ formData, onChange }: FormBuilderProps) => {
  const addQuestion = (e?: React.MouseEvent) => {
    e?.preventDefault(); // Prevent form submission
    e?.stopPropagation(); // Stop event bubbling
    
    if (formData.questions.length >= 10) return;
    
    const newQuestion: FormQuestion = {
      id: `q_${Date.now()}`,
      type: 'text',
      question: '',
      required: true,
      order: formData.questions.length + 1
    };
    
    onChange({
      ...formData,
      questions: [...formData.questions, newQuestion]
    });
  };

  const removeQuestion = (questionId: string) => {
    const updatedQuestions = formData.questions
      .filter(q => q.id !== questionId)
      .map((q, index) => ({ ...q, order: index + 1 }));
    
    onChange({
      ...formData,
      questions: updatedQuestions
    });
  };

  const updateQuestion = (questionId: string, updates: Partial<FormQuestion>) => {
    const updatedQuestions = formData.questions.map(q =>
      q.id === questionId ? { ...q, ...updates } : q
    );
    
    onChange({
      ...formData,
      questions: updatedQuestions
    });
  };

  const moveQuestion = (questionId: string, direction: 'up' | 'down', e?: React.MouseEvent) => {
    e?.preventDefault(); // Prevent form submission
    e?.stopPropagation(); // Stop event bubbling
    
    const currentIndex = formData.questions.findIndex(q => q.id === questionId);
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === formData.questions.length - 1)
    ) {
      return;
    }

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const updatedQuestions = [...formData.questions];
    [updatedQuestions[currentIndex], updatedQuestions[newIndex]] = 
    [updatedQuestions[newIndex], updatedQuestions[currentIndex]];
    
    // Update order numbers
    updatedQuestions.forEach((q, index) => {
      q.order = index + 1;
    });

    onChange({
      ...formData,
      questions: updatedQuestions
    });
  };

  const updateQuestionOption = (questionId: string, optionIndex: number, value: string) => {
    const question = formData.questions.find(q => q.id === questionId);
    if (!question || question.type !== 'multiple_choice') return;

    const updatedOptions = [...(question.options || ['', '', '', ''])];
    updatedOptions[optionIndex] = value;
    
    updateQuestion(questionId, { options: updatedOptions });
  };

  return (
    <div className="space-y-6">
      {/* Form Header - Simplified */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="form-title">Título del Formulario *</Label>
          <Input
            id="form-title"
            value={formData.title}
            onChange={(e) => onChange({ ...formData, title: e.target.value })}
            placeholder="Ej: Formulario de Pre-registro"
            className="bg-white border-pixel-light"
          />
        </div>
        <div>
          <Label htmlFor="form-description">Descripción</Label>
          <Input
            id="form-description"
            value={formData.description}
            onChange={(e) => onChange({ ...formData, description: e.target.value })}
            placeholder="Describe el propósito del formulario..."
            className="bg-white border-pixel-light"
          />
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-pixel-dark">
            Preguntas ({formData.questions.length}/10)
          </h3>
          <Button
            type="button"
            onClick={addQuestion}
            disabled={formData.questions.length >= 10}
            className="bg-pixel-orange hover:bg-pixel-dark text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Agregar Pregunta
          </Button>
        </div>

        {formData.questions.map((question, index) => (
          <Card key={question.id} className="border-pixel-light">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-base">Pregunta {index + 1}</CardTitle>
                <div className="flex space-x-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={(e) => moveQuestion(question.id, 'up', e)}
                    disabled={index === 0}
                  >
                    <MoveUp className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={(e) => moveQuestion(question.id, 'down', e)}
                    disabled={index === formData.questions.length - 1}
                  >
                    <MoveDown className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    onClick={(e) => {
                      e?.preventDefault();
                      e?.stopPropagation();
                      removeQuestion(question.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Pregunta *</Label>
                  <Input
                    value={question.question}
                    onChange={(e) => updateQuestion(question.id, { question: e.target.value })}
                    placeholder="Escribe tu pregunta aquí..."
                    className="bg-white border-pixel-light"
                  />
                </div>
                <div>
                  <Label>Tipo de Pregunta</Label>
                  <Select
                    value={question.type}
                    onValueChange={(value: 'multiple_choice' | 'text') => {
                      const updates: Partial<FormQuestion> = { type: value };
                      if (value === 'multiple_choice') {
                        updates.options = ['', '', '', ''];
                        updates.placeholder = undefined;
                      } else {
                        updates.options = undefined;
                        updates.placeholder = '';
                      }
                      updateQuestion(question.id, updates);
                    }}
                  >
                    <SelectTrigger className="bg-white border-pixel-light">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white z-50">
                      <SelectItem value="text">Texto Libre</SelectItem>
                      <SelectItem value="multiple_choice">Opción Múltiple</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {question.type === 'multiple_choice' && (
                <div>
                  <Label>Opciones de Respuesta</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {[0, 1, 2, 3].map((optionIndex) => (
                      <Input
                        key={optionIndex}
                        value={(question.options || [])[optionIndex] || ''}
                        onChange={(e) => updateQuestionOption(question.id, optionIndex, e.target.value)}
                        placeholder={`Opción ${optionIndex + 1}`}
                        className="bg-white border-pixel-light"
                      />
                    ))}
                  </div>
                </div>
              )}

              {question.type === 'text' && (
                <div>
                  <Label>Texto de Ayuda (Placeholder)</Label>
                  <Input
                    value={question.placeholder || ''}
                    onChange={(e) => updateQuestion(question.id, { placeholder: e.target.value })}
                    placeholder="Ej: Escribe tu respuesta aquí..."
                    className="bg-white border-pixel-light"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {formData.questions.length === 0 && (
          <Card className="border-dashed border-pixel-light">
            <CardContent className="text-center py-8">
              <p className="text-pixel-light mb-4">No hay preguntas aún</p>
              <Button
                type="button"
                onClick={addQuestion}
                className="bg-pixel-orange hover:bg-pixel-dark text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Agregar Primera Pregunta
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};