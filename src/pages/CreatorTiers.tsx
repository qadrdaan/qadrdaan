import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Award, Star, Crown, Sparkles, Lock, Check } from "lucide-react";
import { Link } from "react-router-dom";

const TIERS = [
  {
    key: "bronze",
    name: "Bronze Poet",
    icon: Award,
    color: "text-amber-700",
    bg: "from-amber-700/10 to-amber-900/10",
    threshold: 0,
    monthly: 0,
    perks: ["Standard discovery", "Basic analytics", "Public profile"],
  },
  {
    key: "silver",
    name: "Silver Poet",
    icon: Star,
    color: "text-slate-400",
    bg: "from-slate-400/10 to-slate-600/10",
    threshold: 1000,
    monthly: 100,
    perks: ["Verified poet badge eligibility", "Priority moderation queue", "100 free promo coins/month", "1 free post boost/month"],
  },
  {
    key: "gold",
    name: "Gold Poet",
    icon: Crown,
    color: "text-yellow-500",
    bg: "from-yellow-500/15 to-yellow-700/10",
    threshold: 5000,
    monthly: 500,
    perks: ["Reduced 12% withdrawal fee", "Editor pick eligibility", "500 free promo coins/month", "Mentorship listing", "Priority support"],
  },
  {
    key: "platinum",
    name: "Platinum Poet",
    icon: Sparkles,
    color: "text-fuchsia-400",
    bg: "from-fuchsia-500/15 to-purple-700/15",
    threshold: 20000,
    monthly: 2000,
    perks: ["Featured on home", "10% withdrawal fee", "2,000 free promo coins/month", "Custom avatar style", "Dedicated success manager", "Annual Mushaira invite"],
  },
];

const calcPoints = (p: any) =>
  ((p?.followers_count || 0) * 1) +
  ((p?.total_gifts_received || 0) * 2) +
  ((p?.books_count || 0) * 50) +
  ((p?.videos_count || 0) * 25);

const CreatorTiers = () => {
  const { user, profile } = useAuth();
  const [tier, setTier] = useState<any>(null);
  const points = calcPoints(profile);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from("creator_tiers").select("*").eq("user_id", user.id).maybeSingle();
      setTier(data);
    })();
  }, [user]);

  const currentTier = [...TIERS].reverse().find(t => points >= t.threshold) || TIERS[0];
  const nextTier = TIERS.find(t => t.threshold > points);
  const progress = nextTier ? Math.min(100, ((points - currentTier.threshold) / (nextTier.threshold - currentTier.threshold)) * 100) : 100;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-28 pb-16 container mx-auto px-6 max-w-5xl">
        <h1 className="font-display text-4xl font-bold text-foreground mb-2">Creator Economy Tiers</h1>
        <p className="font-body text-sm text-muted-foreground mb-8 max-w-2xl">
          Earn points from followers, gifts, books and videos. Climb tiers to unlock free promo coins, lower fees, and exclusive perks.
        </p>

        {user && (
          <div className="bg-card border border-border rounded-2xl p-6 mb-10">
            <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${currentTier.bg} flex items-center justify-center`}>
                  <currentTier.icon className={`w-6 h-6 ${currentTier.color}`} />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Your tier</p>
                  <p className="font-display text-2xl font-bold text-foreground">{currentTier.name}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase font-bold text-muted-foreground tracking-wider">Points</p>
                <p className="font-display text-2xl font-bold text-primary">{points.toLocaleString()}</p>
              </div>
            </div>
            {nextTier && (
              <>
                <div className="flex items-center justify-between text-xs font-body text-muted-foreground mb-1.5">
                  <span>Next: <strong className="text-foreground">{nextTier.name}</strong></span>
                  <span>{(nextTier.threshold - points).toLocaleString()} points to go</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-brand transition-all" style={{ width: `${progress}%` }} />
                </div>
              </>
            )}
            {currentTier.monthly > 0 && (
              <p className="mt-4 text-xs font-body text-emerald-600 font-bold">
                ✨ You receive {currentTier.monthly} free promo coins each month for being {currentTier.name}.
              </p>
            )}
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {TIERS.map(t => {
            const Icon = t.icon;
            const unlocked = points >= t.threshold;
            return (
              <div key={t.key} className={`bg-card border ${currentTier.key === t.key ? "border-primary" : "border-border"} rounded-2xl p-5 relative overflow-hidden`}>
                <div className={`absolute inset-0 bg-gradient-to-br ${t.bg} opacity-50 pointer-events-none`} />
                <div className="relative">
                  <div className="flex items-center justify-between mb-3">
                    <Icon className={`w-7 h-7 ${t.color}`} />
                    {unlocked ? <Check className="w-4 h-4 text-emerald-500" /> : <Lock className="w-4 h-4 text-muted-foreground" />}
                  </div>
                  <h3 className="font-display text-lg font-bold text-foreground">{t.name}</h3>
                  <p className="font-body text-xs text-muted-foreground mb-3">{t.threshold.toLocaleString()}+ points</p>
                  <ul className="space-y-1.5 text-xs font-body text-foreground/90">
                    {t.perks.map(p => <li key={p} className="flex items-start gap-1.5"><Check className="w-3 h-3 text-primary shrink-0 mt-0.5" /> {p}</li>)}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-10 bg-card border border-border rounded-2xl p-5">
          <h3 className="font-display text-lg font-bold text-foreground mb-2">Mentorship Marketplace</h3>
          <p className="font-body text-sm text-muted-foreground mb-3">
            Gold and Platinum poets can list 1:1 mentorship sessions paid with coins. Mentees book directly from your profile.
          </p>
          <Link to="/profile" className="inline-flex px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-bold">
            Set up your mentorship listing
          </Link>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default CreatorTiers;
