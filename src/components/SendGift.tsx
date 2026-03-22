import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, X, PlusCircle, Coins } from "lucide-react";
import CoinPurchaseModal from "./CoinPurchaseModal";

const GIFT_TYPES = [
  { type: "rose", emoji: "🌹", label: "Rose", description: "A token of appreciation", cost: 1 },
  { type: "star", emoji: "⭐", label: "Star", description: "You shine bright!", cost: 5 },
  { type: "crown", emoji: "👑", label: "Crown", description: "The king/queen of poetry", cost: 10 },
  { type: "diamond", emoji: "💎", label: "Diamond", description: "Truly priceless talent", cost: 25 },
];

interface SendGiftProps {
  recipientId: string;
  recipientName: string;
  eventId?: string;
  onGiftSent?: () => void;
}

const SendGift = ({ recipientId, recipientName, eventId, onGiftSent }: SendGiftProps) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [purchaseOpen, setPurchaseOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [balance, setBalance] = useState<number>(0);

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
    if (open) fetchBalance();
  }, [open, user]);

  const handleSend = async () => {
    if (!user) { toast.error("Please sign in to send gifts"); return; }
    if (!selected) { toast.error("Please select a gift"); return; }
    if (user.id === recipientId) { toast.error("You can't send a gift to yourself"); return; }

    const gift = GIFT_TYPES.find((g) => g.type === selected);
    if (!gift) { toast.error("Invalid gift type"); return; }

    if (balance < gift.cost) {
      toast.error(`Insufficient coins! You need ${gift.cost} coins.`);
      setPurchaseOpen(true);
      return;
    }

    setSending(true);

    const { error: balanceError } = await supabase
      .from("user_balances")
      .update({ coins: balance - gift.cost })
      .eq("user_id", user.id);

    if (balanceError) {
      toast.error("Failed to deduct coins");
      setSending(false);
      return;
    }

    const { error } = await supabase.from("gifts").insert({
      sender_id: user.id,
      recipient_id: recipientId,
      event_id: eventId || null,
      gift_type: selected,
      message: message.trim() || null,
      coin_cost: gift.cost,
    });

    if (error) {
      toast.error(error.message);
      await supabase.from("user_balances").update({ coins: balance }).eq("user_id", user.id);
    } else {
      toast.success(`${gift.emoji} ${gift.label} sent to ${recipientName}!`);
      setOpen(false);
      setSelected(null);
      setMessage("");
      fetchBalance();
      onGiftSent?.();
    }
    setSending(false);
  };

  return (
    <>
      <button
        onClick={() => {
          if (!user) { toast.error("Please sign in to send gifts"); return; }
          setOpen(true);
        }}
        className="px-5 py-2.5 font-body font-semibold text-sm border border-secondary/30 text-secondary rounded-lg hover:bg-secondary/10 transition-colors flex items-center gap-2"
      >
        <Gift className="w-4 h-4" />
        Send Gift
      </button>

      <CoinPurchaseModal 
        isOpen={purchaseOpen} 
        onClose={() => setPurchaseOpen(false)} 
        onSuccess={(newBal) => setBalance(newBal)} 
      />

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              className="bg-card rounded-3xl border border-border p-6 w-full max-w-md shadow-2xl"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-display text-xl font-bold text-foreground">
                  Send Gift to {recipientName}
                </h3>
                <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-5 px-4 py-3 bg-muted/50 border border-border rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Coins className="w-5 h-5 text-accent" />
                  <p className="font-body text-sm text-muted-foreground">
                    Balance: <span className="font-bold text-foreground">{balance} coins</span>
                  </p>
                </div>
                <button 
                  onClick={() => setPurchaseOpen(true)}
                  className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1 hover:underline"
                >
                  <PlusCircle className="w-3.5 h-3.5" /> Buy Coins
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-5">
                {GIFT_TYPES.map((gift) => (
                  <button
                    key={gift.type}
                    onClick={() => setSelected(gift.type)}
                    className={`p-4 rounded-2xl border-2 text-center transition-all ${
                      selected === gift.type
                        ? "border-secondary bg-secondary/5 shadow-lg shadow-secondary/5"
                        : "border-border hover:border-secondary/30"
                    }`}
                  >
                    <span className="text-3xl block mb-1">{gift.emoji}</span>
                    <p className="font-body text-sm font-bold text-foreground">{gift.label}</p>
                    <p className="font-body text-[10px] text-muted-foreground mb-2">{gift.description}</p>
                    <p className={`font-body text-xs font-bold ${balance < gift.cost ? 'text-destructive' : 'text-secondary'}`}>
                      {gift.cost} coins
                    </p>
                  </button>
                ))}
              </div>

              <div className="mb-5">
                <label className="block font-body text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">
                  Message (optional)
                </label>
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  maxLength={200}
                  placeholder="Your words of appreciation..."
                  className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <button
                onClick={handleSend}
                disabled={!selected || sending}
                className="w-full py-4 font-body font-bold bg-gradient-brand rounded-2xl text-white shadow-brand hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Gift className="w-5 h-5" />
                {sending ? "Sending..." : "Send Gift"}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SendGift;