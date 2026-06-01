import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Coins, Gift, ShoppingCart, Sparkles } from "lucide-react";

const PROCESSING_FEE_RATE = 0.10; // 10%
const COIN_RATE = 100; // 100 coins per $1

const COIN_PACKAGES = [
  { coins: 100, basePrice: 1.0, popular: false },
  { coins: 500, basePrice: 5.0, popular: true },
  { coins: 1000, basePrice: 10.0, popular: false },
];

const GIFT_TYPES = [
  { type: "rose", emoji: "🌹", label: "Rose", cost: 1, description: "A token of appreciation" },
  { type: "tulip", emoji: "🌷", label: "Tulip", cost: 2, description: "Spring blossom" },
  { type: "sunflower", emoji: "🌻", label: "Sunflower", cost: 3, description: "Warmth & joy" },
  { type: "bouquet", emoji: "💐", label: "Bouquet", cost: 4, description: "A floral tribute" },
  { type: "star", emoji: "⭐", label: "Star", cost: 5, description: "You shine bright!" },
  { type: "tea", emoji: "🍵", label: "Chai", cost: 5, description: "A warm cup of chai" },
  { type: "sweets", emoji: "🍬", label: "Mithai", cost: 6, description: "Sweet appreciation" },
  { type: "cake", emoji: "🎂", label: "Cake", cost: 8, description: "Celebrate them" },
  { type: "balloon", emoji: "🎈", label: "Balloon", cost: 8, description: "Floating cheer" },
  { type: "crown", emoji: "👑", label: "Crown", cost: 10, description: "The king/queen of poetry" },
  { type: "trophy", emoji: "🏆", label: "Trophy", cost: 12, description: "True champion" },
  { type: "medal", emoji: "🏅", label: "Medal", cost: 12, description: "Award of honor" },
  { type: "guitar", emoji: "🎸", label: "Guitar", cost: 15, description: "Music of the soul" },
  { type: "book", emoji: "📖", label: "Book", cost: 15, description: "A literary gift" },
  { type: "pen", emoji: "🖋️", label: "Golden Pen", cost: 18, description: "For your craft" },
  { type: "moon", emoji: "🌙", label: "Crescent", cost: 20, description: "Guiding light" },
  { type: "lantern", emoji: "🏮", label: "Lantern", cost: 20, description: "Glowing tribute" },
  { type: "fire", emoji: "🔥", label: "Fire", cost: 22, description: "Pure passion" },
  { type: "diamond", emoji: "💎", label: "Diamond", cost: 25, description: "Truly priceless" },
  { type: "gem", emoji: "💍", label: "Ring", cost: 30, description: "Precious gesture" },
  { type: "rocket", emoji: "🚀", label: "Rocket", cost: 40, description: "To the stars" },
  { type: "yacht", emoji: "🛥️", label: "Yacht", cost: 60, description: "Lavish admiration" },
  { type: "car", emoji: "🏎️", label: "Sports Car", cost: 80, description: "Top-tier gift" },
  { type: "castle", emoji: "🏰", label: "Castle", cost: 150, description: "Royalty status" },
];

const GiftShop = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [customCoins, setCustomCoins] = useState<string>("");

  const fetchBalance = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("user_balances")
      .select("coins")
      .eq("user_id", user.id)
      .maybeSingle();
    setBalance(data?.coins ?? 0);
  };

  useEffect(() => {
    fetchBalance();
  }, [user]);

  const calculateTotals = (basePrice: number) => {
    const fee = +(basePrice * PROCESSING_FEE_RATE).toFixed(2);
    const total = +(basePrice + fee).toFixed(2);
    return { fee, total };
  };

  const handlePurchase = async (coins: number, basePrice: number) => {
    if (!user) {
      toast.error("Please sign in to purchase coins");
      navigate("/auth");
      return;
    }
    if (coins <= 0) {
      toast.error("Enter a valid coin amount");
      return;
    }

    setLoading(true);
    const { total } = calculateTotals(basePrice);

    const { data: existingBalance } = await supabase
      .from("user_balances")
      .select("id, coins")
      .eq("user_id", user.id)
      .maybeSingle();

    if (existingBalance) {
      const { error: updateError } = await supabase
        .from("user_balances")
        .update({ coins: existingBalance.coins + coins })
        .eq("user_id", user.id);
      if (updateError) {
        toast.error("Failed to update balance");
        setLoading(false);
        return;
      }
    } else {
      const { error: insertError } = await supabase
        .from("user_balances")
        .insert({ user_id: user.id, coins });
      if (insertError) {
        toast.error("Failed to create balance");
        setLoading(false);
        return;
      }
    }

    const { error: purchaseError } = await supabase.from("coin_purchases").insert({
      user_id: user.id,
      amount: coins,
      price: total,
      payment_method: "manual",
      status: "pending",
    });

    if (purchaseError) {
      toast.error("Failed to record purchase");
    } else {
      toast.success(`Purchase request submitted for ${coins} coins. You'll be contacted for payment.`);
      fetchBalance();
      setCustomCoins("");
    }
    setLoading(false);
  };

  const customCoinsNum = Math.max(0, parseInt(customCoins || "0", 10));
  const customBasePrice = +(customCoinsNum / COIN_RATE).toFixed(2);
  const customTotals = calculateTotals(customBasePrice);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-28 pb-20 container mx-auto px-6 max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            Gift Shop
          </h1>
          <p className="font-body text-lg text-muted-foreground max-w-2xl mx-auto">
            Purchase coins to send gifts to your favorite creators
          </p>
          <p className="font-body text-xs text-muted-foreground mt-2">
            A 10% processing fee is added to every purchase.
          </p>
          {user && balance !== null && (
            <div className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-gradient-gold rounded-xl text-primary font-body font-semibold shadow-gold">
              <Coins className="w-5 h-5" />
              Your Balance: {balance} coins
            </div>
          )}
        </div>

        {/* Coin Packages */}
        <div className="mb-12">
          <h2 className="font-display text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-secondary" />
            Coin Packages
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {COIN_PACKAGES.map((pkg) => {
              const { fee, total } = calculateTotals(pkg.basePrice);
              return (
                <motion.div
                  key={pkg.coins}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -8, scale: 1.03 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className={`relative bg-card border-2 rounded-2xl p-6 text-center transition-colors duration-300 cursor-pointer group hover:border-secondary hover:shadow-gold hover:bg-gradient-to-b hover:from-card hover:to-secondary/5 ${
                    pkg.popular ? "border-secondary shadow-gold" : "border-border"
                  }`}
                >
                  {pkg.popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-gold text-primary text-xs font-body font-bold rounded-full shadow-gold">
                      POPULAR
                    </span>
                  )}
                  <Coins className="w-12 h-12 mx-auto mb-4 text-secondary group-hover:scale-110 transition-transform" />
                  <h3 className="font-display text-3xl font-bold text-foreground mb-1">
                    {pkg.coins}
                  </h3>
                  <p className="font-body text-sm text-muted-foreground mb-4">Coins</p>
                  <p className="font-display text-2xl font-bold text-secondary">
                    ${pkg.basePrice.toFixed(2)}
                  </p>
                  <p className="font-body text-[11px] text-muted-foreground mb-1">
                    + ${fee.toFixed(2)} processing fee
                  </p>
                  <p className="font-body text-sm font-semibold text-foreground mb-5">
                    Total: ${total.toFixed(2)}
                  </p>
                  <button
                    onClick={() => handlePurchase(pkg.coins, pkg.basePrice)}
                    disabled={loading}
                    className="w-full py-3 font-body font-semibold bg-gradient-gold rounded-lg text-primary shadow-gold hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {loading ? "Processing..." : "Request Purchase"}
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Custom Amount */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16 bg-card border-2 border-border rounded-2xl p-6 md:p-8 hover:border-secondary/60 transition-colors"
        >
          <h3 className="font-display text-xl font-bold text-foreground mb-2 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-secondary" />
            Custom Amount
          </h3>
          <p className="font-body text-sm text-muted-foreground mb-4">
            Buy any number of coins. Rate: 100 coins = $1 (+ 10% processing fee).
          </p>
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="block font-body text-xs font-medium text-foreground mb-1.5">
                Number of coins
              </label>
              <input
                type="number"
                min={1}
                step={1}
                value={customCoins}
                onChange={(e) => setCustomCoins(e.target.value)}
                placeholder="e.g. 250"
                className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground font-body focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="text-left md:text-right">
              <p className="font-body text-xs text-muted-foreground">Base ${customBasePrice.toFixed(2)} + fee ${customTotals.fee.toFixed(2)}</p>
              <p className="font-display text-xl font-bold text-secondary">
                Total: ${customTotals.total.toFixed(2)}
              </p>
            </div>
            <button
              onClick={() => handlePurchase(customCoinsNum, customBasePrice)}
              disabled={loading || customCoinsNum <= 0}
              className="px-6 py-3 font-body font-semibold bg-gradient-gold rounded-lg text-primary shadow-gold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? "Processing..." : "Buy Coins"}
            </button>
          </div>
        </motion.div>

        {/* Gift Types */}
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
            <Gift className="w-6 h-6 text-secondary" />
            Available Gifts
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {GIFT_TYPES.map((gift) => (
              <motion.div
                key={gift.type}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -6, scale: 1.04 }}
                className="bg-card border border-border rounded-2xl p-5 text-center hover:border-secondary hover:shadow-gold transition-colors cursor-pointer"
              >
                <span className="text-5xl block mb-3">{gift.emoji}</span>
                <h3 className="font-display text-base font-bold text-foreground mb-1">
                  {gift.label}
                </h3>
                <p className="font-body text-xs text-muted-foreground mb-3 min-h-[32px]">{gift.description}</p>
                <div className="flex items-center justify-center gap-1.5 font-body text-secondary font-semibold text-sm">
                  <Coins className="w-4 h-4" />
                  {gift.cost} coins
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <p className="font-body text-sm text-muted-foreground text-center mt-10">
          Note: Manual payment confirmation required. You'll be contacted for payment details after request.
        </p>
      </section>
      <Footer />
    </div>
  );
};

export default GiftShop;
