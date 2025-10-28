import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

// Fallback exercise program
const FALLBACK_PROGRAM = {
  title: "General Exercise Program",
  description: "Here's a general exercise program based on your assessment.",
  exercises: [
    {
      name: "Gentle Stretching",
      description: "Gentle stretching to improve flexibility and reduce pain.",
      duration: "10-15 minutes",
      frequency: "Daily"
    }
  ],
  notes: "This is a general recommendation. For a personalized program, please consult a physiotherapist.",
  isFallback: true
};

serve(async (req)=>{
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }

  try {
    const { assessmentData, assessmentId } = await req.json();
    const { healthData, questionnaireAnswers, hasVideo } = assessmentData || {};

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

    // If no Gemini API key, return fallback program
    if (!GEMINI_API_KEY) {
      console.warn('No GEMINI_API_KEY found, using fallback program');
      return new Response(JSON.stringify({
        exerciseProgram: FALLBACK_PROGRAM,
        isFallback: true,
        message: "AI service not configured - using fallback program"
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    // System and user prompts geared to produce strict JSON
    const systemPrompt = `You are FIZIO AI, a physiotherapy assistant. Generate a personalized exercise program based on the patient's assessment.
Respond ONLY with valid JSON (no backticks or markdown) following this schema:
{
  "title": "string",
  "description": "string",
  "exercises": [
    {
      "name": "string",
      "description": "string",
      "duration": "string",
      "frequency": "string",
      "instructions": ["string"],
      "precautions": ["string"]
    }
  ],
  "notes": "string"
}`;

    const userPrompt = `Create a personalized exercise program for a patient with these details:
- Age: ${healthData?.age ?? 'Not specified'}
- Gender: ${healthData?.gender || healthData?.sex || 'Not specified'}
- Main Complaint: ${questionnaireAnswers?.presenting_problem || healthData?.presenting_problem || 'Not specified'}
- Pain Level: ${questionnaireAnswers?.pain_intensity ?? healthData?.pain_intensity ?? 'Not specified'}/10
- Duration of Symptoms: ${questionnaireAnswers?.pain_onset ?? healthData?.pain_onset ?? 'Not specified'}
- Occupation: ${healthData?.occupation ?? 'Not specified'}
- Primary site(s): ${(Array.isArray(questionnaireAnswers?.primary_sites) ? questionnaireAnswers?.primary_sites.join(', ') : questionnaireAnswers?.primary_sites) || 'Not specified'}
- Aggravating factors: ${(Array.isArray(healthData?.aggravating_factors) ? healthData?.aggravating_factors.join(', ') : healthData?.aggravating_factors) || 'Not specified'}
- Relieving factors: ${(Array.isArray(healthData?.relieving_factors) ? healthData?.relieving_factors.join(', ') : healthData?.relieving_factors) || 'Not specified'}
${hasVideo ? 'Note: Patient has provided a video assessment for visual analysis.' : ''}

Requirements:
- 3–5 safe exercises tailored to the complaint and stage (acute if <6 weeks)
- Include warm-up, main, and cool-down suggestions in the list
- Provide clear instructions (bullet steps) and precautions
- Keep within home-friendly options; adapt intensity conservatively for safety`;

    // Call Gemini generateContent API
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    const body = {
      contents: [
        {
          role: "user",
          parts: [
            { text: systemPrompt },
            { text: userPrompt }
          ]
        }
      ]
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      // Return 200 with fallback so the frontend flow continues gracefully
      return new Response(JSON.stringify({
        exerciseProgram: FALLBACK_PROGRAM,
        isFallback: true,
        error: `AI service error: ${response.status} ${errorText}`
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    const data = await response.json();
    // Gemini returns text in candidates[0].content.parts[].text
    const text = data?.candidates?.[0]?.content?.parts?.map((p: any) => p?.text).join('\n') || '';

    let exerciseProgram = FALLBACK_PROGRAM;
    let isFallback = true;
    try {
      if (text) {
        const jsonTextMatch = text.match(/\{[\s\S]*\}/);
        const jsonText = jsonTextMatch ? jsonTextMatch[0] : text;
        const parsed = JSON.parse(jsonText);
        exerciseProgram = {
          ...parsed,
          isFallback: false
        };
        isFallback = false;
      }
    } catch (e) {
      console.warn('Failed to parse Gemini response, using fallback program', e);
    }

    // Try to persist recommendation server-side with service role to bypass RLS
    try {
      const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
      const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
      if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY && assessmentId) {
        const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
        await admin.from('recommendations').insert({
          assessment_id: assessmentId,
          program: exerciseProgram,
          confidence: isFallback ? 0.3 : 0.8,
          source: isFallback ? 'fallback' : 'ai'
        });
      }
    } catch (e) {
      console.warn('Edge function could not persist recommendation:', e);
    }

    return new Response(JSON.stringify({
      exerciseProgram,
      isFallback
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error in generate-exercise-program:', error);
    // Return 200 with fallback so client doesn't treat it as a hard error
    return new Response(JSON.stringify({
      exerciseProgram: FALLBACK_PROGRAM,
      isFallback: true,
      error: (error as any)?.message || 'Failed to generate exercise program'
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});
