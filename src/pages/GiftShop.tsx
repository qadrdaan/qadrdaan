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
  { type: "daad",          emoji: "❤️", label: "داد",          cost: 5,        description: "Crystal heart of appreciation" },
  { type: "qalam",         emoji: "✒️", label: "قلم",          cost: 20,       description: "Golden fountain pen" },
  { type: "kitaab",        emoji: "📖", label: "کتاب",         cost: 50,       description: "Glowing leather-bound book" },
  { type: "ghazal",        emoji: "🌺", label: "غزل",          cost: 100,      description: "Red rose on poetry pages" },
  { type: "deewan",        emoji: "📚", label: "دیوان",        cost: 250,      description: "Stack of classic poetry" },
  { type: "mushaira",      emoji: "🎤", label: "مشاعرہ",       cost: 500,      description: "Golden mic on the stage" },
  { type: "chiragh_adab",  emoji: "🪔", label: "چراغِ ادب",     cost: 1000,     description: "Eternal lamp of literature" },
  { type: "makhtoota",     emoji: "📜", label: "مخطوطہ",       cost: 2000,     description: "Illuminated ancient scroll" },
  { type: "taj_adab",      emoji: "👑", label: "تاجِ ادب",      cost: 5000,     description: "Royal crown of poetry" },
  { type: "fakhr_qalam",   emoji: "🎖️", label: "فخرِ قلم",     cost: 10000,    description: "Literary medal of honor" },
  { type: "shaheen_fikr",  emoji: "🦅", label: "شاہینِ فکر",    cost: 15000,    description: "Eagle of intellect" },
  { type: "sitara_adab",   emoji: "⭐", label: "ستارۂ ادب",    cost: 20000,    description: "Radiant literary star" },
  { type: "khazana_adab",  emoji: "🗝️", label: "خزانۂ ادب",   cost: 30000,    description: "Treasure chest of books" },
  { type: "safeer_qadrdan",emoji: "🌍", label: "سفیرِ قدردان", cost: 50000,    description: "Globe of literary ambassadorship" },
  { type: "nishaan",       emoji: "🏆", label: "نشانِ قدردان", cost: 75000,    description: "Crystal & gold trophy" },
  { type: "sultan_sukhan", emoji: "🤴", label: "سلطانِ سخن",   cost: 100000,   description: "Throne of poetry" },
  { type: "qasr_adab",     emoji: "🏰", label: "قصرِ ادب",     cost: 150000,   description: "Palace of literature" },
  { type: "mohsin_adab",   emoji: "🌟", label: "محسنِ ادب",    cost: 250000,   description: "Celestial literary emblem" },
  { type: "waqar",         emoji: "💠", label: "وقارِ قدردان", cost: 500000,   description: "Rare sapphire of honor" },
  { type: "kehkashan",     emoji: "🌌", label: "کہکشاںِ ادب", cost: 1000000,  description: "Galaxy — the ultimate honor" },
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
    if (coins < 100) {
      toast.error("Minimum purchase is 100 coins");
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
      payment_method: "gateway",
      status: "pending",
    });

    if (purchaseError) {
      toast.error("Failed to record purchase");
    } else {
      toast.success(`Purchase of ${coins} coins initiated. Complete checkout in the secure payment gateway.`);
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
            Buy any number of coins (minimum 100). Rate: 100 coins = $1 (+ 10% processing fee).
          </p>
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="block font-body text-xs font-medium text-foreground mb-1.5">
                Number of coins
              </label>
              <input
                type="number"
                min={100}
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
              disabled={loading || customCoinsNum < 100}
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
          All payments are securely processed through our integrated payment gateway.
        </p>
      </section>
      <Footer />
    </div>
  );
};

export default GiftShop;
