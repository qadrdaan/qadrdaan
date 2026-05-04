import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Megaphone, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const ReinvestmentTracker = () => {
  const { user, profile } = useAuth();
  const [adSpend, setAdSpend] = useState(0);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("advertiser_balances")
        .select("total_spent")
        .eq("user_id", user.id)
        .maybeSingle();
      const adsSpent = Number(data?.total_spent || 0);
      const promoCoinsSpent = profile?.promotion_coins_spent || 0;
      setAdSpend(adsSpent + promoCoinsSpent);
    })();
  }, [user, profile]);

  if (!profile) return null;

  const giftsReceived = profile.total_gifts_received || 0;
  const required = Math.ceil(giftsReceived * 0.4);
  const progress = Math.min(100, required > 0 ? (adSpend / required) * 100 : 0);
  const met = required === 0 || adSpend >= required;

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-5">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${met ? "bg-green-500/20 text-green-600" : "bg-secondary/20 text-secondary"}`}>
          {met ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
        </div>
        <div className="flex-1">
          <h3 className="font-display text-lg font-bold">40% Reinvestment</h3>
          <p className="text-xs text-muted-foreground">Spend 40% of received gifts back into ads/promotions</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-muted/40 rounded-xl p-3 text-center">
          <p className="text-[10px] uppercase font-bold text-muted-foreground">Gifts</p>
          <p className="font-display text-lg font-bold">{giftsReceived}</p>
        </div>
        <div className="bg-muted/40 rounded-xl p-3 text-center">
          <p className="text-[10px] uppercase font-bold text-muted-foreground">Required</p>
          <p className="font-display text-lg font-bold text-secondary">{required}</p>
        </div>
        <div className="bg-muted/40 rounded-xl p-3 text-center">
          <p className="text-[10px] uppercase font-bold text-muted-foreground">Spent</p>
          <p className="font-display text-lg font-bold text-green-600">{Math.round(adSpend)}</p>
        </div>
      </div>

      <Progress value={progress} className="h-2 mb-3" />

      {!met ? (
        <a href="/ads" className="flex items-center justify-center gap-2 mt-4 py-2.5 bg-secondary/10 text-secondary rounded-xl font-bold uppercase text-xs tracking-widest hover:bg-secondary/20 transition-colors">
          <Megaphone className="w-4 h-4" /> Run Ads To Fulfil
        </a>
      ) : (
        <p className="text-center text-xs text-green-600 font-bold uppercase tracking-widest mt-3">Obligation Met ✓</p>
      )}
    </div>
  );
};

export default ReinvestmentTracker;
