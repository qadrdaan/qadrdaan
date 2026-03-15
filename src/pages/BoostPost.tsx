import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Rocket } from "lucide-react";

const BoostPost = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const postId = searchParams.get("post");
  const [post, setPost] = useState<any>(null);
  const [budget, setBudget] = useState("5");
  const [duration, setDuration] = useState("3");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!postId) return;
    supabase.from("poetry_posts").select("*").eq("id", postId).single().then(({ data }) => setPost(data));
  }, [postId]);

  const handleBoost = async () => {
    if (!user || !post) return;
    const budgetNum = parseFloat(budget);
    if (budgetNum < 5) { toast.error("Minimum budget is $5"); return; }

    setSubmitting(true);
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + parseInt(duration));

    const { data: campaign, error } = await supabase.from("ad_campaigns" as any).insert({
      advertiser_id: user.id,
      name: `Boost: ${post.title}`,
      ad_type: "sponsored_post",
      pricing_model: "cpm",
      status: "pending_review",
      placements: ["feed"],
      daily_budget: budgetNum / parseInt(duration),
      lifetime_budget: budgetNum,
      bid_amount: 1.0,
      start_date: new Date().toISOString(),
      end_date: endDate.toISOString(),
    } as any).select().single();

    if (error || !campaign) {
      toast.error("Failed to boost post");
      setSubmitting(false);
      return;
    }

    await supabase.from("ad_creatives" as any).insert({
      campaign_id: (campaign as any).id,
      headline: post.title,
      body_text: post.content?.substring(0, 200),
      promoted_post_id: post.id,
      cta_text: "Read More",
      cta_link: `${window.location.origin}/post/${post.id}`,
    } as any);

    toast.success("Post boost submitted for review!");
    navigate("/ads");
    setSubmitting(false);
  };

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-28 pb-20 container mx-auto px-6 text-center">
          <p className="font-body text-muted-foreground">Loading post...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-28 pb-20 container mx-auto px-6 max-w-lg">
        <div className="text-center mb-8">
          <Rocket className="w-10 h-10 text-secondary mx-auto mb-3" />
          <h1 className="font-display text-2xl font-bold text-foreground">Boost Your Post</h1>
          <p className="font-body text-muted-foreground text-sm mt-1">Reach more readers on Qadrdaan</p>
        </div>

        {/* Post preview */}
        <div className="bg-card border border-border rounded-xl p-4 mb-6">
          <h3 className="font-display text-base font-bold text-foreground mb-1">{post.title}</h3>
          <p className="font-body text-sm text-muted-foreground line-clamp-3">{post.content}</p>
        </div>

        {/* Budget */}
        <div className="mb-5">
          <label className="font-body text-sm font-medium text-foreground block mb-2">Total Budget ($)</label>
          <div className="flex gap-2 mb-3">
            {["5", "10", "25", "50"].map((amt) => (
              <button key={amt} onClick={() => setBudget(amt)}
                className={`px-4 py-2 rounded-xl text-sm font-body font-medium transition-colors ${budget === amt ? "bg-secondary text-secondary-foreground" : "bg-muted text-muted-foreground"}`}>
                ${amt}
              </button>
            ))}
          </div>
          <input type="number" min="5" value={budget} onChange={(e) => setBudget(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-input bg-background font-body text-sm" />
        </div>

        {/* Duration */}
        <div className="mb-6">
          <label className="font-body text-sm font-medium text-foreground block mb-2">Duration (days)</label>
          <div className="flex gap-2">
            {["1", "3", "7", "14", "30"].map((d) => (
              <button key={d} onClick={() => setDuration(d)}
                className={`px-4 py-2 rounded-xl text-sm font-body font-medium transition-colors ${duration === d ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"}`}>
                {d}d
              </button>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="bg-muted rounded-xl p-4 mb-6">
          <div className="flex justify-between font-body text-sm mb-1">
            <span className="text-muted-foreground">Daily spend</span>
            <span className="text-foreground font-semibold">${(parseFloat(budget || "0") / parseInt(duration || "1")).toFixed(2)}/day</span>
          </div>
          <div className="flex justify-between font-body text-sm mb-1">
            <span className="text-muted-foreground">Est. reach</span>
            <span className="text-foreground font-semibold">{(parseFloat(budget || "0") * 200).toLocaleString()} people</span>
          </div>
          <div className="flex justify-between font-body text-sm">
            <span className="text-muted-foreground">Total</span>
            <span className="text-secondary font-bold">${parseFloat(budget || "0").toFixed(2)}</span>
          </div>
        </div>

        <button onClick={handleBoost} disabled={submitting}
          className="w-full py-3 font-body font-semibold bg-secondary text-secondary-foreground rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50">
          {submitting ? "Boosting..." : "Boost Post"}
        </button>
      </section>
      <Footer />
    </div>
  );
};

export default BoostPost;
