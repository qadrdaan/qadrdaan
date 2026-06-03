import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Coins, Gift, ShoppingCart, Sparkles } from "lucide-react";
import daadIcon from "@/assets/gifts/daad.png";
import qalamIcon from "@/assets/gifts/qalam.png";
import kitaabIcon from "@/assets/gifts/kitaab.png";
import ghazalIcon from "@/assets/gifts/ghazal.png";
import deewanIcon from "@/assets/gifts/deewan.png";
import mushairaIcon from "@/assets/gifts/mushaira.png";
import chiraghIcon from "@/assets/gifts/chiragh.png";
import makhtootaIcon from "@/assets/gifts/makhtoota.png";
import tajIcon from "@/assets/gifts/taj.png";
import fakhrIcon from "@/assets/gifts/fakhr.png";
import shaheenIcon from "@/assets/gifts/shaheen.png";
import sitaraIcon from "@/assets/gifts/sitara.png";
import khazanaIcon from "@/assets/gifts/khazana.png";
import safeerIcon from "@/assets/gifts/safeer.png";
import nishaanIcon from "@/assets/gifts/nishaan.png";
import sultanIcon from "@/assets/gifts/sultan.png";
import qasrIcon from "@/assets/gifts/qasr.png";
import mohsinIcon from "@/assets/gifts/mohsin.png";
import waqarIcon from "@/assets/gifts/waqar.png";
import kehkashanIcon from "@/assets/gifts/kehkashan.png";

const PROCESSING_FEE_RATE = 0.1;
const COIN_RATE = 100;

const COIN_PACKAGES = [
  { coins: 100, basePrice: 1.0, popular: false },
  { coins: 500, basePrice: 5.0, popular: true },
  { coins: 1000, basePrice: 10.0, popular: false },
];

const GIFT_TYPES = [
  { type: "daad", label: "داد", cost: 5, description: "Crystal heart of appreciation", image: daadIcon },
  { type: "qalam", label: "قلم", cost: 20, description: "Golden fountain pen", image: qalamIcon },
  { type: "kitaab", label: "کتاب", cost: 50, description: "Glowing leather-bound book", image: kitaabIcon },
  { type: "ghazal", label: "غزل", cost: 100, description: "Red rose on poetry pages", image: ghazalIcon },
  { type: "deewan", label: "دیوان", cost: 250, description: "Stack of classic poetry", image: deewanIcon },
  { type: "mushaira", label: "مشاعرہ", cost: 500, description: "Golden mic on the stage", image: mushairaIcon },
  { type: "chiragh_adab", label: "چراغِ ادب", cost: 1000, description: "Eternal lamp of literature", image: chiraghIcon },
  { type: "makhtoota", label: "مخطوطہ", cost: 2000, description: "Illuminated ancient scroll", image: makhtootaIcon },
  { type: "taj_adab", label: "تاجِ ادب", cost: 5000, description: "Royal crown of poetry", image: tajIcon },
  { type: "fakhr_qalam", label: "فخرِ قلم", cost: 10000, description: "Literary medal of honor", image: fakhrIcon },
  { type: "shaheen_fikr", label: "شاہینِ فکر", cost: 15000, description: "Eagle of intellect", image: shaheenIcon },
  { type: "sitara_adab", label: "ستارۂ ادب", cost: 20000, description: "Radiant literary star", image: sitaraIcon },
  { type: "khazana_adab", label: "خزانۂ ادب", cost: 30000, description: "Treasure chest of books", image: khazanaIcon },
  { type: "safeer_qadrdan", label: "سفیرِ قدردان", cost: 50000, description: "Globe of literary ambassadorship", image: safeerIcon },
  { type: "nishaan", label: "نشانِ قدردان", cost: 75000, description: "Crystal & gold trophy", image: nishaanIcon },
  { type: "sultan_sukhan", label: "سلطانِ سخن", cost: 100000, description: "Throne of poetry", image: sultanIcon },
  { type: "qasr_adab", label: "قصرِ ادب", cost: 150000, description: "Palace of literature", image: qasrIcon },
  { type: "mohsin_adab", label: "محسنِ ادب", cost: 250000, description: "Celestial literary emblem", image: mohsinIcon },
  { type: "waqar", label: "وقارِ قدردان", cost: 500000, description: "Rare sapphire of honor", image: waqarIcon },
  { type: "kehkashan", label: "کہکشاںِ ادب", cost: 1000000, description: "Galaxy — the ultimate honor", image: kehkashanIcon },
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

    const { error } = await supabase.from("coin_purchases").insert({
      user_id: user.id,
      amount: coins,
      price: total,
      payment_method: "gateway",
      status: "pending",
    });

    setLoading(false);

    if (error) {
      toast.error("Failed to create purchase request");
      return;
    }

    toast.success(`Purchase created for ${coins} coins. Secure checkout will be connected to the payment gateway.`);
    setCustomCoins("");
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
            Purchase coins to send premium collectible gifts to your favorite creators
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
                  <h3 className="font-display text-3xl font-bold text-foreground mb-1">{pkg.coins}</h3>
                  <p className="font-body text-sm text-muted-foreground mb-4">Coins</p>
                  <p className="font-display text-2xl font-bold text-secondary">${pkg.basePrice.toFixed(2)}</p>
                  <p className="font-body text-[11px] text-muted-foreground mb-1">+ ${fee.toFixed(2)} processing fee</p>
                  <p className="font-body text-sm font-semibold text-foreground mb-5">Total: ${total.toFixed(2)}</p>
                  <button
                    onClick={() => handlePurchase(pkg.coins, pkg.basePrice)}
                    disabled={loading}
                    className="w-full py-3 font-body font-semibold bg-gradient-gold rounded-lg text-primary shadow-gold hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {loading ? "Processing..." : "Create Purchase"}
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>

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
              <p className="font-display text-xl font-bold text-secondary">Total: ${customTotals.total.toFixed(2)}</p>
            </div>
            <button
              onClick={() => handlePurchase(customCoinsNum, customBasePrice)}
              disabled={loading || customCoinsNum < 100}
              className="px-6 py-3 font-body font-semibold bg-gradient-gold rounded-lg text-primary shadow-gold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? "Processing..." : "Create Purchase"}
            </button>
          </div>
        </motion.div>

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
                <div className="aspect-square mb-3 rounded-2xl bg-muted/30 flex items-center justify-center overflow-hidden">
                  <img
                    src={gift.image}
                    alt={gift.label}
                    loading="lazy"
                    width={1024}
                    height={1024}
                    className="w-full h-full object-contain p-2"
                  />
                </div>
                <h3 className="font-display text-base font-bold text-foreground mb-1">{gift.label}</h3>
                <p className="font-body text-xs text-muted-foreground mb-3 min-h-[32px]">{gift.description}</p>
                <div className="flex items-center justify-center gap-1.5 font-body text-secondary font-semibold text-sm">
                  <Coins className="w-4 h-4" />
                  {gift.cost.toLocaleString()} coins
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
