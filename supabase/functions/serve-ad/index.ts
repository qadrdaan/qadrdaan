import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceKey);

    const { placement = "feed", user_id, language, interests = [] } = await req.json();

    // Get active campaigns for this placement
    const { data: campaigns } = await admin
      .from("ad_campaigns")
      .select("*, ad_creatives(*)")
      .eq("status", "active")
      .contains("placements", [placement]);

    if (!campaigns || campaigns.length === 0) {
      return new Response(JSON.stringify({ ad: null }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Filter by budget (daily spend check)
    const today = new Date().toISOString().split("T")[0];
    const eligible = [];

    for (const campaign of campaigns) {
      // Check if advertiser has balance
      const { data: balance } = await admin
        .from("advertiser_balances")
        .select("balance")
        .eq("user_id", campaign.advertiser_id)
        .single();

      if (!balance || balance.balance <= 0) continue;

      // Check daily budget
      const { count: todayImpressions } = await admin
        .from("ad_impressions")
        .select("*", { count: "exact", head: true })
        .eq("campaign_id", campaign.id)
        .gte("created_at", `${today}T00:00:00Z`);

      const dailyCost =
        campaign.pricing_model === "cpm"
          ? ((todayImpressions || 0) * campaign.bid_amount) / 1000
          : (todayImpressions || 0) * campaign.bid_amount;

      if (dailyCost >= campaign.daily_budget) continue;

      // Check schedule
      const now = new Date();
      if (campaign.end_date && new Date(campaign.end_date) < now) continue;
      if (new Date(campaign.start_date) > now) continue;

      // Calculate ad score: bid × quality_score × engagement_probability
      const engagementProb = Math.max(0.1, (campaign.engagement_rate || 0.5));
      const adScore = campaign.bid_amount * (campaign.quality_score || 5) * engagementProb;

      // Targeting boost
      let targetBoost = 1.0;
      if (language && campaign.target_languages?.length > 0) {
        if (campaign.target_languages.includes(language)) targetBoost += 0.3;
        else targetBoost -= 0.2;
      }
      if (interests.length > 0 && campaign.target_interests?.length > 0) {
        const overlap = interests.filter((i: string) => campaign.target_interests.includes(i));
        targetBoost += overlap.length * 0.1;
      }

      eligible.push({
        ...campaign,
        adScore: adScore * targetBoost,
        creative: campaign.ad_creatives?.[0] || null,
      });
    }

    if (eligible.length === 0) {
      return new Response(JSON.stringify({ ad: null }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Sort by ad score (auction) and pick winner
    eligible.sort((a, b) => b.adScore - a.adScore);
    const winner = eligible[0];

    // Record impression
    await admin.from("ad_impressions").insert({
      campaign_id: winner.id,
      creative_id: winner.creative?.id || null,
      user_id: user_id || null,
      placement,
    });

    // Return ad data (strip internal fields)
    const adResponse = {
      campaign_id: winner.id,
      ad_type: winner.ad_type,
      creative: winner.creative
        ? {
            id: winner.creative.id,
            headline: winner.creative.headline,
            body_text: winner.creative.body_text,
            image_url: winner.creative.image_url,
            video_url: winner.creative.video_url,
            cta_text: winner.creative.cta_text,
            cta_link: winner.creative.cta_link,
            carousel_slides: winner.creative.carousel_slides,
          }
        : null,
      advertiser_id: winner.advertiser_id,
    };

    return new Response(JSON.stringify({ ad: adResponse }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Ad serving error:", error);
    return new Response(JSON.stringify({ ad: null, error: "Failed to serve ad" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
