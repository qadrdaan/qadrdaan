import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  BookOpen, Video, Users, Gift, Mic, Trophy, Wallet, 
  PenLine, Heart, DollarSign, ShieldCheck, AlertTriangle,
  ArrowUpRight, MessageCircle, Star, Clock
} from "lucide-react";

const CreatorDashboard = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ books: 0, videos: 0, events: 0, competitions: 0, posts: 0, fanClubs: 0 });
  const [walletData, setWalletData] = useState<any>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [watchMinutes, setWatchMinutes] = useState(0);
  const [monetizationEligible, setMonetizationEligible] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    const fetchAll = async () => {
      const [books, videos, events, comps, posts, clubs, wallet, watchTime, notifications] = await Promise.all([
        supabase.from("books").select("id", { count: "exact", head: true }).eq("creator_id", user.id),
        supabase.from("videos").select("id", { count: "exact", head: true }).eq("creator_id", user.id),
        supabase.from("mushaira_events").select("id", { count: "exact", head: true }).eq("organizer_id", user.id),
        supabase.from("competitions").select("id", { count: "exact", head: true }).eq("organizer_id", user.id),
        supabase.from("poetry_posts").select("id", { count: "exact", head: true }).eq("creator_id", user.id),
        supabase.from("fan_clubs").select("id", { count: "exact", head: true }).eq("creator_id", user.id),
        supabase.from("creator_wallets").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("watch_time_tracking" as any).select("watch_seconds").eq("creator_id", user.id).gte("created_at", new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()),
        supabase.from("notifications").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(5)
      ]);

      setStats({
        books: books.count || 0,
        videos: videos.count || 0,
        events: events.count || 0,
        competitions: comps.count || 0,
        posts: posts.count || 0,
        fanClubs: clubs.count || 0,
      });
      setWalletData(wallet.data);
      setRecentActivity(notifications.data || []);
      
      const totalSeconds = ((watchTime.data as any[]) || []).reduce((sum: number, r: any) => sum + (r.watch_seconds || 0), 0);
      const mins = Math.round(totalSeconds / 60);
      setWatchMinutes(mins);
      setMonetizationEligible((profile?.followers_count || 0) >= 8000 && mins >= 400000);
    };
    fetchAll();
  }, [user, profile]);

  if (loading || !profile) return null;

  const statCards = [
    { icon: PenLine, label: "Posts", value: stats.posts, color: "text-primary" },
    { icon: BookOpen, label: "Books", value: stats.books, color: "text-secondary" },
    { icon: Video, label: "Videos", value: stats.videos, color: "text-accent" },
    { icon: Users, label: "Followers", value: profile.followers_count, color: "text-primary" },
  ];

  const quickActions = [
    { icon: PenLine, label: "Write Poetry", to: "/create-post", color: "bg-primary/10 text-primary" },
    { icon: BookOpen, label: "Upload Book", to: "/upload-book", color: "bg-secondary/10 text-secondary" },
    { icon: Video, label: "Upload Video", to: "/upload-video", color: "bg-accent/10 text-accent" },
    { icon: Mic, label: "Host Mushaira", to: "/create-mushaira", color: "bg-primary/10 text-primary" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-28 pb-20 container mx-auto px-6 max-w-6xl">
        <div className="grid lg:grid-cols-[1fr_320px] gap-8">
          <div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-1">
                Creator <span className="text-gradient-brand">Dashboard</span>
              </h1>
              <p className="font-body text-muted-foreground">Manage your literary empire and track your growth.</p>
            </motion.div>

            {/* Monetization Progress */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className={`p-6 rounded-3xl border mb-8 ${monetizationEligible ? "bg-secondary/5 border-secondary/30" : "bg-card border-border shadow-sm"}`}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  {monetizationEligible ? <ShieldCheck className="w-8 h-8 text-secondary" /> : <Star className="w-8 h-8 text-accent" />}
                  <div>
                    <h3 className="font-display text-xl font-bold text-foreground">
                      {monetizationEligible ? "Monetization Active ✓" : "Monetization Progress"}
                    </h3>
                    <p className="font-body text-xs text-muted-foreground">Reach these milestones to start earning from ads.</p>
                  </div>
                </div>
                {!monetizationEligible && <span className="px-3 py-1 rounded-full bg-accent/10 text-accent text-[10px] font-bold uppercase">In Progress</span>}
              </div>
              
              <div className="grid sm:grid-cols-2 gap-8">
                <div>
                  <div className="flex justify-between mb-2">
                    <p className="font-body text-xs font-bold text-foreground uppercase tracking-wider">Followers</p>
                    <p className="font-body text-xs font-bold text-primary">{profile.followers_count.toLocaleString()} / 8,000</p>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${Math.min(((profile.followers_count || 0) / 8000) * 100, 100)}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <p className="font-body text-xs font-bold text-foreground uppercase tracking-wider">Watch Time (60d)</p>
                    <p className="font-body text-xs font-bold text-secondary">{watchMinutes.toLocaleString()} / 400,000 min</p>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-secondary rounded-full transition-all duration-1000" style={{ width: `${Math.min((watchMinutes / 400000) * 100, 100)}%` }} />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              {statCards.map((s, i) => (
                <motion.div key={s.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="p-6 bg-card border border-border rounded-3xl shadow-sm hover:shadow-md transition-shadow">
                  <s.icon className={`w-6 h-6 ${s.color} mb-3`} />
                  <p className="font-display text-2xl font-bold text-foreground">{s.value}</p>
                  <p className="font-body text-xs font-bold text-muted-foreground uppercase tracking-widest">{s.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Quick Actions */}
            <h2 className="font-display text-xl font-bold text-foreground mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              {quickActions.map((a, i) => (
                <Link key={a.label} to={a.to}
                  className="flex flex-col items-center gap-3 p-6 bg-card border border-border rounded-3xl hover:border-primary/30 transition-all hover:shadow-sm text-center group">
                  <div className={`w-12 h-12 rounded-2xl ${a.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <a.icon className="w-6 h-6" />
                  </div>
                  <span className="font-body text-xs font-bold text-foreground uppercase tracking-tighter">{a.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Wallet Summary */}
            <div className="p-6 bg-gradient-brand rounded-3xl text-white shadow-brand">
              <div className="flex items-center justify-between mb-4">
                <Wallet className="w-6 h-6" />
                <Link to="/wallet" className="p-1.5 bg-white/20 rounded-lg hover:bg-white/30 transition-colors">
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
              <p className="font-body text-xs font-bold uppercase tracking-widest opacity-80">Available Balance</p>
              <p className="font-display text-3xl font-bold mt-1">
                ${walletData ? (walletData.available_balance / 100).toFixed(2) : "0.00"}
              </p>
              <div className="mt-6 pt-6 border-t border-white/10 flex justify-between items-center">
                <div className="text-center">
                  <p className="font-display text-lg font-bold">{stats.fanClubs}</p>
                  <p className="font-body text-[10px] uppercase font-bold opacity-70">Clubs</p>
                </div>
                <div className="text-center">
                  <p className="font-display text-lg font-bold">{profile.total_gifts_received}</p>
                  <p className="font-body text-[10px] uppercase font-bold opacity-70">Gifts</p>
                </div>
                <div className="text-center">
                  <p className="font-display text-lg font-bold">{stats.events}</p>
                  <p className="font-body text-[10px] uppercase font-bold opacity-70">Events</p>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
              <h3 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" /> Activity
              </h3>
              <div className="space-y-4">
                {recentActivity.length === 0 ? (
                  <p className="font-body text-xs text-muted-foreground text-center py-4">No recent activity.</p>
                ) : (
                  recentActivity.map((act) => (
                    <div key={act.id} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                        {act.type === 'like' ? <Heart className="w-4 h-4 text-secondary" /> : 
                         act.type === 'gift' ? <Gift className="w-4 h-4 text-accent" /> : 
                         <MessageCircle className="w-4 h-4 text-primary" />}
                      </div>
                      <div className="min-w-0">
                        <p className="font-body text-xs text-foreground leading-tight">
                          <span className="font-bold">{act.title}</span> {act.message}
                        </p>
                        <p className="font-body text-[10px] text-muted-foreground mt-0.5">{new Date(act.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <Link to="/notifications" className="block text-center mt-6 font-body text-[10px] font-bold text-primary hover:underline uppercase tracking-widest">View All Activity</Link>
            </div>
          </aside>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default CreatorDashboard;