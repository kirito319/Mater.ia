import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronDown, FileText, Copy, Download, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MobileLayout } from '@/components/MobileLayout';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAIUsage } from '@/hooks/useAIUsage';
import { AIUsageIndicator } from '@/components/AIUsageIndicator';
import { SubscriptionUpgradeModal } from '@/components/SubscriptionUpgradeModal';
import { supabase } from '@/integrations/supabase/client';
import jsPDF from 'jspdf';
const AI = () => {
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const { 
    usageCount,
    canUseAI,
    isLoading: isUsageLoading,
    refreshUsage
  } = useAIUsage();
  const [selectedCategory, setSelectedCategory] = useState('Documentation');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string>('free');
  const [showForm, setShowForm] = useState(false);
  const [currentStep, setCurrentStep] = useState<'form' | 'preview'>('form');
  const [isLoading, setIsLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [formData, setFormData] = useState({
    teacherName: '',
    level: '',
    temasDeLaSemana: '',
    celebraciones: '',
    anunciosImportantes: '',
    anunciosAdicionales: ''
  });

  // Lesson Plan state
  const [lessonPlanData, setLessonPlanData] = useState({
    grade: '',
    topicThemes: '',
    subtopics: '',
    additionalCriteria: ''
  });
  const [currentLessonPlanStep, setCurrentLessonPlanStep] = useState<'form' | 'preview'>('form');
  const [lessonPlanResponse, setLessonPlanResponse] = useState('');
  const [showLessonPlanDialog, setShowLessonPlanDialog] = useState(false);
  const [isLessonPlanLoading, setIsLessonPlanLoading] = useState(false);

  // Evaluation state
  const [evaluationData, setEvaluationData] = useState({
    subject: '',
    grade: '',
    topic: '',
    numberOfQuestions: '10',
    difficulty: 'intermedio',
    additionalInstructions: ''
  });
  const [currentEvaluationStep, setCurrentEvaluationStep] = useState<'form' | 'preview'>('form');
  const [evaluationResponse, setEvaluationResponse] = useState('');
  const [showEvaluationDialog, setShowEvaluationDialog] = useState(false);
  const [isEvaluationLoading, setIsEvaluationLoading] = useState(false);

  // Worksheet state
  const [worksheetData, setWorksheetData] = useState({
    subject: '',
    grade: '',
    topic: '',
    worksheetType: 'ejercicios',
    numberOfExercises: '10',
    difficulty: 'intermedio',
    additionalInstructions: ''
  });
  const [currentWorksheetStep, setCurrentWorksheetStep] = useState<'form' | 'preview'>('form');
  const [worksheetResponse, setWorksheetResponse] = useState('');
  const [showWorksheetDialog, setShowWorksheetDialog] = useState(false);
  const [isWorksheetLoading, setIsWorksheetLoading] = useState(false);

  // Presentation state
  const [presentationData, setPresentationData] = useState({
    title: '',
    subject: '',
    grade: '',
    topic: '',
    presentationType: 'educativa',
    numberOfSlides: '10',
    contentType: 'texto',
    contentInput: '',
    youtubeUrl: '',
    additionalInstructions: ''
  });
  const [currentPresentationStep, setCurrentPresentationStep] = useState<'form' | 'preview'>('form');
  const [presentationResponse, setPresentationResponse] = useState('');
  const [showPresentationDialog, setShowPresentationDialog] = useState(false);
  const [isPresentationLoading, setIsPresentationLoading] = useState(false);

  // Academic Content state
  const [academicContentData, setAcademicContentData] = useState({
    title: '',
    subject: '',
    grade: '',
    topic: '',
    contentType: 'articulo',
    academicLevel: 'basico',
    length: 'corto',
    format: 'texto',
    learningObjectives: '',
    keyConcepts: '',
    assessmentCriteria: '',
    additionalInstructions: ''
  });
  const [currentAcademicContentStep, setCurrentAcademicContentStep] = useState<'form' | 'preview'>('form');
  const [academicContentResponse, setAcademicContentResponse] = useState('');
  const [showAcademicContentDialog, setShowAcademicContentDialog] = useState(false);
  const [isAcademicContentLoading, setIsAcademicContentLoading] = useState(false);

  // Professional Email state
  const [emailData, setEmailData] = useState({
    senderName: '',
    senderTitle: '',
    senderEmail: '',
    recipientName: '',
    recipientTitle: '',
    recipientEmail: '',
    subject: '',
    emailType: 'formal',
    tone: 'profesional',
    purpose: 'informacion',
    urgency: 'normal',
    mainMessage: '',
    additionalPoints: '',
    closingType: 'formal',
    additionalInstructions: ''
  });
  const [currentEmailStep, setCurrentEmailStep] = useState<'form' | 'preview'>('form');
  const [emailResponse, setEmailResponse] = useState('');
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [isEmailLoading, setIsEmailLoading] = useState(false);

  // Rubric Generator state
  const [rubricData, setRubricData] = useState({
    assignmentName: '',
    subject: '',
    grade: '',
    assignmentType: 'proyecto',
    rubricType: 'analitica',
    criteriaCount: '4',
    performanceLevels: '4',
    scaleType: 'numerica',
    totalPoints: '100',
    criteria: [
      { name: '', description: '', weight: '25' }
    ],
    additionalInstructions: ''
  });
  const [currentRubricStep, setCurrentRubricStep] = useState<'form' | 'preview'>('form');
  const [rubricResponse, setRubricResponse] = useState('');
  const [showRubricDialog, setShowRubricDialog] = useState(false);
  const [isRubricLoading, setIsRubricLoading] = useState(false);

  // Writing Feedback state
  const [writingFeedbackData, setWritingFeedbackData] = useState({
    studentName: '',
    grade: '',
    subject: '',
    assignmentType: 'ensayo',
    writingSample: '',
    feedbackType: 'constructiva',
    focusAreas: ['contenido', 'organizacion', 'gramatica', 'estilo'],
    rubricBased: false,
    rubricCriteria: '',
    specificInstructions: '',
    tone: 'apoyador',
    length: 'detallada',
    additionalInstructions: ''
  });
  const [currentWritingFeedbackStep, setCurrentWritingFeedbackStep] = useState<'form' | 'preview'>('form');
  const [writingFeedbackResponse, setWritingFeedbackResponse] = useState('');
  const [showWritingFeedbackDialog, setShowWritingFeedbackDialog] = useState(false);
  const [isWritingFeedbackLoading, setIsWritingFeedbackLoading] = useState(false);

  // Informative Texts state
  const [informativeTextsData, setInformativeTextsData] = useState({
    title: '',
    subject: '',
    grade: '',
    topic: '',
    textType: 'articulo',
    length: 'medio',
    difficulty: 'intermedio',
    language: 'espanol',
    includeImages: false,
    includeQuestions: false,
    includeActivities: false,
    keyConcepts: '',
    learningObjectives: '',
    additionalInstructions: ''
  });
  const [currentInformativeTextsStep, setCurrentInformativeTextsStep] = useState<'form' | 'preview'>('form');
  const [informativeTextsResponse, setInformativeTextsResponse] = useState('');
  const [showInformativeTextsDialog, setShowInformativeTextsDialog] = useState(false);
  const [isInformativeTextsLoading, setIsInformativeTextsLoading] = useState(false);

  // Text Corrector state
  const [textCorrectorData, setTextCorrectorData] = useState({
    originalText: '',
    language: 'espanol',
    correctionType: 'completa',
    focusAreas: ['gramatica', 'ortografia', 'puntuacion', 'estilo'],
    tone: 'profesional',
    formality: 'neutral',
    includeSuggestions: true,
    includeExplanations: true,
    additionalInstructions: ''
  });
  const [currentTextCorrectorStep, setCurrentTextCorrectorStep] = useState<'form' | 'preview'>('form');
  const [textCorrectorResponse, setTextCorrectorResponse] = useState('');
  const [showTextCorrectorDialog, setShowTextCorrectorDialog] = useState(false);
  const [isTextCorrectorLoading, setIsTextCorrectorLoading] = useState(false);

  // YouTube Questions state
  const [youtubeQuestionsData, setYoutubeQuestionsData] = useState({
    videoUrl: '',
    subject: '',
    grade: '',
    questionType: 'comprension',
    difficulty: 'intermedio',
    questionCount: '10',
    language: 'espanol',
    includeAnswerKey: true,
    includeTimeStamps: true,
    focusAreas: ['contenido', 'conceptos', 'aplicacion', 'analisis'],
    additionalInstructions: ''
  });
  const [currentYoutubeQuestionsStep, setCurrentYoutubeQuestionsStep] = useState<'form' | 'preview'>('form');
  const [youtubeQuestionsResponse, setYoutubeQuestionsResponse] = useState('');
  const [showYoutubeQuestionsDialog, setShowYoutubeQuestionsDialog] = useState(false);
  const [isYoutubeQuestionsLoading, setIsYoutubeQuestionsLoading] = useState(false);
  const categories = [{
    value: 'Documentation',
    label: 'Documentation',
    icon: FileText
  }];
  const levels = ['Kinder', '1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade', '6th Grade', '7th Grade', '8th Grade', '9th Grade', '10th Grade', '11th Grade', '12th Grade'];
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  const handleLessonPlanInputChange = (field: string, value: string) => {
    setLessonPlanData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEvaluationInputChange = (field: string, value: string) => {
    setEvaluationData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleWorksheetInputChange = (field: string, value: string) => {
    setWorksheetData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePresentationInputChange = (field: string, value: string) => {
    setPresentationData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAcademicContentInputChange = (field: string, value: string) => {
    setAcademicContentData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEmailInputChange = (field: string, value: string) => {
    setEmailData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRubricInputChange = (field: string, value: string) => {
    setRubricData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCriteriaChange = (index: number, field: string, value: string) => {
    setRubricData(prev => ({
      ...prev,
      criteria: prev.criteria.map((criterion, i) => 
        i === index ? { ...criterion, [field]: value } : criterion
      )
    }));
  };

  const addCriterion = () => {
    setRubricData(prev => ({
      ...prev,
      criteria: [...prev.criteria, { name: '', description: '', weight: '25' }]
    }));
  };

  const removeCriterion = (index: number) => {
    if (rubricData.criteria.length > 1) {
      setRubricData(prev => ({
        ...prev,
        criteria: prev.criteria.filter((_, i) => i !== index)
      }));
    }
  };

  const handleWritingFeedbackInputChange = (field: string, value: string | boolean | string[]) => {
    setWritingFeedbackData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFocusAreaChange = (area: string, checked: boolean) => {
    setWritingFeedbackData(prev => ({
      ...prev,
      focusAreas: checked 
        ? [...prev.focusAreas, area]
        : prev.focusAreas.filter(a => a !== area)
    }));
  };

  const handleInformativeTextsInputChange = (field: string, value: string | boolean) => {
    setInformativeTextsData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTextCorrectorInputChange = (field: string, value: string | boolean) => {
    setTextCorrectorData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCorrectorFocusAreaChange = (area: string, checked: boolean) => {
    setTextCorrectorData(prev => ({
      ...prev,
      focusAreas: checked 
        ? [...prev.focusAreas, area]
        : prev.focusAreas.filter(a => a !== area)
    }));
  };

  const handleYoutubeQuestionsInputChange = (field: string, value: string | boolean) => {
    setYoutubeQuestionsData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleYoutubeFocusAreaChange = (area: string, checked: boolean) => {
    setYoutubeQuestionsData(prev => ({
      ...prev,
      focusAreas: checked 
        ? [...prev.focusAreas, area]
        : prev.focusAreas.filter(a => a !== area)
    }));
  };
  const handleGenerateNewsletter = async () => {
    // Validate required fields
    if (!formData.teacherName.trim() || !formData.level.trim()) {
      toast({
        title: "Campos requeridos",
        description: "Por favor, completa el nombre del maestro y el nivel.",
        variant: "destructive"
      });
      return;
    }
    setIsLoading(true);
    try {
      const {
        data,
        error
      } = await supabase.functions.invoke('generate-circular-semanal', {
        body: formData
      });
      if (error) {
        if (error.message === 'AI_LIMIT_EXCEEDED') {
          setShowUpgradeModal(true);
          return;
        }
        throw error;
      }

      // Refresh usage after successful generation (server-side increment)
      await refreshUsage();
      setAiResponse(data.generatedText);
      setCurrentStep('preview');
      toast({
        title: "¡Boletín generado!",
        description: "Tu circular semanal ha sido creada exitosamente."
      });
    } catch (error) {
      console.error('Error generating newsletter:', error);
      toast({
        title: "Error",
        description: "Hubo un problema al generar el boletín. Inténtalo de nuevo.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  const handleDoOver = () => {
    setCurrentStep('form');
  };
  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(aiResponse);
      toast({
        title: "¡Copiado!",
        description: "El texto ha sido copiado al portapapeles."
      });
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = aiResponse;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast({
        title: "¡Copiado!",
        description: "El texto ha sido copiado al portapapeles."
      });
    }
  };
  const handleCreatePDF = () => {
    try {
      const pdf = new jsPDF();

      // Set font to support Spanish characters
      pdf.setFont('helvetica');
      pdf.setFontSize(16);

      // Add title
      pdf.text('Boletín Semanal', 20, 20);

      // Add content with proper text wrapping
      const splitText = pdf.splitTextToSize(aiResponse, 170);
      pdf.setFontSize(12);
      pdf.text(splitText, 20, 40);

      // Save the PDF
      pdf.save('Boletin_Semanal.pdf');
      toast({
        title: "¡PDF creado!",
        description: "Tu boletín ha sido descargado como PDF."
      });
    } catch (error) {
      console.error('Error creating PDF:', error);
      toast({
        title: "Error",
        description: "Hubo un problema al crear el PDF. Inténtalo de nuevo.",
        variant: "destructive"
      });
    }
  };
  const resetForm = () => {
    setShowForm(false);
    setCurrentStep('form');
    setAiResponse('');
    setFormData({
      teacherName: '',
      level: '',
      temasDeLaSemana: '',
      celebraciones: '',
      anunciosImportantes: '',
      anunciosAdicionales: ''
    });
  };
  const handleGenerateLessonPlan = async () => {
    if (!lessonPlanData.grade || !lessonPlanData.topicThemes) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa el Grado y el Tema Principal.",
        variant: "destructive"
      });
      return;
    }
    setIsLessonPlanLoading(true);
    try {
      const {
        data,
        error
      } = await supabase.functions.invoke('generate-lesson-plan', {
        body: lessonPlanData
      });
      if (error) {
        if (error.message === 'AI_LIMIT_EXCEEDED') {
          setShowUpgradeModal(true);
          return;
        }
        throw error;
      }

      // Refresh usage after successful generation (server-side increment)
      await refreshUsage();
      setLessonPlanResponse(data.lessonPlan);
      setCurrentLessonPlanStep('preview');
      toast({
        title: "¡Plan de Lección Generado!",
        description: "Tu plan de lección ha sido creado exitosamente."
      });
    } catch (error) {
      console.error('Error generating lesson plan:', error);
      toast({
        title: "Error",
        description: "No se pudo generar el plan de lección. Intenta de nuevo.",
        variant: "destructive"
      });
    } finally {
      setIsLessonPlanLoading(false);
    }
  };
  const handleCopyLessonPlanToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(lessonPlanResponse);
      toast({
        title: "¡Copiado!",
        description: "El plan de lección ha sido copiado al portapapeles."
      });
    } catch (error) {
      const textArea = document.createElement('textarea');
      textArea.value = lessonPlanResponse;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast({
        title: "¡Copiado!",
        description: "El plan de lección ha sido copiado al portapapeles."
      });
    }
  };
  const handleCreateLessonPlanPDF = () => {
    try {
      const pdf = new jsPDF();
      pdf.setFont('helvetica');
      pdf.setFontSize(16);
      pdf.text('Plan de Lección', 20, 20);
      const splitText = pdf.splitTextToSize(lessonPlanResponse, 170);
      pdf.setFontSize(12);
      pdf.text(splitText, 20, 40);
      pdf.save('Lesson_Plan.pdf');
      toast({
        title: "¡PDF creado!",
        description: "Tu plan de lección ha sido descargado como PDF."
      });
    } catch (error) {
      console.error('Error creating PDF:', error);
      toast({
        title: "Error",
        description: "Hubo un problema al crear el PDF. Inténtalo de nuevo.",
        variant: "destructive"
      });
    }
  };
  const resetLessonPlanForm = () => {
    setShowLessonPlanDialog(false);
    setCurrentLessonPlanStep('form');
    setLessonPlanResponse('');
    setLessonPlanData({
      grade: '',
      topicThemes: '',
      subtopics: '',
      additionalCriteria: ''
    });
  };

  const handleGenerateEvaluation = async () => {
    if (!evaluationData.subject.trim() || !evaluationData.grade.trim() || !evaluationData.topic.trim()) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa la materia, grado y tema.",
        variant: "destructive"
      });
      return;
    }
    setIsEvaluationLoading(true);
    try {
      // Crear prompt específico para evaluación usando la función de plan de lección
      const evaluationPrompt = `IMPORTANTE: Genera una EVALUACIÓN DE OPCIÓN MÚLTIPLE, NO un plan de lección.

EVALUACIÓN DE ${evaluationData.subject.toUpperCase()}
Grado: ${evaluationData.grade}
Tema: ${evaluationData.topic}
Número de preguntas: ${evaluationData.numberOfQuestions}
Dificultad: ${evaluationData.difficulty}
${evaluationData.additionalInstructions ? `Instrucciones adicionales: ${evaluationData.additionalInstructions}` : ''}

FORMATO REQUERIDO:

**EVALUACIÓN DE ${evaluationData.subject.toUpperCase()}**
**Grado: ${evaluationData.grade}**
**Tema: ${evaluationData.topic}**

**INSTRUCCIONES:**
- Lee cada pregunta cuidadosamente
- Selecciona la respuesta correcta marcando la letra correspondiente
- Solo hay una respuesta correcta por pregunta
- Tiempo estimado: ${Math.ceil(parseInt(evaluationData.numberOfQuestions) * 1.5)} minutos

**PREGUNTAS:**
[Genera exactamente ${evaluationData.numberOfQuestions} preguntas de opción múltiple con 4 opciones cada una (A, B, C, D)]

**RESPUESTAS CORRECTAS:**
[Lista las respuestas correctas al final, numeradas del 1 al ${evaluationData.numberOfQuestions}]

CRITERIOS:
- Preguntas claras y específicas al tema
- Opciones incorrectas plausibles pero claramente incorrectas
- Nivel de dificultad apropiado para ${evaluationData.grade}
- Variedad en tipos de preguntas (conceptos, aplicación, análisis)
- Terminología apropiada para el nivel educativo
- Formato profesional y listo para imprimir`;

      const { data, error } = await supabase.functions.invoke('generate-lesson-plan', {
        body: {
          grade: evaluationData.grade,
          topicThemes: evaluationPrompt,
          subtopics: '',
          additionalCriteria: 'Generar SOLO la evaluación, no un plan de lección'
        }
      });
      
      if (error) {
        if (error.message === 'AI_LIMIT_EXCEEDED') {
          setShowUpgradeModal(true);
          return;
        }
        throw error;
      }

      // Refresh usage after successful generation (server-side increment)
      await refreshUsage();
      setEvaluationResponse(data.lessonPlan);
      setCurrentEvaluationStep('preview');
      toast({
        title: "¡Evaluación generada!",
        description: "Tu evaluación ha sido creada exitosamente."
      });
    } catch (error) {
      console.error('Error generating evaluation:', error);
      console.error('Error details:', error.message, error);
      toast({
        title: "Error",
        description: `Error: ${error.message || 'No se pudo generar la evaluación. Intenta de nuevo.'}`,
        variant: "destructive"
      });
    } finally {
      setIsEvaluationLoading(false);
    }
  };

  const handleCopyEvaluationToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(evaluationResponse);
      toast({
        title: "¡Copiado!",
        description: "La evaluación ha sido copiada al portapapeles."
      });
    } catch (error) {
      const textArea = document.createElement('textarea');
      textArea.value = evaluationResponse;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast({
        title: "¡Copiado!",
        description: "La evaluación ha sido copiada al portapapeles."
      });
    }
  };

  const handleCreateEvaluationPDF = () => {
    try {
      const pdf = new jsPDF();
      pdf.setFont('helvetica');
      pdf.setFontSize(16);
      pdf.text('Evaluación', 20, 20);
      const splitText = pdf.splitTextToSize(evaluationResponse, 170);
      pdf.setFontSize(12);
      pdf.text(splitText, 20, 40);
      pdf.save('Evaluacion.pdf');
      toast({
        title: "¡PDF creado!",
        description: "Tu evaluación ha sido descargada como PDF."
      });
    } catch (error) {
      console.error('Error creating PDF:', error);
      toast({
        title: "Error",
        description: "Hubo un problema al crear el PDF. Inténtalo de nuevo.",
        variant: "destructive"
      });
    }
  };

  const resetEvaluationForm = () => {
    setShowEvaluationDialog(false);
    setCurrentEvaluationStep('form');
    setEvaluationResponse('');
    setEvaluationData({
      subject: '',
      grade: '',
      topic: '',
      numberOfQuestions: '10',
      difficulty: 'intermedio',
      additionalInstructions: ''
    });
  };

  const handleGenerateWorksheet = async () => {
    if (!worksheetData.subject.trim() || !worksheetData.grade.trim() || !worksheetData.topic.trim()) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa la materia, grado y tema.",
        variant: "destructive"
      });
      return;
    }
    setIsWorksheetLoading(true);
    try {
      // Crear prompt específico para hoja de trabajo
      const worksheetPrompt = `IMPORTANTE: Genera una HOJA DE TRABAJO con EJERCICIOS PRÁCTICOS, NO una evaluación de opción múltiple.

HOJA DE TRABAJO DE ${worksheetData.subject.toUpperCase()}
Grado: ${worksheetData.grade}
Tema: ${worksheetData.topic}
Tipo de hoja: ${worksheetData.worksheetType}
Número de ejercicios: ${worksheetData.numberOfExercises}
Dificultad: ${worksheetData.difficulty}
${worksheetData.additionalInstructions ? `Instrucciones adicionales: ${worksheetData.additionalInstructions}` : ''}

FORMATO REQUERIDO:

**HOJA DE TRABAJO - ${worksheetData.subject.toUpperCase()}**
**Grado: ${worksheetData.grade}**
**Tema: ${worksheetData.topic}**
**Fecha: _____________**
**Nombre del estudiante: _____________**

**INSTRUCCIONES:**
- Resuelve cada ejercicio paso a paso
- Muestra todo tu trabajo
- Usa el espacio proporcionado para tus respuestas
- Tiempo estimado: ${Math.ceil(parseInt(worksheetData.numberOfExercises) * 2)} minutos

**EJERCICIOS:**
[Genera exactamente ${worksheetData.numberOfExercises} ejercicios prácticos relacionados con ${worksheetData.topic}]

**CRITERIOS:**
- Ejercicios apropiados para ${worksheetData.grade}
- Dificultad ${worksheetData.difficulty}
- Variedad en tipos de ejercicios (cálculos, problemas, análisis, etc.)
- Espacio suficiente para que el estudiante resuelva
- Instrucciones claras para cada ejercicio
- Formato profesional y listo para imprimir
- Incluye ejercicios de diferentes niveles de complejidad`;

      const { data, error } = await supabase.functions.invoke('generate-lesson-plan', {
        body: {
          grade: worksheetData.grade,
          topicThemes: worksheetPrompt,
          subtopics: '',
          additionalCriteria: 'Generar SOLO la hoja de trabajo con ejercicios, no un plan de lección'
        }
      });
      
      if (error) {
        if (error.message === 'AI_LIMIT_EXCEEDED') {
          setShowUpgradeModal(true);
          return;
        }
        throw error;
      }

      // Refresh usage after successful generation (server-side increment)
      await refreshUsage();
      setWorksheetResponse(data.lessonPlan);
      setCurrentWorksheetStep('preview');
      toast({
        title: "¡Hoja de trabajo generada!",
        description: "Tu hoja de trabajo ha sido creada exitosamente."
      });
    } catch (error) {
      console.error('Error generating worksheet:', error);
      console.error('Error details:', error.message, error);
      toast({
        title: "Error",
        description: `Error: ${error.message || 'No se pudo generar la hoja de trabajo. Intenta de nuevo.'}`,
        variant: "destructive"
      });
    } finally {
      setIsWorksheetLoading(false);
    }
  };

  const handleCopyWorksheetToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(worksheetResponse);
      toast({
        title: "¡Copiado!",
        description: "La hoja de trabajo ha sido copiada al portapapeles."
      });
    } catch (error) {
      const textArea = document.createElement('textarea');
      textArea.value = worksheetResponse;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast({
        title: "¡Copiado!",
        description: "La hoja de trabajo ha sido copiada al portapapeles."
      });
    }
  };

  const handleCreateWorksheetPDF = () => {
    try {
      const pdf = new jsPDF();
      pdf.setFont('helvetica');
      pdf.setFontSize(16);
      pdf.text('Hoja de Trabajo', 20, 20);
      const splitText = pdf.splitTextToSize(worksheetResponse, 170);
      pdf.setFontSize(12);
      pdf.text(splitText, 20, 40);
      pdf.save('Hoja_de_Trabajo.pdf');
      toast({
        title: "¡PDF creado!",
        description: "Tu hoja de trabajo ha sido descargada como PDF."
      });
    } catch (error) {
      console.error('Error creating PDF:', error);
      toast({
        title: "Error",
        description: "Hubo un problema al crear el PDF. Inténtalo de nuevo.",
        variant: "destructive"
      });
    }
  };

  const resetWorksheetForm = () => {
    setShowWorksheetDialog(false);
    setCurrentWorksheetStep('form');
    setWorksheetResponse('');
    setWorksheetData({
      subject: '',
      grade: '',
      topic: '',
      worksheetType: 'ejercicios',
      numberOfExercises: '10',
      difficulty: 'intermedio',
      additionalInstructions: ''
    });
  };

  const handleGeneratePresentation = async () => {
    if (!presentationData.title.trim() || !presentationData.subject.trim() || !presentationData.grade.trim() || !presentationData.topic.trim()) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa el título, materia, grado y tema.",
        variant: "destructive"
      });
      return;
    }

    if (presentationData.contentType === 'texto' && !presentationData.contentInput.trim()) {
      toast({
        title: "Contenido requerido",
        description: "Por favor proporciona el texto o contenido para la presentación.",
        variant: "destructive"
      });
      return;
    }

    if (presentationData.contentType === 'youtube' && !presentationData.youtubeUrl.trim()) {
      toast({
        title: "URL requerida",
        description: "Por favor proporciona la URL del video de YouTube.",
        variant: "destructive"
      });
      return;
    }

    setIsPresentationLoading(true);
    try {
      // Crear prompt específico para presentación
      let presentationPrompt = `IMPORTANTE: Genera una PRESENTACIÓN EDUCATIVA con DIAPOSITIVAS, NO un plan de lección.

PRESENTACIÓN: ${presentationData.title.toUpperCase()}
Materia: ${presentationData.subject}
Grado: ${presentationData.grade}
Tema: ${presentationData.topic}
Tipo de presentación: ${presentationData.presentationType}
Número de diapositivas: ${presentationData.numberOfSlides}
Tipo de contenido: ${presentationData.contentType}`;

      // Agregar contenido específico según el tipo
      if (presentationData.contentType === 'texto') {
        presentationPrompt += `\nContenido proporcionado: ${presentationData.contentInput}`;
      } else if (presentationData.contentType === 'youtube') {
        presentationPrompt += `\nVideo de YouTube: ${presentationData.youtubeUrl}`;
      }

      if (presentationData.additionalInstructions) {
        presentationPrompt += `\nInstrucciones adicionales: ${presentationData.additionalInstructions}`;
      }

      // Si es un video de YouTube, agregar instrucciones específicas
      if (presentationData.contentType === 'youtube') {
        presentationPrompt += `

INSTRUCCIONES ESPECIALES PARA VIDEO DE YOUTUBE:
1. PRIMERO: Analiza y resume el contenido del video de YouTube proporcionado
2. SEGUNDO: Extrae los puntos clave, conceptos principales y información educativa relevante del video
3. TERCERO: Organiza esa información en una presentación estructurada apropiada para ${presentationData.grade}
4. INCLUYE: Referencias específicas al video cuando sea apropiado (ej: "Como se muestra en el video...")
5. ADAPTA: El contenido del video al nivel educativo de ${presentationData.grade}
6. MENCIONA: En la presentación que el contenido está basado en el video de YouTube
7. RESUMEN: Incluye un resumen del video en la diapositiva de objetivos o al final
8. CONVIERTE: La información del video en diapositivas educativas claras y organizadas

PROCESO DE ANÁLISIS DEL VIDEO:
- Identifica el tema principal del video
- Extrae los conceptos clave mencionados
- Organiza la información de manera lógica
- Adapta el lenguaje al nivel de ${presentationData.grade}
- Crea diapositivas que complementen y expliquen el contenido del video`;
      }

      presentationPrompt += `

FORMATO REQUERIDO:

**PRESENTACIÓN: ${presentationData.title.toUpperCase()}**
**Materia: ${presentationData.subject} | Grado: ${presentationData.grade}**
**Tema: ${presentationData.topic}**

**DIAPOSITIVA 1: TÍTULO**
- Título principal: ${presentationData.title}
- Subtítulo: ${presentationData.topic}
- Materia: ${presentationData.subject}
- Grado: ${presentationData.grade}
- Fecha: [Fecha actual]`;

      if (presentationData.contentType === 'youtube') {
        presentationPrompt += `

**DIAPOSITIVA 2: OBJETIVOS**
- Objetivo general
- Objetivos específicos (3-4 puntos)
- Lo que aprenderás al final
- Basado en el video de YouTube proporcionado

**DIAPOSITIVA 3: RESUMEN DEL VIDEO**
- Resumen del contenido del video de YouTube
- Puntos clave extraídos del video
- Conceptos principales identificados
- Información relevante para ${presentationData.grade}

**DIAPOSITIVAS 4-${parseInt(presentationData.numberOfSlides) - 2}: CONTENIDO PRINCIPAL**
[Genera ${parseInt(presentationData.numberOfSlides) - 5} diapositivas con el contenido principal basado en el video]
- Cada diapositiva debe tener un título claro
- Contenido organizado en puntos clave extraídos del video
- Referencias al video cuando sea apropiado (ej: "Como se muestra en el video...")
- Imágenes o diagramas sugeridos cuando sea apropiado
- Información apropiada para ${presentationData.grade}
- Nivel de dificultad apropiado`;
      } else {
        presentationPrompt += `

**DIAPOSITIVA 2: OBJETIVOS**
- Objetivo general
- Objetivos específicos (3-4 puntos)
- Lo que aprenderás al final

**DIAPOSITIVAS 3-${parseInt(presentationData.numberOfSlides) - 2}: CONTENIDO PRINCIPAL**
[Genera ${parseInt(presentationData.numberOfSlides) - 4} diapositivas con el contenido principal]
- Cada diapositiva debe tener un título claro
- Contenido organizado en puntos clave
- Imágenes o diagramas sugeridos cuando sea apropiado
- Información apropiada para ${presentationData.grade}
- Nivel de dificultad apropiado`;
      }

      presentationPrompt += `

**DIAPOSITIVA ${parseInt(presentationData.numberOfSlides) - 1}: EJEMPLOS O ACTIVIDADES**
- Ejemplos prácticos
- Casos de estudio
- Actividades interactivas sugeridas`;

      if (presentationData.contentType === 'youtube') {
        presentationPrompt += `
- Actividades basadas en el contenido del video`;
      }

      presentationPrompt += `

**DIAPOSITIVA ${presentationData.numberOfSlides}: RESUMEN Y CONCLUSIÓN**
- Puntos clave resumidos
- Conclusiones principales
- Próximos pasos o tareas
- Preguntas para reflexión`;

      if (presentationData.contentType === 'youtube') {
        presentationPrompt += `
- Referencia al video de YouTube utilizado`;
      }

      presentationPrompt += `

**CRITERIOS:**
- Diapositivas claras y bien estructuradas
- Contenido apropiado para ${presentationData.grade}
- Formato profesional y educativo
- Títulos descriptivos para cada diapositiva
- Información organizada en puntos clave
- Sugerencias de elementos visuales cuando sea apropiado
- Duración estimada: ${Math.ceil(parseInt(presentationData.numberOfSlides) * 1.5)} minutos
- Listo para exportar a PowerPoint o Google Slides`;

      if (presentationData.contentType === 'youtube') {
        presentationPrompt += `
- ANÁLISIS DEL VIDEO: Resume y extrae información relevante del video de YouTube
- ADAPTACIÓN: Convierte el contenido del video en material educativo apropiado
- REFERENCIAS: Incluye referencias específicas al video cuando sea apropiado
- ESTRUCTURA: Organiza la información del video en diapositivas educativas claras`;
      }

      const { data, error } = await supabase.functions.invoke('generate-lesson-plan', {
        body: {
          grade: presentationData.grade,
          topicThemes: presentationPrompt,
          subtopics: '',
          additionalCriteria: 'Generar SOLO la presentación con diapositivas, no un plan de lección'
        }
      });
      
      if (error) {
        if (error.message === 'AI_LIMIT_EXCEEDED') {
          setShowUpgradeModal(true);
          return;
        }
        throw error;
      }

      // Refresh usage after successful generation (server-side increment)
      await refreshUsage();
      setPresentationResponse(data.lessonPlan);
      setCurrentPresentationStep('preview');
      toast({
        title: "¡Presentación generada!",
        description: "Tu presentación ha sido creada exitosamente."
      });
    } catch (error) {
      console.error('Error generating presentation:', error);
      console.error('Error details:', error.message, error);
      toast({
        title: "Error",
        description: `Error: ${error.message || 'No se pudo generar la presentación. Intenta de nuevo.'}`,
        variant: "destructive"
      });
    } finally {
      setIsPresentationLoading(false);
    }
  };

  const handleCopyPresentationToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(presentationResponse);
      toast({
        title: "¡Copiado!",
        description: "La presentación ha sido copiada al portapapeles."
      });
    } catch (error) {
      const textArea = document.createElement('textarea');
      textArea.value = presentationResponse;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast({
        title: "¡Copiado!",
        description: "La presentación ha sido copiada al portapapeles."
      });
    }
  };

  const handleCreatePresentationPDF = () => {
    try {
      const pdf = new jsPDF();
      pdf.setFont('helvetica');
      pdf.setFontSize(16);
      pdf.text('Presentación Educativa', 20, 20);
      const splitText = pdf.splitTextToSize(presentationResponse, 170);
      pdf.setFontSize(12);
      pdf.text(splitText, 20, 40);
      pdf.save('Presentacion_Educativa.pdf');
      toast({
        title: "¡PDF creado!",
        description: "Tu presentación ha sido descargada como PDF."
      });
    } catch (error) {
      console.error('Error creating PDF:', error);
      toast({
        title: "Error",
        description: "Hubo un problema al crear el PDF. Inténtalo de nuevo.",
        variant: "destructive"
      });
    }
  };

  const handleExportToPowerPoint = () => {
    try {
      // Dividir el contenido en diapositivas basado en los marcadores **DIAPOSITIVA**
      const slides = presentationResponse.split(/\*\*DIAPOSITIVA \d+:/);
      
      // Crear HTML para la presentación
      let htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${presentationData.title}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .slide {
            width: 100vw;
            height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 40px;
            box-sizing: border-box;
            page-break-after: always;
            background: white;
            margin-bottom: 20px;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }
        .slide-title {
            font-size: 2.5em;
            font-weight: bold;
            color: #1F4E79;
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #1F4E79;
            padding-bottom: 15px;
            width: 100%;
        }
        .slide-content {
            font-size: 1.2em;
            line-height: 1.6;
            color: #333;
            max-width: 80%;
            text-align: left;
        }
        .slide-content ul {
            list-style-type: none;
            padding-left: 0;
        }
        .slide-content li {
            margin: 15px 0;
            padding-left: 30px;
            position: relative;
        }
        .slide-content li:before {
            content: "•";
            color: #1F4E79;
            font-weight: bold;
            position: absolute;
            left: 0;
            font-size: 1.5em;
        }
        .slide-footer {
            position: absolute;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            font-size: 0.9em;
            color: #666;
            text-align: center;
        }
        .slide-number {
            position: absolute;
            top: 20px;
            right: 30px;
            font-size: 1em;
            color: #999;
        }
        @media print {
            .slide {
                page-break-after: always;
                margin-bottom: 0;
            }
        }
    </style>
</head>
<body>
`;

      slides.forEach((slideContent, index) => {
        if (index === 0) return; // Saltar el primer elemento vacío
        
        // Extraer el título de la diapositiva
        const titleMatch = slideContent.match(/\*\*DIAPOSITIVA \d+: ([^*]+)/);
        const title = titleMatch ? titleMatch[1].trim() : `Diapositiva ${index}`;
        
        // Limpiar el contenido y dividir en líneas
        const cleanContent = slideContent
          .replace(/\*\*DIAPOSITIVA \d+: [^*]+\*\*/, '')
          .replace(/\*\*[^*]+\*\*/g, '')
          .trim();
        
        const lines = cleanContent.split('\n').filter(line => line.trim());
        
        htmlContent += `
    <div class="slide">
        <div class="slide-number">${index}</div>
        <div class="slide-title">${title}</div>
        <div class="slide-content">
            <ul>
`;
        
        lines.forEach(line => {
          if (line.trim()) {
            const text = line.startsWith('-') ? line.substring(1).trim() : line.trim();
            htmlContent += `                <li>${text}</li>\n`;
          }
        });
        
        htmlContent += `
            </ul>
        </div>
        <div class="slide-footer">
            ${presentationData.title} - ${presentationData.subject} | ${presentationData.grade}
        </div>
    </div>
`;
      });
      
      htmlContent += `
</body>
</html>`;

      // Crear y descargar el archivo HTML
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${presentationData.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_presentacion.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "¡Presentación HTML creada!",
        description: "Tu presentación ha sido descargada como archivo HTML. Puedes abrirla en PowerPoint o cualquier navegador."
      });
    } catch (error) {
      console.error('Error creating presentation:', error);
      toast({
        title: "Error",
        description: "Hubo un problema al crear la presentación. Inténtalo de nuevo.",
        variant: "destructive"
      });
    }
  };

  const resetPresentationForm = () => {
    setShowPresentationDialog(false);
    setCurrentPresentationStep('form');
    setPresentationResponse('');
    setPresentationData({
      title: '',
      subject: '',
      grade: '',
      topic: '',
      presentationType: 'educativa',
      numberOfSlides: '10',
      contentType: 'texto',
      contentInput: '',
      youtubeUrl: '',
      additionalInstructions: ''
    });
  };

  const handleGenerateAcademicContent = async () => {
    if (!academicContentData.title.trim() || !academicContentData.subject.trim() || !academicContentData.grade.trim() || !academicContentData.topic.trim()) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa el título, materia, grado y tema.",
        variant: "destructive"
      });
      return;
    }

    setIsAcademicContentLoading(true);
    try {
      // Crear prompt específico para contenido académico
      let academicPrompt = `IMPORTANTE: Genera CONTENIDO ACADÉMICO PERSONALIZADO de alta calidad, NO un plan de lección.

CONTENIDO ACADÉMICO: ${academicContentData.title.toUpperCase()}
Materia: ${academicContentData.subject}
Grado: ${academicContentData.grade}
Tema: ${academicContentData.topic}
Tipo de contenido: ${academicContentData.contentType}
Nivel académico: ${academicContentData.academicLevel}
Longitud: ${academicContentData.length}
Formato: ${academicContentData.format}`;

      if (academicContentData.learningObjectives) {
        academicPrompt += `\nObjetivos de aprendizaje: ${academicContentData.learningObjectives}`;
      }

      if (academicContentData.keyConcepts) {
        academicPrompt += `\nConceptos clave: ${academicContentData.keyConcepts}`;
      }

      if (academicContentData.assessmentCriteria) {
        academicPrompt += `\nCriterios de evaluación: ${academicContentData.assessmentCriteria}`;
      }

      if (academicContentData.additionalInstructions) {
        academicPrompt += `\nInstrucciones adicionales: ${academicContentData.additionalInstructions}`;
      }

      academicPrompt += `

FORMATO REQUERIDO:

**${academicContentData.title.toUpperCase()}**
**Materia: ${academicContentData.subject} | Grado: ${academicContentData.grade}**
**Tema: ${academicContentData.topic}**

**INTRODUCCIÓN**
- Contexto del tema
- Importancia del contenido
- Conexión con el currículo de ${academicContentData.grade}
- Objetivos de aprendizaje claros`;

      if (academicContentData.learningObjectives) {
        academicPrompt += `
- Objetivos específicos: ${academicContentData.learningObjectives}`;
      }

      academicPrompt += `

**DESARROLLO DEL CONTENIDO**
- Explicación detallada del tema
- Conceptos fundamentales
- Ejemplos prácticos y aplicaciones
- Conexiones interdisciplinarias
- Nivel apropiado para ${academicContentData.grade}`;

      if (academicContentData.keyConcepts) {
        academicPrompt += `
- Conceptos clave: ${academicContentData.keyConcepts}`;
      }

      academicPrompt += `

**ACTIVIDADES DE APRENDIZAJE**
- Actividades de comprensión
- Ejercicios prácticos
- Casos de estudio
- Proyectos sugeridos
- Evaluaciones formativas`;

      if (academicContentData.assessmentCriteria) {
        academicPrompt += `
- Criterios de evaluación: ${academicContentData.assessmentCriteria}`;
      }

      academicPrompt += `

**RECURSOS Y MATERIALES**
- Bibliografía recomendada
- Enlaces útiles
- Materiales multimedia
- Herramientas digitales
- Recursos complementarios

**CONCLUSIÓN**
- Síntesis del contenido
- Aplicaciones prácticas
- Próximos pasos de aprendizaje
- Preguntas para reflexión

**CRITERIOS DE CALIDAD:**
- Contenido académicamente riguroso
- Apropiado para ${academicContentData.grade}
- Nivel de dificultad: ${academicContentData.academicLevel}
- Longitud: ${academicContentData.length}
- Formato: ${academicContentData.format}
- Lenguaje claro y accesible
- Estructura lógica y coherente
- Incluye ejemplos y aplicaciones prácticas
- Fomenta el pensamiento crítico
- Alineado con estándares educativos`;

      const { data, error } = await supabase.functions.invoke('generate-lesson-plan', {
        body: {
          grade: academicContentData.grade,
          topicThemes: academicPrompt,
          subtopics: '',
          additionalCriteria: 'Generar SOLO contenido académico personalizado, no un plan de lección'
        }
      });
      
      if (error) {
        if (error.message === 'AI_LIMIT_EXCEEDED') {
          setShowUpgradeModal(true);
          return;
        }
        throw error;
      }

      // Refresh usage after successful generation (server-side increment)
      await refreshUsage();
      setAcademicContentResponse(data.lessonPlan);
      setCurrentAcademicContentStep('preview');
      toast({
        title: "¡Contenido académico generado!",
        description: "Tu contenido académico personalizado ha sido creado exitosamente."
      });
    } catch (error) {
      console.error('Error generating academic content:', error);
      console.error('Error details:', error.message, error);
      toast({
        title: "Error",
        description: `Error: ${error.message || 'No se pudo generar el contenido académico. Intenta de nuevo.'}`,
        variant: "destructive"
      });
    } finally {
      setIsAcademicContentLoading(false);
    }
  };

  const handleCopyAcademicContentToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(academicContentResponse);
      toast({
        title: "¡Copiado!",
        description: "El contenido académico ha sido copiado al portapapeles."
      });
    } catch (error) {
      const textArea = document.createElement('textarea');
      textArea.value = academicContentResponse;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast({
        title: "¡Copiado!",
        description: "El contenido académico ha sido copiado al portapapeles."
      });
    }
  };

  const handleCreateAcademicContentPDF = () => {
    try {
      const pdf = new jsPDF();
      pdf.setFont('helvetica');
      pdf.setFontSize(16);
      pdf.text('Contenido Académico', 20, 20);
      const splitText = pdf.splitTextToSize(academicContentResponse, 170);
      pdf.setFontSize(12);
      pdf.text(splitText, 20, 40);
      pdf.save('Contenido_Academico.pdf');
      toast({
        title: "¡PDF creado!",
        description: "Tu contenido académico ha sido descargado como PDF."
      });
    } catch (error) {
      console.error('Error creating PDF:', error);
      toast({
        title: "Error",
        description: "Hubo un problema al crear el PDF. Inténtalo de nuevo.",
        variant: "destructive"
      });
    }
  };

  const resetAcademicContentForm = () => {
    setShowAcademicContentDialog(false);
    setCurrentAcademicContentStep('form');
    setAcademicContentResponse('');
    setAcademicContentData({
      title: '',
      subject: '',
      grade: '',
      topic: '',
      contentType: 'articulo',
      academicLevel: 'basico',
      length: 'corto',
      format: 'texto',
      learningObjectives: '',
      keyConcepts: '',
      assessmentCriteria: '',
      additionalInstructions: ''
    });
  };

  const handleGenerateEmail = async () => {
    if (!emailData.senderName.trim() || !emailData.recipientName.trim() || !emailData.subject.trim() || !emailData.mainMessage.trim()) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa el nombre del remitente, destinatario, asunto y mensaje principal.",
        variant: "destructive"
      });
      return;
    }

    setIsEmailLoading(true);
    try {
      // Crear prompt específico para correo profesional
      let emailPrompt = `IMPORTANTE: Genera un CORREO ELECTRÓNICO PROFESIONAL de alta calidad, NO un plan de lección.

CORREO PROFESIONAL:
Remitente: ${emailData.senderName}${emailData.senderTitle ? ` (${emailData.senderTitle})` : ''}${emailData.senderEmail ? ` - ${emailData.senderEmail}` : ''}
Destinatario: ${emailData.recipientName}${emailData.recipientTitle ? ` (${emailData.recipientTitle})` : ''}${emailData.recipientEmail ? ` - ${emailData.recipientEmail}` : ''}
Asunto: ${emailData.subject}
Tipo de correo: ${emailData.emailType}
Tono: ${emailData.tone}
Propósito: ${emailData.purpose}
Urgencia: ${emailData.urgency}
Mensaje principal: ${emailData.mainMessage}`;

      if (emailData.additionalPoints) {
        emailPrompt += `\nPuntos adicionales: ${emailData.additionalPoints}`;
      }

      if (emailData.additionalInstructions) {
        emailPrompt += `\nInstrucciones adicionales: ${emailData.additionalInstructions}`;
      }

      emailPrompt += `

FORMATO REQUERIDO:

**ASUNTO:** ${emailData.subject}

**CORREO ELECTRÓNICO PROFESIONAL**

Estimado/a ${emailData.recipientName}${emailData.recipientTitle ? ` ${emailData.recipientTitle}` : ''},

[Saludo apropiado según el tipo de correo y tono]

${emailData.mainMessage}`;

      if (emailData.additionalPoints) {
        emailPrompt += `

${emailData.additionalPoints}`;
      }

      emailPrompt += `

[Párrafo de cierre apropiado según el tipo de correo y urgencia]

${emailData.closingType === 'formal' ? 'Atentamente' : emailData.closingType === 'cordial' ? 'Cordialmente' : 'Saludos cordiales'},
${emailData.senderName}${emailData.senderTitle ? `\n${emailData.senderTitle}` : ''}${emailData.senderEmail ? `\n${emailData.senderEmail}` : ''}`;

      if (emailData.senderEmail) {
        emailPrompt += `

---
Este correo electrónico fue generado automáticamente. Por favor, verifique la información antes de enviar.`;
      }

      emailPrompt += `

**CRITERIOS DE CALIDAD:**
- Correo profesional y bien estructurado
- Tono apropiado: ${emailData.tone}
- Tipo de correo: ${emailData.emailType}
- Propósito claro: ${emailData.purpose}
- Urgencia: ${emailData.urgency}
- Lenguaje claro y conciso
- Estructura profesional estándar
- Saludo y despedida apropiados
- Información completa y precisa
- Formato listo para enviar`;

      const { data, error } = await supabase.functions.invoke('generate-lesson-plan', {
        body: {
          grade: 'Profesional',
          topicThemes: emailPrompt,
          subtopics: '',
          additionalCriteria: 'Generar SOLO un correo electrónico profesional, no un plan de lección'
        }
      });
      
      if (error) {
        if (error.message === 'AI_LIMIT_EXCEEDED') {
          setShowUpgradeModal(true);
          return;
        }
        throw error;
      }

      // Refresh usage after successful generation (server-side increment)
      await refreshUsage();
      setEmailResponse(data.lessonPlan);
      setCurrentEmailStep('preview');
      toast({
        title: "¡Correo profesional generado!",
        description: "Tu correo electrónico profesional ha sido creado exitosamente."
      });
    } catch (error) {
      console.error('Error generating email:', error);
      console.error('Error details:', error.message, error);
      toast({
        title: "Error",
        description: `Error: ${error.message || 'No se pudo generar el correo profesional. Intenta de nuevo.'}`,
        variant: "destructive"
      });
    } finally {
      setIsEmailLoading(false);
    }
  };

  const handleCopyEmailToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(emailResponse);
      toast({
        title: "¡Copiado!",
        description: "El correo profesional ha sido copiado al portapapeles."
      });
    } catch (error) {
      const textArea = document.createElement('textarea');
      textArea.value = emailResponse;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast({
        title: "¡Copiado!",
        description: "El correo profesional ha sido copiado al portapapeles."
      });
    }
  };

  const handleCreateEmailPDF = () => {
    try {
      const pdf = new jsPDF();
      pdf.setFont('helvetica');
      pdf.setFontSize(16);
      pdf.text('Correo Profesional', 20, 20);
      const splitText = pdf.splitTextToSize(emailResponse, 170);
      pdf.setFontSize(12);
      pdf.text(splitText, 20, 40);
      pdf.save('Correo_Profesional.pdf');
      toast({
        title: "¡PDF creado!",
        description: "Tu correo profesional ha sido descargado como PDF."
      });
    } catch (error) {
      console.error('Error creating PDF:', error);
      toast({
        title: "Error",
        description: "Hubo un problema al crear el PDF. Inténtalo de nuevo.",
        variant: "destructive"
      });
    }
  };

  const resetEmailForm = () => {
    setShowEmailDialog(false);
    setCurrentEmailStep('form');
    setEmailResponse('');
    setEmailData({
      senderName: '',
      senderTitle: '',
      senderEmail: '',
      recipientName: '',
      recipientTitle: '',
      recipientEmail: '',
      subject: '',
      emailType: 'formal',
      tone: 'profesional',
      purpose: 'informacion',
      urgency: 'normal',
      mainMessage: '',
      additionalPoints: '',
      closingType: 'formal',
      additionalInstructions: ''
    });
  };

  const handleGenerateRubric = async () => {
    if (!rubricData.assignmentName.trim() || !rubricData.subject.trim() || !rubricData.grade.trim()) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa el nombre de la asignación, materia y grado.",
        variant: "destructive"
      });
      return;
    }

    // Validate criteria
    const hasValidCriteria = rubricData.criteria.some(criterion => 
      criterion.name.trim() && criterion.description.trim()
    );

    if (!hasValidCriteria) {
      toast({
        title: "Criterios requeridos",
        description: "Por favor agrega al menos un criterio con nombre y descripción.",
        variant: "destructive"
      });
      return;
    }

    setIsRubricLoading(true);
    try {
      // Crear prompt específico para rúbricas
      let rubricPrompt = `IMPORTANTE: Genera una RÚBRICA PERSONALIZADA de alta calidad, NO un plan de lección.

RÚBRICA DE EVALUACIÓN:
Nombre de la asignación: ${rubricData.assignmentName}
Materia: ${rubricData.subject}
Grado: ${rubricData.grade}
Tipo de asignación: ${rubricData.assignmentType}
Tipo de rúbrica: ${rubricData.rubricType}
Número de criterios: ${rubricData.criteriaCount}
Niveles de desempeño: ${rubricData.performanceLevels}
Tipo de escala: ${rubricData.scaleType}
Puntos totales: ${rubricData.totalPoints}`;

      // Agregar criterios específicos
      rubricPrompt += `\n\nCRITERIOS ESPECÍFICOS:`;
      rubricData.criteria.forEach((criterion, index) => {
        if (criterion.name.trim() && criterion.description.trim()) {
          rubricPrompt += `\n${index + 1}. ${criterion.name}: ${criterion.description} (Peso: ${criterion.weight}%)`;
        }
      });

      if (rubricData.additionalInstructions) {
        rubricPrompt += `\n\nInstrucciones adicionales: ${rubricData.additionalInstructions}`;
      }

      rubricPrompt += `

FORMATO REQUERIDO:

**RÚBRICA DE EVALUACIÓN: ${rubricData.assignmentName.toUpperCase()}**
**Materia: ${rubricData.subject} | Grado: ${rubricData.grade}**
**Tipo: ${rubricData.assignmentType} | Puntos totales: ${rubricData.totalPoints}**

**INSTRUCCIONES DE USO:**
- Esta rúbrica evalúa el desempeño en ${rubricData.assignmentName}
- Cada criterio se evalúa según los niveles de desempeño establecidos
- Los puntos se asignan según el nivel alcanzado en cada criterio
- La calificación final es la suma de todos los criterios evaluados

**CRITERIOS DE EVALUACIÓN:**`;

      // Generar tabla de rúbrica
      const performanceLevels = parseInt(rubricData.performanceLevels);
      const scaleType = rubricData.scaleType;
      
      rubricPrompt += `\n\n| Criterio | Descripción | `;
      
      // Generar encabezados de niveles
      for (let i = 1; i <= performanceLevels; i++) {
        if (scaleType === 'numerica') {
          const points = Math.round((parseInt(rubricData.totalPoints) / performanceLevels) * i);
          rubricPrompt += `Nivel ${i} (${points} pts) | `;
        } else if (scaleType === 'letras') {
          const letters = ['D', 'C', 'B', 'A'];
          rubricPrompt += `${letters[i-1] || 'A'} | `;
        } else {
          const levels = ['Insuficiente', 'Básico', 'Satisfactorio', 'Excelente'];
          rubricPrompt += `${levels[i-1] || 'Excelente'} | `;
        }
      }
      
      rubricPrompt += `\n|----------|-------------|`;
      
      // Generar filas de separación
      for (let i = 1; i <= performanceLevels; i++) {
        rubricPrompt += `----------|`;
      }
      rubricPrompt += `\n`;

      // Agregar criterios específicos
      rubricData.criteria.forEach((criterion, index) => {
        if (criterion.name.trim() && criterion.description.trim()) {
          const weight = parseInt(criterion.weight);
          const maxPoints = Math.round((parseInt(rubricData.totalPoints) * weight) / 100);
          
          rubricPrompt += `| **${criterion.name}** | ${criterion.description} | `;
          
          // Generar descripciones para cada nivel
          for (let i = 1; i <= performanceLevels; i++) {
            const points = Math.round((maxPoints / performanceLevels) * i);
            rubricPrompt += `[Descripción nivel ${i}] | `;
          }
          rubricPrompt += `\n`;
        }
      });

      rubricPrompt += `

**ESCALA DE CALIFICACIÓN:**
- Puntos totales posibles: ${rubricData.totalPoints}
- Criterios evaluados: ${rubricData.criteriaCount}
- Niveles de desempeño: ${rubricData.performanceLevels}
- Tipo de escala: ${rubricData.scaleType}

**CRITERIOS DE CALIDAD:**
- Rúbrica clara y específica
- Criterios alineados con objetivos de aprendizaje
- Niveles de desempeño bien definidos
- Escala de calificación apropiada para ${rubricData.grade}
- Descripciones detalladas para cada nivel
- Ponderación equilibrada de criterios
- Fácil de usar para evaluadores
- Proporciona retroalimentación constructiva
- Permite evaluación objetiva y consistente
- Alineada con estándares educativos`;

      const { data, error } = await supabase.functions.invoke('generate-lesson-plan', {
        body: {
          grade: rubricData.grade,
          topicThemes: rubricPrompt,
          subtopics: '',
          additionalCriteria: 'Generar SOLO una rúbrica de evaluación personalizada, no un plan de lección'
        }
      });
      
      if (error) {
        if (error.message === 'AI_LIMIT_EXCEEDED') {
          setShowUpgradeModal(true);
          return;
        }
        throw error;
      }

      // Refresh usage after successful generation (server-side increment)
      await refreshUsage();
      setRubricResponse(data.lessonPlan);
      setCurrentRubricStep('preview');
      toast({
        title: "¡Rúbrica generada!",
        description: "Tu rúbrica personalizada ha sido creada exitosamente."
      });
    } catch (error) {
      console.error('Error generating rubric:', error);
      console.error('Error details:', error.message, error);
      toast({
        title: "Error",
        description: `Error: ${error.message || 'No se pudo generar la rúbrica. Intenta de nuevo.'}`,
        variant: "destructive"
      });
    } finally {
      setIsRubricLoading(false);
    }
  };

  const handleCopyRubricToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(rubricResponse);
      toast({
        title: "¡Copiado!",
        description: "La rúbrica ha sido copiada al portapapeles."
      });
    } catch (error) {
      const textArea = document.createElement('textarea');
      textArea.value = rubricResponse;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast({
        title: "¡Copiado!",
        description: "La rúbrica ha sido copiada al portapapeles."
      });
    }
  };

  const handleCreateRubricPDF = () => {
    try {
      const pdf = new jsPDF();
      pdf.setFont('helvetica');
      pdf.setFontSize(16);
      pdf.text('Rúbrica de Evaluación', 20, 20);
      const splitText = pdf.splitTextToSize(rubricResponse, 170);
      pdf.setFontSize(12);
      pdf.text(splitText, 20, 40);
      pdf.save('Rubrica_Evaluacion.pdf');
      toast({
        title: "¡PDF creado!",
        description: "Tu rúbrica ha sido descargada como PDF."
      });
    } catch (error) {
      console.error('Error creating PDF:', error);
      toast({
        title: "Error",
        description: "Hubo un problema al crear el PDF. Inténtalo de nuevo.",
        variant: "destructive"
      });
    }
  };

  const resetRubricForm = () => {
    setShowRubricDialog(false);
    setCurrentRubricStep('form');
    setRubricResponse('');
    setRubricData({
      assignmentName: '',
      subject: '',
      grade: '',
      assignmentType: 'proyecto',
      rubricType: 'analitica',
      criteriaCount: '4',
      performanceLevels: '4',
      scaleType: 'numerica',
      totalPoints: '100',
      criteria: [
        { name: '', description: '', weight: '25' }
      ],
      additionalInstructions: ''
    });
  };

  const handleGenerateWritingFeedback = async () => {
    if (!writingFeedbackData.studentName.trim() || !writingFeedbackData.grade.trim() || !writingFeedbackData.writingSample.trim()) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa el nombre del estudiante, grado y muestra de escritura.",
        variant: "destructive"
      });
      return;
    }

    setIsWritingFeedbackLoading(true);
    try {
      // Crear prompt específico para retroalimentación de escritura
      let feedbackPrompt = `IMPORTANTE: Genera RETROALIMENTACIÓN DE ESCRITURA de alta calidad, NO un plan de lección.

RETROALIMENTACIÓN DE ESCRITURA:
Estudiante: ${writingFeedbackData.studentName}
Grado: ${writingFeedbackData.grade}
Materia: ${writingFeedbackData.subject}
Tipo de asignación: ${writingFeedbackData.assignmentType}
Tipo de retroalimentación: ${writingFeedbackData.feedbackType}
Tono: ${writingFeedbackData.tone}
Longitud: ${writingFeedbackData.length}
Áreas de enfoque: ${writingFeedbackData.focusAreas.join(', ')}

MUESTRA DE ESCRITURA DEL ESTUDIANTE:
${writingFeedbackData.writingSample}`;

      if (writingFeedbackData.rubricBased && writingFeedbackData.rubricCriteria) {
        feedbackPrompt += `\n\nCRITERIOS DE RÚBRICA A APLICAR:
${writingFeedbackData.rubricCriteria}`;
      }

      if (writingFeedbackData.specificInstructions) {
        feedbackPrompt += `\n\nINSTRUCCIONES ESPECÍFICAS:
${writingFeedbackData.specificInstructions}`;
      }

      if (writingFeedbackData.additionalInstructions) {
        feedbackPrompt += `\n\nINSTRUCCIONES ADICIONALES:
${writingFeedbackData.additionalInstructions}`;
      }

      feedbackPrompt += `

FORMATO REQUERIDO:

**RETROALIMENTACIÓN DE ESCRITURA**
**Estudiante: ${writingFeedbackData.studentName} | Grado: ${writingFeedbackData.grade}**
**Materia: ${writingFeedbackData.subject} | Tipo: ${writingFeedbackData.assignmentType}**

**RESUMEN GENERAL:**
- Evaluación general del trabajo
- Fortalezas principales identificadas
- Áreas de mejora más importantes
- Calificación o nivel de desempeño

**ANÁLISIS DETALLADO POR ÁREAS:**`;

      // Agregar análisis por cada área de enfoque
      if (writingFeedbackData.focusAreas.includes('contenido')) {
        feedbackPrompt += `

**CONTENIDO:**
- Claridad de ideas y argumentos
- Desarrollo del tema
- Uso de evidencia y ejemplos
- Originalidad y creatividad
- Cumplimiento de objetivos`;
      }

      if (writingFeedbackData.focusAreas.includes('organizacion')) {
        feedbackPrompt += `

**ORGANIZACIÓN:**
- Estructura general del texto
- Coherencia entre párrafos
- Uso de conectores y transiciones
- Introducción y conclusión
- Flujo lógico de ideas`;
      }

      if (writingFeedbackData.focusAreas.includes('gramatica')) {
        feedbackPrompt += `

**GRAMÁTICA Y ORTOGRAFÍA:**
- Corrección ortográfica
- Uso de puntuación
- Concordancia gramatical
- Variedad sintáctica
- Claridad en la expresión`;
      }

      if (writingFeedbackData.focusAreas.includes('estilo')) {
        feedbackPrompt += `

**ESTILO Y VOZ:**
- Tono apropiado para la audiencia
- Uso del vocabulario
- Voz activa vs. pasiva
- Consistencia en el estilo
- Personalidad del escritor`;
      }

      if (writingFeedbackData.focusAreas.includes('formato')) {
        feedbackPrompt += `

**FORMATO Y PRESENTACIÓN:**
- Cumplimiento de requisitos de formato
- Uso de citas y referencias
- Presentación visual
- Longitud apropiada
- Elementos requeridos`;
      }

      feedbackPrompt += `

**SUGERENCIAS ESPECÍFICAS DE MEJORA:**
- Recomendaciones concretas y accionables
- Ejemplos específicos del texto
- Estrategias de mejora
- Recursos adicionales
- Próximos pasos

**COMENTARIOS POSITIVOS:**
- Reconocimiento de logros
- Fortalezas a mantener
- Aspectos destacados
- Motivación y aliento

**CRITERIOS DE CALIDAD:**
- Retroalimentación constructiva y específica
- Tono ${writingFeedbackData.tone} apropiado para ${writingFeedbackData.grade}
- Enfoque en ${writingFeedbackData.focusAreas.join(', ')}
- Sugerencias accionables y concretas
- Balance entre fortalezas y áreas de mejora
- Lenguaje claro y comprensible
- Motivación y apoyo al estudiante
- Alineado con estándares de escritura
- Retroalimentación de longitud ${writingFeedbackData.length}
- Fomenta el crecimiento del estudiante`;

      const { data, error } = await supabase.functions.invoke('generate-lesson-plan', {
        body: {
          grade: writingFeedbackData.grade,
          topicThemes: feedbackPrompt,
          subtopics: '',
          additionalCriteria: 'Generar SOLO retroalimentación de escritura personalizada, no un plan de lección'
        }
      });
      
      if (error) {
        if (error.message === 'AI_LIMIT_EXCEEDED') {
          setShowUpgradeModal(true);
          return;
        }
        throw error;
      }

      // Refresh usage after successful generation (server-side increment)
      await refreshUsage();
      setWritingFeedbackResponse(data.lessonPlan);
      setCurrentWritingFeedbackStep('preview');
      toast({
        title: "¡Retroalimentación generada!",
        description: "La retroalimentación de escritura ha sido creada exitosamente."
      });
    } catch (error) {
      console.error('Error generating writing feedback:', error);
      console.error('Error details:', error.message, error);
      toast({
        title: "Error",
        description: `Error: ${error.message || 'No se pudo generar la retroalimentación. Intenta de nuevo.'}`,
        variant: "destructive"
      });
    } finally {
      setIsWritingFeedbackLoading(false);
    }
  };

  const handleCopyWritingFeedbackToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(writingFeedbackResponse);
      toast({
        title: "¡Copiado!",
        description: "La retroalimentación ha sido copiada al portapapeles."
      });
    } catch (error) {
      const textArea = document.createElement('textarea');
      textArea.value = writingFeedbackResponse;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast({
        title: "¡Copiado!",
        description: "La retroalimentación ha sido copiada al portapapeles."
      });
    }
  };

  const handleCreateWritingFeedbackPDF = () => {
    try {
      const pdf = new jsPDF();
      pdf.setFont('helvetica');
      pdf.setFontSize(16);
      pdf.text('Retroalimentación de Escritura', 20, 20);
      const splitText = pdf.splitTextToSize(writingFeedbackResponse, 170);
      pdf.setFontSize(12);
      pdf.text(splitText, 20, 40);
      pdf.save('Retroalimentacion_Escritura.pdf');
      toast({
        title: "¡PDF creado!",
        description: "Tu retroalimentación ha sido descargada como PDF."
      });
    } catch (error) {
      console.error('Error creating PDF:', error);
      toast({
        title: "Error",
        description: "Hubo un problema al crear el PDF. Inténtalo de nuevo.",
        variant: "destructive"
      });
    }
  };

  const resetWritingFeedbackForm = () => {
    setShowWritingFeedbackDialog(false);
    setCurrentWritingFeedbackStep('form');
    setWritingFeedbackResponse('');
    setWritingFeedbackData({
      studentName: '',
      grade: '',
      subject: '',
      assignmentType: 'ensayo',
      writingSample: '',
      feedbackType: 'constructiva',
      focusAreas: ['contenido', 'organizacion', 'gramatica', 'estilo'],
      rubricBased: false,
      rubricCriteria: '',
      specificInstructions: '',
      tone: 'apoyador',
      length: 'detallada',
      additionalInstructions: ''
    });
  };

  const handleGenerateInformativeTexts = async () => {
    if (!informativeTextsData.title.trim() || !informativeTextsData.subject.trim() || !informativeTextsData.grade.trim() || !informativeTextsData.topic.trim()) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa el título, materia, grado y tema.",
        variant: "destructive"
      });
      return;
    }

    setIsInformativeTextsLoading(true);
    try {
      // Crear prompt específico para textos informativos
      let informativePrompt = `IMPORTANTE: Genera un TEXTO INFORMATIVO ORIGINAL de alta calidad, NO un plan de lección.

TEXTO INFORMATIVO:
Título: ${informativeTextsData.title}
Materia: ${informativeTextsData.subject}
Grado: ${informativeTextsData.grade}
Tema: ${informativeTextsData.topic}
Tipo de texto: ${informativeTextsData.textType}
Longitud: ${informativeTextsData.length}
Dificultad: ${informativeTextsData.difficulty}
Idioma: ${informativeTextsData.language}`;

      if (informativeTextsData.keyConcepts) {
        informativePrompt += `\nConceptos clave: ${informativeTextsData.keyConcepts}`;
      }

      if (informativeTextsData.learningObjectives) {
        informativePrompt += `\nObjetivos de aprendizaje: ${informativeTextsData.learningObjectives}`;
      }

      if (informativeTextsData.additionalInstructions) {
        informativePrompt += `\nInstrucciones adicionales: ${informativeTextsData.additionalInstructions}`;
      }

      informativePrompt += `

FORMATO REQUERIDO:

**${informativeTextsData.title.toUpperCase()}**
**Materia: ${informativeTextsData.subject} | Grado: ${informativeTextsData.grade}**
**Tema: ${informativeTextsData.topic}**

**INTRODUCCIÓN**
- Presentación del tema
- Contexto y relevancia
- Objetivos del texto
- Conexión con el currículo de ${informativeTextsData.grade}`;

      if (informativeTextsData.learningObjectives) {
        informativePrompt += `
- Objetivos específicos: ${informativeTextsData.learningObjectives}`;
      }

      informativePrompt += `

**DESARROLLO DEL CONTENIDO**
- Explicación detallada del tema
- Información clara y precisa
- Ejemplos y casos prácticos
- Datos relevantes y actualizados
- Nivel apropiado para ${informativeTextsData.grade}`;

      if (informativeTextsData.keyConcepts) {
        informativePrompt += `
- Conceptos clave: ${informativeTextsData.keyConcepts}`;
      }

      informativePrompt += `

**INFORMACIÓN DETALLADA**
- Aspectos principales del tema
- Características y propiedades
- Procesos y procedimientos
- Relaciones y conexiones
- Aplicaciones prácticas`;

      if (informativeTextsData.includeImages) {
        informativePrompt += `

**ELEMENTOS VISUALES**
- Descripción de imágenes sugeridas
- Diagramas y esquemas
- Gráficos y tablas
- Ilustraciones explicativas`;
      }

      informativePrompt += `

**CONCLUSIÓN**
- Síntesis de los puntos principales
- Aplicaciones prácticas
- Importancia del tema
- Conexiones con otros temas`;

      if (informativeTextsData.includeQuestions) {
        informativePrompt += `

**PREGUNTAS DE COMPRENSIÓN**
- Preguntas de nivel básico
- Preguntas de análisis
- Preguntas de aplicación
- Preguntas de reflexión`;
      }

      if (informativeTextsData.includeActivities) {
        informativePrompt += `

**ACTIVIDADES SUGERIDAS**
- Actividades de comprensión
- Ejercicios prácticos
- Proyectos de investigación
- Actividades de reflexión`;
      }

      informativePrompt += `

**VOCABULARIO CLAVE**
- Términos importantes del tema
- Definiciones claras
- Palabras técnicas apropiadas para ${informativeTextsData.grade}
- Glosario básico

**CRITERIOS DE CALIDAD:**
- Texto informativo original y único
- Contenido preciso y actualizado
- Lenguaje apropiado para ${informativeTextsData.grade}
- Nivel de dificultad: ${informativeTextsData.difficulty}
- Longitud: ${informativeTextsData.length}
- Estructura clara y lógica
- Información relevante y útil
- Ejemplos y casos prácticos
- Vocabulario apropiado
- Fomenta el aprendizaje activo
- Alineado con estándares educativos`;

      const { data, error } = await supabase.functions.invoke('generate-lesson-plan', {
        body: {
          grade: informativeTextsData.grade,
          topicThemes: informativePrompt,
          subtopics: '',
          additionalCriteria: 'Generar SOLO un texto informativo original, no un plan de lección'
        }
      });
      
      if (error) {
        if (error.message === 'AI_LIMIT_EXCEEDED') {
          setShowUpgradeModal(true);
          return;
        }
        throw error;
      }

      // Refresh usage after successful generation (server-side increment)
      await refreshUsage();
      setInformativeTextsResponse(data.lessonPlan);
      setCurrentInformativeTextsStep('preview');
      toast({
        title: "¡Texto informativo generado!",
        description: "Tu texto informativo original ha sido creado exitosamente."
      });
    } catch (error) {
      console.error('Error generating informative text:', error);
      console.error('Error details:', error.message, error);
      toast({
        title: "Error",
        description: `Error: ${error.message || 'No se pudo generar el texto informativo. Intenta de nuevo.'}`,
        variant: "destructive"
      });
    } finally {
      setIsInformativeTextsLoading(false);
    }
  };

  const handleCopyInformativeTextsToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(informativeTextsResponse);
      toast({
        title: "¡Copiado!",
        description: "El texto informativo ha sido copiado al portapapeles."
      });
    } catch (error) {
      const textArea = document.createElement('textarea');
      textArea.value = informativeTextsResponse;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast({
        title: "¡Copiado!",
        description: "El texto informativo ha sido copiado al portapapeles."
      });
    }
  };

  const handleCreateInformativeTextsPDF = () => {
    try {
      const pdf = new jsPDF();
      pdf.setFont('helvetica');
      pdf.setFontSize(16);
      pdf.text('Texto Informativo', 20, 20);
      const splitText = pdf.splitTextToSize(informativeTextsResponse, 170);
      pdf.setFontSize(12);
      pdf.text(splitText, 20, 40);
      pdf.save('Texto_Informativo.pdf');
      toast({
        title: "¡PDF creado!",
        description: "Tu texto informativo ha sido descargado como PDF."
      });
    } catch (error) {
      console.error('Error creating PDF:', error);
      toast({
        title: "Error",
        description: "Hubo un problema al crear el PDF. Inténtalo de nuevo.",
        variant: "destructive"
      });
    }
  };

  const resetInformativeTextsForm = () => {
    setShowInformativeTextsDialog(false);
    setCurrentInformativeTextsStep('form');
    setInformativeTextsResponse('');
    setInformativeTextsData({
      title: '',
      subject: '',
      grade: '',
      topic: '',
      textType: 'articulo',
      length: 'medio',
      difficulty: 'intermedio',
      language: 'espanol',
      includeImages: false,
      includeQuestions: false,
      includeActivities: false,
      keyConcepts: '',
      learningObjectives: '',
      additionalInstructions: ''
    });
  };

  const handleCorrectText = async () => {
    if (!textCorrectorData.originalText.trim()) {
      toast({
        title: "Texto requerido",
        description: "Por favor ingresa el texto que quieres corregir.",
        variant: "destructive"
      });
      return;
    }

    setIsTextCorrectorLoading(true);
    try {
      // Crear prompt específico para corrección de textos
      let correctionPrompt = `IMPORTANTE: Revisa y corrige el siguiente texto, NO generes un plan de lección.

CORRECCIÓN DE TEXTO:
Idioma: ${textCorrectorData.language}
Tipo de corrección: ${textCorrectorData.correctionType}
Áreas de enfoque: ${textCorrectorData.focusAreas.join(', ')}
Tono: ${textCorrectorData.tone}
Formalidad: ${textCorrectorData.formality}
Incluir sugerencias: ${textCorrectorData.includeSuggestions ? 'Sí' : 'No'}
Incluir explicaciones: ${textCorrectorData.includeExplanations ? 'Sí' : 'No'}

TEXTO ORIGINAL:
${textCorrectorData.originalText}`;

      if (textCorrectorData.additionalInstructions) {
        correctionPrompt += `\n\nINSTRUCCIONES ADICIONALES:
${textCorrectorData.additionalInstructions}`;
      }

      correctionPrompt += `

FORMATO REQUERIDO:

**TEXTO CORREGIDO**
[Texto corregido con todas las mejoras aplicadas]

**RESUMEN DE CORRECCIONES REALIZADAS**
- Número total de correcciones: [X]
- Tipos de errores encontrados: [Lista de tipos]
- Mejoras principales aplicadas: [Lista de mejoras]`;

      if (textCorrectorData.includeSuggestions) {
        correctionPrompt += `

**SUGERENCIAS DE MEJORA**
- Sugerencias específicas para mejorar el texto
- Recomendaciones de estilo y claridad
- Consejos para futuros escritos`;
      }

      if (textCorrectorData.includeExplanations) {
        correctionPrompt += `

**EXPLICACIONES DETALLADAS**
- Explicación de cada corrección realizada
- Reglas gramaticales aplicadas
- Justificación de cambios de estilo`;
      }

      correctionPrompt += `

**CRITERIOS DE CORRECCIÓN APLICADOS:**
- Corrección de gramática y sintaxis
- Corrección de ortografía y acentuación
- Mejora de puntuación y signos
- Optimización de estilo y claridad
- Coherencia y cohesión del texto
- Tono apropiado: ${textCorrectorData.tone}
- Nivel de formalidad: ${textCorrectorData.formality}
- Idioma: ${textCorrectorData.language}
- Mantenimiento del significado original
- Mejora de la fluidez y legibilidad`;

      const { data, error } = await supabase.functions.invoke('generate-lesson-plan', {
        body: {
          grade: 'Corrección',
          topicThemes: correctionPrompt,
          subtopics: '',
          additionalCriteria: 'Generar SOLO corrección de texto, no un plan de lección'
        }
      });
      
      if (error) {
        if (error.message === 'AI_LIMIT_EXCEEDED') {
          setShowUpgradeModal(true);
          return;
        }
        throw error;
      }

      // Refresh usage after successful generation (server-side increment)
      await refreshUsage();
      setTextCorrectorResponse(data.lessonPlan);
      setCurrentTextCorrectorStep('preview');
      toast({
        title: "¡Texto corregido!",
        description: "Tu texto ha sido revisado y corregido exitosamente."
      });
    } catch (error) {
      console.error('Error correcting text:', error);
      console.error('Error details:', error.message, error);
      toast({
        title: "Error",
        description: `Error: ${error.message || 'No se pudo corregir el texto. Intenta de nuevo.'}`,
        variant: "destructive"
      });
    } finally {
      setIsTextCorrectorLoading(false);
    }
  };

  const handleCopyCorrectedTextToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(textCorrectorResponse);
      toast({
        title: "¡Copiado!",
        description: "El texto corregido ha sido copiado al portapapeles."
      });
    } catch (error) {
      const textArea = document.createElement('textarea');
      textArea.value = textCorrectorResponse;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast({
        title: "¡Copiado!",
        description: "El texto corregido ha sido copiado al portapapeles."
      });
    }
  };

  const handleCreateCorrectedTextPDF = () => {
    try {
      const pdf = new jsPDF();
      pdf.setFont('helvetica');
      pdf.setFontSize(16);
      pdf.text('Texto Corregido', 20, 20);
      const splitText = pdf.splitTextToSize(textCorrectorResponse, 170);
      pdf.setFontSize(12);
      pdf.text(splitText, 20, 40);
      pdf.save('Texto_Corregido.pdf');
      toast({
        title: "¡PDF creado!",
        description: "Tu texto corregido ha sido descargado como PDF."
      });
    } catch (error) {
      console.error('Error creating PDF:', error);
      toast({
        title: "Error",
        description: "Hubo un problema al crear el PDF. Inténtalo de nuevo.",
        variant: "destructive"
      });
    }
  };

  const resetTextCorrectorForm = () => {
    setShowTextCorrectorDialog(false);
    setCurrentTextCorrectorStep('form');
    setTextCorrectorResponse('');
    setTextCorrectorData({
      originalText: '',
      language: 'espanol',
      correctionType: 'completa',
      focusAreas: ['gramatica', 'ortografia', 'puntuacion', 'estilo'],
      tone: 'profesional',
      formality: 'neutral',
      includeSuggestions: true,
      includeExplanations: true,
      additionalInstructions: ''
    });
  };

  const handleGenerateYoutubeQuestions = async () => {
    if (!youtubeQuestionsData.videoUrl.trim() || !youtubeQuestionsData.subject.trim() || !youtubeQuestionsData.grade.trim()) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa la URL del video, materia y grado.",
        variant: "destructive"
      });
      return;
    }

    setIsYoutubeQuestionsLoading(true);
    try {
      // Crear prompt específico para preguntas sobre videos de YouTube
      let youtubePrompt = `IMPORTANTE: Genera preguntas orientadoras basadas en un video de YouTube, NO un plan de lección.

PREGUNTAS SOBRE VIDEO DE YOUTUBE:
URL del Video: ${youtubeQuestionsData.videoUrl}
Materia: ${youtubeQuestionsData.subject}
Grado: ${youtubeQuestionsData.grade}
Tipo de preguntas: ${youtubeQuestionsData.questionType}
Dificultad: ${youtubeQuestionsData.difficulty}
Número de preguntas: ${youtubeQuestionsData.questionCount}
Idioma: ${youtubeQuestionsData.language}
Áreas de enfoque: ${youtubeQuestionsData.focusAreas.join(', ')}
Incluir clave de respuestas: ${youtubeQuestionsData.includeAnswerKey ? 'Sí' : 'No'}
Incluir marcas de tiempo: ${youtubeQuestionsData.includeTimeStamps ? 'Sí' : 'No'}`;

      if (youtubeQuestionsData.additionalInstructions) {
        youtubePrompt += `\nInstrucciones adicionales: ${youtubeQuestionsData.additionalInstructions}`;
      }

      youtubePrompt += `

INSTRUCCIONES ESPECÍFICAS:
1. Analiza el contenido del video de YouTube proporcionado
2. Genera preguntas orientadoras alineadas con el contenido del video
3. Las preguntas deben ser apropiadas para ${youtubeQuestionsData.grade}
4. Nivel de dificultad: ${youtubeQuestionsData.difficulty}
5. Tipo de preguntas: ${youtubeQuestionsData.questionType}
6. Idioma: ${youtubeQuestionsData.language}
7. Número total de preguntas: ${youtubeQuestionsData.questionCount}`;

      if (youtubeQuestionsData.includeTimeStamps) {
        youtubePrompt += `
8. Incluir marcas de tiempo específicas donde se encuentra la respuesta`;
      }

      if (youtubeQuestionsData.includeAnswerKey) {
        youtubePrompt += `
9. Incluir clave de respuestas detallada`;
      }

      youtubePrompt += `

FORMATO REQUERIDO:

**INFORMACIÓN DEL VIDEO**
- Título del video: [Extraer del contenido]
- Duración: [Si está disponible]
- Materia: ${youtubeQuestionsData.subject}
- Grado: ${youtubeQuestionsData.grade}
- Nivel de dificultad: ${youtubeQuestionsData.difficulty}`;

      if (youtubeQuestionsData.includeTimeStamps) {
        youtubePrompt += `
- Marcas de tiempo incluidas: Sí`;
      }

      youtubePrompt += `

**PREGUNTAS ORIENTADORAS**

**Preguntas de Comprensión Básica**`;

      if (youtubeQuestionsData.focusAreas.includes('contenido')) {
        youtubePrompt += `
- Preguntas sobre el contenido principal del video
- Preguntas sobre conceptos clave mencionados
- Preguntas sobre información específica presentada`;
      }

      if (youtubeQuestionsData.focusAreas.includes('conceptos')) {
        youtubePrompt += `

**Preguntas de Conceptos**
- Preguntas sobre definiciones y terminología
- Preguntas sobre principios y teorías
- Preguntas sobre relaciones entre conceptos`;
      }

      if (youtubeQuestionsData.focusAreas.includes('aplicacion')) {
        youtubePrompt += `

**Preguntas de Aplicación**
- Preguntas sobre casos prácticos
- Preguntas sobre ejemplos del video
- Preguntas sobre situaciones reales`;
      }

      if (youtubeQuestionsData.focusAreas.includes('analisis')) {
        youtubePrompt += `

**Preguntas de Análisis**
- Preguntas sobre comparaciones y contrastes
- Preguntas sobre causas y efectos
- Preguntas sobre evaluaciones críticas`;
      }

      youtubePrompt += `

**Preguntas de Síntesis**
- Preguntas que requieren conectar ideas
- Preguntas sobre conclusiones
- Preguntas sobre aplicaciones futuras

**Preguntas de Evaluación**
- Preguntas sobre opiniones y juicios
- Preguntas sobre validez de argumentos
- Preguntas sobre implicaciones`;

      if (youtubeQuestionsData.includeAnswerKey) {
        youtubePrompt += `

**CLAVE DE RESPUESTAS**
- Respuestas detalladas para cada pregunta
- Explicaciones de por qué la respuesta es correcta
- Referencias específicas al contenido del video
- Nivel de dificultad de cada pregunta`;
      }

      if (youtubeQuestionsData.includeTimeStamps) {
        youtubePrompt += `

**MARCAS DE TIEMPO**
- Tiempo específico donde se encuentra cada respuesta
- Segmentos del video relevantes para cada pregunta
- Referencias temporales para facilitar la revisión`;
      }

      youtubePrompt += `

**CRITERIOS DE CALIDAD:**
- Preguntas alineadas con el contenido del video
- Nivel apropiado para ${youtubeQuestionsData.grade}
- Dificultad: ${youtubeQuestionsData.difficulty}
- Tipo: ${youtubeQuestionsData.questionType}
- Idioma: ${youtubeQuestionsData.language}
- Número total: ${youtubeQuestionsData.questionCount}
- Preguntas claras y específicas
- Respuestas basadas en el contenido del video
- Variedad en tipos de preguntas
- Progresión lógica de dificultad
- Fomenta el pensamiento crítico
- Alineado con objetivos educativos`;

      const { data, error } = await supabase.functions.invoke('generate-lesson-plan', {
        body: {
          grade: youtubeQuestionsData.grade,
          topicThemes: youtubePrompt,
          subtopics: '',
          additionalCriteria: 'Generar SOLO preguntas sobre video de YouTube, no un plan de lección'
        }
      });
      
      if (error) {
        if (error.message === 'AI_LIMIT_EXCEEDED') {
          setShowUpgradeModal(true);
          return;
        }
        throw error;
      }

      // Refresh usage after successful generation (server-side increment)
      await refreshUsage();
      setYoutubeQuestionsResponse(data.lessonPlan);
      setCurrentYoutubeQuestionsStep('preview');
      toast({
        title: "¡Preguntas generadas!",
        description: "Las preguntas orientadoras han sido creadas exitosamente."
      });
    } catch (error) {
      console.error('Error generating YouTube questions:', error);
      console.error('Error details:', error.message, error);
      toast({
        title: "Error",
        description: `Error: ${error.message || 'No se pudieron generar las preguntas. Intenta de nuevo.'}`,
        variant: "destructive"
      });
    } finally {
      setIsYoutubeQuestionsLoading(false);
    }
  };

  const handleCopyYoutubeQuestionsToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(youtubeQuestionsResponse);
      toast({
        title: "¡Copiado!",
        description: "Las preguntas han sido copiadas al portapapeles."
      });
    } catch (error) {
      const textArea = document.createElement('textarea');
      textArea.value = youtubeQuestionsResponse;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast({
        title: "¡Copiado!",
        description: "Las preguntas han sido copiadas al portapapeles."
      });
    }
  };

  const handleCreateYoutubeQuestionsPDF = () => {
    try {
      const pdf = new jsPDF();
      pdf.setFont('helvetica');
      pdf.setFontSize(16);
      pdf.text('Preguntas sobre Video de YouTube', 20, 20);
      const splitText = pdf.splitTextToSize(youtubeQuestionsResponse, 170);
      pdf.setFontSize(12);
      pdf.text(splitText, 20, 40);
      pdf.save('Preguntas_YouTube.pdf');
      toast({
        title: "¡PDF creado!",
        description: "Las preguntas han sido descargadas como PDF."
      });
    } catch (error) {
      console.error('Error creating PDF:', error);
      toast({
        title: "Error",
        description: "Hubo un problema al crear el PDF. Inténtalo de nuevo.",
        variant: "destructive"
      });
    }
  };

  const resetYoutubeQuestionsForm = () => {
    setShowYoutubeQuestionsDialog(false);
    setCurrentYoutubeQuestionsStep('form');
    setYoutubeQuestionsResponse('');
    setYoutubeQuestionsData({
      videoUrl: '',
      subject: '',
      grade: '',
      questionType: 'comprension',
      difficulty: 'intermedio',
      questionCount: '10',
      language: 'espanol',
      includeAnswerKey: true,
      includeTimeStamps: true,
      focusAreas: ['contenido', 'conceptos', 'aplicacion', 'analisis'],
      additionalInstructions: ''
    });
  };

  // Check for subscription status on component mount and when URL changes
  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      try {
        const {
          data: profile
        } = await supabase.from('profiles').select('subscription_status').eq('user_id', (await supabase.auth.getUser()).data.user?.id).maybeSingle();
        if (profile) {
          setSubscriptionStatus(profile.subscription_status || 'free');
        }
      } catch (error) {
        console.error('Error fetching subscription status:', error);
      }
    };
    checkSubscriptionStatus();

    // Check for upgrade success in URL
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('upgraded') === 'true') {
      // Refresh subscription state via edge function and then reload local status
      supabase.functions.invoke('check-subscription').catch((e) => {
        console.warn('check-subscription failed:', e);
      });
      checkSubscriptionStatus();
      refreshUsage();
      toast({
        title: '¡Actualización exitosa!',
        description: 'Ahora tienes acceso ilimitado a las herramientas de IA.'
      });
      // Clean URL
      window.history.replaceState({}, '', '/ai');
    }
  }, [refreshUsage, toast]);
  const handleAIButtonClick = (actionType: 'newsletter' | 'lesson-plan' | 'evaluation' | 'worksheet' | 'presentation' | 'academic-content' | 'professional-email' | 'rubric-generator' | 'writing-feedback' | 'informative-texts' | 'text-corrector' | 'youtube-questions') => {
    if (!canUseAI) {
      setShowUpgradeModal(true);
      return;
    }
    if (actionType === 'newsletter') {
      setShowForm(true);
    } else if (actionType === 'lesson-plan') {
      setShowLessonPlanDialog(true);
    } else if (actionType === 'evaluation') {
      setShowEvaluationDialog(true);
    } else if (actionType === 'worksheet') {
      setShowWorksheetDialog(true);
    } else if (actionType === 'presentation') {
      setShowPresentationDialog(true);
    } else if (actionType === 'academic-content') {
      setShowAcademicContentDialog(true);
    } else if (actionType === 'professional-email') {
      setShowEmailDialog(true);
    } else if (actionType === 'rubric-generator') {
      setShowRubricDialog(true);
    } else if (actionType === 'writing-feedback') {
      setShowWritingFeedbackDialog(true);
    } else if (actionType === 'informative-texts') {
      setShowInformativeTextsDialog(true);
    } else if (actionType === 'text-corrector') {
      setShowTextCorrectorDialog(true);
    } else {
      setShowYoutubeQuestionsDialog(true);
    }
  };
  return <MobileLayout title="Herramientas IA" hideHeader={true}>
      <div className="container-padding section-spacing min-h-screen bg-[#555555]">
        {/* Back Button */}
        <div className="mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')} className="mb-4 -ml-2 text-white hover:bg-[#3e3e3e]">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          
          <h1 className="text-responsive-2xl text-white text-center font-bold text-lg">
            Herramientas IA
          </h1>
        </div>

        {/* Category Dropdown */}
        <div className="mb-6">
          <Label className="text-white font-semibold text-sm mb-3 block rounded-none">
            Categoría
          </Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-between bg-[#3e3e3e] border-[#3e3e3e] text-white h-12 text-left hover:bg-[#3e3e3e]/80">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  {selectedCategory}
                </div>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-full bg-[#3e3e3e] border-[#3e3e3e]">
              {categories.map(category => {
              const Icon = category.icon;
              return <DropdownMenuItem key={category.value} onClick={() => setSelectedCategory(category.label)} className="flex items-center gap-2 cursor-pointer text-white hover:bg-[#555555]">
                    <Icon className="h-4 w-4" />
                    {category.label}
                  </DropdownMenuItem>;
            })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* AI Usage Indicator */}
        <div className="mb-6">
          <AIUsageIndicator usageCount={usageCount} subscriptionStatus={subscriptionStatus} isLoading={isUsageLoading} onUpgradeClick={() => setShowUpgradeModal(true)} />
        </div>

        {/* Section Title */}
        <h2 className="text-white mb-4 text-sm text-center font-light my-[18px]">El futuro de la educación es ahora...</h2>

        {/* AI Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className={`bg-[#3e3e3e] border-0 cursor-pointer hover:bg-[#3e3e3e]/80 transition-colors rounded-lg ${!canUseAI ? '' : ''}`} onClick={() => handleAIButtonClick('newsletter')}>
            <CardContent className="p-6 py-[7px]">
              <div className="text-center">
                
                <h3 className="text-lg text-white py-0 text-center font-bold">
                  Circular Semanal
                </h3>
                {!canUseAI && <p className="text-xs text-white/60 mt-1">Límite alcanzado</p>}
              </div>
            </CardContent>
          </Card>

          <Card className={`bg-[#3e3e3e] border-0 cursor-pointer hover:bg-[#3e3e3e]/80 transition-colors rounded-lg ${!canUseAI ? '' : ''}`} onClick={() => handleAIButtonClick('lesson-plan')}>
            <CardContent className="p-6 py-[4px]">
              <div className="text-center">
                
                <h3 className="text-lg text-white py-[4px] font-bold">
                  Plan de Lección
                </h3>
                {!canUseAI && <p className="text-xs text-white/60 mt-1">Límite alcanzado</p>}
              </div>
            </CardContent>
          </Card>

          <Card className={`bg-[#3e3e3e] border-0 cursor-pointer hover:bg-[#3e3e3e]/80 transition-colors rounded-lg ${!canUseAI ? '' : ''}`} onClick={() => handleAIButtonClick('evaluation')}>
            <CardContent className="p-6 py-[4px]">
              <div className="text-center">
                
                <h3 className="text-lg text-white py-[4px] font-bold">
                  Evaluación
                </h3>
                {!canUseAI && <p className="text-xs text-white/60 mt-1">Límite alcanzado</p>}
              </div>
            </CardContent>
          </Card>

          <Card className={`bg-[#3e3e3e] border-0 cursor-pointer hover:bg-[#3e3e3e]/80 transition-colors rounded-lg ${!canUseAI ? '' : ''}`} onClick={() => handleAIButtonClick('worksheet')}>
            <CardContent className="p-6 py-[4px]">
              <div className="text-center">
                
                <h3 className="text-lg text-white py-[4px] font-bold">
                  Generador de Hojas de Trabajo
                </h3>
                {!canUseAI && <p className="text-xs text-white/60 mt-1">Límite alcanzado</p>}
              </div>
            </CardContent>
          </Card>

          <Card className={`bg-[#3e3e3e] border-0 cursor-pointer hover:bg-[#3e3e3e]/80 transition-colors rounded-lg ${!canUseAI ? '' : ''}`} onClick={() => handleAIButtonClick('presentation')}>
            <CardContent className="p-6 py-[4px]">
              <div className="text-center">
                
                <h3 className="text-lg text-white py-[4px] font-bold">
                  Generador de Presentaciones
                </h3>
                {!canUseAI && <p className="text-xs text-white/60 mt-1">Límite alcanzado</p>}
              </div>
            </CardContent>
          </Card>

          <Card className={`bg-[#3e3e3e] border-0 cursor-pointer hover:bg-[#3e3e3e]/80 transition-colors rounded-lg ${!canUseAI ? '' : ''}`} onClick={() => handleAIButtonClick('academic-content')}>
            <CardContent className="p-6 py-[4px]">
              <div className="text-center">
                
                <h3 className="text-lg text-white py-[4px] font-bold">
                  Contenido Académico
                </h3>
                {!canUseAI && <p className="text-xs text-white/60 mt-1">Límite alcanzado</p>}
              </div>
            </CardContent>
          </Card>

          <Card className={`bg-[#3e3e3e] border-0 cursor-pointer hover:bg-[#3e3e3e]/80 transition-colors rounded-lg ${!canUseAI ? '' : ''}`} onClick={() => handleAIButtonClick('professional-email')}>
            <CardContent className="p-6 py-[4px]">
              <div className="text-center">
                
                <h3 className="text-lg text-white py-[4px] font-bold">
                  Correo Profesional
                </h3>
                {!canUseAI && <p className="text-xs text-white/60 mt-1">Límite alcanzado</p>}
              </div>
            </CardContent>
          </Card>

          <Card className={`bg-[#3e3e3e] border-0 cursor-pointer hover:bg-[#3e3e3e]/80 transition-colors rounded-lg ${!canUseAI ? '' : ''}`} onClick={() => handleAIButtonClick('rubric-generator')}>
            <CardContent className="p-6 py-[4px]">
              <div className="text-center">
                
                <h3 className="text-lg text-white py-[4px] font-bold">
                  Generador de Rúbricas
                </h3>
                {!canUseAI && <p className="text-xs text-white/60 mt-1">Límite alcanzado</p>}
              </div>
            </CardContent>
          </Card>

          <Card className={`bg-[#3e3e3e] border-0 cursor-pointer hover:bg-[#3e3e3e]/80 transition-colors rounded-lg ${!canUseAI ? '' : ''}`} onClick={() => handleAIButtonClick('writing-feedback')}>
            <CardContent className="p-6 py-[4px]">
              <div className="text-center">
                
                <h3 className="text-lg text-white py-[4px] font-bold">
                  Retroalimentación de Escritura
                </h3>
                {!canUseAI && <p className="text-xs text-white/60 mt-1">Límite alcanzado</p>}
              </div>
            </CardContent>
          </Card>

          <Card className={`bg-[#3e3e3e] border-0 cursor-pointer hover:bg-[#3e3e3e]/80 transition-colors rounded-lg ${!canUseAI ? '' : ''}`} onClick={() => handleAIButtonClick('informative-texts')}>
            <CardContent className="p-6 py-[4px]">
              <div className="text-center">
                
                <h3 className="text-lg text-white py-[4px] font-bold">
                  Textos Informativos
                </h3>
                {!canUseAI && <p className="text-xs text-white/60 mt-1">Límite alcanzado</p>}
              </div>
            </CardContent>
          </Card>

          <Card className={`bg-[#3e3e3e] border-0 cursor-pointer hover:bg-[#3e3e3e]/80 transition-colors rounded-lg ${!canUseAI ? '' : ''}`} onClick={() => handleAIButtonClick('text-corrector')}>
            <CardContent className="p-6 py-[4px]">
              <div className="text-center">
                
                <h3 className="text-lg text-white py-[4px] font-bold">
                  Corrector de Textos
                </h3>
                {!canUseAI && <p className="text-xs text-white/60 mt-1">Límite alcanzado</p>}
              </div>
            </CardContent>
          </Card>

          <Card className={`bg-[#3e3e3e] border-0 cursor-pointer hover:bg-[#3e3e3e]/80 transition-colors rounded-lg ${!canUseAI ? '' : ''}`} onClick={() => handleAIButtonClick('youtube-questions')}>
            <CardContent className="p-6 py-[4px]">
              <div className="text-center">
                
                <h3 className="text-lg text-white py-[4px] font-bold">
                  Preguntas sobre Video de YouTube
                </h3>
                {!canUseAI && <p className="text-xs text-white/60 mt-1">Límite alcanzado</p>}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Form Dialog */}
        <Dialog open={showForm} onOpenChange={resetForm}>
          <DialogContent className="max-w-2xl mx-auto max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-center">
                {currentStep === 'form' ? 'Genera: Circular Semanal' : 'Vista Previa del Boletín'}
              </DialogTitle>
            </DialogHeader>
            
            {currentStep === 'form' ? <div className="space-y-4 py-4">
                {/* Teacher Name */}
                <div className="space-y-2">
                  <Label htmlFor="teacherName">Nombre del Maestro/a *</Label>
                  <Input id="teacherName" placeholder="Ingresa el nombre del maestro/a" value={formData.teacherName} onChange={e => handleInputChange('teacherName', e.target.value)} />
                </div>

                {/* Level Selection */}
                <div className="space-y-2">
                  <Label htmlFor="level">Nivel/Grado *</Label>
                  <Select value={formData.level} onValueChange={value => handleInputChange('level', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un nivel" />
                    </SelectTrigger>
                    <SelectContent>
                      {levels.map(level => <SelectItem key={level} value={level}>
                          {level}
                        </SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                {/* Temas de la Semana */}
                <div className="space-y-2">
                  <Label htmlFor="temasDeLaSemana">Temas de la Semana</Label>
                  <Textarea id="temasDeLaSemana" placeholder="• Tema 1&#10;• Tema 2&#10;• Tema 3" value={formData.temasDeLaSemana} onChange={e => handleInputChange('temasDeLaSemana', e.target.value)} className="min-h-[100px]" />
                </div>

                {/* Celebraciones */}
                <div className="space-y-2">
                  <Label htmlFor="celebraciones">Celebraciones</Label>
                  <Textarea id="celebraciones" placeholder="• Celebración 1&#10;• Celebración 2" value={formData.celebraciones} onChange={e => handleInputChange('celebraciones', e.target.value)} className="min-h-[100px]" />
                </div>

                {/* Anuncios Importantes */}
                <div className="space-y-2">
                  <Label htmlFor="anunciosImportantes">Anuncios Importantes</Label>
                  <Textarea id="anunciosImportantes" placeholder="• Anuncio importante 1&#10;• Anuncio importante 2" value={formData.anunciosImportantes} onChange={e => handleInputChange('anunciosImportantes', e.target.value)} className="min-h-[100px]" />
                </div>

                {/* Anuncios Adicionales */}
                <div className="space-y-2">
                  <Label htmlFor="anunciosAdicionales">Anuncios Adicionales</Label>
                  <Textarea id="anunciosAdicionales" placeholder="• Anuncio adicional 1&#10;• Anuncio adicional 2" value={formData.anunciosAdicionales} onChange={e => handleInputChange('anunciosAdicionales', e.target.value)} className="min-h-[100px]" />
                </div>

                {/* Form Buttons */}
                <div className="flex gap-3 justify-center pt-4">
                  <Button onClick={handleGenerateNewsletter} disabled={isLoading} className="bg-primary hover:bg-primary text-primary-foreground">
                    {isLoading ? 'Generando...' : '¡Crear!'}
                  </Button>
                  <Button variant="outline" onClick={resetForm} disabled={isLoading}>
                    Go back
                  </Button>
                </div>
              </div> : <div className="space-y-4 py-4">
                {/* Preview Box */}
                <div className="border rounded-lg p-4 bg-muted max-h-[400px] overflow-y-auto">
                  <h3 className="font-semibold mb-3">Boletín Generado:</h3>
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {aiResponse}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                  <Button onClick={handleDoOver} variant="outline" className="flex items-center gap-2">
                    <RotateCcw className="h-4 w-4" />
                    Do Over
                  </Button>
                  <Button onClick={handleCopyToClipboard} variant="outline" className="flex items-center gap-2">
                    <Copy className="h-4 w-4" />
                    Copy to Clipboard
                  </Button>
                  <Button onClick={handleCreatePDF} className="bg-primary hover:bg-primary text-primary-foreground flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Create PDF
                  </Button>
                </div>
              </div>}
          </DialogContent>
        </Dialog>

        {/* Lesson Plan Dialog */}
        <Dialog open={showLessonPlanDialog} onOpenChange={resetLessonPlanForm}>
          <DialogContent className="max-w-2xl mx-auto max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-center">
                {currentLessonPlanStep === 'form' ? 'Genera: Plan de Lección' : 'Vista Previa del Plan de Lección'}
              </DialogTitle>
            </DialogHeader>
            
            {currentLessonPlanStep === 'form' ? <div className="space-y-4 py-4">
                {/* Grade */}
                <div className="space-y-2">
                  <Label htmlFor="grade">Grado *</Label>
                  <Select value={lessonPlanData.grade} onValueChange={value => handleLessonPlanInputChange('grade', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un grado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Kinder">Kinder</SelectItem>
                      <SelectItem value="1er Grado">1er Grado</SelectItem>
                      <SelectItem value="2do Grado">2do Grado</SelectItem>
                      <SelectItem value="3er Grado">3er Grado</SelectItem>
                      <SelectItem value="4to Grado">4to Grado</SelectItem>
                      <SelectItem value="5to Grado">5to Grado</SelectItem>
                      <SelectItem value="6to Grado">6to Grado</SelectItem>
                      <SelectItem value="7mo Grado">7mo Grado</SelectItem>
                      <SelectItem value="8vo Grado">8vo Grado</SelectItem>
                      <SelectItem value="9no Grado">9no Grado</SelectItem>
                      <SelectItem value="10mo Grado">10mo Grado</SelectItem>
                      <SelectItem value="11vo Grado">11vo Grado</SelectItem>
                      <SelectItem value="12vo Grado">12vo Grado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Topic/Themes */}
                <div className="space-y-2">
                  <Label htmlFor="topicThemes">Tema Principal *</Label>
                  <Input id="topicThemes" placeholder="Ej: La fotosíntesis, Guerra de Independencia, etc." value={lessonPlanData.topicThemes} onChange={e => handleLessonPlanInputChange('topicThemes', e.target.value)} />
                </div>

                {/* Subtopics */}
                <div className="space-y-2">
                  <Label htmlFor="subtopics">Subtemas</Label>
                  <Textarea id="subtopics" placeholder="Lista los subtemas que quieres cubrir en la lección..." value={lessonPlanData.subtopics} onChange={e => handleLessonPlanInputChange('subtopics', e.target.value)} className="min-h-[100px]" />
                </div>

                {/* Additional Criteria */}
                <div className="space-y-2">
                  <Label htmlFor="additionalCriteria">Criterios Adicionales</Label>
                  <Textarea id="additionalCriteria" placeholder="Incluye cualquier información adicional: estilo de enseñanza, recursos disponibles, necesidades especiales, etc." value={lessonPlanData.additionalCriteria} onChange={e => handleLessonPlanInputChange('additionalCriteria', e.target.value)} className="min-h-[100px]" />
                </div>

                {/* Form Buttons */}
                <div className="flex gap-3 justify-center pt-4">
                  <Button onClick={handleGenerateLessonPlan} disabled={isLessonPlanLoading} className="bg-primary hover:bg-primary text-primary-foreground">
                    {isLessonPlanLoading ? 'Generando...' : '¡Generar Plan de Lección!'}
                  </Button>
                  <Button variant="outline" onClick={resetLessonPlanForm} disabled={isLessonPlanLoading}>
                    Cancelar
                  </Button>
                </div>
              </div> : <div className="space-y-4 py-4">
                {/* Preview Box */}
                <div className="border rounded-lg p-4 bg-muted max-h-[400px] overflow-y-auto">
                  <h3 className="font-semibold mb-3">Plan de Lección Generado:</h3>
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {lessonPlanResponse}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                  <Button onClick={() => setCurrentLessonPlanStep('form')} variant="outline" className="flex items-center gap-2">
                    <RotateCcw className="h-4 w-4" />
                    Do Over
                  </Button>
                  <Button onClick={handleCopyLessonPlanToClipboard} variant="outline" className="flex items-center gap-2">
                    <Copy className="h-4 w-4" />
                    Copy to Clipboard
                  </Button>
                  <Button onClick={handleCreateLessonPlanPDF} className="bg-primary hover:bg-primary text-primary-foreground flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Create PDF
                  </Button>
                </div>
              </div>}
          </DialogContent>
        </Dialog>

        {/* Evaluation Dialog */}
        <Dialog open={showEvaluationDialog} onOpenChange={resetEvaluationForm}>
          <DialogContent className="max-w-2xl mx-auto max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-center">
                {currentEvaluationStep === 'form' ? 'Genera: Evaluación' : 'Vista Previa de la Evaluación'}
              </DialogTitle>
            </DialogHeader>
            
            {currentEvaluationStep === 'form' ? <div className="space-y-4 py-4">
                {/* Subject */}
                <div className="space-y-2">
                  <Label htmlFor="subject">Materia *</Label>
                  <Input id="subject" placeholder="Ej: Matemáticas, Ciencias, Historia, etc." value={evaluationData.subject} onChange={e => handleEvaluationInputChange('subject', e.target.value)} />
                </div>

                {/* Grade */}
                <div className="space-y-2">
                  <Label htmlFor="grade">Grado *</Label>
                  <Select value={evaluationData.grade} onValueChange={value => handleEvaluationInputChange('grade', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un grado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Kinder">Kinder</SelectItem>
                      <SelectItem value="1er Grado">1er Grado</SelectItem>
                      <SelectItem value="2do Grado">2do Grado</SelectItem>
                      <SelectItem value="3er Grado">3er Grado</SelectItem>
                      <SelectItem value="4to Grado">4to Grado</SelectItem>
                      <SelectItem value="5to Grado">5to Grado</SelectItem>
                      <SelectItem value="6to Grado">6to Grado</SelectItem>
                      <SelectItem value="7mo Grado">7mo Grado</SelectItem>
                      <SelectItem value="8vo Grado">8vo Grado</SelectItem>
                      <SelectItem value="9no Grado">9no Grado</SelectItem>
                      <SelectItem value="10mo Grado">10mo Grado</SelectItem>
                      <SelectItem value="11vo Grado">11vo Grado</SelectItem>
                      <SelectItem value="12vo Grado">12vo Grado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Topic */}
                <div className="space-y-2">
                  <Label htmlFor="topic">Tema Principal *</Label>
                  <Input id="topic" placeholder="Ej: La fotosíntesis, Ecuaciones cuadráticas, Revolución Francesa, etc." value={evaluationData.topic} onChange={e => handleEvaluationInputChange('topic', e.target.value)} />
                </div>

                {/* Number of Questions */}
                <div className="space-y-2">
                  <Label htmlFor="numberOfQuestions">Número de Preguntas</Label>
                  <Select value={evaluationData.numberOfQuestions} onValueChange={value => handleEvaluationInputChange('numberOfQuestions', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona número de preguntas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 preguntas</SelectItem>
                      <SelectItem value="10">10 preguntas</SelectItem>
                      <SelectItem value="15">15 preguntas</SelectItem>
                      <SelectItem value="20">20 preguntas</SelectItem>
                      <SelectItem value="25">25 preguntas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Difficulty */}
                <div className="space-y-2">
                  <Label htmlFor="difficulty">Nivel de Dificultad</Label>
                  <Select value={evaluationData.difficulty} onValueChange={value => handleEvaluationInputChange('difficulty', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona nivel de dificultad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="básico">Básico</SelectItem>
                      <SelectItem value="intermedio">Intermedio</SelectItem>
                      <SelectItem value="avanzado">Avanzado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Additional Instructions */}
                <div className="space-y-2">
                  <Label htmlFor="additionalInstructions">Instrucciones Adicionales</Label>
                  <Textarea id="additionalInstructions" placeholder="Incluye cualquier instrucción específica, formato especial, o criterios adicionales..." value={evaluationData.additionalInstructions} onChange={e => handleEvaluationInputChange('additionalInstructions', e.target.value)} className="min-h-[100px]" />
                </div>

                {/* Form Buttons */}
                <div className="flex gap-3 justify-center pt-4">
                  <Button onClick={handleGenerateEvaluation} disabled={isEvaluationLoading} className="bg-primary hover:bg-primary text-primary-foreground">
                    {isEvaluationLoading ? 'Generando...' : '¡Generar Evaluación!'}
                  </Button>
                  <Button variant="outline" onClick={resetEvaluationForm} disabled={isEvaluationLoading}>
                    Cancelar
                  </Button>
                </div>
              </div> : <div className="space-y-4 py-4">
                {/* Preview Box */}
                <div className="border rounded-lg p-4 bg-muted max-h-[400px] overflow-y-auto">
                  <h3 className="font-semibold mb-3">Evaluación Generada:</h3>
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {evaluationResponse}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                  <Button onClick={() => setCurrentEvaluationStep('form')} variant="outline" className="flex items-center gap-2">
                    <RotateCcw className="h-4 w-4" />
                    Do Over
                  </Button>
                  <Button onClick={handleCopyEvaluationToClipboard} variant="outline" className="flex items-center gap-2">
                    <Copy className="h-4 w-4" />
                    Copy to Clipboard
                  </Button>
                  <Button onClick={handleCreateEvaluationPDF} className="bg-primary hover:bg-primary text-primary-foreground flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Create PDF
                  </Button>
                </div>
              </div>}
          </DialogContent>
        </Dialog>

        {/* Worksheet Dialog */}
        <Dialog open={showWorksheetDialog} onOpenChange={resetWorksheetForm}>
          <DialogContent className="max-w-2xl mx-auto max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-center">
                {currentWorksheetStep === 'form' ? 'Genera: Hoja de Trabajo' : 'Vista Previa de la Hoja de Trabajo'}
              </DialogTitle>
            </DialogHeader>
            
            {currentWorksheetStep === 'form' ? <div className="space-y-4 py-4">
                {/* Subject */}
                <div className="space-y-2">
                  <Label htmlFor="worksheetSubject">Materia *</Label>
                  <Input id="worksheetSubject" placeholder="Ej: Matemáticas, Ciencias, Historia, etc." value={worksheetData.subject} onChange={e => handleWorksheetInputChange('subject', e.target.value)} />
                </div>

                {/* Grade */}
                <div className="space-y-2">
                  <Label htmlFor="worksheetGrade">Grado *</Label>
                  <Select value={worksheetData.grade} onValueChange={value => handleWorksheetInputChange('grade', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un grado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Kinder">Kinder</SelectItem>
                      <SelectItem value="1er Grado">1er Grado</SelectItem>
                      <SelectItem value="2do Grado">2do Grado</SelectItem>
                      <SelectItem value="3er Grado">3er Grado</SelectItem>
                      <SelectItem value="4to Grado">4to Grado</SelectItem>
                      <SelectItem value="5to Grado">5to Grado</SelectItem>
                      <SelectItem value="6to Grado">6to Grado</SelectItem>
                      <SelectItem value="7mo Grado">7mo Grado</SelectItem>
                      <SelectItem value="8vo Grado">8vo Grado</SelectItem>
                      <SelectItem value="9no Grado">9no Grado</SelectItem>
                      <SelectItem value="10mo Grado">10mo Grado</SelectItem>
                      <SelectItem value="11vo Grado">11vo Grado</SelectItem>
                      <SelectItem value="12vo Grado">12vo Grado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Topic */}
                <div className="space-y-2">
                  <Label htmlFor="worksheetTopic">Tema Principal *</Label>
                  <Input id="worksheetTopic" placeholder="Ej: La fotosíntesis, Ecuaciones cuadráticas, Revolución Francesa, etc." value={worksheetData.topic} onChange={e => handleWorksheetInputChange('topic', e.target.value)} />
                </div>

                {/* Worksheet Type */}
                <div className="space-y-2">
                  <Label htmlFor="worksheetType">Tipo de Hoja de Trabajo</Label>
                  <Select value={worksheetData.worksheetType} onValueChange={value => handleWorksheetInputChange('worksheetType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona tipo de hoja" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ejercicios">Ejercicios Prácticos</SelectItem>
                      <SelectItem value="problemas">Problemas de Aplicación</SelectItem>
                      <SelectItem value="actividades">Actividades Interactivas</SelectItem>
                      <SelectItem value="ejercicios_mixtos">Ejercicios Mixtos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Number of Exercises */}
                <div className="space-y-2">
                  <Label htmlFor="numberOfExercises">Número de Ejercicios</Label>
                  <Select value={worksheetData.numberOfExercises} onValueChange={value => handleWorksheetInputChange('numberOfExercises', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona número de ejercicios" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 ejercicios</SelectItem>
                      <SelectItem value="10">10 ejercicios</SelectItem>
                      <SelectItem value="15">15 ejercicios</SelectItem>
                      <SelectItem value="20">20 ejercicios</SelectItem>
                      <SelectItem value="25">25 ejercicios</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Difficulty */}
                <div className="space-y-2">
                  <Label htmlFor="worksheetDifficulty">Nivel de Dificultad</Label>
                  <Select value={worksheetData.difficulty} onValueChange={value => handleWorksheetInputChange('difficulty', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona nivel de dificultad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="básico">Básico</SelectItem>
                      <SelectItem value="intermedio">Intermedio</SelectItem>
                      <SelectItem value="avanzado">Avanzado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Additional Instructions */}
                <div className="space-y-2">
                  <Label htmlFor="worksheetAdditionalInstructions">Instrucciones Adicionales</Label>
                  <Textarea id="worksheetAdditionalInstructions" placeholder="Incluye cualquier instrucción específica, formato especial, o criterios adicionales..." value={worksheetData.additionalInstructions} onChange={e => handleWorksheetInputChange('additionalInstructions', e.target.value)} className="min-h-[100px]" />
                </div>

                {/* Form Buttons */}
                <div className="flex gap-3 justify-center pt-4">
                  <Button onClick={handleGenerateWorksheet} disabled={isWorksheetLoading} className="bg-primary hover:bg-primary text-primary-foreground">
                    {isWorksheetLoading ? 'Generando...' : '¡Generar Hoja de Trabajo!'}
                  </Button>
                  <Button variant="outline" onClick={resetWorksheetForm} disabled={isWorksheetLoading}>
                    Cancelar
                  </Button>
                </div>
              </div> : <div className="space-y-4 py-4">
                {/* Preview Box */}
                <div className="border rounded-lg p-4 bg-muted max-h-[400px] overflow-y-auto">
                  <h3 className="font-semibold mb-3">Hoja de Trabajo Generada:</h3>
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {worksheetResponse}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                  <Button onClick={() => setCurrentWorksheetStep('form')} variant="outline" className="flex items-center gap-2">
                    <RotateCcw className="h-4 w-4" />
                    Do Over
                  </Button>
                  <Button onClick={handleCopyWorksheetToClipboard} variant="outline" className="flex items-center gap-2">
                    <Copy className="h-4 w-4" />
                    Copy to Clipboard
                  </Button>
                  <Button onClick={handleCreateWorksheetPDF} className="bg-primary hover:bg-primary text-primary-foreground flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Create PDF
                  </Button>
                </div>
              </div>}
          </DialogContent>
        </Dialog>

        {/* Presentation Dialog */}
        <Dialog open={showPresentationDialog} onOpenChange={resetPresentationForm}>
          <DialogContent className="max-w-2xl mx-auto max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-center">
                {currentPresentationStep === 'form' ? 'Genera: Presentación Educativa' : 'Vista Previa de la Presentación'}
              </DialogTitle>
            </DialogHeader>
            
            {currentPresentationStep === 'form' ? <div className="space-y-4 py-4">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="presentationTitle">Título de la Presentación *</Label>
                  <Input id="presentationTitle" placeholder="Ej: La Fotosíntesis, Historia de México, etc." value={presentationData.title} onChange={e => handlePresentationInputChange('title', e.target.value)} />
                </div>

                {/* Subject */}
                <div className="space-y-2">
                  <Label htmlFor="presentationSubject">Materia *</Label>
                  <Input id="presentationSubject" placeholder="Ej: Ciencias, Historia, Matemáticas, etc." value={presentationData.subject} onChange={e => handlePresentationInputChange('subject', e.target.value)} />
                </div>

                {/* Grade */}
                <div className="space-y-2">
                  <Label htmlFor="presentationGrade">Grado *</Label>
                  <Select value={presentationData.grade} onValueChange={value => handlePresentationInputChange('grade', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un grado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Kinder">Kinder</SelectItem>
                      <SelectItem value="1er Grado">1er Grado</SelectItem>
                      <SelectItem value="2do Grado">2do Grado</SelectItem>
                      <SelectItem value="3er Grado">3er Grado</SelectItem>
                      <SelectItem value="4to Grado">4to Grado</SelectItem>
                      <SelectItem value="5to Grado">5to Grado</SelectItem>
                      <SelectItem value="6to Grado">6to Grado</SelectItem>
                      <SelectItem value="7mo Grado">7mo Grado</SelectItem>
                      <SelectItem value="8vo Grado">8vo Grado</SelectItem>
                      <SelectItem value="9no Grado">9no Grado</SelectItem>
                      <SelectItem value="10mo Grado">10mo Grado</SelectItem>
                      <SelectItem value="11vo Grado">11vo Grado</SelectItem>
                      <SelectItem value="12vo Grado">12vo Grado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Topic */}
                <div className="space-y-2">
                  <Label htmlFor="presentationTopic">Tema Principal *</Label>
                  <Input id="presentationTopic" placeholder="Ej: La fotosíntesis, Revolución Mexicana, Ecuaciones cuadráticas, etc." value={presentationData.topic} onChange={e => handlePresentationInputChange('topic', e.target.value)} />
                </div>

                {/* Presentation Type */}
                <div className="space-y-2">
                  <Label htmlFor="presentationType">Tipo de Presentación</Label>
                  <Select value={presentationData.presentationType} onValueChange={value => handlePresentationInputChange('presentationType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona tipo de presentación" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="educativa">Educativa</SelectItem>
                      <SelectItem value="expositiva">Expositiva</SelectItem>
                      <SelectItem value="interactiva">Interactiva</SelectItem>
                      <SelectItem value="tutorial">Tutorial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Number of Slides */}
                <div className="space-y-2">
                  <Label htmlFor="numberOfSlides">Número de Diapositivas</Label>
                  <Select value={presentationData.numberOfSlides} onValueChange={value => handlePresentationInputChange('numberOfSlides', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona número de diapositivas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 diapositivas</SelectItem>
                      <SelectItem value="10">10 diapositivas</SelectItem>
                      <SelectItem value="15">15 diapositivas</SelectItem>
                      <SelectItem value="20">20 diapositivas</SelectItem>
                      <SelectItem value="25">25 diapositivas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Content Type */}
                <div className="space-y-2">
                  <Label htmlFor="contentType">Tipo de Contenido</Label>
                  <Select value={presentationData.contentType} onValueChange={value => handlePresentationInputChange('contentType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona tipo de contenido" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="texto">Texto/Información</SelectItem>
                      <SelectItem value="youtube">Video de YouTube</SelectItem>
                      <SelectItem value="tema">Solo tema</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Content Input - Conditional based on contentType */}
                {presentationData.contentType === 'texto' && (
                  <div className="space-y-2">
                    <Label htmlFor="contentInput">Contenido o Información *</Label>
                    <Textarea id="contentInput" placeholder="Proporciona el texto, información o contenido que quieres incluir en la presentación..." value={presentationData.contentInput} onChange={e => handlePresentationInputChange('contentInput', e.target.value)} className="min-h-[100px]" />
                  </div>
                )}

                {presentationData.contentType === 'youtube' && (
                  <div className="space-y-2">
                    <Label htmlFor="youtubeUrl">URL del Video de YouTube *</Label>
                    <Input id="youtubeUrl" placeholder="https://www.youtube.com/watch?v=..." value={presentationData.youtubeUrl} onChange={e => handlePresentationInputChange('youtubeUrl', e.target.value)} />
                  </div>
                )}

                {/* Additional Instructions */}
                <div className="space-y-2">
                  <Label htmlFor="presentationAdditionalInstructions">Instrucciones Adicionales</Label>
                  <Textarea id="presentationAdditionalInstructions" placeholder="Incluye cualquier instrucción específica, formato especial, o criterios adicionales..." value={presentationData.additionalInstructions} onChange={e => handlePresentationInputChange('additionalInstructions', e.target.value)} className="min-h-[100px]" />
                </div>

                {/* Form Buttons */}
                <div className="flex gap-3 justify-center pt-4">
                  <Button onClick={handleGeneratePresentation} disabled={isPresentationLoading} className="bg-primary hover:bg-primary text-primary-foreground">
                    {isPresentationLoading ? 'Generando...' : '¡Generar Presentación!'}
                  </Button>
                  <Button variant="outline" onClick={resetPresentationForm} disabled={isPresentationLoading}>
                    Cancelar
                  </Button>
                </div>
              </div> : <div className="space-y-4 py-4">
                {/* Preview Box */}
                <div className="border rounded-lg p-4 bg-muted max-h-[400px] overflow-y-auto">
                  <h3 className="font-semibold mb-3">Presentación Generada:</h3>
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {presentationResponse}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                  <Button onClick={() => setCurrentPresentationStep('form')} variant="outline" className="flex items-center gap-2">
                    <RotateCcw className="h-4 w-4" />
                    Do Over
                  </Button>
                  <Button onClick={handleCopyPresentationToClipboard} variant="outline" className="flex items-center gap-2">
                    <Copy className="h-4 w-4" />
                    Copy to Clipboard
                  </Button>
                  <Button onClick={handleCreatePresentationPDF} variant="outline" className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Create PDF
                  </Button>
                  <Button onClick={handleExportToPowerPoint} className="bg-primary hover:bg-primary text-primary-foreground flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Export as HTML Presentation
                  </Button>
                </div>
              </div>}
          </DialogContent>
        </Dialog>

        {/* Academic Content Dialog */}
        <Dialog open={showAcademicContentDialog} onOpenChange={resetAcademicContentForm}>
          <DialogContent className="max-w-2xl mx-auto max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-center">
                {currentAcademicContentStep === 'form' ? 'Genera: Contenido Académico' : 'Vista Previa del Contenido Académico'}
              </DialogTitle>
            </DialogHeader>
            
            {currentAcademicContentStep === 'form' ? <div className="space-y-4 py-4">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="academicTitle">Título del Contenido *</Label>
                  <Input id="academicTitle" placeholder="Ej: La Fotosíntesis en las Plantas, Historia de la Revolución Mexicana, etc." value={academicContentData.title} onChange={e => handleAcademicContentInputChange('title', e.target.value)} />
                </div>

                {/* Subject */}
                <div className="space-y-2">
                  <Label htmlFor="academicSubject">Materia *</Label>
                  <Input id="academicSubject" placeholder="Ej: Ciencias, Historia, Matemáticas, etc." value={academicContentData.subject} onChange={e => handleAcademicContentInputChange('subject', e.target.value)} />
                </div>

                {/* Grade */}
                <div className="space-y-2">
                  <Label htmlFor="academicGrade">Grado *</Label>
                  <Select value={academicContentData.grade} onValueChange={value => handleAcademicContentInputChange('grade', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un grado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Kinder">Kinder</SelectItem>
                      <SelectItem value="1er Grado">1er Grado</SelectItem>
                      <SelectItem value="2do Grado">2do Grado</SelectItem>
                      <SelectItem value="3er Grado">3er Grado</SelectItem>
                      <SelectItem value="4to Grado">4to Grado</SelectItem>
                      <SelectItem value="5to Grado">5to Grado</SelectItem>
                      <SelectItem value="6to Grado">6to Grado</SelectItem>
                      <SelectItem value="7mo Grado">7mo Grado</SelectItem>
                      <SelectItem value="8vo Grado">8vo Grado</SelectItem>
                      <SelectItem value="9no Grado">9no Grado</SelectItem>
                      <SelectItem value="10mo Grado">10mo Grado</SelectItem>
                      <SelectItem value="11vo Grado">11vo Grado</SelectItem>
                      <SelectItem value="12vo Grado">12vo Grado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Topic */}
                <div className="space-y-2">
                  <Label htmlFor="academicTopic">Tema Principal *</Label>
                  <Input id="academicTopic" placeholder="Ej: La fotosíntesis, Revolución Mexicana, Ecuaciones cuadráticas, etc." value={academicContentData.topic} onChange={e => handleAcademicContentInputChange('topic', e.target.value)} />
                </div>

                {/* Content Type */}
                <div className="space-y-2">
                  <Label htmlFor="academicContentType">Tipo de Contenido</Label>
                  <Select value={academicContentData.contentType} onValueChange={value => handleAcademicContentInputChange('contentType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona tipo de contenido" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="articulo">Artículo Académico</SelectItem>
                      <SelectItem value="ensayo">Ensayo</SelectItem>
                      <SelectItem value="resumen">Resumen Ejecutivo</SelectItem>
                      <SelectItem value="guia">Guía de Estudio</SelectItem>
                      <SelectItem value="tutorial">Tutorial</SelectItem>
                      <SelectItem value="investigacion">Informe de Investigación</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Academic Level */}
                <div className="space-y-2">
                  <Label htmlFor="academicLevel">Nivel Académico</Label>
                  <Select value={academicContentData.academicLevel} onValueChange={value => handleAcademicContentInputChange('academicLevel', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona nivel académico" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basico">Básico</SelectItem>
                      <SelectItem value="intermedio">Intermedio</SelectItem>
                      <SelectItem value="avanzado">Avanzado</SelectItem>
                      <SelectItem value="universitario">Universitario</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Length */}
                <div className="space-y-2">
                  <Label htmlFor="academicLength">Longitud del Contenido</Label>
                  <Select value={academicContentData.length} onValueChange={value => handleAcademicContentInputChange('length', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona longitud" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="corto">Corto (1-2 páginas)</SelectItem>
                      <SelectItem value="medio">Medio (3-5 páginas)</SelectItem>
                      <SelectItem value="largo">Largo (6-10 páginas)</SelectItem>
                      <SelectItem value="extenso">Extenso (10+ páginas)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Format */}
                <div className="space-y-2">
                  <Label htmlFor="academicFormat">Formato</Label>
                  <Select value={academicContentData.format} onValueChange={value => handleAcademicContentInputChange('format', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona formato" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="texto">Texto</SelectItem>
                      <SelectItem value="estructurado">Estructurado con secciones</SelectItem>
                      <SelectItem value="interactivo">Interactivo</SelectItem>
                      <SelectItem value="multimedia">Multimedia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Learning Objectives */}
                <div className="space-y-2">
                  <Label htmlFor="learningObjectives">Objetivos de Aprendizaje</Label>
                  <Textarea id="learningObjectives" placeholder="Describe los objetivos específicos que debe cumplir este contenido..." value={academicContentData.learningObjectives} onChange={e => handleAcademicContentInputChange('learningObjectives', e.target.value)} className="min-h-[80px]" />
                </div>

                {/* Key Concepts */}
                <div className="space-y-2">
                  <Label htmlFor="keyConcepts">Conceptos Clave</Label>
                  <Textarea id="keyConcepts" placeholder="Lista los conceptos principales que debe cubrir el contenido..." value={academicContentData.keyConcepts} onChange={e => handleAcademicContentInputChange('keyConcepts', e.target.value)} className="min-h-[80px]" />
                </div>

                {/* Assessment Criteria */}
                <div className="space-y-2">
                  <Label htmlFor="assessmentCriteria">Criterios de Evaluación</Label>
                  <Textarea id="assessmentCriteria" placeholder="Describe cómo se evaluará el aprendizaje de este contenido..." value={academicContentData.assessmentCriteria} onChange={e => handleAcademicContentInputChange('assessmentCriteria', e.target.value)} className="min-h-[80px]" />
                </div>

                {/* Additional Instructions */}
                <div className="space-y-2">
                  <Label htmlFor="academicAdditionalInstructions">Instrucciones Adicionales</Label>
                  <Textarea id="academicAdditionalInstructions" placeholder="Incluye cualquier instrucción específica, estilo de escritura, o criterios adicionales..." value={academicContentData.additionalInstructions} onChange={e => handleAcademicContentInputChange('additionalInstructions', e.target.value)} className="min-h-[100px]" />
                </div>

                {/* Form Buttons */}
                <div className="flex gap-3 justify-center pt-4">
                  <Button onClick={handleGenerateAcademicContent} disabled={isAcademicContentLoading} className="bg-primary hover:bg-primary text-primary-foreground">
                    {isAcademicContentLoading ? 'Generando...' : '¡Generar Contenido Académico!'}
                  </Button>
                  <Button variant="outline" onClick={resetAcademicContentForm} disabled={isAcademicContentLoading}>
                    Cancelar
                  </Button>
                </div>
              </div> : <div className="space-y-4 py-4">
                {/* Preview Box */}
                <div className="border rounded-lg p-4 bg-muted max-h-[400px] overflow-y-auto">
                  <h3 className="font-semibold mb-3">Contenido Académico Generado:</h3>
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {academicContentResponse}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                  <Button onClick={() => setCurrentAcademicContentStep('form')} variant="outline" className="flex items-center gap-2">
                    <RotateCcw className="h-4 w-4" />
                    Do Over
                  </Button>
                  <Button onClick={handleCopyAcademicContentToClipboard} variant="outline" className="flex items-center gap-2">
                    <Copy className="h-4 w-4" />
                    Copy to Clipboard
                  </Button>
                  <Button onClick={handleCreateAcademicContentPDF} className="bg-primary hover:bg-primary text-primary-foreground flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Create PDF
                  </Button>
                </div>
              </div>}
          </DialogContent>
        </Dialog>

        {/* Professional Email Dialog */}
        <Dialog open={showEmailDialog} onOpenChange={resetEmailForm}>
          <DialogContent className="max-w-2xl mx-auto max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-center">
                {currentEmailStep === 'form' ? 'Genera: Correo Profesional' : 'Vista Previa del Correo Profesional'}
              </DialogTitle>
            </DialogHeader>
            
            {currentEmailStep === 'form' ? <div className="space-y-4 py-4">
                {/* Sender Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">Información del Remitente</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="senderName">Nombre del Remitente *</Label>
                      <Input id="senderName" placeholder="Ej: María González" value={emailData.senderName} onChange={e => handleEmailInputChange('senderName', e.target.value)} />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="senderTitle">Cargo/Título</Label>
                      <Input id="senderTitle" placeholder="Ej: Directora de Primaria" value={emailData.senderTitle} onChange={e => handleEmailInputChange('senderTitle', e.target.value)} />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="senderEmail">Correo Electrónico</Label>
                    <Input id="senderEmail" type="email" placeholder="Ej: maria.gonzalez@escuela.edu" value={emailData.senderEmail} onChange={e => handleEmailInputChange('senderEmail', e.target.value)} />
                  </div>
                </div>

                {/* Recipient Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">Información del Destinatario</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="recipientName">Nombre del Destinatario *</Label>
                      <Input id="recipientName" placeholder="Ej: Juan Pérez" value={emailData.recipientName} onChange={e => handleEmailInputChange('recipientName', e.target.value)} />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="recipientTitle">Cargo/Título</Label>
                      <Input id="recipientTitle" placeholder="Ej: Coordinador Académico" value={emailData.recipientTitle} onChange={e => handleEmailInputChange('recipientTitle', e.target.value)} />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="recipientEmail">Correo Electrónico</Label>
                    <Input id="recipientEmail" type="email" placeholder="Ej: juan.perez@escuela.edu" value={emailData.recipientEmail} onChange={e => handleEmailInputChange('recipientEmail', e.target.value)} />
                  </div>
                </div>

                {/* Email Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">Detalles del Correo</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="emailSubject">Asunto *</Label>
                    <Input id="emailSubject" placeholder="Ej: Reunión de padres de familia - 15 de marzo" value={emailData.subject} onChange={e => handleEmailInputChange('subject', e.target.value)} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="emailType">Tipo de Correo</Label>
                      <Select value={emailData.emailType} onValueChange={value => handleEmailInputChange('emailType', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona tipo de correo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="formal">Formal</SelectItem>
                          <SelectItem value="informal">Informal</SelectItem>
                          <SelectItem value="solicitud">Solicitud</SelectItem>
                          <SelectItem value="informacion">Información</SelectItem>
                          <SelectItem value="recordatorio">Recordatorio</SelectItem>
                          <SelectItem value="invitacion">Invitación</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="emailTone">Tono</Label>
                      <Select value={emailData.tone} onValueChange={value => handleEmailInputChange('tone', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona tono" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="profesional">Profesional</SelectItem>
                          <SelectItem value="cordial">Cordial</SelectItem>
                          <SelectItem value="formal">Formal</SelectItem>
                          <SelectItem value="amigable">Amigable</SelectItem>
                          <SelectItem value="urgente">Urgente</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="emailPurpose">Propósito</Label>
                      <Select value={emailData.purpose} onValueChange={value => handleEmailInputChange('purpose', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona propósito" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="informacion">Información</SelectItem>
                          <SelectItem value="solicitud">Solicitud</SelectItem>
                          <SelectItem value="coordinacion">Coordinación</SelectItem>
                          <SelectItem value="seguimiento">Seguimiento</SelectItem>
                          <SelectItem value="invitacion">Invitación</SelectItem>
                          <SelectItem value="recordatorio">Recordatorio</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="emailUrgency">Urgencia</Label>
                      <Select value={emailData.urgency} onValueChange={value => handleEmailInputChange('urgency', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona urgencia" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="baja">Baja</SelectItem>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="alta">Alta</SelectItem>
                          <SelectItem value="urgente">Urgente</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Message Content */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">Contenido del Mensaje</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="mainMessage">Mensaje Principal *</Label>
                    <Textarea id="mainMessage" placeholder="Describe el contenido principal del correo..." value={emailData.mainMessage} onChange={e => handleEmailInputChange('mainMessage', e.target.value)} className="min-h-[100px]" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="additionalPoints">Puntos Adicionales</Label>
                    <Textarea id="additionalPoints" placeholder="Incluye puntos adicionales, detalles específicos, o información complementaria..." value={emailData.additionalPoints} onChange={e => handleEmailInputChange('additionalPoints', e.target.value)} className="min-h-[80px]" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="closingType">Tipo de Despedida</Label>
                    <Select value={emailData.closingType} onValueChange={value => handleEmailInputChange('closingType', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona tipo de despedida" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="formal">Formal (Atentamente)</SelectItem>
                        <SelectItem value="cordial">Cordial (Cordialmente)</SelectItem>
                        <SelectItem value="amigable">Amigable (Saludos cordiales)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emailAdditionalInstructions">Instrucciones Adicionales</Label>
                    <Textarea id="emailAdditionalInstructions" placeholder="Incluye cualquier instrucción específica, estilo de escritura, o criterios adicionales..." value={emailData.additionalInstructions} onChange={e => handleEmailInputChange('additionalInstructions', e.target.value)} className="min-h-[80px]" />
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="flex gap-3 justify-center pt-4">
                  <Button onClick={handleGenerateEmail} disabled={isEmailLoading} className="bg-primary hover:bg-primary text-primary-foreground">
                    {isEmailLoading ? 'Generando...' : '¡Generar Correo Profesional!'}
                  </Button>
                  <Button variant="outline" onClick={resetEmailForm} disabled={isEmailLoading}>
                    Cancelar
                  </Button>
                </div>
              </div> : <div className="space-y-4 py-4">
                {/* Preview Box */}
                <div className="border rounded-lg p-4 bg-muted max-h-[400px] overflow-y-auto">
                  <h3 className="font-semibold mb-3">Correo Profesional Generado:</h3>
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {emailResponse}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                  <Button onClick={() => setCurrentEmailStep('form')} variant="outline" className="flex items-center gap-2">
                    <RotateCcw className="h-4 w-4" />
                    Do Over
                  </Button>
                  <Button onClick={handleCopyEmailToClipboard} variant="outline" className="flex items-center gap-2">
                    <Copy className="h-4 w-4" />
                    Copy to Clipboard
                  </Button>
                  <Button onClick={handleCreateEmailPDF} className="bg-primary hover:bg-primary text-primary-foreground flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Create PDF
                  </Button>
                </div>
              </div>}
          </DialogContent>
        </Dialog>

        {/* Rubric Generator Dialog */}
        <Dialog open={showRubricDialog} onOpenChange={resetRubricForm}>
          <DialogContent className="max-w-4xl mx-auto max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-center">
                {currentRubricStep === 'form' ? 'Genera: Rúbrica de Evaluación' : 'Vista Previa de la Rúbrica'}
              </DialogTitle>
            </DialogHeader>
            
            {currentRubricStep === 'form' ? <div className="space-y-6 py-4">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">Información Básica</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="assignmentName">Nombre de la Asignación *</Label>
                      <Input id="assignmentName" placeholder="Ej: Proyecto de Ciencias, Ensayo de Historia, etc." value={rubricData.assignmentName} onChange={e => handleRubricInputChange('assignmentName', e.target.value)} />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="rubricSubject">Materia *</Label>
                      <Input id="rubricSubject" placeholder="Ej: Ciencias, Historia, Matemáticas, etc." value={rubricData.subject} onChange={e => handleRubricInputChange('subject', e.target.value)} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rubricGrade">Grado *</Label>
                    <Select value={rubricData.grade} onValueChange={value => handleRubricInputChange('grade', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un grado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Kinder">Kinder</SelectItem>
                        <SelectItem value="1er Grado">1er Grado</SelectItem>
                        <SelectItem value="2do Grado">2do Grado</SelectItem>
                        <SelectItem value="3er Grado">3er Grado</SelectItem>
                        <SelectItem value="4to Grado">4to Grado</SelectItem>
                        <SelectItem value="5to Grado">5to Grado</SelectItem>
                        <SelectItem value="6to Grado">6to Grado</SelectItem>
                        <SelectItem value="7mo Grado">7mo Grado</SelectItem>
                        <SelectItem value="8vo Grado">8vo Grado</SelectItem>
                        <SelectItem value="9no Grado">9no Grado</SelectItem>
                        <SelectItem value="10mo Grado">10mo Grado</SelectItem>
                        <SelectItem value="11vo Grado">11vo Grado</SelectItem>
                        <SelectItem value="12vo Grado">12vo Grado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Rubric Configuration */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">Configuración de la Rúbrica</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="assignmentType">Tipo de Asignación</Label>
                      <Select value={rubricData.assignmentType} onValueChange={value => handleRubricInputChange('assignmentType', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona tipo de asignación" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="proyecto">Proyecto</SelectItem>
                          <SelectItem value="ensayo">Ensayo</SelectItem>
                          <SelectItem value="presentacion">Presentación</SelectItem>
                          <SelectItem value="examen">Examen</SelectItem>
                          <SelectItem value="tarea">Tarea</SelectItem>
                          <SelectItem value="investigacion">Investigación</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="rubricType">Tipo de Rúbrica</Label>
                      <Select value={rubricData.rubricType} onValueChange={value => handleRubricInputChange('rubricType', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona tipo de rúbrica" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="analitica">Analítica</SelectItem>
                          <SelectItem value="holistica">Holística</SelectItem>
                          <SelectItem value="desarrollo">Desarrollo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="criteriaCount">Número de Criterios</Label>
                      <Select value={rubricData.criteriaCount} onValueChange={value => handleRubricInputChange('criteriaCount', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona número de criterios" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3">3 Criterios</SelectItem>
                          <SelectItem value="4">4 Criterios</SelectItem>
                          <SelectItem value="5">5 Criterios</SelectItem>
                          <SelectItem value="6">6 Criterios</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="performanceLevels">Niveles de Desempeño</Label>
                      <Select value={rubricData.performanceLevels} onValueChange={value => handleRubricInputChange('performanceLevels', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona niveles" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3">3 Niveles</SelectItem>
                          <SelectItem value="4">4 Niveles</SelectItem>
                          <SelectItem value="5">5 Niveles</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="scaleType">Tipo de Escala</Label>
                      <Select value={rubricData.scaleType} onValueChange={value => handleRubricInputChange('scaleType', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona tipo de escala" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="numerica">Numérica</SelectItem>
                          <SelectItem value="letras">Letras (A, B, C, D)</SelectItem>
                          <SelectItem value="descriptiva">Descriptiva</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="totalPoints">Puntos Totales</Label>
                    <Input id="totalPoints" type="number" placeholder="100" value={rubricData.totalPoints} onChange={e => handleRubricInputChange('totalPoints', e.target.value)} />
                  </div>
                </div>

                {/* Criteria Definition */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-800">Criterios de Evaluación</h3>
                    <Button type="button" onClick={addCriterion} variant="outline" size="sm">
                      + Agregar Criterio
                    </Button>
                  </div>
                  
                  {rubricData.criteria.map((criterion, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">Criterio {index + 1}</h4>
                        {rubricData.criteria.length > 1 && (
                          <Button type="button" onClick={() => removeCriterion(index)} variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                            Eliminar
                          </Button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor={`criterionName${index}`}>Nombre del Criterio</Label>
                          <Input 
                            id={`criterionName${index}`}
                            placeholder="Ej: Contenido, Presentación, Creatividad"
                            value={criterion.name}
                            onChange={e => handleCriteriaChange(index, 'name', e.target.value)}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor={`criterionWeight${index}`}>Peso (%)</Label>
                          <Input 
                            id={`criterionWeight${index}`}
                            type="number"
                            placeholder="25"
                            value={criterion.weight}
                            onChange={e => handleCriteriaChange(index, 'weight', e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor={`criterionDescription${index}`}>Descripción del Criterio</Label>
                        <Textarea 
                          id={`criterionDescription${index}`}
                          placeholder="Describe qué evalúa este criterio..."
                          value={criterion.description}
                          onChange={e => handleCriteriaChange(index, 'description', e.target.value)}
                          className="min-h-[80px]"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Additional Instructions */}
                <div className="space-y-2">
                  <Label htmlFor="rubricAdditionalInstructions">Instrucciones Adicionales</Label>
                  <Textarea id="rubricAdditionalInstructions" placeholder="Incluye cualquier instrucción específica, estándares especiales, o criterios adicionales para la rúbrica..." value={rubricData.additionalInstructions} onChange={e => handleRubricInputChange('additionalInstructions', e.target.value)} className="min-h-[100px]" />
                </div>

                {/* Form Buttons */}
                <div className="flex gap-3 justify-center pt-4">
                  <Button onClick={handleGenerateRubric} disabled={isRubricLoading} className="bg-primary hover:bg-primary text-primary-foreground">
                    {isRubricLoading ? 'Generando...' : '¡Generar Rúbrica!'}
                  </Button>
                  <Button variant="outline" onClick={resetRubricForm} disabled={isRubricLoading}>
                    Cancelar
                  </Button>
                </div>
              </div> : <div className="space-y-4 py-4">
                {/* Preview Box */}
                <div className="border rounded-lg p-4 bg-muted max-h-[400px] overflow-y-auto">
                  <h3 className="font-semibold mb-3">Rúbrica Generada:</h3>
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {rubricResponse}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                  <Button onClick={() => setCurrentRubricStep('form')} variant="outline" className="flex items-center gap-2">
                    <RotateCcw className="h-4 w-4" />
                    Do Over
                  </Button>
                  <Button onClick={handleCopyRubricToClipboard} variant="outline" className="flex items-center gap-2">
                    <Copy className="h-4 w-4" />
                    Copy to Clipboard
                  </Button>
                  <Button onClick={handleCreateRubricPDF} className="bg-primary hover:bg-primary text-primary-foreground flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Create PDF
                  </Button>
                </div>
              </div>}
          </DialogContent>
        </Dialog>

        {/* Writing Feedback Dialog */}
        <Dialog open={showWritingFeedbackDialog} onOpenChange={resetWritingFeedbackForm}>
          <DialogContent className="max-w-4xl mx-auto max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-center">
                {currentWritingFeedbackStep === 'form' ? 'Genera: Retroalimentación de Escritura' : 'Vista Previa de la Retroalimentación'}
              </DialogTitle>
            </DialogHeader>
            
            {currentWritingFeedbackStep === 'form' ? <div className="space-y-6 py-4">
                {/* Student Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">Información del Estudiante</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="studentName">Nombre del Estudiante *</Label>
                      <Input id="studentName" placeholder="Ej: María González" value={writingFeedbackData.studentName} onChange={e => handleWritingFeedbackInputChange('studentName', e.target.value)} />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="writingGrade">Grado *</Label>
                      <Select value={writingFeedbackData.grade} onValueChange={value => handleWritingFeedbackInputChange('grade', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un grado" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Kinder">Kinder</SelectItem>
                          <SelectItem value="1er Grado">1er Grado</SelectItem>
                          <SelectItem value="2do Grado">2do Grado</SelectItem>
                          <SelectItem value="3er Grado">3er Grado</SelectItem>
                          <SelectItem value="4to Grado">4to Grado</SelectItem>
                          <SelectItem value="5to Grado">5to Grado</SelectItem>
                          <SelectItem value="6to Grado">6to Grado</SelectItem>
                          <SelectItem value="7mo Grado">7mo Grado</SelectItem>
                          <SelectItem value="8vo Grado">8vo Grado</SelectItem>
                          <SelectItem value="9no Grado">9no Grado</SelectItem>
                          <SelectItem value="10mo Grado">10mo Grado</SelectItem>
                          <SelectItem value="11vo Grado">11vo Grado</SelectItem>
                          <SelectItem value="12vo Grado">12vo Grado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="writingSubject">Materia</Label>
                    <Input id="writingSubject" placeholder="Ej: Lengua Española, Historia, Ciencias, etc." value={writingFeedbackData.subject} onChange={e => handleWritingFeedbackInputChange('subject', e.target.value)} />
                  </div>
                </div>

                {/* Writing Sample */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">Muestra de Escritura</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="assignmentType">Tipo de Asignación</Label>
                    <Select value={writingFeedbackData.assignmentType} onValueChange={value => handleWritingFeedbackInputChange('assignmentType', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona tipo de asignación" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ensayo">Ensayo</SelectItem>
                        <SelectItem value="cuento">Cuento</SelectItem>
                        <SelectItem value="poema">Poema</SelectItem>
                        <SelectItem value="reporte">Reporte</SelectItem>
                        <SelectItem value="carta">Carta</SelectItem>
                        <SelectItem value="articulo">Artículo</SelectItem>
                        <SelectItem value="resumen">Resumen</SelectItem>
                        <SelectItem value="reflexion">Reflexión</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="writingSample">Texto del Estudiante *</Label>
                    <Textarea id="writingSample" placeholder="Pega aquí el texto escrito por el estudiante que quieres evaluar..." value={writingFeedbackData.writingSample} onChange={e => handleWritingFeedbackInputChange('writingSample', e.target.value)} className="min-h-[200px]" />
                  </div>
                </div>

                {/* Feedback Configuration */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">Configuración de la Retroalimentación</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="feedbackType">Tipo de Retroalimentación</Label>
                      <Select value={writingFeedbackData.feedbackType} onValueChange={value => handleWritingFeedbackInputChange('feedbackType', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona tipo de retroalimentación" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="constructiva">Constructiva</SelectItem>
                          <SelectItem value="formativa">Formativa</SelectItem>
                          <SelectItem value="sumativa">Sumativa</SelectItem>
                          <SelectItem value="motivacional">Motivacional</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="feedbackTone">Tono</Label>
                      <Select value={writingFeedbackData.tone} onValueChange={value => handleWritingFeedbackInputChange('tone', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona tono" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="apoyador">Apoyador</SelectItem>
                          <SelectItem value="profesional">Profesional</SelectItem>
                          <SelectItem value="amigable">Amigable</SelectItem>
                          <SelectItem value="directo">Directo</SelectItem>
                          <SelectItem value="motivador">Motivador</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="feedbackLength">Longitud de la Retroalimentación</Label>
                    <Select value={writingFeedbackData.length} onValueChange={value => handleWritingFeedbackInputChange('length', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona longitud" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="breve">Breve</SelectItem>
                        <SelectItem value="moderada">Moderada</SelectItem>
                        <SelectItem value="detallada">Detallada</SelectItem>
                        <SelectItem value="extensa">Extensa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Focus Areas */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">Áreas de Enfoque</h3>
                  <p className="text-sm text-gray-600">Selecciona las áreas en las que quieres que se enfoque la retroalimentación:</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                      { value: 'contenido', label: 'Contenido' },
                      { value: 'organizacion', label: 'Organización' },
                      { value: 'gramatica', label: 'Gramática y Ortografía' },
                      { value: 'estilo', label: 'Estilo y Voz' },
                      { value: 'formato', label: 'Formato y Presentación' },
                      { value: 'creatividad', label: 'Creatividad' }
                    ].map((area) => (
                      <div key={area.value} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`focus-${area.value}`}
                          checked={writingFeedbackData.focusAreas.includes(area.value)}
                          onChange={(e) => handleFocusAreaChange(area.value, e.target.checked)}
                          className="rounded border-gray-300"
                        />
                        <Label htmlFor={`focus-${area.value}`} className="text-sm">
                          {area.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Rubric-based Feedback */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">Retroalimentación Basada en Rúbrica</h3>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="rubricBased"
                      checked={writingFeedbackData.rubricBased}
                      onChange={(e) => handleWritingFeedbackInputChange('rubricBased', e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="rubricBased">Usar criterios de rúbrica específicos</Label>
                  </div>

                  {writingFeedbackData.rubricBased && (
                    <div className="space-y-2">
                      <Label htmlFor="rubricCriteria">Criterios de Rúbrica</Label>
                      <Textarea id="rubricCriteria" placeholder="Pega aquí los criterios de la rúbrica que quieres aplicar..." value={writingFeedbackData.rubricCriteria} onChange={e => handleWritingFeedbackInputChange('rubricCriteria', e.target.value)} className="min-h-[100px]" />
                    </div>
                  )}
                </div>

                {/* Specific Instructions */}
                <div className="space-y-2">
                  <Label htmlFor="specificInstructions">Instrucciones Específicas</Label>
                  <Textarea id="specificInstructions" placeholder="Incluye instrucciones específicas sobre qué aspectos evaluar o cómo estructurar la retroalimentación..." value={writingFeedbackData.specificInstructions} onChange={e => handleWritingFeedbackInputChange('specificInstructions', e.target.value)} className="min-h-[80px]" />
                </div>

                {/* Additional Instructions */}
                <div className="space-y-2">
                  <Label htmlFor="writingAdditionalInstructions">Instrucciones Adicionales</Label>
                  <Textarea id="writingAdditionalInstructions" placeholder="Cualquier otra instrucción específica para la retroalimentación..." value={writingFeedbackData.additionalInstructions} onChange={e => handleWritingFeedbackInputChange('additionalInstructions', e.target.value)} className="min-h-[80px]" />
                </div>

                {/* Form Buttons */}
                <div className="flex gap-3 justify-center pt-4">
                  <Button onClick={handleGenerateWritingFeedback} disabled={isWritingFeedbackLoading} className="bg-primary hover:bg-primary text-primary-foreground">
                    {isWritingFeedbackLoading ? 'Generando...' : '¡Generar Retroalimentación!'}
                  </Button>
                  <Button variant="outline" onClick={resetWritingFeedbackForm} disabled={isWritingFeedbackLoading}>
                    Cancelar
                  </Button>
                </div>
              </div> : <div className="space-y-4 py-4">
                {/* Preview Box */}
                <div className="border rounded-lg p-4 bg-muted max-h-[400px] overflow-y-auto">
                  <h3 className="font-semibold mb-3">Retroalimentación Generada:</h3>
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {writingFeedbackResponse}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                  <Button onClick={() => setCurrentWritingFeedbackStep('form')} variant="outline" className="flex items-center gap-2">
                    <RotateCcw className="h-4 w-4" />
                    Do Over
                  </Button>
                  <Button onClick={handleCopyWritingFeedbackToClipboard} variant="outline" className="flex items-center gap-2">
                    <Copy className="h-4 w-4" />
                    Copy to Clipboard
                  </Button>
                  <Button onClick={handleCreateWritingFeedbackPDF} className="bg-primary hover:bg-primary text-primary-foreground flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Create PDF
                  </Button>
                </div>
              </div>}
          </DialogContent>
        </Dialog>

        {/* Informative Texts Dialog */}
        <Dialog open={showInformativeTextsDialog} onOpenChange={resetInformativeTextsForm}>
          <DialogContent className="max-w-4xl mx-auto max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-center">
                {currentInformativeTextsStep === 'form' ? 'Genera: Texto Informativo' : 'Vista Previa del Texto Informativo'}
              </DialogTitle>
            </DialogHeader>
            
            {currentInformativeTextsStep === 'form' ? <div className="space-y-6 py-4">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">Información Básica</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="informativeTitle">Título del Texto *</Label>
                    <Input id="informativeTitle" placeholder="Ej: La Fotosíntesis en las Plantas, El Sistema Solar, etc." value={informativeTextsData.title} onChange={e => handleInformativeTextsInputChange('title', e.target.value)} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="informativeSubject">Materia *</Label>
                      <Input id="informativeSubject" placeholder="Ej: Ciencias, Historia, Geografía, etc." value={informativeTextsData.subject} onChange={e => handleInformativeTextsInputChange('subject', e.target.value)} />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="informativeGrade">Grado *</Label>
                      <Select value={informativeTextsData.grade} onValueChange={value => handleInformativeTextsInputChange('grade', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un grado" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Kinder">Kinder</SelectItem>
                          <SelectItem value="1er Grado">1er Grado</SelectItem>
                          <SelectItem value="2do Grado">2do Grado</SelectItem>
                          <SelectItem value="3er Grado">3er Grado</SelectItem>
                          <SelectItem value="4to Grado">4to Grado</SelectItem>
                          <SelectItem value="5to Grado">5to Grado</SelectItem>
                          <SelectItem value="6to Grado">6to Grado</SelectItem>
                          <SelectItem value="7mo Grado">7mo Grado</SelectItem>
                          <SelectItem value="8vo Grado">8vo Grado</SelectItem>
                          <SelectItem value="9no Grado">9no Grado</SelectItem>
                          <SelectItem value="10mo Grado">10mo Grado</SelectItem>
                          <SelectItem value="11vo Grado">11vo Grado</SelectItem>
                          <SelectItem value="12vo Grado">12vo Grado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="informativeTopic">Tema Principal *</Label>
                    <Input id="informativeTopic" placeholder="Ej: La fotosíntesis, El sistema solar, La revolución francesa, etc." value={informativeTextsData.topic} onChange={e => handleInformativeTextsInputChange('topic', e.target.value)} />
                  </div>
                </div>

                {/* Text Configuration */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">Configuración del Texto</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="textType">Tipo de Texto</Label>
                      <Select value={informativeTextsData.textType} onValueChange={value => handleInformativeTextsInputChange('textType', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona tipo de texto" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="articulo">Artículo Informativo</SelectItem>
                          <SelectItem value="reportaje">Reportaje</SelectItem>
                          <SelectItem value="ensayo">Ensayo Expositivo</SelectItem>
                          <SelectItem value="monografia">Monografía</SelectItem>
                          <SelectItem value="resumen">Resumen Ejecutivo</SelectItem>
                          <SelectItem value="guia">Guía de Estudio</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="textLength">Longitud del Texto</Label>
                      <Select value={informativeTextsData.length} onValueChange={value => handleInformativeTextsInputChange('length', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona longitud" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="corto">Corto (1-2 páginas)</SelectItem>
                          <SelectItem value="medio">Medio (3-5 páginas)</SelectItem>
                          <SelectItem value="largo">Largo (6-10 páginas)</SelectItem>
                          <SelectItem value="extenso">Extenso (10+ páginas)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="textDifficulty">Dificultad</Label>
                      <Select value={informativeTextsData.difficulty} onValueChange={value => handleInformativeTextsInputChange('difficulty', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona dificultad" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="basico">Básico</SelectItem>
                          <SelectItem value="intermedio">Intermedio</SelectItem>
                          <SelectItem value="avanzado">Avanzado</SelectItem>
                          <SelectItem value="universitario">Universitario</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="textLanguage">Idioma</Label>
                      <Select value={informativeTextsData.language} onValueChange={value => handleInformativeTextsInputChange('language', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona idioma" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="espanol">Español</SelectItem>
                          <SelectItem value="ingles">Inglés</SelectItem>
                          <SelectItem value="frances">Francés</SelectItem>
                          <SelectItem value="portugues">Portugués</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Additional Features */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">Características Adicionales</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="includeImages"
                        checked={informativeTextsData.includeImages}
                        onChange={(e) => handleInformativeTextsInputChange('includeImages', e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="includeImages">Incluir elementos visuales</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="includeQuestions"
                        checked={informativeTextsData.includeQuestions}
                        onChange={(e) => handleInformativeTextsInputChange('includeQuestions', e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="includeQuestions">Incluir preguntas</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="includeActivities"
                        checked={informativeTextsData.includeActivities}
                        onChange={(e) => handleInformativeTextsInputChange('includeActivities', e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="includeActivities">Incluir actividades</Label>
                    </div>
                  </div>
                </div>

                {/* Content Specifications */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">Especificaciones del Contenido</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="keyConcepts">Conceptos Clave</Label>
                    <Textarea id="keyConcepts" placeholder="Lista los conceptos principales que debe cubrir el texto..." value={informativeTextsData.keyConcepts} onChange={e => handleInformativeTextsInputChange('keyConcepts', e.target.value)} className="min-h-[80px]" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="learningObjectives">Objetivos de Aprendizaje</Label>
                    <Textarea id="learningObjectives" placeholder="Describe los objetivos específicos que debe cumplir este texto..." value={informativeTextsData.learningObjectives} onChange={e => handleInformativeTextsInputChange('learningObjectives', e.target.value)} className="min-h-[80px]" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="informativeAdditionalInstructions">Instrucciones Adicionales</Label>
                    <Textarea id="informativeAdditionalInstructions" placeholder="Incluye cualquier instrucción específica, estilo de escritura, o criterios adicionales..." value={informativeTextsData.additionalInstructions} onChange={e => handleInformativeTextsInputChange('additionalInstructions', e.target.value)} className="min-h-[100px]" />
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="flex gap-3 justify-center pt-4">
                  <Button onClick={handleGenerateInformativeTexts} disabled={isInformativeTextsLoading} className="bg-primary hover:bg-primary text-primary-foreground">
                    {isInformativeTextsLoading ? 'Generando...' : '¡Generar Texto Informativo!'}
                  </Button>
                  <Button variant="outline" onClick={resetInformativeTextsForm} disabled={isInformativeTextsLoading}>
                    Cancelar
                  </Button>
                </div>
              </div> : <div className="space-y-4 py-4">
                {/* Preview Box */}
                <div className="border rounded-lg p-4 bg-muted max-h-[400px] overflow-y-auto">
                  <h3 className="font-semibold mb-3">Texto Informativo Generado:</h3>
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {informativeTextsResponse}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                  <Button onClick={() => setCurrentInformativeTextsStep('form')} variant="outline" className="flex items-center gap-2">
                    <RotateCcw className="h-4 w-4" />
                    Do Over
                  </Button>
                  <Button onClick={handleCopyInformativeTextsToClipboard} variant="outline" className="flex items-center gap-2">
                    <Copy className="h-4 w-4" />
                    Copy to Clipboard
                  </Button>
                  <Button onClick={handleCreateInformativeTextsPDF} className="bg-primary hover:bg-primary text-primary-foreground flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Create PDF
                  </Button>
                </div>
              </div>}
          </DialogContent>
        </Dialog>

        {/* Text Corrector Dialog */}
        <Dialog open={showTextCorrectorDialog} onOpenChange={resetTextCorrectorForm}>
          <DialogContent className="max-w-4xl mx-auto max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-center">
                {currentTextCorrectorStep === 'form' ? 'Corrector de Textos' : 'Vista Previa del Texto Corregido'}
              </DialogTitle>
            </DialogHeader>
            
            {currentTextCorrectorStep === 'form' ? <div className="space-y-6 py-4">
                {/* Text Input */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">Texto a Corregir</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="originalText">Texto Original *</Label>
                    <Textarea 
                      id="originalText" 
                      placeholder="Pega aquí el texto que quieres corregir..." 
                      value={textCorrectorData.originalText} 
                      onChange={e => handleTextCorrectorInputChange('originalText', e.target.value)} 
                      className="min-h-[200px]"
                    />
                  </div>
                </div>

                {/* Correction Settings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">Configuración de Corrección</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="correctorLanguage">Idioma</Label>
                      <Select value={textCorrectorData.language} onValueChange={value => handleTextCorrectorInputChange('language', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona idioma" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="espanol">Español</SelectItem>
                          <SelectItem value="ingles">Inglés</SelectItem>
                          <SelectItem value="frances">Francés</SelectItem>
                          <SelectItem value="portugues">Portugués</SelectItem>
                          <SelectItem value="italiano">Italiano</SelectItem>
                          <SelectItem value="aleman">Alemán</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="correctionType">Tipo de Corrección</Label>
                      <Select value={textCorrectorData.correctionType} onValueChange={value => handleTextCorrectorInputChange('correctionType', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="completa">Corrección Completa</SelectItem>
                          <SelectItem value="ortografia">Solo Ortografía</SelectItem>
                          <SelectItem value="gramatica">Solo Gramática</SelectItem>
                          <SelectItem value="estilo">Solo Estilo</SelectItem>
                          <SelectItem value="puntuacion">Solo Puntuación</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="correctorTone">Tono</Label>
                      <Select value={textCorrectorData.tone} onValueChange={value => handleTextCorrectorInputChange('tone', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona tono" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="profesional">Profesional</SelectItem>
                          <SelectItem value="academico">Académico</SelectItem>
                          <SelectItem value="formal">Formal</SelectItem>
                          <SelectItem value="informal">Informal</SelectItem>
                          <SelectItem value="amigable">Amigable</SelectItem>
                          <SelectItem value="técnico">Técnico</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="formality">Formalidad</Label>
                      <Select value={textCorrectorData.formality} onValueChange={value => handleTextCorrectorInputChange('formality', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona formalidad" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="muy-formal">Muy Formal</SelectItem>
                          <SelectItem value="formal">Formal</SelectItem>
                          <SelectItem value="neutral">Neutral</SelectItem>
                          <SelectItem value="informal">Informal</SelectItem>
                          <SelectItem value="muy-informal">Muy Informal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Focus Areas */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">Áreas de Enfoque</h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="gramatica"
                        checked={textCorrectorData.focusAreas.includes('gramatica')}
                        onChange={(e) => handleCorrectorFocusAreaChange('gramatica', e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="gramatica">Gramática</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="ortografia"
                        checked={textCorrectorData.focusAreas.includes('ortografia')}
                        onChange={(e) => handleCorrectorFocusAreaChange('ortografia', e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="ortografia">Ortografía</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="puntuacion"
                        checked={textCorrectorData.focusAreas.includes('puntuacion')}
                        onChange={(e) => handleCorrectorFocusAreaChange('puntuacion', e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="puntuacion">Puntuación</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="estilo"
                        checked={textCorrectorData.focusAreas.includes('estilo')}
                        onChange={(e) => handleCorrectorFocusAreaChange('estilo', e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="estilo">Estilo</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="coherencia"
                        checked={textCorrectorData.focusAreas.includes('coherencia')}
                        onChange={(e) => handleCorrectorFocusAreaChange('coherencia', e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="coherencia">Coherencia</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="claridad"
                        checked={textCorrectorData.focusAreas.includes('claridad')}
                        onChange={(e) => handleCorrectorFocusAreaChange('claridad', e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="claridad">Claridad</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="fluidez"
                        checked={textCorrectorData.focusAreas.includes('fluidez')}
                        onChange={(e) => handleCorrectorFocusAreaChange('fluidez', e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="fluidez">Fluidez</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="vocabulario"
                        checked={textCorrectorData.focusAreas.includes('vocabulario')}
                        onChange={(e) => handleCorrectorFocusAreaChange('vocabulario', e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="vocabulario">Vocabulario</Label>
                    </div>
                  </div>
                </div>

                {/* Additional Options */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">Opciones Adicionales</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="includeSuggestions"
                        checked={textCorrectorData.includeSuggestions}
                        onChange={(e) => handleTextCorrectorInputChange('includeSuggestions', e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="includeSuggestions">Incluir sugerencias de mejora</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="includeExplanations"
                        checked={textCorrectorData.includeExplanations}
                        onChange={(e) => handleTextCorrectorInputChange('includeExplanations', e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="includeExplanations">Incluir explicaciones detalladas</Label>
                    </div>
                  </div>
                </div>

                {/* Additional Instructions */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">Instrucciones Adicionales</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="correctorAdditionalInstructions">Instrucciones Específicas</Label>
                    <Textarea 
                      id="correctorAdditionalInstructions" 
                      placeholder="Incluye cualquier instrucción específica sobre el tipo de corrección que necesitas..." 
                      value={textCorrectorData.additionalInstructions} 
                      onChange={e => handleTextCorrectorInputChange('additionalInstructions', e.target.value)} 
                      className="min-h-[100px]"
                    />
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="flex gap-3 justify-center pt-4">
                  <Button onClick={handleCorrectText} disabled={isTextCorrectorLoading} className="bg-primary hover:bg-primary text-primary-foreground">
                    {isTextCorrectorLoading ? 'Corrigiendo...' : '¡Corregir Texto!'}
                  </Button>
                  <Button variant="outline" onClick={resetTextCorrectorForm} disabled={isTextCorrectorLoading}>
                    Cancelar
                  </Button>
                </div>
              </div> : <div className="space-y-4 py-4">
                {/* Preview Box */}
                <div className="border rounded-lg p-4 bg-muted max-h-[400px] overflow-y-auto">
                  <h3 className="font-semibold mb-3">Texto Corregido:</h3>
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {textCorrectorResponse}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                  <Button onClick={() => setCurrentTextCorrectorStep('form')} variant="outline" className="flex items-center gap-2">
                    <RotateCcw className="h-4 w-4" />
                    Do Over
                  </Button>
                  <Button onClick={handleCopyCorrectedTextToClipboard} variant="outline" className="flex items-center gap-2">
                    <Copy className="h-4 w-4" />
                    Copy to Clipboard
                  </Button>
                  <Button onClick={handleCreateCorrectedTextPDF} className="bg-primary hover:bg-primary text-primary-foreground flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Create PDF
                  </Button>
                </div>
              </div>}
          </DialogContent>
        </Dialog>

        {/* YouTube Questions Dialog */}
        <Dialog open={showYoutubeQuestionsDialog} onOpenChange={resetYoutubeQuestionsForm}>
          <DialogContent className="max-w-4xl mx-auto max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-center">
                {currentYoutubeQuestionsStep === 'form' ? 'Preguntas sobre Video de YouTube' : 'Vista Previa de las Preguntas'}
              </DialogTitle>
            </DialogHeader>
            
            {currentYoutubeQuestionsStep === 'form' ? <div className="space-y-6 py-4">
                {/* Video Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">Información del Video</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="videoUrl">URL del Video de YouTube *</Label>
                    <Input 
                      id="videoUrl" 
                      placeholder="https://www.youtube.com/watch?v=..." 
                      value={youtubeQuestionsData.videoUrl} 
                      onChange={e => handleYoutubeQuestionsInputChange('videoUrl', e.target.value)} 
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="youtubeSubject">Materia *</Label>
                      <Input 
                        id="youtubeSubject" 
                        placeholder="Ej: Ciencias, Historia, Matemáticas, etc." 
                        value={youtubeQuestionsData.subject} 
                        onChange={e => handleYoutubeQuestionsInputChange('subject', e.target.value)} 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="youtubeGrade">Grado *</Label>
                      <Select value={youtubeQuestionsData.grade} onValueChange={value => handleYoutubeQuestionsInputChange('grade', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un grado" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Kinder">Kinder</SelectItem>
                          <SelectItem value="1er Grado">1er Grado</SelectItem>
                          <SelectItem value="2do Grado">2do Grado</SelectItem>
                          <SelectItem value="3er Grado">3er Grado</SelectItem>
                          <SelectItem value="4to Grado">4to Grado</SelectItem>
                          <SelectItem value="5to Grado">5to Grado</SelectItem>
                          <SelectItem value="6to Grado">6to Grado</SelectItem>
                          <SelectItem value="7mo Grado">7mo Grado</SelectItem>
                          <SelectItem value="8vo Grado">8vo Grado</SelectItem>
                          <SelectItem value="9no Grado">9no Grado</SelectItem>
                          <SelectItem value="10mo Grado">10mo Grado</SelectItem>
                          <SelectItem value="11vo Grado">11vo Grado</SelectItem>
                          <SelectItem value="12vo Grado">12vo Grado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Question Configuration */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">Configuración de Preguntas</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="questionType">Tipo de Preguntas</Label>
                      <Select value={youtubeQuestionsData.questionType} onValueChange={value => handleYoutubeQuestionsInputChange('questionType', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="comprension">Comprensión</SelectItem>
                          <SelectItem value="analisis">Análisis</SelectItem>
                          <SelectItem value="aplicacion">Aplicación</SelectItem>
                          <SelectItem value="sintesis">Síntesis</SelectItem>
                          <SelectItem value="evaluacion">Evaluación</SelectItem>
                          <SelectItem value="mixtas">Mixtas</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="youtubeDifficulty">Dificultad</Label>
                      <Select value={youtubeQuestionsData.difficulty} onValueChange={value => handleYoutubeQuestionsInputChange('difficulty', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona dificultad" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="basico">Básico</SelectItem>
                          <SelectItem value="intermedio">Intermedio</SelectItem>
                          <SelectItem value="avanzado">Avanzado</SelectItem>
                          <SelectItem value="mixto">Mixto</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="questionCount">Número de Preguntas</Label>
                      <Select value={youtubeQuestionsData.questionCount} onValueChange={value => handleYoutubeQuestionsInputChange('questionCount', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona cantidad" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">5 preguntas</SelectItem>
                          <SelectItem value="10">10 preguntas</SelectItem>
                          <SelectItem value="15">15 preguntas</SelectItem>
                          <SelectItem value="20">20 preguntas</SelectItem>
                          <SelectItem value="25">25 preguntas</SelectItem>
                          <SelectItem value="30">30 preguntas</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="youtubeLanguage">Idioma</Label>
                      <Select value={youtubeQuestionsData.language} onValueChange={value => handleYoutubeQuestionsInputChange('language', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona idioma" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="espanol">Español</SelectItem>
                          <SelectItem value="ingles">Inglés</SelectItem>
                          <SelectItem value="frances">Francés</SelectItem>
                          <SelectItem value="portugues">Portugués</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Focus Areas */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">Áreas de Enfoque</h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="youtube-contenido"
                        checked={youtubeQuestionsData.focusAreas.includes('contenido')}
                        onChange={(e) => handleYoutubeFocusAreaChange('contenido', e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="youtube-contenido">Contenido</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="youtube-conceptos"
                        checked={youtubeQuestionsData.focusAreas.includes('conceptos')}
                        onChange={(e) => handleYoutubeFocusAreaChange('conceptos', e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="youtube-conceptos">Conceptos</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="youtube-aplicacion"
                        checked={youtubeQuestionsData.focusAreas.includes('aplicacion')}
                        onChange={(e) => handleYoutubeFocusAreaChange('aplicacion', e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="youtube-aplicacion">Aplicación</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="youtube-analisis"
                        checked={youtubeQuestionsData.focusAreas.includes('analisis')}
                        onChange={(e) => handleYoutubeFocusAreaChange('analisis', e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="youtube-analisis">Análisis</Label>
                    </div>
                  </div>
                </div>

                {/* Additional Options */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">Opciones Adicionales</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="includeAnswerKey"
                        checked={youtubeQuestionsData.includeAnswerKey}
                        onChange={(e) => handleYoutubeQuestionsInputChange('includeAnswerKey', e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="includeAnswerKey">Incluir clave de respuestas</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="includeTimeStamps"
                        checked={youtubeQuestionsData.includeTimeStamps}
                        onChange={(e) => handleYoutubeQuestionsInputChange('includeTimeStamps', e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="includeTimeStamps">Incluir marcas de tiempo</Label>
                    </div>
                  </div>
                </div>

                {/* Additional Instructions */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">Instrucciones Adicionales</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="youtubeAdditionalInstructions">Instrucciones Específicas</Label>
                    <Textarea 
                      id="youtubeAdditionalInstructions" 
                      placeholder="Incluye cualquier instrucción específica sobre el tipo de preguntas que necesitas..." 
                      value={youtubeQuestionsData.additionalInstructions} 
                      onChange={e => handleYoutubeQuestionsInputChange('additionalInstructions', e.target.value)} 
                      className="min-h-[100px]"
                    />
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="flex gap-3 justify-center pt-4">
                  <Button onClick={handleGenerateYoutubeQuestions} disabled={isYoutubeQuestionsLoading} className="bg-primary hover:bg-primary text-primary-foreground">
                    {isYoutubeQuestionsLoading ? 'Generando...' : '¡Generar Preguntas!'}
                  </Button>
                  <Button variant="outline" onClick={resetYoutubeQuestionsForm} disabled={isYoutubeQuestionsLoading}>
                    Cancelar
                  </Button>
                </div>
              </div> : <div className="space-y-4 py-4">
                {/* Preview Box */}
                <div className="border rounded-lg p-4 bg-muted max-h-[400px] overflow-y-auto">
                  <h3 className="font-semibold mb-3">Preguntas Generadas:</h3>
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {youtubeQuestionsResponse}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                  <Button onClick={() => setCurrentYoutubeQuestionsStep('form')} variant="outline" className="flex items-center gap-2">
                    <RotateCcw className="h-4 w-4" />
                    Do Over
                  </Button>
                  <Button onClick={handleCopyYoutubeQuestionsToClipboard} variant="outline" className="flex items-center gap-2">
                    <Copy className="h-4 w-4" />
                    Copy to Clipboard
                  </Button>
                  <Button onClick={handleCreateYoutubeQuestionsPDF} className="bg-primary hover:bg-primary text-primary-foreground flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Create PDF
                  </Button>
                </div>
              </div>}
          </DialogContent>
        </Dialog>

        {/* Subscription Upgrade Modal */}
        <SubscriptionUpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} currentUsage={usageCount} onUpgradeSuccess={() => {
        setShowUpgradeModal(false);
        refreshUsage();
      }} />
      </div>
    </MobileLayout>;
};
export default AI;