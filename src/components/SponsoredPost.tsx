import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ExternalLink, EyeOff, Megaphone, MoreHorizontal, Flag, HelpCircle, Settings2, X } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

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

const HIDE_KEY = "qadrdaan_ad_hidden_until";

const SponsoredPost = ({ placement = "feed" }: SponsoredPostProps) => {
  const { user, profile } = useAuth();
  const [ad, setAd] = useState<AdData | null>(null);
  const [hidden, setHidden] = useState(false);
  const [advertiserName, setAdvertiserName] = useState("");

  useEffect(() => {
    // Check persisted suppression (2-hour Hide Ad)
    const stored = localStorage.getItem(HIDE_KEY);
    if (stored && Date.now() < parseInt(stored, 10)) {
      setHidden(true);
      return;
    }
    if (stored) localStorage.removeItem(HIDE_KEY);

    const fetchAd = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("serve-ad", {
          body: {
            placement,
            user_id: user?.id || null,
            language: profile?.language || null,
            interests: [],
          },
        });
        if (!error && data?.ad) {
          setAd(data.ad);
          const { data: p } = await supabase
            .from("profiles")
            .select("display_name")
            .eq("user_id", data.ad.advertiser_id)
            .single();
          setAdvertiserName(p?.display_name || "Advertiser");
        }
      } catch {
        // Silently fail
      }
    };
    fetchAd();
  }, [placement, user, profile]);

  const handleClick = async () => {
    if (!ad) return;
    await supabase.from("ad_clicks" as any).insert({
      campaign_id: ad.campaign_id,
      creative_id: ad.creative?.id || null,
      user_id: user?.id || null,
    } as any);
    if (ad.creative?.cta_link) {
      window.open(ad.creative.cta_link, "_blank", "noopener");
    }
  };

  const handleHideTemporary = () => {
    const until = Date.now() + 2 * 60 * 60 * 1000; // 2 hours
    localStorage.setItem(HIDE_KEY, String(until));
    setHidden(true);
    toast.success("Ad hidden for 2 hours");
  };

  if (!ad || !ad.creative || hidden) return null;

  const c = ad.creative;

  return (
    <div className="bg-card border border-border rounded-2xl p-5 relative shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
            <Megaphone className="w-3.5 h-3.5 text-accent" />
          </div>
          <div>
            <p className="font-body text-xs font-bold text-foreground">{advertiserName}</p>
            <p className="font-body text-[9px] text-accent font-bold uppercase tracking-widest">Sponsored</p>
          </div>
        </div>
        <div className="flex items-center gap-0.5">
          <button
            onClick={handleHideTemporary}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="Hide ad for 2 hours"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                <MoreHorizontal className="w-3.5 h-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem onClick={handleHideTemporary} className="gap-2.5 font-body text-xs">
                <EyeOff className="w-3.5 h-3.5" /> Hide Ad
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast.info("Ad reported")} className="gap-2.5 font-body text-xs">
                <Flag className="w-3.5 h-3.5" /> Report Ad
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => toast.info("This ad is shown based on your interests and activity on Qadrdaan")} className="gap-2.5 font-body text-xs">
                <HelpCircle className="w-3.5 h-3.5" /> Why am I seeing this?
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast.info("Ad Preferences — coming soon!")} className="gap-2.5 font-body text-xs">
                <Settings2 className="w-3.5 h-3.5" /> Ad Preferences
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {c.headline && (
        <h3 className="font-display text-base font-bold text-foreground mb-2">{c.headline}</h3>
      )}
      {c.body_text && (
        <p className="font-body text-foreground/80 text-xs mb-3 leading-relaxed">{c.body_text}</p>
      )}
      {c.image_url && (
        <img
          src={c.image_url}
          alt={c.headline || "Sponsored"}
          className="w-full rounded-xl mb-3 max-h-64 object-cover cursor-pointer"
          onClick={handleClick}
        />
      )}
      {c.cta_link && (
        <button
          onClick={handleClick}
          className="flex items-center gap-2 px-5 py-2 font-body font-bold text-xs uppercase tracking-widest bg-secondary text-white rounded-xl hover:opacity-90 transition-opacity shadow-brand"
        >
          {c.cta_text || "Learn More"} <ExternalLink className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};

export default SponsoredPost;
