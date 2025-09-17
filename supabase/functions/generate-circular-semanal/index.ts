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

    const { teacherName, gradeLevel, temasDeLaSemana, celebraciones, anunciosImportantes, anunciosAdicionales } = await req.json();

    const prompt = `Eres un asistente experto en educación y comunicación escolar. Tu tarea es crear un boletín semanal dirigido a los padres de familia, listo para convertirse en PDF.

Datos para el boletín:
- Nombre del maestro/a: ${teacherName}
- Nivel/Grado: ${gradeLevel}
- Temas de la semana: ${temasDeLaSemana}
- Celebraciones de la semana: ${celebraciones}
- Anuncios importantes: ${anunciosImportantes}
- Anuncios adicionales: ${anunciosAdicionales}

Genera el boletín siguiendo el formato estructurado con encabezados, secciones y tono cálido y profesional. Incluye un saludo inicial y una despedida cordial.`;

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
          { role: 'system', content: 'Eres un asistente experto en educación y comunicación escolar especializado en crear boletines semanales para padres de familia.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data.choices[0].message.content;

    console.log('Generated newsletter:', generatedText);

    // Increment usage server-side for free users after successful generation
    try {
      if (subscriptionStatus === 'free') {
        const currentMonth = new Date().toISOString().slice(0, 7);
        await supabaseClient.rpc('increment_ai_usage', { p_month_year: currentMonth });
      }
    } catch (e) {
      console.warn('Failed to increment AI usage (server-side):', e);
    }

    return new Response(JSON.stringify({ generatedText }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-circular-semanal function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});