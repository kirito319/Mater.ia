import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Create Supabase client for authentication and usage checking
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header provided');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError || !user) {
      throw new Error('Authentication failed');
    }

    // Check subscription status
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('subscription_status')
      .eq('user_id', user.id)
      .maybeSingle();

    const subscriptionStatus = profile?.subscription_status || 'free';

    // Check AI usage limits for free users
    if (subscriptionStatus === 'free') {
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
      const { data: usage } = await supabaseClient
        .from('user_ai_usage')
        .select('usage_count')
        .eq('user_id', user.id)
        .eq('month_year', currentMonth)
        .maybeSingle();

      const currentUsage = usage?.usage_count || 0;
      if (currentUsage >= 15) {
        return new Response(JSON.stringify({ error: 'AI_LIMIT_EXCEEDED' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    const { subject, grade, topic, numberOfQuestions, difficulty, additionalInstructions } = await req.json();

    const prompt = `Eres un experto en diseño de evaluaciones educativas. Tu tarea es crear una evaluación de opción múltiple profesional y bien estructurada.

Datos para la evaluación:
- Materia: ${subject}
- Grado: ${grade}
- Tema: ${topic}
- Número de preguntas: ${numberOfQuestions}
- Nivel de dificultad: ${difficulty}
- Instrucciones adicionales: ${additionalInstructions || 'Ninguna'}

FORMATO REQUERIDO:

**EVALUACIÓN DE ${subject.toUpperCase()}**
**Grado: ${grade}**
**Tema: ${topic}**

**INSTRUCCIONES:**
- Lee cada pregunta cuidadosamente
- Selecciona la respuesta correcta marcando la letra correspondiente
- Solo hay una respuesta correcta por pregunta
- Tiempo estimado: ${Math.ceil(parseInt(numberOfQuestions) * 1.5)} minutos

**PREGUNTAS:**

[Genera exactamente ${numberOfQuestions} preguntas de opción múltiple con 4 opciones cada una (A, B, C, D)]

**RESPUESTAS CORRECTAS:**
[Lista las respuestas correctas al final, numeradas del 1 al ${numberOfQuestions}]

CRITERIOS DE CALIDAD:
- Las preguntas deben ser claras y específicas al tema
- Las opciones incorrectas deben ser plausibles pero claramente incorrectas
- El nivel de dificultad debe ser apropiado para ${grade}
- Incluye variedad en los tipos de preguntas (conceptos, aplicación, análisis)
- Las preguntas deben evaluar comprensión real, no memorización
- Usa terminología apropiada para el nivel educativo
- Asegúrate de que cada pregunta tenga exactamente 4 opciones (A, B, C, D)

El formato debe ser profesional y listo para imprimir o convertir a PDF.`;

    console.log('Sending request to OpenAI with prompt:', prompt);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'Eres un experto en diseño de evaluaciones educativas que crea evaluaciones de opción múltiple profesionales, claras y pedagógicamente efectivas.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const evaluation = data.choices[0].message.content;

    console.log('Generated evaluation:', evaluation);

    // Increment usage server-side for free users after successful generation
    try {
      if (subscriptionStatus === 'free') {
        const currentMonth = new Date().toISOString().slice(0, 7);
        await supabaseClient.rpc('increment_ai_usage', { p_month_year: currentMonth });
      }
    } catch (e) {
      console.warn('Failed to increment AI usage (server-side):', e);
    }

    return new Response(JSON.stringify({ evaluation }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-evaluation function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

