import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { content, language, category } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are an expert poetry analyzer specializing in Urdu, Hindi, Punjabi, Persian, and English poetry traditions.

Analyze the given poetry and return a JSON response using the tool provided. Evaluate:

1. **Bahr (Meter)**: Identify the poetic meter (bahr) used. Common bahrs: Hazaj, Ramal, Rajaz, Kamil, Mutaqarib, Mutadarak, etc.
2. **Auzaan (Metrical Feet)**: Break down the metrical pattern (fa'ilun, mafa'ilun, etc.)
3. **Qafiya (Rhyme)**: Identify the rhyme scheme and any rhyme errors
4. **Radif (Refrain)**: Identify the radif (repeating word/phrase at end of lines) if present
5. **Rhythm Quality**: Rate overall rhythm consistency (1-10)
6. **Errors**: List specific meter, rhyme, or structural mistakes
7. **Suggestions**: Provide actionable improvement tips

Consider the language "${language}" and category "${category}" for context.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Analyze this poetry:\n\n${content}` },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "poetry_analysis",
              description: "Return structured poetry analysis results",
              parameters: {
                type: "object",
                properties: {
                  bahr: {
                    type: "object",
                    properties: {
                      name: { type: "string", description: "Name of the bahr/meter identified" },
                      confidence: { type: "string", enum: ["high", "medium", "low"] },
                      description: { type: "string", description: "Brief explanation of this meter" },
                    },
                    required: ["name", "confidence", "description"],
                  },
                  auzaan: {
                    type: "object",
                    properties: {
                      pattern: { type: "string", description: "The metrical foot pattern e.g. fa'ilun fa'ilun" },
                      breakdown: { type: "array", items: { type: "string" }, description: "Line-by-line metrical breakdown" },
                    },
                    required: ["pattern", "breakdown"],
                  },
                  qafiya: {
                    type: "object",
                    properties: {
                      rhyme_scheme: { type: "string", description: "Identified rhyme scheme e.g. AA BA CA" },
                      rhyme_words: { type: "array", items: { type: "string" } },
                      errors: { type: "array", items: { type: "string" } },
                    },
                    required: ["rhyme_scheme", "rhyme_words", "errors"],
                  },
                  radif: {
                    type: "object",
                    properties: {
                      present: { type: "boolean" },
                      word: { type: "string", description: "The radif word/phrase if present" },
                      consistency: { type: "string", enum: ["consistent", "inconsistent", "none"] },
                    },
                    required: ["present", "word", "consistency"],
                  },
                  rhythm_score: { type: "number", description: "Overall rhythm quality 1-10" },
                  errors: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        type: { type: "string", enum: ["meter", "rhyme", "structure", "language"] },
                        line: { type: "number" },
                        message: { type: "string" },
                      },
                      required: ["type", "message"],
                    },
                  },
                  suggestions: {
                    type: "array",
                    items: { type: "string" },
                    description: "Actionable improvement suggestions",
                  },
                  overall_quality: { type: "string", enum: ["excellent", "good", "fair", "needs_improvement"] },
                },
                required: ["bahr", "auzaan", "qafiya", "radif", "rhythm_score", "errors", "suggestions", "overall_quality"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "poetry_analysis" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please try later." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI analysis failed" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = await response.json();
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      return new Response(JSON.stringify({ error: "No analysis returned" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const analysis = JSON.parse(toolCall.function.arguments);
    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-poetry error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
