import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Megaphone, AlertTriangle } from "lucide-react";

const PROMOTION_PACKAGES = [
  { id: "featured", label: "Featured Placement (7 days)", cost: 10 },
  { id: "boosted", label: "Boosted Visibility (3 days)", cost: 5 },
  { id: "event_promo", label: "Event Promotion", cost: 15 },
  { id: "social_highlight", label: "Social Highlight", cost: 20 },
];

const PromotionObligation = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [spending, setSpending] = useState(false);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("user_balances")
      .select("coins")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => setBalance(data?.coins ?? 0));
  }, [user]);

  if (!profile || profile.promotion_obligation_met || profile.total_gifts_received === 0) {
    return null;
  }

  const totalRequired = Math.ceil(profile.total_gifts_received * 0.4);
  const remaining = Math.max(0, totalRequired - profile.promotion_coins_spent);

  if (remaining === 0) return null;

  const handleSpend = async (packageId: string, cost: number) => {
    if (!user) return;
    if (balance < cost) {
      toast.error(`Insufficient coins. You have ${balance} but need ${cost}.`);
      return;
    }

    setSpending(true);

    // Deduct from balance
    const { error: balError } = await supabase
      .from("user_balances")
      .update({ coins: balance - cost })
      .eq("user_id", user.id);

    if (balError) {
      toast.error("Failed to process");
      setSpending(false);
      return;
    }

    const newSpent = (profile.promotion_coins_spent || 0) + cost;
    const obligationMet = newSpent >= totalRequired;

    const { error } = await supabase
      .from("profiles")
      .update({
        promotion_coins_spent: newSpent,
        promotion_obligation_met: obligationMet,
      })
      .eq("user_id", user.id);

    if (error) {
      toast.error("Failed to update promotion status");
      // Refund
      await supabase
        .from("user_balances")
        .update({ coins: balance })
        .eq("user_id", user.id);
    } else {
      toast.success(`Promotion "${PROMOTION_PACKAGES.find(p => p.id === packageId)?.label}" activated!`);
      setBalance(balance - cost);
      await refreshProfile();
    }
    setSpending(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 bg-card border-2 border-secondary/30 rounded-2xl"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
          <AlertTriangle className="w-5 h-5 text-secondary" />
        </div>
        <div>
          <h3 className="font-display text-lg font-bold text-foreground">Promotion Obligation</h3>
          <p className="font-body text-sm text-muted-foreground">
            First-time gift receivers must spend 40% of received gifts on promotions
          </p>
        </div>
      </div>

      <div className="mb-5 p-3 bg-background rounded-lg border border-border">
        <div className="flex justify-between font-body text-sm">
          <span className="text-muted-foreground">Total gifts received:</span>
          <span className="font-semibold text-foreground">{profile.total_gifts_received} coins</span>
        </div>
        <div className="flex justify-between font-body text-sm mt-1">
          <span className="text-muted-foreground">40% required:</span>
          <span className="font-semibold text-foreground">{totalRequired} coins</span>
        </div>
        <div className="flex justify-between font-body text-sm mt-1">
          <span className="text-muted-foreground">Already spent on promotions:</span>
          <span className="font-semibold text-secondary">{profile.promotion_coins_spent} coins</span>
        </div>
        <div className="flex justify-between font-body text-sm mt-1">
          <span className="text-muted-foreground">Remaining to spend:</span>
          <span className="font-semibold text-destructive">{remaining} coins</span>
        </div>
        {/* Progress bar */}
        <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-secondary rounded-full transition-all"
            style={{ width: `${Math.min(100, (profile.promotion_coins_spent / totalRequired) * 100)}%` }}
          />
        </div>
      </div>

      <p className="font-body text-xs text-muted-foreground mb-4">
        Choose a promotion package below to fulfill your obligation:
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {PROMOTION_PACKAGES.map((pkg) => (
          <button
            key={pkg.id}
            onClick={() => handleSpend(pkg.id, pkg.cost)}
            disabled={spending || balance < pkg.cost}
            className="p-4 rounded-xl border border-border hover:border-secondary/40 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center gap-2 mb-1">
              <Megaphone className="w-4 h-4 text-secondary" />
              <span className="font-body text-sm font-semibold text-foreground">{pkg.label}</span>
            </div>
            <p className="font-body text-xs text-secondary font-semibold">{pkg.cost} coins</p>
          </button>
        ))}
      </div>
    </motion.div>
  );
};

export default PromotionObligation;
