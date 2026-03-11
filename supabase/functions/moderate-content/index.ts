import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get auth user
    const authHeader = req.headers.get("Authorization");
    const publishableKey = Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;
    const userClient = createClient(SUPABASE_URL, publishableKey, {
      global: { headers: { Authorization: authHeader || "" } },
    });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { content, content_type } = await req.json();
    if (!content || !content_type) {
      return new Response(JSON.stringify({ error: "Missing content or content_type" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if user is already banned
    const { data: profile } = await adminClient
      .from("profiles")
      .select("is_banned, is_suspended, suspended_until, strike_count")
      .eq("user_id", user.id)
      .single();

    if (profile?.is_banned) {
      return new Response(JSON.stringify({
        allowed: false,
        reason: "Your account has been permanently banned due to repeated violations.",
        action: "permanent_ban",
      }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (profile?.is_suspended && profile?.suspended_until) {
      const suspendedUntil = new Date(profile.suspended_until);
      if (suspendedUntil > new Date()) {
        return new Response(JSON.stringify({
          allowed: false,
          reason: `Your account is suspended until ${suspendedUntil.toLocaleDateString()}. Please wait before posting.`,
          action: "temp_suspension",
        }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      } else {
        // Suspension expired, clear it
        await adminClient.from("profiles").update({ is_suspended: false, suspended_until: null }).eq("user_id", user.id);
      }
    }

    // AI moderation check
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are a content moderator for Qadrdaan, a literary platform for poetry and literature in Urdu, Hindi, Punjabi, Persian, and English. 
Analyze the given text and determine if it contains:
1. Profanity or vulgar language (in any language including Urdu/Hindi/Punjabi transliterations)
2. Hate speech, discrimination, or slurs
3. Threats, harassment, or bullying
4. Sexually explicit content
5. Personal attacks or insults

Literary criticism, mature themes in poetry, and respectful debate are ALLOWED.
Respond ONLY with a JSON object, no markdown.`,
          },
          {
            role: "user",
            content: `Analyze this ${content_type} for policy violations:\n\n"${content}"`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "moderation_result",
              description: "Return moderation analysis result",
              parameters: {
                type: "object",
                properties: {
                  is_violation: { type: "boolean", description: "True if content violates policies" },
                  severity: { type: "string", enum: ["none", "low", "medium", "high"], description: "Severity of violation" },
                  reason: { type: "string", description: "Brief explanation of why content was flagged, or 'clean' if no violation" },
                  categories: {
                    type: "array",
                    items: { type: "string" },
                    description: "List of violation categories found",
                  },
                },
                required: ["is_violation", "severity", "reason", "categories"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "moderation_result" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI service temporarily unavailable." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      // If AI fails, allow content through (fail-open for availability)
      console.error("AI moderation failed:", response.status);
      return new Response(JSON.stringify({ allowed: true, reason: "Moderation unavailable" }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiResult = await response.json();
    let moderation;
    try {
      const toolCall = aiResult.choices?.[0]?.message?.tool_calls?.[0];
      moderation = JSON.parse(toolCall.function.arguments);
    } catch {
      // If parsing fails, allow content
      return new Response(JSON.stringify({ allowed: true, reason: "Moderation parse error" }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!moderation.is_violation) {
      return new Response(JSON.stringify({ allowed: true, reason: "clean" }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Violation detected - apply three-strike rule
    const currentStrikes = (profile?.strike_count || 0) + 1;
    let actionTaken = "warning";
    let suspendedUntil = null;

    if (currentStrikes >= 3) {
      actionTaken = "permanent_ban";
      await adminClient.from("profiles").update({
        is_banned: true,
        strike_count: currentStrikes,
      }).eq("user_id", user.id);
    } else if (currentStrikes === 2) {
      actionTaken = "temp_suspension";
      suspendedUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days
      await adminClient.from("profiles").update({
        is_suspended: true,
        suspended_until: suspendedUntil,
        strike_count: currentStrikes,
      }).eq("user_id", user.id);
    } else {
      await adminClient.from("profiles").update({
        strike_count: currentStrikes,
      }).eq("user_id", user.id);
    }

    // Record violation
    await adminClient.from("user_violations").insert({
      user_id: user.id,
      violation_type: "content_moderation",
      content_type,
      content_text: content.substring(0, 500),
      ai_reason: moderation.reason,
      strike_number: currentStrikes,
      action_taken: actionTaken,
    });

    const messages: Record<string, string> = {
      warning: `⚠️ Warning (Strike ${currentStrikes}/3): Your content was flagged for "${moderation.reason}". Repeated violations will lead to suspension.`,
      temp_suspension: `🚫 Strike ${currentStrikes}/3: Your account has been suspended for 7 days due to "${moderation.reason}". One more violation will result in a permanent ban.`,
      permanent_ban: `❌ Strike 3/3: Your account has been permanently banned due to repeated violations. Last violation: "${moderation.reason}".`,
    };

    return new Response(JSON.stringify({
      allowed: false,
      reason: messages[actionTaken],
      action: actionTaken,
      strike_count: currentStrikes,
    }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (e) {
    console.error("Moderation error:", e);
    // Fail-open: allow content if moderation system fails
    return new Response(JSON.stringify({ allowed: true, reason: "System error" }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
