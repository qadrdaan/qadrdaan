import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ExternalLink, Flag, EyeOff, Megaphone } from "lucide-react";

interface AdCreative {
  id: string;
  headline: string | null;
  body_text: string | null;
  image_url: string | null;
  video_url: string | null;
  cta_text: string | null;
  cta_link: string | null;
  carousel_slides: any[] | null;
}

interface AdData {
  campaign_id: string;
  ad_type: string;
  creative: AdCreative | null;
  advertiser_id: string;
}

interface SponsoredPostProps {
  placement?: string;
}

const SponsoredPost = ({ placement = "feed" }: SponsoredPostProps) => {
  const { user, profile } = useAuth();
  const [ad, setAd] = useState<AdData | null>(null);
  const [hidden, setHidden] = useState(false);
  const [advertiserName, setAdvertiserName] = useState("");

  useEffect(() => {
    const fetchAd = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("serve-ad", {
          body: {
            placement,
            user_id: user?.id || null,
            language: profile?.language || null,
            interests: profile?.preferred_genres || [],
          },
        });
        if (!error && data?.ad) {
          setAd(data.ad);
          // Fetch advertiser name
          const { data: p } = await supabase
            .from("profiles")
            .select("display_name")
            .eq("user_id", data.ad.advertiser_id)
            .single();
          setAdvertiserName(p?.display_name || "Advertiser");
        }
      } catch {
        // Silently fail - no ad to show
      }
    };
    fetchAd();
  }, [placement, user, profile]);

  const handleClick = async () => {
    if (!ad) return;
    // Record click
    await supabase.from("ad_clicks" as any).insert({
      campaign_id: ad.campaign_id,
      creative_id: ad.creative?.id || null,
      user_id: user?.id || null,
    } as any);
    // Open link
    if (ad.creative?.cta_link) {
      window.open(ad.creative.cta_link, "_blank", "noopener");
    }
  };

  if (!ad || !ad.creative || hidden) return null;

  const c = ad.creative;

  return (
    <div className="bg-card border border-border rounded-2xl p-6 relative">
      {/* Sponsored badge */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-accent/20 flex items-center justify-center">
            <Megaphone className="w-4 h-4 text-accent" />
          </div>
          <div>
            <p className="font-body text-sm font-semibold text-foreground">{advertiserName}</p>
            <p className="font-body text-xs text-accent">Sponsored</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setHidden(true)}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="Hide ad"
          >
            <EyeOff className="w-3.5 h-3.5" />
          </button>
          <button
            className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-muted transition-colors"
            title="Report ad"
          >
            <Flag className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Headline */}
      {c.headline && (
        <h3 className="font-display text-lg font-bold text-foreground mb-2">{c.headline}</h3>
      )}

      {/* Body */}
      {c.body_text && (
        <p className="font-body text-foreground/80 text-sm mb-4 leading-relaxed">{c.body_text}</p>
      )}

      {/* Image */}
      {c.image_url && (
        <img
          src={c.image_url}
          alt={c.headline || "Sponsored"}
          className="w-full rounded-xl mb-4 max-h-80 object-cover cursor-pointer"
          onClick={handleClick}
        />
      )}

      {/* Video */}
      {c.video_url && !c.image_url && (
        <video
          src={c.video_url}
          className="w-full rounded-xl mb-4 max-h-80"
          muted
          autoPlay
          loop
          playsInline
        />
      )}

      {/* Carousel */}
      {c.carousel_slides && Array.isArray(c.carousel_slides) && c.carousel_slides.length > 0 && (
        <div className="flex gap-3 overflow-x-auto pb-2 mb-4 scrollbar-thin">
          {c.carousel_slides.map((slide: any, i: number) => (
            <div key={i} className="flex-shrink-0 w-48">
              {slide.image && (
                <img src={slide.image} alt={slide.title || ""} className="w-full h-32 object-cover rounded-lg mb-1" />
              )}
              {slide.title && (
                <p className="font-body text-xs font-medium text-foreground truncate">{slide.title}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* CTA Button */}
      {c.cta_link && (
        <button
          onClick={handleClick}
          className="flex items-center gap-2 px-5 py-2.5 font-body font-semibold text-sm bg-secondary text-secondary-foreground rounded-lg hover:opacity-90 transition-opacity"
        >
          {c.cta_text || "Learn More"} <ExternalLink className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};

export default SponsoredPost;
