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
}

interface Withdrawal {
  id: string;
  amount: number;
  status: string;
  payment_method: string;
  created_at: string;
  processed_at: string | null;
}

const COIN_RATE = 100; // 100 coins = $1

const Wallet = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [tab, setTab] = useState<"overview" | "transactions" | "withdraw">("overview");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (user) {
      fetchWallet();
      fetchTransactions();
      fetchWithdrawals();
    }
  }, [user]);

  const fetchWallet = async () => {
    const { data } = await supabase
      .from("creator_wallets")
      .select("*")
      .eq("user_id", user!.id)
      .single();
    setWallet(data as WalletData | null);
    setLoading(false);
  };

  const fetchTransactions = async () => {
    const { data } = await supabase
      .from("wallet_transactions")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false })
      .limit(50);
    setTransactions((data as Transaction[]) || []);
  };

  const fetchWithdrawals = async () => {
    const { data } = await supabase
      .from("withdrawal_requests")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false });
    setWithdrawals((data as Withdrawal[]) || []);
  };

  const handleWithdraw = async () => {
    if (!user) return;
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount < 5) {
      toast.error("Minimum withdrawal is $5");
      return;
    }
    const coinAmount = amount * COIN_RATE;
    if (!wallet || coinAmount > wallet.available_balance) {
      toast.error("Insufficient balance");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("withdrawal_requests").insert({
      user_id: user.id,
      amount: coinAmount,
      payment_method: paymentMethod,
    });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Withdrawal request submitted!");
      setWithdrawAmount("");
      fetchWithdrawals();
      fetchWallet();
    }
    setSubmitting(false);
  };

  const toDollars = (coins: number) => (coins / COIN_RATE).toFixed(2);

  const statusIcon = (s: string) => {
    if (s === "completed") return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (s === "rejected") return <XCircle className="w-4 h-4 text-destructive" />;
    return <Clock className="w-4 h-4 text-secondary" />;
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 flex items-center justify-center">
          <p className="font-body text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const w = wallet || {
    total_earnings: 0, available_balance: 0, total_withdrawn: 0,
    gift_earnings: 0, book_earnings: 0, fan_club_earnings: 0, ad_earnings: 0,
  };

  const statCards = [
    { label: "Total Earnings", value: `$${toDollars(w.total_earnings)}`, icon: TrendingUp, color: "text-primary" },
    { label: "Available Balance", value: `$${toDollars(w.available_balance)}`, icon: WalletIcon, color: "text-green-500" },
    { label: "Total Withdrawn", value: `$${toDollars(w.total_withdrawn)}`, icon: ArrowDownToLine, color: "text-secondary" },
  ];

  const earningsBreakdown = [
    { label: "Gift Earnings (65%)", value: w.gift_earnings, icon: Gift },
    { label: "Book Sales (85%)", value: w.book_earnings, icon: BookOpen },
    { label: "Fan Club", value: w.fan_club_earnings, icon: DollarSign },
    { label: "Ad Revenue (65%)", value: w.ad_earnings, icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="h-48 bg-gradient-hero relative flex items-end">
        <div className="container mx-auto px-6 pb-6 relative z-10">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground">
            Wallet & Earnings
          </h1>
          <p className="font-body text-primary-foreground/80 mt-1">
            Track your earnings and manage withdrawals • 100 coins = $1
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-5xl">
        {/* Stat cards */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          {statCards.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-card rounded-2xl border border-border p-5"
            >
              <div className="flex items-center gap-3 mb-2">
                <s.icon className={`w-5 h-5 ${s.color}`} />
                <span className="font-body text-sm text-muted-foreground">{s.label}</span>
              </div>
              <p className="font-display text-2xl font-bold text-foreground">{s.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(["overview", "transactions", "withdraw"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg font-body text-sm font-semibold capitalize transition-colors ${
                tab === t
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {t === "withdraw" ? "Withdraw" : t}
            </button>
          ))}
        </div>

        {/* Overview */}
        {tab === "overview" && (
          <div className="bg-card rounded-2xl border border-border p-6">
            <h2 className="font-display text-xl font-bold text-foreground mb-4">
              Earnings Breakdown
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {earningsBreakdown.map((e) => (
                <div key={e.label} className="flex items-center justify-between p-4 bg-background rounded-xl border border-border">
                  <div className="flex items-center gap-3">
                    <e.icon className="w-4 h-4 text-secondary" />
                    <span className="font-body text-sm text-foreground">{e.label}</span>
                  </div>
                  <span className="font-display font-bold text-foreground">
                    ${toDollars(e.value)} <span className="text-xs text-muted-foreground">({e.value} coins)</span>
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-muted rounded-xl">
              <h3 className="font-display text-sm font-semibold text-foreground mb-2">Revenue Split</h3>
              <div className="grid grid-cols-2 gap-2 font-body text-sm text-muted-foreground">
                <p>• Gifts & Live: 65% creator / 35% platform</p>
                <p>• Book Sales: 85% creator / 15% platform</p>
                <p>• Ad Revenue: 65% creator / 35% platform</p>
                <p>• Event Bookings: 90% creator / 10% platform</p>
              </div>
            </div>
          </div>
        )}

        {/* Transactions */}
        {tab === "transactions" && (
          <div className="bg-card rounded-2xl border border-border p-6">
            <h2 className="font-display text-xl font-bold text-foreground mb-4">
              Transaction History
            </h2>
            {transactions.length === 0 ? (
              <p className="font-body text-sm text-muted-foreground">No transactions yet.</p>
            ) : (
              <div className="space-y-3">
                {transactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-3 bg-background rounded-xl border border-border">
                    <div>
                      <p className="font-body text-sm font-medium text-foreground">
                        {tx.description || tx.transaction_type.replace(/_/g, " ")}
                      </p>
                      <p className="font-body text-xs text-muted-foreground">
                        {new Date(tx.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="font-display font-bold text-green-600">
                      +${toDollars(tx.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Withdraw */}
        {tab === "withdraw" && (
          <div className="bg-card rounded-2xl border border-border p-6">
            <h2 className="font-display text-xl font-bold text-foreground mb-4">
              Request Withdrawal
            </h2>
            <div className="max-w-md space-y-4">
              <div>
                <label className="font-body text-sm font-semibold text-foreground block mb-1">
                  Amount (USD) — Minimum $5
                </label>
                <input
                  type="number"
                  min="5"
                  step="1"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="Enter amount in USD"
                  className="w-full px-4 py-2.5 rounded-lg bg-background border border-border text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
                {withdrawAmount && (
                  <p className="font-body text-xs text-muted-foreground mt-1">
                    = {parseFloat(withdrawAmount) * COIN_RATE || 0} coins
                  </p>
                )}
              </div>
              <div>
                <label className="font-body text-sm font-semibold text-foreground block mb-1">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-background border border-border text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="jazzcash">JazzCash</option>
                  <option value="easypaisa">Easypaisa</option>
                  <option value="paypal">PayPal</option>
                </select>
              </div>
              <button
                onClick={handleWithdraw}
                disabled={submitting}
                className="px-6 py-2.5 bg-primary text-primary-foreground font-body font-semibold text-sm rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Submit Withdrawal Request"}
              </button>
            </div>

            {/* Previous withdrawals */}
            {withdrawals.length > 0 && (
              <div className="mt-8">
                <h3 className="font-display text-lg font-semibold text-foreground mb-3">
                  Withdrawal History
                </h3>
                <div className="space-y-3">
                  {withdrawals.map((wd) => (
                    <div key={wd.id} className="flex items-center justify-between p-3 bg-background rounded-xl border border-border">
                      <div className="flex items-center gap-3">
                        {statusIcon(wd.status)}
                        <div>
                          <p className="font-body text-sm font-medium text-foreground capitalize">
                            {wd.payment_method.replace(/_/g, " ")}
                          </p>
                          <p className="font-body text-xs text-muted-foreground">
                            {new Date(wd.created_at).toLocaleDateString()} • {wd.status}
                          </p>
                        </div>
                      </div>
                      <span className="font-display font-bold text-foreground">
                        ${toDollars(wd.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Wallet;
