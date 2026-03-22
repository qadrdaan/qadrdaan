import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Play, Pause, Trash2, BarChart3, DollarSign, Eye, MousePointer, TrendingUp, Wallet } from "lucide-react";

interface Campaign {
  id: string;
  name: string;
  ad_type: string;
  pricing_model: string;
  status: string;
  daily_budget: number;
  lifetime_budget: number | null;
  bid_amount: number;
  impressions_count: number;
  clicks_count: number;
  conversions_count: number;
  total_spent: number;
  quality_score: number;
  start_date: string;
  end_date: string | null;
  created_at: string;
}

const AdsManager = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [balance, setBalance] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [depositAmount, setDepositAmount] = useState("10");

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [authLoading, user, navigate]);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const [campaignsRes, balanceRes] = await Promise.all([
      supabase.from("ad_campaigns" as any).select("*").eq("advertiser_id", user.id).order("created_at", { ascending: false }),
      supabase.from("advertiser_balances" as any).select("*").eq("user_id", user.id).single(),
    ]);
    setCampaigns((campaignsRes.data as any[]) || []);
    if (balanceRes.data) {
      setBalance((balanceRes.data as any).balance || 0);
      setTotalSpent((balanceRes.data as any).total_spent || 0);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDeposit = async () => {
    if (!user) return;
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount < 5) { toast.error("Minimum deposit is $5"); return; }

    // Upsert balance
    const { error } = await supabase.from("advertiser_balances" as any).upsert({
      user_id: user.id,
      balance: balance + amount,
      total_deposited: (balance + amount),
    } as any, { onConflict: "user_id" });

    if (!error) {
      await supabase.from("ad_transactions" as any).insert({
        user_id: user.id,
        amount,
        transaction_type: "deposit",
        description: `Deposited $${amount.toFixed(2)}`,
      } as any);
      toast.success(`$${amount.toFixed(2)} added to ad balance`);
      fetchData();
    } else {
      toast.error("Failed to deposit");
    }
  };

  const toggleCampaign = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "paused" : currentStatus === "paused" ? "active" : currentStatus;
    await supabase.from("ad_campaigns" as any).update({ status: newStatus } as any).eq("id", id);
    toast.success(`Campaign ${newStatus}`);
    fetchData();
  };

  const deleteCampaign = async (id: string) => {
    await supabase.from("ad_campaigns" as any).delete().eq("id", id);
    toast.success("Campaign deleted");
    fetchData();
  };

  const totalImpressions = campaigns.reduce((s, c) => s + c.impressions_count, 0);
  const totalClicks = campaigns.reduce((s, c) => s + c.clicks_count, 0);
  const avgCTR = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : "0.00";

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-28 pb-20 container mx-auto px-6 text-center">
          <p className="font-body text-muted-foreground">Loading...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-28 pb-20 container mx-auto px-6 max-w-5xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Ads Manager</h1>
            <p className="font-body text-muted-foreground mt-1">Promote your content on Qadrdaan</p>
          </div>
          <button
            onClick={() => navigate("/create-ad")}
            className="flex items-center gap-2 px-6 py-2.5 font-body font-bold text-xs uppercase tracking-widest bg-primary text-white rounded-xl shadow-brand hover:opacity-90 transition-all"
          >
            <Plus className="w-4 h-4" /> Create Ad
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {[
            { label: "Balance", value: `$${balance.toFixed(2)}`, icon: Wallet, color: "text-accent" },
            { label: "Total Spent", value: `$${totalSpent.toFixed(2)}`, icon: DollarSign, color: "text-secondary" },
            { label: "Impressions", value: totalImpressions.toLocaleString(), icon: Eye, color: "text-primary" },
            { label: "Clicks", value: totalClicks.toLocaleString(), icon: MousePointer, color: "text-foreground" },
            { label: "CTR", value: `${avgCTR}%`, icon: TrendingUp, color: "text-accent" },
          ].map((s) => (
            <div key={s.label} className="bg-card border border-border rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <s.icon className={`w-4 h-4 ${s.color}`} />
                <span className="font-body text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{s.label}</span>
              </div>
              <p className={`font-display text-xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        <Tabs defaultValue="campaigns">
          <TabsList className="bg-muted/50 p-1 rounded-xl mb-6">
            <TabsTrigger value="campaigns" className="text-xs font-bold uppercase">Campaigns</TabsTrigger>
            <TabsTrigger value="billing" className="text-xs font-bold uppercase">Billing</TabsTrigger>
          </TabsList>

          <TabsContent value="campaigns">
            {campaigns.length === 0 ? (
              <div className="text-center py-20 bg-card border border-dashed border-border rounded-3xl">
                <BarChart3 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="font-display text-xl font-bold text-foreground mb-2">No campaigns yet</h3>
                <p className="font-body text-sm text-muted-foreground mb-6">Create your first ad to reach the Qadrdaan community</p>
                <button onClick={() => navigate("/create-ad")} className="px-8 py-3 font-body font-bold text-xs uppercase tracking-widest bg-primary text-white rounded-xl shadow-brand">
                  Create Campaign
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {campaigns.map((c) => {
                  const ctr = c.impressions_count > 0 ? ((c.clicks_count / c.impressions_count) * 100).toFixed(2) : "0.00";
                  return (
                    <div key={c.id} className="bg-card border border-border rounded-2xl p-6 flex flex-col md:flex-row md:items-center gap-6 shadow-sm">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-display text-lg font-bold text-foreground">{c.name}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            c.status === "active" ? "bg-green-500/10 text-green-600" :
                            c.status === "paused" ? "bg-muted text-muted-foreground" :
                            c.status === "pending_review" ? "bg-accent/10 text-accent" :
                            c.status === "rejected" ? "bg-destructive/10 text-destructive" :
                            "bg-muted text-muted-foreground"
                          }`}>
                            {c.status.replace("_", " ")}
                          </span>
                        </div>
                        <p className="font-body text-xs text-muted-foreground">
                          {c.ad_type.replace("_", " ")} · {c.pricing_model.toUpperCase()} · ${c.bid_amount} bid · ${c.daily_budget}/day
                        </p>
                      </div>
                      <div className="flex items-center gap-8 text-sm font-body">
                        <div className="text-center">
                          <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider mb-1">Impr.</p>
                          <p className="font-bold text-foreground">{c.impressions_count}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider mb-1">Clicks</p>
                          <p className="font-bold text-foreground">{c.clicks_count}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider mb-1">CTR</p>
                          <p className="font-bold text-accent">{ctr}%</p>
                        </div>
                        <div className="text-center">
                          <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider mb-1">Spent</p>
                          <p className="font-bold text-secondary">${c.total_spent.toFixed(2)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {(c.status === "active" || c.status === "paused") && (
                          <button onClick={() => toggleCampaign(c.id, c.status)} className="p-2.5 rounded-xl hover:bg-muted transition-colors text-muted-foreground hover:text-foreground border border-border">
                            {c.status === "active" ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          </button>
                        )}
                        {c.status === "draft" && (
                          <button onClick={() => deleteCampaign(c.id)} className="p-2.5 rounded-xl hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive border border-border">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="billing">
            <div className="bg-card border border-border rounded-3xl p-8 max-w-md shadow-sm">
              <h3 className="font-display text-xl font-bold text-foreground mb-4">Add Funds</h3>
              <p className="font-body text-sm text-muted-foreground mb-6">
                Deposit funds to your advertising balance. Minimum $5.
              </p>
              <div className="flex gap-2 mb-6">
                {["5", "10", "25", "50", "100"].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setDepositAmount(amt)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                      depositAmount === amt ? "bg-primary text-white shadow-brand" : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    ${amt}
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <input
                  type="number"
                  min="5"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-xl border border-border bg-background font-body text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="Amount"
                />
                <button
                  onClick={handleDeposit}
                  className="px-6 py-3 font-body font-bold text-xs uppercase tracking-widest bg-accent text-white rounded-xl hover:opacity-90 transition-opacity shadow-brand"
                >
                  Deposit
                </button>
              </div>
              <p className="font-body text-[10px] text-muted-foreground mt-6 leading-relaxed">
                Payment processing via Stripe/PayPal coming soon. Manual deposits are reviewed and approved by the admin team within 24 hours.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </section>
      <Footer />
    </div>
  );
};

export default AdsManager;