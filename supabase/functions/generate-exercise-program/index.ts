import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { assessmentData } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `You are FIZIO AI, a physiotherapy assistant platform. After a patient assessment, generate a structured exercise program instead of a single exercise. All recommendations must strictly align with World Health Organization (WHO) guidelines on physical activity and rehabilitation.

Your response must be organized into the following sections:

**Warm-up** – Gentle mobility or stretching exercises to prepare the body.

**Main Exercises** – Core recommended activities (strength, balance, aerobic, flexibility), tailored to the patient's condition.

**Cool-down** – Relaxation and light stretching exercises.

**Safety & Notes** – Special considerations, frequency, duration, and intensity based on WHO standards.

For each exercise, provide:
- Name of exercise
- Frequency (times per week/day)
- Duration (minutes/reps)
- Intensity level (light, moderate, vigorous)
- Purpose / Benefit for the patient's condition

Always return multiple suitable exercises (at least 2-3 per section), well-arranged and easy for both patients and physiotherapists to follow. Include variations or alternatives if possible. Do not recommend anything outside WHO-approved guidelines.

Format your response in clear markdown with proper headings and bullet points for easy reading.`;

    const userPrompt = `Based on the following patient assessment, generate a complete exercise program:

${JSON.stringify(assessmentData, null, 2)}

Please provide a comprehensive exercise program with warm-up, main exercises, cool-down, and safety notes.`;

    console.log('Calling Lovable AI Gateway with assessment data');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required. Please add credits to your workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      throw new Error(`AI Gateway error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const exerciseProgram = data.choices[0].message.content;

    console.log('Successfully generated exercise program');

    return new Response(
      JSON.stringify({ exerciseProgram }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-exercise-program function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
