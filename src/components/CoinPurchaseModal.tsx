"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Coins, CreditCard, CheckCircle2, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const PACKAGES = [
  { id: 'pkg1', price: 1, coins: 100, bonus: 0, label: '$1' },
  { id: 'pkg2', price: 5, coins: 600, bonus: 100, label: '$5', popular: true },
  { id: 'pkg3', price: 10, coins: 1250, bonus: 250, label: '$10' },
  { id: 'pkg4', price: 20, coins: 2500, bonus: 500, label: '$20' },
];

interface CoinPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newBalance: number) => void;
}

const CoinPurchaseModal = ({ isOpen, onClose, onSuccess }: CoinPurchaseModalProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [purchased, setPurchased] = useState(false);

  const handlePurchase = async (pkg: typeof PACKAGES[0]) => {
    if (!user) return;
    setLoading(true);

    try {
      // 1. Get current balance
      const { data: balanceData } = await supabase
        .from("user_balances")
        .select("coins")
        .eq("user_id", user.id)
        .maybeSingle();

      const currentCoins = balanceData?.coins ?? 0;
      const newTotal = currentCoins + pkg.coins;

      // 2. Update balance
      const { error: updateError } = await supabase
        .from("user_balances")
        .upsert({ user_id: user.id, coins: newTotal }, { onConflict: 'user_id' });

      if (updateError) throw updateError;

      // 3. Record transaction
      await supabase.from("coin_purchases").insert({
        user_id: user.id,
        amount: pkg.coins,
        price: pkg.price,
        payment_method: "simulated_card",
        status: "completed"
      });

      setPurchased(true);
      setTimeout(() => {
        onSuccess(newTotal);
        onClose();
        setPurchased(false);
      }, 2000);
    } catch (error: any) {
      toast.error("Purchase failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-card border border-border rounded-3xl w-full max-w-md overflow-hidden shadow-2xl"
          >
            <div className="p-6 border-b border-border flex items-center justify-between bg-gradient-to-r from-primary/5 to-secondary/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                  <Coins className="w-6 h-6 text-accent" />
                </div>
                <h2 className="font-display text-xl font-bold text-foreground">Buy Coins</h2>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {purchased ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-12 text-center"
                >
                  <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/20">
                    <CheckCircle2 className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="font-display text-2xl font-bold text-foreground mb-2">Purchase Successful!</h3>
                  <p className="font-body text-muted-foreground">Your balance has been updated.</p>
                </motion.div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {PACKAGES.map((pkg) => (
                    <button
                      key={pkg.id}
                      onClick={() => handlePurchase(pkg)}
                      disabled={loading}
                      className={`relative p-5 rounded-2xl border-2 text-center transition-all group ${
                        pkg.popular 
                          ? "border-primary bg-primary/5 shadow-lg shadow-primary/5" 
                          : "border-border hover:border-primary/40 bg-card"
                      }`}
                    >
                      {pkg.popular && (
                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-primary text-white text-[10px] font-bold rounded-full uppercase tracking-wider">
                          Best Value
                        </span>
                      )}
                      <p className="font-display text-2xl font-bold text-foreground mb-1">{pkg.coins}</p>
                      <p className="font-body text-xs text-muted-foreground mb-3">Coins</p>
                      {pkg.bonus > 0 && (
                        <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-secondary uppercase mb-3">
                          <Sparkles className="w-3 h-3" /> Bonus {pkg.bonus}
                        </div>
                      )}
                      <div className="py-2 bg-muted group-hover:bg-primary group-hover:text-white rounded-xl font-bold text-sm transition-colors">
                        {pkg.label}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {!purchased && (
              <div className="p-6 bg-muted/30 border-t border-border flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-muted-foreground" />
                <p className="text-[10px] font-body text-muted-foreground leading-tight">
                  Secure payment processed via qadrdaan. By purchasing, you agree to our Terms of Service regarding digital goods.
                </p>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CoinPurchaseModal;