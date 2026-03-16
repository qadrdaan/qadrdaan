import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, Users, DollarSign, Flag, CheckCircle, XCircle, BadgeCheck, Megaphone } from "lucide-react";

interface CoinPurchase {
  id: string; user_id: string; amount: number; price: number; status: string;
  payment_method: string; created_at: string;
  profiles?: { display_name: string | null };
}

const AdminDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [purchases, setPurchases] = useState<CoinPurchase[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [violations, setViolations] = useState<any[]>([]);
  const [verificationRequests, setVerificationRequests] = useState<any[]>([]);
  const [platformStats, setPlatformStats] = useState({ users: 0, creators: 0, posts: 0, books: 0, videos: 0 });

  useEffect(() => { if (!authLoading && !user) navigate("/auth"); }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    const checkAdmin = async () => {
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle();
      if (!data) { toast.error("Access denied"); navigate("/"); return; }
      setIsAdmin(true);
      fetchAll();
    };
    checkAdmin();
  }, [user]);

  const fetchAll = async () => {
    setLoading(true);
    const [pRes, rRes, vRes, vrRes, uC, cC, pC, bC, viC] = await Promise.all([
      supabase.from("coin_purchases").select("*").order("created_at", { ascending: false }).limit(50),
      supabase.from("content_reports" as any).select("*").order("created_at", { ascending: false }).limit(50),
      supabase.from("user_violations").select("*").order("created_at", { ascending: false }).limit(50),
      supabase.from("verification_requests" as any).select("*").order("created_at", { ascending: false }).limit(50),
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("profiles").select("id", { count: "exact", head: true }).eq("is_creator", true),
      supabase.from("poetry_posts").select("id", { count: "exact", head: true }),
      supabase.from("books").select("id", { count: "exact", head: true }),
      supabase.from("videos").select("id", { count: "exact", head: true }),
    ]);
    const ids = new Set<string>();
    [pRes, rRes, vRes, vrRes].forEach((r) => (r.data || []).forEach((d: any) => {
      if (d.user_id) ids.add(d.user_id);
      if (d.reporter_id) ids.add(d.reporter_id);
      if (d.reported_user_id) ids.add(d.reported_user_id);
    }));
    const { data: profiles } = await supabase.from("profiles").select("user_id, display_name").in("user_id", Array.from(ids));
    const nm = new Map((profiles || []).map((p: any) => [p.user_id, p.display_name]));

    setPurchases((pRes.data || []).map((p: any) => ({ ...p, profiles: { display_name: nm.get(p.user_id) || null } })));
    setReports((rRes.data || []).map((r: any) => ({ ...r, reporter_name: nm.get(r.reporter_id), reported_name: nm.get(r.reported_user_id) })));
    setViolations((vRes.data || []).map((v: any) => ({ ...v, user_name: nm.get(v.user_id) })));
    setVerificationRequests((vrRes.data || []).map((v: any) => ({ ...v, user_name: nm.get(v.user_id) })));
    setPlatformStats({ users: uC.count || 0, creators: cC.count || 0, posts: pC.count || 0, books: bC.count || 0, videos: viC.count || 0 });
    setLoading(false);
  };

  const approvePurchase = async (p: CoinPurchase) => {
    await supabase.from("coin_purchases").update({ status: "completed" }).eq("id", p.id);
    const { data: bal } = await supabase.from("user_balances").select("coins").eq("user_id", p.user_id).maybeSingle();
    if (bal) await supabase.from("user_balances").update({ coins: bal.coins + p.amount }).eq("user_id", p.user_id);
    else await supabase.from("user_balances").insert({ user_id: p.user_id, coins: p.amount });
    toast.success("Approved"); fetchAll();
  };
  const rejectPurchase = async (p: CoinPurchase) => {
    await supabase.from("coin_purchases").update({ status: "rejected" }).eq("id", p.id);
    toast.success("Rejected"); fetchAll();
  };
  const reportAction = async (r: any, action: string) => {
    await supabase.from("content_reports" as any).update({ status: action, reviewed_at: new Date().toISOString() } as any).eq("id", r.id);
    toast.success(`Report ${action}`); fetchAll();
  };
  const handleVerif = async (v: any, ok: boolean) => {
    await supabase.from("verification_requests" as any).update({ status: ok ? "approved" : "rejected", reviewed_at: new Date().toISOString() } as any).eq("id", v.id);
    if (ok) await supabase.from("profiles").update({ is_verified: true }).eq("user_id", v.user_id);
    toast.success(ok ? "Approved" : "Rejected"); fetchAll();
  };

  if (authLoading || loading || !isAdmin) return (
    <div className="min-h-screen bg-background"><Navbar /><div className="pt-28 pb-20 container mx-auto px-6 text-center"><p className="font-body text-muted-foreground">Loading...</p></div><Footer /></div>
  );

  const pp = purchases.filter(p => p.status === "pending");
  const pr = reports.filter((r: any) => r.status === "pending");
  const pv = verificationRequests.filter((v: any) => v.status === "pending");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-28 pb-20 container mx-auto px-6 max-w-6xl">
        <h1 className="font-display text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
        <p className="font-body text-muted-foreground mb-8">Platform management & moderation</p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {[{ l: "Users", v: platformStats.users }, { l: "Creators", v: platformStats.creators }, { l: "Posts", v: platformStats.posts }, { l: "Books", v: platformStats.books }, { l: "Videos", v: platformStats.videos }].map(s => (
            <div key={s.l} className="p-4 bg-card border border-border rounded-xl text-center">
              <p className="font-display text-2xl font-bold text-foreground">{s.v}</p>
              <p className="font-body text-xs text-muted-foreground">{s.l}</p>
            </div>
          ))}
        </div>
        <Tabs defaultValue="reports">
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="reports" className="gap-1 text-xs"><Flag className="w-3.5 h-3.5" />Reports{pr.length > 0 && <span className="ml-1 px-1.5 py-0.5 bg-destructive text-destructive-foreground rounded-full text-xs">{pr.length}</span>}</TabsTrigger>
            <TabsTrigger value="verification" className="gap-1 text-xs"><BadgeCheck className="w-3.5 h-3.5" />Verify{pv.length > 0 && <span className="ml-1 px-1.5 py-0.5 bg-accent text-accent-foreground rounded-full text-xs">{pv.length}</span>}</TabsTrigger>
            <TabsTrigger value="purchases" className="gap-1 text-xs"><DollarSign className="w-3.5 h-3.5" />Purchases{pp.length > 0 && <span className="ml-1 px-1.5 py-0.5 bg-secondary text-secondary-foreground rounded-full text-xs">{pp.length}</span>}</TabsTrigger>
            <TabsTrigger value="violations" className="gap-1 text-xs"><AlertTriangle className="w-3.5 h-3.5" />Violations</TabsTrigger>
          </TabsList>

          <TabsContent value="reports"><div className="space-y-3">
            {reports.length === 0 ? <p className="font-body text-muted-foreground text-center py-10">No reports</p> : reports.map((r: any) => (
              <motion.div key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 bg-card border border-border rounded-xl">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex gap-2 flex-wrap mb-1">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-body ${r.status === "pending" ? "bg-accent/20 text-accent" : r.status === "action_taken" ? "bg-destructive/20 text-destructive" : "bg-muted text-muted-foreground"}`}>{r.status}</span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-body bg-muted text-muted-foreground">{r.content_type}</span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-body bg-muted text-muted-foreground">{r.reason}</span>
                    </div>
                    <p className="font-body text-sm text-foreground">By: {r.reporter_name || "?"} → {r.reported_name || "?"}</p>
                    {r.description && <p className="font-body text-xs text-muted-foreground mt-1">{r.description}</p>}
                  </div>
                  {r.status === "pending" && <div className="flex gap-2 shrink-0">
                    <button onClick={() => reportAction(r, "action_taken")} className="px-3 py-1.5 text-xs font-body font-semibold bg-destructive text-destructive-foreground rounded-lg">Action</button>
                    <button onClick={() => reportAction(r, "dismissed")} className="px-3 py-1.5 text-xs font-body font-semibold bg-muted text-muted-foreground rounded-lg">Dismiss</button>
                  </div>}
                </div>
              </motion.div>
            ))}
          </div></TabsContent>

          <TabsContent value="verification"><div className="space-y-3">
            {verificationRequests.length === 0 ? <p className="font-body text-muted-foreground text-center py-10">No requests</p> : verificationRequests.map((v: any) => (
              <motion.div key={v.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 bg-card border border-border rounded-xl">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-body ${v.status === "pending" ? "bg-accent/20 text-accent" : v.status === "approved" ? "bg-secondary/20 text-secondary" : "bg-destructive/20 text-destructive"}`}>{v.status}</span>
                    <p className="font-body text-sm font-semibold text-foreground mt-1">{v.full_name}</p>
                    <p className="font-body text-xs text-muted-foreground">User: {v.user_name || v.user_id}</p>
                    <p className="font-body text-sm text-foreground mt-1">{v.reason}</p>
                    {v.portfolio_links && <p className="font-body text-xs text-secondary mt-1">{v.portfolio_links}</p>}
                  </div>
                  {v.status === "pending" && <div className="flex gap-2 shrink-0">
                    <button onClick={() => handleVerif(v, true)} className="px-3 py-1.5 text-xs font-body font-semibold bg-secondary text-secondary-foreground rounded-lg flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" />Approve</button>
                    <button onClick={() => handleVerif(v, false)} className="px-3 py-1.5 text-xs font-body font-semibold bg-muted text-muted-foreground rounded-lg flex items-center gap-1"><XCircle className="w-3.5 h-3.5" />Reject</button>
                  </div>}
                </div>
              </motion.div>
            ))}
          </div></TabsContent>

          <TabsContent value="purchases"><div className="space-y-3">
            {purchases.length === 0 ? <p className="font-body text-muted-foreground text-center py-10">No purchases</p> : purchases.map(p => (
              <motion.div key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-4 p-4 bg-card border border-border rounded-xl">
                <div className="flex-1">
                  <p className="font-body text-sm font-semibold text-foreground">{p.profiles?.display_name || "Unknown"}</p>
                  <p className="font-body text-xs text-muted-foreground">{p.amount} coins · ${p.price} · {p.payment_method}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-body ${p.status === "pending" ? "bg-accent/20 text-accent" : p.status === "completed" ? "bg-secondary/20 text-secondary" : "bg-destructive/20 text-destructive"}`}>{p.status}</span>
                {p.status === "pending" && <div className="flex gap-2">
                  <button onClick={() => approvePurchase(p)} className="px-3 py-1.5 text-xs font-body font-semibold bg-secondary text-secondary-foreground rounded-lg">Approve</button>
                  <button onClick={() => rejectPurchase(p)} className="px-3 py-1.5 text-xs font-body font-semibold bg-muted text-muted-foreground rounded-lg">Reject</button>
                </div>}
              </motion.div>
            ))}
          </div></TabsContent>

          <TabsContent value="violations"><div className="space-y-3">
            {violations.length === 0 ? <p className="font-body text-muted-foreground text-center py-10">No violations</p> : violations.map((v: any) => (
              <motion.div key={v.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 bg-card border border-border rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-body ${v.action_taken === "permanent_ban" ? "bg-destructive/20 text-destructive" : v.action_taken === "temp_suspension" ? "bg-accent/20 text-accent" : "bg-muted text-muted-foreground"}`}>{v.action_taken}</span>
                  <span className="text-xs font-body text-muted-foreground">Strike #{v.strike_number}</span>
                </div>
                <p className="font-body text-sm text-foreground">{v.user_name || v.user_id}</p>
                <p className="font-body text-xs text-muted-foreground">{v.content_type} · {v.violation_type}</p>
                {v.ai_reason && <p className="font-body text-xs text-muted-foreground mt-1">{v.ai_reason}</p>}
              </motion.div>
            ))}
          </div></TabsContent>
        </Tabs>
      </section>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
