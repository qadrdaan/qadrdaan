import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const AD_TYPES = [
  { value: "sponsored_post", label: "Sponsored Post" },
  { value: "single_image", label: "Single Image" },
  { value: "carousel", label: "Carousel" },
  { value: "video", label: "Video Ad" },
  { value: "search", label: "Search Ad" },
  { value: "profile_promotion", label: "Profile Promotion" },
  { value: "event_promotion", label: "Event Promotion" },
];

const PRICING_MODELS = [
  { value: "cpc", label: "CPC – Pay per Click", desc: "$0.10–$0.50 avg" },
  { value: "cpm", label: "CPM – Pay per 1K Views", desc: "$0.50–$5.00 avg" },
  { value: "cpa", label: "CPA – Pay per Action", desc: "$2–$20 avg" },
];

const PLACEMENTS = [
  { value: "feed", label: "Home Feed" },
  { value: "story", label: "Stories" },
  { value: "video_between", label: "Between Videos" },
  { value: "search_results", label: "Search Results" },
  { value: "marketplace", label: "Marketplace" },
  { value: "live_room", label: "Live Room Banners" },
];

const CTA_OPTIONS = ["Learn More", "Follow", "Join", "Install App", "Buy Book", "Visit", "Sign Up", "Subscribe"];

const CreateAd = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  // Campaign
  const [name, setName] = useState("");
  const [adType, setAdType] = useState("sponsored_post");
  const [pricingModel, setPricingModel] = useState("cpc");
  const [selectedPlacements, setSelectedPlacements] = useState(["feed"]);
  const [dailyBudget, setDailyBudget] = useState("5");
  const [lifetimeBudget, setLifetimeBudget] = useState("");
  const [bidAmount, setBidAmount] = useState("0.10");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState("");

  // Targeting
  const [targetLangs, setTargetLangs] = useState<string[]>([]);
  const [targetInterests, setTargetInterests] = useState("");
  const [targetCategories, setTargetCategories] = useState("");

  // Creative
  const [headline, setHeadline] = useState("");
  const [bodyText, setBodyText] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [ctaText, setCtaText] = useState("Learn More");
  const [ctaLink, setCtaLink] = useState("");

  const togglePlacement = (p: string) => {
    setSelectedPlacements((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  };

  const toggleLang = (l: string) => {
    setTargetLangs((prev) =>
      prev.includes(l) ? prev.filter((x) => x !== l) : [...prev, l]
    );
  };

  const handleSubmit = async (asDraft: boolean) => {
    if (!user) { navigate("/auth"); return; }
    if (!name.trim()) { toast.error("Campaign name required"); return; }
    if (!headline.trim()) { toast.error("Headline required"); return; }
    if (parseFloat(dailyBudget) < 5) { toast.error("Minimum daily budget is $5"); return; }

    setSubmitting(true);

    // Create campaign
    const { data: campaign, error } = await supabase.from("ad_campaigns" as any).insert({
      advertiser_id: user.id,
      name: name.trim(),
      ad_type: adType,
      pricing_model: pricingModel,
      status: asDraft ? "draft" : "pending_review",
      placements: selectedPlacements,
      target_languages: targetLangs,
      target_interests: targetInterests.split(",").map((s) => s.trim()).filter(Boolean),
      target_categories: targetCategories.split(",").map((s) => s.trim()).filter(Boolean),
      daily_budget: parseFloat(dailyBudget),
      lifetime_budget: lifetimeBudget ? parseFloat(lifetimeBudget) : null,
      bid_amount: parseFloat(bidAmount),
      start_date: new Date(startDate).toISOString(),
      end_date: endDate ? new Date(endDate).toISOString() : null,
    } as any).select().single();

    if (error || !campaign) {
      toast.error("Failed to create campaign");
      setSubmitting(false);
      return;
    }

    // Create creative
    await supabase.from("ad_creatives" as any).insert({
      campaign_id: (campaign as any).id,
      headline: headline.trim(),
      body_text: bodyText.trim() || null,
      image_url: imageUrl.trim() || null,
      cta_text: ctaText,
      cta_link: ctaLink.trim() || null,
    } as any);

    toast.success(asDraft ? "Campaign saved as draft" : "Campaign submitted for review");
    navigate("/ads");
    setSubmitting(false);
  };

  if (authLoading) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-28 pb-20 container mx-auto px-6 max-w-2xl">
        <h1 className="font-display text-3xl font-bold text-foreground mb-2">Create Ad Campaign</h1>
        <p className="font-body text-muted-foreground mb-8">Reach the Qadrdaan community — 2% cheaper than other platforms</p>

        <div className="space-y-6">
          {/* Campaign Name */}
          <div>
            <label className="font-body text-sm font-medium text-foreground block mb-1.5">Campaign Name *</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-input bg-background font-body text-sm" placeholder="My first campaign" />
          </div>

          {/* Ad Type */}
          <div>
            <label className="font-body text-sm font-medium text-foreground block mb-1.5">Ad Type *</label>
            <div className="grid grid-cols-2 gap-2">
              {AD_TYPES.map((t) => (
                <button key={t.value} onClick={() => setAdType(t.value)}
                  className={`px-3 py-2 rounded-xl text-sm font-body font-medium text-left transition-colors ${adType === t.value ? "bg-secondary text-secondary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Pricing Model */}
          <div>
            <label className="font-body text-sm font-medium text-foreground block mb-1.5">Pricing Model *</label>
            <div className="space-y-2">
              {PRICING_MODELS.map((p) => (
                <button key={p.value} onClick={() => setPricingModel(p.value)}
                  className={`w-full px-4 py-3 rounded-xl text-left transition-colors ${pricingModel === p.value ? "bg-secondary text-secondary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
                  <span className="font-body text-sm font-semibold">{p.label}</span>
                  <span className="font-body text-xs ml-2 opacity-70">{p.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Placements */}
          <div>
            <label className="font-body text-sm font-medium text-foreground block mb-1.5">Placements *</label>
            <div className="flex flex-wrap gap-2">
              {PLACEMENTS.map((p) => (
                <button key={p.value} onClick={() => togglePlacement(p.value)}
                  className={`px-3 py-1.5 rounded-full text-xs font-body font-medium transition-colors ${selectedPlacements.includes(p.value) ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"}`}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Budget */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-body text-sm font-medium text-foreground block mb-1.5">Daily Budget ($) *</label>
              <input type="number" min="5" step="1" value={dailyBudget} onChange={(e) => setDailyBudget(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-input bg-background font-body text-sm" />
            </div>
            <div>
              <label className="font-body text-sm font-medium text-foreground block mb-1.5">Bid Amount ($) *</label>
              <input type="number" min="0.01" step="0.01" value={bidAmount} onChange={(e) => setBidAmount(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-input bg-background font-body text-sm" />
            </div>
          </div>

          <div>
            <label className="font-body text-sm font-medium text-foreground block mb-1.5">Lifetime Budget ($, optional)</label>
            <input type="number" min="5" value={lifetimeBudget} onChange={(e) => setLifetimeBudget(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-input bg-background font-body text-sm" placeholder="Leave empty for no limit" />
          </div>

          {/* Schedule */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-body text-sm font-medium text-foreground block mb-1.5">Start Date *</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-input bg-background font-body text-sm" />
            </div>
            <div>
              <label className="font-body text-sm font-medium text-foreground block mb-1.5">End Date (optional)</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-input bg-background font-body text-sm" />
            </div>
          </div>

          {/* Targeting */}
          <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="font-display text-base font-bold text-foreground mb-3">Targeting</h3>
            <div className="space-y-4">
              <div>
                <label className="font-body text-xs text-muted-foreground block mb-1.5">Languages</label>
                <div className="flex flex-wrap gap-2">
                  {["Urdu", "Punjabi", "Hindi", "English", "Saraiki", "Persian"].map((l) => (
                    <button key={l} onClick={() => toggleLang(l)}
                      className={`px-3 py-1 rounded-full text-xs font-body font-medium transition-colors ${targetLangs.includes(l) ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"}`}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="font-body text-xs text-muted-foreground block mb-1.5">Interests (comma-separated)</label>
                <input value={targetInterests} onChange={(e) => setTargetInterests(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background font-body text-sm" placeholder="poetry, books, literature" />
              </div>
              <div>
                <label className="font-body text-xs text-muted-foreground block mb-1.5">Content Categories (comma-separated)</label>
                <input value={targetCategories} onChange={(e) => setTargetCategories(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background font-body text-sm" placeholder="ghazal, nazm, story" />
              </div>
            </div>
          </div>

          {/* Creative */}
          <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="font-display text-base font-bold text-foreground mb-3">Ad Creative</h3>
            <div className="space-y-4">
              <div>
                <label className="font-body text-xs text-muted-foreground block mb-1.5">Headline *</label>
                <input value={headline} onChange={(e) => setHeadline(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background font-body text-sm" placeholder="Your attention-grabbing headline" maxLength={100} />
              </div>
              <div>
                <label className="font-body text-xs text-muted-foreground block mb-1.5">Body Text</label>
                <textarea value={bodyText} onChange={(e) => setBodyText(e.target.value)} rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background font-body text-sm resize-none" placeholder="Describe your product or service" maxLength={500} />
              </div>
              <div>
                <label className="font-body text-xs text-muted-foreground block mb-1.5">Image URL</label>
                <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background font-body text-sm" placeholder="https://..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-body text-xs text-muted-foreground block mb-1.5">CTA Button</label>
                  <select value={ctaText} onChange={(e) => setCtaText(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background font-body text-sm">
                    {CTA_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="font-body text-xs text-muted-foreground block mb-1.5">CTA Link</label>
                  <input value={ctaLink} onChange={(e) => setCtaLink(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background font-body text-sm" placeholder="https://..." />
                </div>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <button onClick={() => handleSubmit(true)} disabled={submitting}
              className="px-5 py-2.5 font-body font-medium text-sm border border-border rounded-xl hover:bg-muted transition-colors text-muted-foreground disabled:opacity-50">
              Save Draft
            </button>
            <button onClick={() => handleSubmit(false)} disabled={submitting}
              className="flex-1 px-5 py-2.5 font-body font-semibold text-sm bg-secondary text-secondary-foreground rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50">
              {submitting ? "Submitting..." : "Submit for Review"}
            </button>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default CreateAd;
