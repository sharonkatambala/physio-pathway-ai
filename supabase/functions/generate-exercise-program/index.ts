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
  phase: "early",
  weekly_target: 3,
  exercises: [
    {
      id: "gentle-stretching",
      name: "Gentle Stretching",
      description: "Gentle stretching to improve flexibility and reduce pain.",
      duration: "10-15 minutes",
      frequency: "Daily",
      sessions_per_week: 5,
      instructions: ["Perform slow, pain-free movements", "Hold each stretch 10-20s"],
      precautions: ["Stop if you feel sharp pain"]
    }
  ],
  notes: "This is a general recommendation. For a personalized program, please consult a physiotherapist.",
  report: {
    summary: "General safety-first advice provided due to unavailable AI.",
    findings: ["Insufficient data to personalize program"],
    recommendations: ["Complete a full assessment for tailored plan"]
  },
  schedule: {
    current_phase: "early",
    early: { summary: "Build tolerance with gentle movement." },
    intermediate: { summary: "Add strength and control." },
    advanced: { summary: "Progress to higher challenge." }
  },
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
    console.log("assessmentData:", JSON.stringify(assessmentData));
    const { healthData, questionnaireAnswers, hasVideo, language } = assessmentData || {};
    const outputLang = language === 'sw' ? 'SWAHILI (Kiswahili)' : 'simple, plain English';

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    // Model overridable via a GEMINI_MODEL secret; defaults to a current model
    // (gemini-1.5-flash-001 is being retired by Google).
    const MODEL = Deno.env.get('GEMINI_MODEL') || 'gemini-2.0-flash';
    // Optional Groq provider (OpenAI-compatible). Preferred when GROQ_API_KEY is set.
    const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');
    const GROQ_MODEL = Deno.env.get('GROQ_MODEL') || 'llama-3.3-70b-versatile';

    // If no AI provider key at all, return fallback program
    if (!GROQ_API_KEY && !GEMINI_API_KEY) {
      console.warn('No AI provider key found, using fallback program');
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
    const systemPrompt = `You are ErgoCareAI, a physiotherapy assistant. Generate BOTH a concise clinical report and a personalized exercise program based on the patient's assessment. Respond ONLY with valid JSON (no backticks or markdown) following this schema:
{
  "title": "string",
  "description": "string",
  "phase": "early" | "intermediate" | "advanced",
  "weekly_target": number,
  "report": {
    "summary": "string",
    "findings": ["string"],
    "recommendations": ["string"]
  },
  "exercises": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "duration": "string",
      "frequency": "string",
      "sessions_per_week": number,
      "phase": "early" | "intermediate" | "advanced",
      "difficulty": "Beginner" | "Intermediate" | "Advanced",
      "target_area": "string",
      "equipment": "string",
      "instructions": ["string"],
      "precautions": ["string"]
    }
  ],
  "schedule": {
    "current_phase": "early" | "intermediate" | "advanced",
    "early": {"summary": "string"},
    "intermediate": {"summary": "string"},
    "advanced": {"summary": "string"}
  },
  "notes": "string"
}`;

    const userPrompt = `Create a personalized exercise program and clinical report for a patient with these details:
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
- 3-5 safe exercises tailored to the complaint and stage (acute if <6 weeks)
- Include warm-up, main, and cool-down suggestions in the list
- Provide clear instructions (bullet steps) and precautions
- Include phases: early, intermediate, advanced, and a weekly schedule summary
- Provide a weekly_target number (sessions per week) and sessions_per_week for each exercise
- Provide a stable id slug for each exercise (lowercase, hyphenated)
- Keep within home-friendly options; adapt intensity conservatively for safety
- Write ALL human-readable text values (title, description, report.summary, every item in findings and recommendations, each exercise name, description, instructions and precautions, notes, and every schedule summary) in ${outputLang}. Keep the JSON keys and the enum values (early/intermediate/advanced, Beginner/Intermediate/Advanced) in English.
- Never use long dash or em dash characters; use commas, periods, or simple hyphens instead`;

    // Provider-aware AI call: prefer Groq (OpenAI-compatible) when configured,
    // else Gemini. Any error degrades to empty text → safe fallback program.
    const callGroq = async () => {
      const resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${GROQ_API_KEY}` },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.5,
          max_tokens: 2048,
          response_format: { type: 'json_object' },
        }),
      });
      if (!resp.ok) throw new Error(`Groq ${resp.status}: ${(await resp.text()).slice(0, 200)}`);
      const d = await resp.json();
      return d?.choices?.[0]?.message?.content || '';
    };

    const callGemini = async () => {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`;
      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: systemPrompt }, { text: userPrompt }] }] }),
      });
      if (!resp.ok) throw new Error(`Gemini ${resp.status}: ${(await resp.text()).slice(0, 200)}`);
      const d = await resp.json();
      return d?.candidates?.[0]?.content?.parts?.map((p: any) => p?.text).join('\n') || '';
    };

    let text = '';
    try {
      if (GROQ_API_KEY) text = await callGroq();
      else text = await callGemini();
    } catch (primaryErr) {
      console.error('Primary AI provider failed:', primaryErr);
      if (GROQ_API_KEY && GEMINI_API_KEY) {
        try { text = await callGemini(); } catch (backupErr) { console.error('Gemini backup failed:', backupErr); }
      }
    }

    let exerciseProgram = FALLBACK_PROGRAM;
    let isFallback = true;
    try {
      if (text) {
        const jsonTextMatch = text.match(/\{[\s\S]*\}/);
        const jsonText = jsonTextMatch ? jsonTextMatch[0] : text;
        const parsed = JSON.parse(jsonText);
        const slugify = (value: string) =>
          String(value || '')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '');

        const parsedExercises = Array.isArray(parsed?.exercises) ? parsed.exercises : [];
        const normalizedExercises = parsedExercises.map((ex: any, idx: number) => {
          const name = ex?.name || `Exercise ${idx + 1}`;
          return {
            ...ex,
            name,
            id: ex?.id || slugify(name) || `exercise-${idx + 1}`,
            sessions_per_week: typeof ex?.sessions_per_week === 'number' ? ex.sessions_per_week : 3,
          };
        });

        exerciseProgram = {
          ...parsed,
          phase: parsed?.phase || parsed?.schedule?.current_phase || 'early',
          weekly_target: typeof parsed?.weekly_target === 'number' ? parsed.weekly_target : 3,
          schedule: {
            current_phase: parsed?.schedule?.current_phase || parsed?.phase || 'early',
            ...(parsed?.schedule || {})
          },
          exercises: normalizedExercises,
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
