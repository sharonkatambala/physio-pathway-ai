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
    const { healthData, questionnaireAnswers, hasVideo } = assessmentData;
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `You are FIZIO AI, a physiotherapy assistant platform. After a patient assessment, generate two structured outputs:

1. **AI Assessment Report** with these exact sections:
   - **Summary of Findings**: Main complaint, location, severity, functional limitation
   - **Possible Clinical Impression**: Suspected condition, aggravating factors, urgent issues if any
   - **Risk / Red Flags Alert**: Highlight urgent symptoms if present (use "⚠️" icon for warnings)
   - **Recommended Management Plan**: Education, exercises, lifestyle modifications
   - **Progress Tracking Goals**: Measurable goals for follow-up
   - **Referral Guidance**: When to consult a physiotherapist or doctor

2. **Exercise Program** with these sections:
   - **Warm-up**: Gentle mobility or stretching exercises to prepare the body
   - **Main Exercises**: Core recommended activities (strength, balance, aerobic, flexibility), tailored to the patient's condition
   - **Cool-down**: Relaxation and light stretching exercises
   - **Safety & Notes**: Special considerations, frequency, duration, and intensity based on WHO standards

For each exercise, provide:
- Name of exercise
- Frequency (times per week/day)
- Duration (minutes/reps)
- Intensity level (light, moderate, vigorous)
- Purpose / Benefit for the patient's condition

Format your response with clear markdown headings (##) for each main section. All recommendations must strictly align with World Health Organization (WHO) guidelines on physical activity and rehabilitation. Include variations or alternatives if possible.`;

    const userPrompt = `Based on the following patient assessment, create a comprehensive AI Assessment Report and personalized exercise program:

Patient Information:
- Age: ${healthData.age}
- Sex: ${healthData.sex}
- Occupation: ${healthData.occupation}
- Medical Diagnosis: ${healthData.diagnosis || 'Not provided'}
- Problem Description: ${healthData.problemDescription}
- Previous Treatment: ${healthData.previousTreatment || 'None reported'}
- Patient Goals: ${healthData.patientGoals}

Assessment Questionnaire Results:
${Object.entries(questionnaireAnswers).map(([key, value]) => `- ${key}: ${value}`).join('\n')}

${hasVideo ? 'Note: Patient has provided a video assessment for visual analysis.' : ''}

Please generate a comprehensive AI Assessment Report followed by a structured exercise program. Make sure the exercise recommendations are tailored to help achieve the patient's stated goals.`;

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
