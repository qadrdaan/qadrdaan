import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, Users, DollarSign, Flag, CheckCircle, XCircle, BadgeCheck, Megaphone, Sparkles, PenLine } from "lucide-react";

const AdminDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<any[]>([]);
  const [verificationRequests, setVerificationRequests] = useState<any[]>([]);
  const [recentPosts, setRecentPosts] = useState<any[]>([]);
  const [platformStats, setPlatformStats] = useState({ users: 0, creators: 0, posts: 0, totalAdSpend: 0 });

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
    const [rRes, vrRes, pRes, uC, cC, poC, adSpend] = await Promise.all([
      supabase.from("content_reports" as any).select("*, profiles:reporter_id(display_name)").order("created_at", { ascending: false }).limit(20),
      supabase.from("verification_requests" as any).select("*, profiles:user_id(display_name)").order("created_at", { ascending: false }).limit(20),
      supabase.from("poetry_posts").select("*, profiles:creator_id(display_name)").order("created_at", { ascending: false }).limit(20),
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("profiles").select("id", { count: "exact", head: true }).eq("is_creator", true),
      supabase.from("poetry_posts").select("id", { count: "exact", head: true }),
      supabase.from("ad_campaigns").select("total_spent"),
    ]);

    setReports(rRes.data || []);
    setVerificationRequests(vrRes.data || []);
    setRecentPosts(pRes.data || []);
    const totalAdSpend = ((adSpend.data as any[]) || []).reduce((s: number, c: any) => s + (c.total_spent || 0), 0);
    setPlatformStats({ users: uC.count || 0, creators: cC.count || 0, posts: poC.count || 0, totalAdSpend });
    setLoading(false);
  };

  const handleVerification = async (id: string, userId: string, status: 'approved' | 'rejected') => {
    const { error } = await supabase.from("verification_requests" as any).update({ status, reviewed_at: new Date().toISOString() } as any).eq("id", id);
    if (error) return toast.error("Failed to update request");
    
    if (status === 'approved') {
      await supabase.from("profiles").update({ is_verified: true }).eq("user_id", userId);
    }
    
    toast.success(`Request ${status}`);
    fetchAll();
  };

  const resolveReport = async (id: string) => {
    const { error } = await supabase.from("content_reports" as any).update({ status: 'resolved', reviewed_at: new Date().toISOString() } as any).eq("id", id);
    if (error) toast.error("Failed to resolve");
    else { toast.success("Report resolved"); fetchAll(); }
  };

  const toggleEditorPick = async (postId: string, currentStatus: boolean) => {
    const { error } = await supabase.from("poetry_posts").update({ is_editor_pick: !currentStatus }).eq("id", postId);
    if (error) toast.error("Failed to update");
    else {
      toast.success(currentStatus ? "Removed from Picks" : "Added to Editor Picks!");
      setRecentPosts(prev => prev.map(p => p.id === postId ? { ...p, is_editor_pick: !currentStatus } : p));
    }
  };

  if (authLoading || loading || !isAdmin) return <div className="min-h-screen bg-background"><Navbar /><div className="pt-28 text-center"><p className="font-body text-muted-foreground">Loading Admin...</p></div></div>;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-28 pb-20 container mx-auto px-6 max-w-6xl">
        <h1 className="font-display text-3xl font-bold text-foreground mb-8">Admin Dashboard</h1>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { l: "Total Users", v: platformStats.users, i: Users },
            { l: "Creators", v: platformStats.creators, i: PenLine },
            { l: "Poetry Posts", v: platformStats.posts, i: Sparkles },
            { l: "Ad Revenue", v: `$${platformStats.totalAdSpend.toFixed(2)}`, i: DollarSign },
          ].map(s => (
            <div key={s.l} className="p-5 bg-card border border-border rounded-2xl">
              <s.i className="w-5 h-5 text-secondary mb-2" />
              <p className="font-display text-2xl font-bold text-foreground">{s.v}</p>
              <p className="font-body text-xs text-muted-foreground">{s.l}</p>
            </div>
          ))}
        </div>

        <Tabs defaultValue="reports">
          <TabsList className="bg-muted/50 p-1 rounded-xl mb-6">
            <TabsTrigger value="reports" className="gap-2 text-xs font-bold uppercase"><Flag className="w-3.5 h-3.5" /> Reports</TabsTrigger>
            <TabsTrigger value="verification" className="gap-2 text-xs font-bold uppercase"><BadgeCheck className="w-3.5 h-3.5" /> Verification</TabsTrigger>
            <TabsTrigger value="picks" className="gap-2 text-xs font-bold uppercase"><Sparkles className="w-3.5 h-3.5" /> Editor Picks</TabsTrigger>
          </TabsList>

          <TabsContent value="reports">
            <div className="space-y-4">
              {reports.length === 0 ? <p className="text-center py-10 font-body text-muted-foreground">No active reports.</p> : reports.map((r) => (
                <div key={r.id} className="bg-card border border-border rounded-2xl p-5 flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 bg-destructive/10 text-destructive text-[10px] font-bold rounded-full uppercase">{r.reason}</span>
                      <span className="text-xs font-body text-muted-foreground">Reported by {(r.profiles as any)?.display_name}</span>
                    </div>
                    <p className="font-body text-sm text-foreground line-clamp-1">{r.description || "No additional details provided."}</p>
                  </div>
                  {r.status === 'pending' && (
                    <button onClick={() => resolveReport(r.id)} className="px-4 py-2 bg-muted text-foreground rounded-xl text-xs font-bold uppercase hover:bg-muted/80 transition-all">Resolve</button>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="verification">
            <div className="space-y-4">
              {verificationRequests.length === 0 ? <p className="text-center py-10 font-body text-muted-foreground">No pending requests.</p> : verificationRequests.map((vr) => (
                <div key={vr.id} className="bg-card border border-border rounded-2xl p-5 flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-display font-bold text-foreground">{(vr.profiles as any)?.display_name}</h3>
                    <p className="font-body text-xs text-muted-foreground line-clamp-1">{vr.reason}</p>
                  </div>
                  {vr.status === 'pending' && (
                    <div className="flex gap-2">
                      <button onClick={() => handleVerification(vr.id, vr.user_id, 'approved')} className="p-2 bg-green-500/10 text-green-600 rounded-xl hover:bg-green-500/20 transition-all"><CheckCircle className="w-5 h-5" /></button>
                      <button onClick={() => handleVerification(vr.id, vr.user_id, 'rejected')} className="p-2 bg-destructive/10 text-destructive rounded-xl hover:bg-destructive/20 transition-all"><XCircle className="w-5 h-5" /></button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="picks">
            <div className="space-y-4">
              {recentPosts.map((post) => (
                <div key={post.id} className="bg-card border border-border rounded-2xl p-5 flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-display font-bold text-foreground truncate">{post.title}</h3>
                      {post.is_editor_pick && <span className="px-2 py-0.5 bg-accent/20 text-accent text-[10px] font-bold rounded-full uppercase">Pick</span>}
                    </div>
                    <p className="font-body text-xs text-muted-foreground">By {(post.profiles as any)?.display_name || "Unknown"} · {post.category}</p>
                  </div>
                  <button
                    onClick={() => toggleEditorPick(post.id, post.is_editor_pick)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${post.is_editor_pick ? "bg-muted text-foreground" : "bg-accent text-white shadow-lg shadow-accent/20"}`}
                  >
                    {post.is_editor_pick ? "Remove Pick" : "Make Pick"}
                  </button>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </section>
      <Footer />
    </div>
  );
};

export default AdminDashboard;