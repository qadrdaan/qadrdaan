import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Wallet as WalletIcon, TrendingUp, Gift, BookOpen,
  ArrowDownToLine, Clock, CheckCircle, XCircle, DollarSign,
  PlusCircle, History, CreditCard, Info, BadgeCheck
} from "lucide-react";

interface WalletData {
  total_earnings: number;
  available_balance: number;
  total_withdrawn: number;
  gift_earnings: number;
  book_earnings: number;
  fan_club_earnings: number;
  ad_earnings: number;
}

interface Transaction {
  id: string;
  amount: number;
  transaction_type: string;
  description: string | null;
  created_at: string;
  is_purchase?: boolean;
}

const COIN_RATE = 100; // 100 coins = $1

const Wallet = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [tab, setTab] = useState<"overview" | "history" | "withdraw">("overview");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (user) {
      fetchWallet();
      fetchHistory();
    }
  }, [user]);

  const fetchWallet = async () => {
    const { data } = await supabase.from("creator_wallets").select("*").eq("user_id", user!.id).single();
    setWallet(data as WalletData | null);
    setLoading(false);
  };

  const fetchHistory = async () => {
    if (!user) return;
    
    const { data: txs } = await supabase
      .from("wallet_transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    const { data: purchases } = await supabase
      .from("coin_purchases")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    const combined: Transaction[] = [
      ...(txs || []).map(t => ({ ...t, is_purchase: false })),
      ...(purchases || []).map(p => ({ 
        id: p.id, 
        amount: p.amount, 
        transaction_type: 'purchase', 
        description: `Purchased ${p.amount} coins`, 
        created_at: p.created_at,
        is_purchase: true 
      }))
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    setTransactions(combined);

    const { data: wds } = await supabase.from("withdrawal_requests").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    setWithdrawals(wds || []);
  };

  const toDollars = (coins: number) => (coins / COIN_RATE).toFixed(2);

  // Tiered Fee Logic
  const getFeePercentage = () => {
    if (profile?.is_verified) return 12;
    const accountAgeDays = profile?.created_at 
      ? Math.floor((Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24)) 
      : 0;
    return accountAgeDays < 30 ? 18 : 15;
  };

  const feePercent = getFeePercentage();
  const amountNum = parseFloat(withdrawAmount) || 0;
  const feeAmount = (amountNum * feePercent) / 100;
  const finalAmount = Math.max(0, amountNum - feeAmount);

  if (authLoading || loading) return <div className="min-h-screen bg-background"><Navbar /><div className="pt-28 text-center">Loading Wallet...</div></div>;

  const w = wallet || { total_earnings: 0, available_balance: 0, total_withdrawn: 0, gift_earnings: 0, book_earnings: 0, fan_club_earnings: 0, ad_earnings: 0 };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="h-48 bg-gradient-hero relative flex items-end">
        <div className="container mx-auto px-6 pb-6 relative z-10">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground">Wallet & Earnings</h1>
          <p className="font-body text-primary-foreground/80 mt-1">Manage your balance and track every coin.</p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-5xl">
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <WalletIcon className="w-5 h-5 text-primary" />
              <span className="font-body text-xs font-bold text-muted-foreground uppercase tracking-wider">Available Balance</span>
            </div>
            <p className="font-display text-3xl font-bold text-foreground">${toDollars(w.available_balance)}</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-secondary" />
              <span className="font-body text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Earnings</span>
            </div>
            <p className="font-display text-3xl font-bold text-foreground">${toDollars(w.total_earnings)}</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <ArrowDownToLine className="w-5 h-5 text-accent" />
              <span className="font-body text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Withdrawn</span>
            </div>
            <p className="font-display text-3xl font-bold text-foreground">${toDollars(w.total_withdrawn)}</p>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          {["overview", "history", "withdraw"].map((t: any) => (
            <button key={t} onClick={() => setTab(t)} className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${tab === t ? "bg-primary text-white shadow-brand" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
              {t}
            </button>
          ))}
        </div>

        {tab === "overview" && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-3xl p-8">
              <h3 className="font-display text-xl font-bold mb-6">Earnings Breakdown</h3>
              <div className="space-y-4">
                {[
                  { label: "Gifts & Mushaira", val: w.gift_earnings, icon: Gift, color: "text-secondary" },
                  { label: "Book Sales", val: w.book_earnings, icon: BookOpen, color: "text-primary" },
                  { label: "Fan Club", val: w.fan_club_earnings, icon: DollarSign, color: "text-accent" },
                  { label: "Ad Revenue", val: w.ad_earnings, icon: TrendingUp, color: "text-green-500" },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <item.icon className={`w-5 h-5 ${item.color}`} />
                      <span className="font-body text-sm font-bold">{item.label}</span>
                    </div>
                    <span className="font-display font-bold">${toDollars(item.val)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-brand rounded-3xl p-8 text-white shadow-brand flex flex-col justify-center">
              <PlusCircle className="w-12 h-12 mb-4" />
              <h3 className="font-display text-2xl font-bold mb-2">Need more coins?</h3>
              <p className="font-body text-sm text-white/80 mb-6">Top up your balance to send gifts and support your favorite poets.</p>
              <button onClick={() => navigate('/gift-shop')} className="w-full py-3 bg-white text-primary rounded-xl font-bold uppercase text-xs tracking-widest hover:bg-white/90 transition-all">Buy Coins Now</button>
            </div>
          </div>
        )}

        {tab === "history" && (
          <div className="bg-card border border-border rounded-3xl overflow-hidden">
            <div className="p-6 border-b border-border bg-muted/30 flex items-center gap-2">
              <History className="w-5 h-5 text-primary" />
              <h3 className="font-display text-lg font-bold">Transaction History</h3>
            </div>
            <div className="divide-y divide-border">
              {transactions.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground font-body">No transactions yet.</div>
              ) : (
                transactions.map((tx) => (
                  <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-muted/20 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.is_purchase ? "bg-accent/10 text-accent" : "bg-primary/10 text-primary"}`}>
                        {tx.is_purchase ? <CreditCard className="w-5 h-5" /> : <DollarSign className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="font-body text-sm font-bold text-foreground">{tx.description || tx.transaction_type}</p>
                        <p className="font-body text-[10px] text-muted-foreground uppercase tracking-wider">{new Date(tx.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <p className={`font-display font-bold ${tx.is_purchase ? "text-accent" : "text-green-600"}`}>
                      {tx.is_purchase ? "" : "+"}${toDollars(tx.amount)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {tab === "withdraw" && (
          <div className="max-w-md mx-auto space-y-6">
            <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
              <h3 className="font-display text-xl font-bold mb-2">Withdraw Funds</h3>
              <p className="font-body text-sm text-muted-foreground mb-6">Minimum withdrawal is $5.00 (500 coins).</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block font-body text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Amount (USD)</label>
                  <input 
                    type="number" 
                    value={withdrawAmount} 
                    onChange={e => setWithdrawAmount(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border focus:ring-2 focus:ring-primary/20 outline-none font-display text-lg font-bold"
                    placeholder="0.00"
                  />
                </div>

                <div className="p-4 bg-muted/30 rounded-2xl space-y-2">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                    <span className="text-muted-foreground">Withdrawal Fee ({feePercent}%)</span>
                    <span className="text-destructive">-${feeAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold">
                    <span className="text-foreground">You Receive</span>
                    <span className="text-green-600">${finalAmount.toFixed(2)}</span>
                  </div>
                </div>

                <button className="w-full py-4 bg-primary text-white rounded-2xl font-bold uppercase text-xs tracking-widest shadow-brand hover:opacity-90 transition-all">Request Withdrawal</button>
              </div>
            </div>

            <div className="bg-accent/5 border border-accent/20 rounded-2xl p-4 flex gap-3">
              <div className="w-5 h-5 text-accent shrink-0">
                <Info className="w-full h-full" />
              </div>
              <div className="space-y-2">
                <p className="text-xs font-body text-foreground/80 leading-relaxed">
                  <strong>Tiered Fee System:</strong> We reward our verified creators with lower fees.
                </p>
                <div className="grid grid-cols-1 gap-1">
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase">
                    <BadgeCheck className="w-3 h-3 text-secondary" /> Blue Badge: 12% Fee
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-muted-foreground">
                    Standard: 15% Fee
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-muted-foreground">
                    New User (<30 days): 18% Fee
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Wallet;