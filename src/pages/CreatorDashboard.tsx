import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, Video, Users, Gift, Mic, Trophy, Wallet, PenLine, Heart, DollarSign, ShieldCheck, AlertTriangle } from "lucide-react";

const CreatorDashboard = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ books: 0, videos: 0, events: 0, competitions: 0, posts: 0, fanClubs: 0 });
  const [walletData, setWalletData] = useState<any>(null);
  const [referralCount, setReferralCount] = useState(0);
  const [watchMinutes, setWatchMinutes] = useState(0);
  const [monetizationEligible, setMonetizationEligible] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    const fetchAll = async () => {
      const [books, videos, events, comps, posts, clubs, wallet, refs, watchTime] = await Promise.all([
        supabase.from("books").select("id", { count: "exact", head: true }).eq("creator_id", user.id),
        supabase.from("videos").select("id", { count: "exact", head: true }).eq("creator_id", user.id),
        supabase.from("mushaira_events").select("id", { count: "exact", head: true }).eq("organizer_id", user.id),
        supabase.from("competitions").select("id", { count: "exact", head: true }).eq("organizer_id", user.id),
        supabase.from("poetry_posts").select("id", { count: "exact", head: true }).eq("creator_id", user.id),
        supabase.from("fan_clubs").select("id", { count: "exact", head: true }).eq("creator_id", user.id),
        supabase.from("creator_wallets").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("referrals").select("id", { count: "exact", head: true }).eq("inviter_id", user.id).eq("status", "accepted"),
        supabase.from("watch_time_tracking" as any).select("watch_seconds").eq("creator_id", user.id).gte("created_at", new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()),
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
      setReferralCount(refs.count || 0);
      const totalSeconds = ((watchTime.data as any[]) || []).reduce((sum: number, r: any) => sum + (r.watch_seconds || 0), 0);
      const mins = Math.round(totalSeconds / 60);
      setWatchMinutes(mins);
      setMonetizationEligible((profile?.followers_count || 0) >= 8000 && mins >= 400000);
    };
    fetchAll();
  }, [user, profile]);

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-28 pb-20 container mx-auto px-6 text-center">
          <p className="font-body text-muted-foreground">Loading dashboard...</p>
        </div>
        <Footer />
      </div>
    );
  }

  const statCards = [
    { icon: PenLine, label: "Poetry Posts", value: stats.posts, color: "text-secondary" },
    { icon: BookOpen, label: "Books", value: stats.books, color: "text-accent" },
    { icon: Video, label: "Videos", value: stats.videos, color: "text-secondary" },
    { icon: Mic, label: "Mushairas", value: stats.events, color: "text-accent" },
    { icon: Trophy, label: "Competitions", value: stats.competitions, color: "text-secondary" },
    { icon: Users, label: "Followers", value: profile.followers_count, color: "text-accent" },
    { icon: Gift, label: "Gifts Received", value: profile.total_gifts_received, color: "text-secondary" },
    { icon: Heart, label: "Fan Clubs", value: stats.fanClubs, color: "text-accent" },
  ];

  const quickActions = [
    { icon: PenLine, label: "Write Poetry", to: "/create-post" },
    { icon: BookOpen, label: "Upload Book", to: "/upload-book" },
    { icon: Video, label: "Upload Video", to: "/upload-video" },
    { icon: Mic, label: "Create Mushaira", to: "/create-mushaira" },
    { icon: Trophy, label: "Create Competition", to: "/create-competition" },
    { icon: Wallet, label: "View Wallet", to: "/wallet" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-28 pb-20 container mx-auto px-6 max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-1">
            Welcome back, <span className="text-gradient-gold">{profile.display_name || "Creator"}</span>
          </h1>
          <p className="font-body text-muted-foreground mb-8">Here's an overview of your creative journey.</p>
        </motion.div>

        {/* Monetization Eligibility */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className={`p-5 rounded-2xl border mb-6 ${monetizationEligible ? "bg-secondary/5 border-secondary/30" : "bg-card border-border"}`}>
          <div className="flex items-center gap-3 mb-3">
            {monetizationEligible ? <ShieldCheck className="w-6 h-6 text-secondary" /> : <AlertTriangle className="w-6 h-6 text-accent" />}
            <h3 className="font-display text-lg font-bold text-foreground">
              {monetizationEligible ? "Monetization Active ✓" : "Monetization Progress"}
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-body text-xs text-muted-foreground">Followers (8,000 needed)</p>
              <div className="w-full h-2 bg-muted rounded-full mt-1 overflow-hidden">
                <div className="h-full bg-secondary rounded-full" style={{ width: `${Math.min(((profile.followers_count || 0) / 8000) * 100, 100)}%` }} />
              </div>
              <p className="font-body text-xs text-foreground mt-1">{profile.followers_count.toLocaleString()} / 8,000</p>
            </div>
            <div>
              <p className="font-body text-xs text-muted-foreground">Watch Time (400K min in 60 days)</p>
              <div className="w-full h-2 bg-muted rounded-full mt-1 overflow-hidden">
                <div className="h-full bg-accent rounded-full" style={{ width: `${Math.min((watchMinutes / 400000) * 100, 100)}%` }} />
              </div>
              <p className="font-body text-xs text-foreground mt-1">{watchMinutes.toLocaleString()} / 400,000 min</p>
            </div>
          </div>
        </motion.div>

        {/* Wallet Summary */}
        {walletData && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="p-5 bg-card border border-border rounded-2xl mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-secondary" /> Earnings
              </h3>
              <Link to="/wallet" className="font-body text-sm text-secondary hover:underline">View Details →</Link>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="font-display text-xl font-bold text-foreground">${(walletData.available_balance / 100).toFixed(2)}</p>
                <p className="font-body text-xs text-muted-foreground">Available</p>
              </div>
              <div>
                <p className="font-display text-xl font-bold text-foreground">${(walletData.total_earnings / 100).toFixed(2)}</p>
                <p className="font-body text-xs text-muted-foreground">Total Earned</p>
              </div>
              <div>
                <p className="font-display text-xl font-bold text-foreground">{referralCount}</p>
                <p className="font-body text-xs text-muted-foreground">Referrals</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {statCards.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className="p-5 bg-card border border-border rounded-2xl">
              <s.icon className={`w-6 h-6 ${s.color} mb-2`} />
              <p className="font-display text-2xl font-bold text-foreground">{s.value}</p>
              <p className="font-body text-xs text-muted-foreground">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <h2 className="font-display text-xl font-bold text-foreground mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {quickActions.map((a) => (
              <Link key={a.label} to={a.to}
                className="flex flex-col items-center gap-2 p-6 bg-card border border-border rounded-2xl hover:border-secondary/40 transition-colors text-center">
                <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
                  <a.icon className="w-5 h-5 text-secondary" />
                </div>
                <span className="font-body text-sm font-medium text-foreground">{a.label}</span>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Profile link */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mt-10 text-center">
          <Link to="/profile" className="font-body text-sm text-secondary hover:underline">
            Edit your profile →
          </Link>
        </motion.div>
      </section>
      <Footer />
    </div>
  );
};

export default CreatorDashboard;
