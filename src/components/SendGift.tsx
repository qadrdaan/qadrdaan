import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, X } from "lucide-react";

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

  useState(() => {
    fetchBalance();
  });

  const handleSend = async () => {
    if (!user) { toast.error("Please sign in to send gifts"); return; }
    if (!selected) { toast.error("Please select a gift"); return; }
    if (user.id === recipientId) { toast.error("You can't send a gift to yourself"); return; }

    const gift = GIFT_TYPES.find((g) => g.type === selected);
    if (!gift) { toast.error("Invalid gift type"); return; }

    // Check balance
    if (balance < gift.cost) {
      toast.error(`Insufficient coins! You need ${gift.cost} coins but have ${balance}.`);
      return;
    }

    setSending(true);

    // Deduct coins from sender
    const { error: balanceError } = await supabase
      .from("user_balances")
      .update({ coins: balance - gift.cost })
      .eq("user_id", user.id);

    if (balanceError) {
      toast.error("Failed to deduct coins");
      setSending(false);
      return;
    }

    // Insert gift
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
      // Refund coins on error
      await supabase
        .from("user_balances")
        .update({ coins: balance })
        .eq("user_id", user.id);
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
              className="bg-card rounded-2xl border border-border p-6 w-full max-w-md shadow-emerald"
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

              {/* Gift types */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                {GIFT_TYPES.map((gift) => (
                  <button
                    key={gift.type}
                    onClick={() => setSelected(gift.type)}
                    className={`p-4 rounded-xl border-2 text-center transition-all ${
                      selected === gift.type
                        ? "border-secondary bg-secondary/10 shadow-gold"
                        : "border-border hover:border-secondary/30"
                    }`}
                  >
                    <span className="text-3xl block mb-1">{gift.emoji}</span>
                    <p className="font-body text-sm font-semibold text-foreground">{gift.label}</p>
                    <p className="font-body text-xs text-muted-foreground">{gift.description}</p>
                  </button>
                ))}
              </div>

              {/* Optional message */}
              <div className="mb-5">
                <label className="block font-body text-sm font-medium text-foreground mb-1.5">
                  Message (optional)
                </label>
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  maxLength={200}
                  placeholder="Your words of appreciation..."
                  className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <button
                onClick={handleSend}
                disabled={!selected || sending}
                className="w-full py-3 font-body font-semibold bg-gradient-gold rounded-lg text-primary shadow-gold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Gift className="w-4 h-4" />
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
