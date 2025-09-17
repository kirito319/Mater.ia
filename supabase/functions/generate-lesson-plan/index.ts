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

    // Check subscription status and usage limits
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('subscription_status')
      .eq('user_id', user.id)
      .maybeSingle();

    const subscriptionStatus = profile?.subscription_status || 'free';

    if (subscriptionStatus === 'free') {
      const currentMonth = new Date().toISOString().slice(0, 7);
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

    const { grade, topicThemes, subtopics, additionalCriteria } = await req.json();

    console.log('Generating lesson plan for:', { grade, topicThemes, subtopics, additionalCriteria });

    const prompt = `Eres un diseñador experto de planes de clase. Crea un plan de clase completo y bien estructurado en español usando la siguiente información:

- Grado: ${grade}
- Tema principal: ${topicThemes}
- Subtemas: ${subtopics}
- Criterios adicionales: ${additionalCriteria}

El plan de clase debe incluir las siguientes secciones con encabezados claros:

**Título de la lección**  
**Objetivo de Aprendizaje** (específico y medible)  
**Evaluaciones** (cómo se medirá el aprendizaje)  
**Puntos Clave** (conceptos esenciales que los estudiantes deben aprender)  
**Apertura** (actividad o dinámica inicial para captar la atención)  
**Introducción de Nuevo Material** (explicación del contenido y métodos)  
**Práctica Guiada** (actividades con apoyo del docente)  
**Práctica Independiente** (trabajo autónomo del estudiante)  
**Cierre** (resumen y reflexión final)  
**Actividad de Extensión** (para estudiantes que terminen rápido)  
**Tarea** (si es relevante)  
**Estándares Alineados** (agrega estándares educativos generales apropiados para el grado)

El tono debe ser claro, profesional y apto para un entorno escolar. El texto debe estar formateado con títulos en negrita y separación entre secciones, listo para convertirse en PDF.`;

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
          { role: 'system', content: 'Eres un diseñador experto de planes de clase que crea planes estructurados y profesionales.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const lessonPlan = data.choices[0].message.content;

    console.log('Generated lesson plan:', lessonPlan);

    // Increment usage server-side for free users after successful generation
    try {
      if (subscriptionStatus === 'free') {
        const currentMonth = new Date().toISOString().slice(0, 7);
        await supabaseClient.rpc('increment_ai_usage', { p_month_year: currentMonth });
      }
    } catch (e) {
      console.warn('Failed to increment AI usage (server-side):', e);
    }

    return new Response(JSON.stringify({ lessonPlan }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-lesson-plan function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});