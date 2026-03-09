import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Coins, Gift, ShoppingCart } from "lucide-react";

const COIN_PACKAGES = [
  { coins: 100, price: 1.0, popular: false },
  { coins: 500, price: 4.5, popular: true },
  { coins: 1000, price: 8.0, popular: false },
  { coins: 2500, price: 18.0, popular: false },
];

const GIFT_TYPES = [
  { type: "rose", emoji: "🌹", label: "Rose", cost: 1, description: "A token of appreciation" },
  { type: "star", emoji: "⭐", label: "Star", cost: 5, description: "You shine bright!" },
  { type: "crown", emoji: "👑", label: "Crown", cost: 10, description: "The king/queen of poetry" },
  { type: "diamond", emoji: "💎", label: "Diamond", cost: 25, description: "Truly priceless talent" },
];

const GiftShop = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchBalance = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("user_balances")
      .select("coins")
      .eq("user_id", user.id)
      .maybeSingle();
    setBalance(data?.coins ?? 0);
  };

  useState(() => {
    fetchBalance();
  });

  const handlePurchase = async (pkg: typeof COIN_PACKAGES[0]) => {
    if (!user) {
      toast.error("Please sign in to purchase coins");
      navigate("/auth");
      return;
    }

    setLoading(true);

    // Check if user_balance exists
    const { data: existingBalance } = await supabase
      .from("user_balances")
      .select("id, coins")
      .eq("user_id", user.id)
      .maybeSingle();

    if (existingBalance) {
      // Update existing balance
      const { error: updateError } = await supabase
        .from("user_balances")
        .update({ coins: existingBalance.coins + pkg.coins })
        .eq("user_id", user.id);

      if (updateError) {
        toast.error("Failed to update balance");
        setLoading(false);
        return;
      }
    } else {
      // Create new balance
      const { error: insertError } = await supabase
        .from("user_balances")
        .insert({ user_id: user.id, coins: pkg.coins });

      if (insertError) {
        toast.error("Failed to create balance");
        setLoading(false);
        return;
      }
    }

    // Record purchase
    const { error: purchaseError } = await supabase.from("coin_purchases").insert({
      user_id: user.id,
      amount: pkg.coins,
      price: pkg.price,
      payment_method: "manual",
      status: "pending",
    });

    if (purchaseError) {
      toast.error("Failed to record purchase");
    } else {
      toast.success(
        `Purchase request submitted! You will receive ${pkg.coins} coins after payment confirmation.`
      );
      fetchBalance();
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-28 pb-20 container mx-auto px-6 max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            Gift Shop
          </h1>
          <p className="font-body text-lg text-muted-foreground max-w-2xl mx-auto">
            Purchase coins to send gifts to your favorite poets and creators
          </p>
          {user && balance !== null && (
            <div className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-gradient-gold rounded-xl text-primary font-body font-semibold shadow-gold">
              <Coins className="w-5 h-5" />
              Your Balance: {balance} coins
            </div>
          )}
        </div>

        {/* Coin Packages */}
        <div className="mb-16">
          <h2 className="font-display text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-secondary" />
            Coin Packages
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {COIN_PACKAGES.map((pkg) => (
              <motion.div
                key={pkg.coins}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`relative bg-card border-2 rounded-2xl p-6 text-center transition-all hover:scale-105 ${
                  pkg.popular ? "border-secondary shadow-gold" : "border-border"
                }`}
              >
                {pkg.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-gold text-primary text-xs font-body font-bold rounded-full shadow-gold">
                    POPULAR
                  </span>
                )}
                <Coins className="w-12 h-12 mx-auto mb-4 text-secondary" />
                <h3 className="font-display text-3xl font-bold text-foreground mb-2">
                  {pkg.coins}
                </h3>
                <p className="font-body text-sm text-muted-foreground mb-4">Coins</p>
                <p className="font-display text-2xl font-bold text-secondary mb-6">
                  ${pkg.price.toFixed(2)}
                </p>
                <button
                  onClick={() => handlePurchase(pkg)}
                  disabled={loading}
                  className="w-full py-3 font-body font-semibold bg-gradient-gold rounded-lg text-primary shadow-gold hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {loading ? "Processing..." : "Request Purchase"}
                </button>
              </motion.div>
            ))}
          </div>
          <p className="font-body text-sm text-muted-foreground text-center mt-6">
            Note: Manual payment confirmation required. You'll be contacted for payment details.
          </p>
        </div>

        {/* Gift Types */}
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
            <Gift className="w-6 h-6 text-secondary" />
            Available Gifts
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {GIFT_TYPES.map((gift) => (
              <motion.div
                key={gift.type}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card border border-border rounded-2xl p-6 text-center"
              >
                <span className="text-5xl block mb-3">{gift.emoji}</span>
                <h3 className="font-display text-xl font-bold text-foreground mb-1">
                  {gift.label}
                </h3>
                <p className="font-body text-sm text-muted-foreground mb-3">{gift.description}</p>
                <div className="flex items-center justify-center gap-1.5 font-body text-secondary font-semibold">
                  <Coins className="w-4 h-4" />
                  {gift.cost} coins
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default GiftShop;
