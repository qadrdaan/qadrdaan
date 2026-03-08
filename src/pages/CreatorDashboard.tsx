import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, Video, Users, Gift, Plus, Mic, Trophy } from "lucide-react";

const CreatorDashboard = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ books: 0, videos: 0, events: 0, competitions: 0 });

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    const fetchStats = async () => {
      const [books, videos, events, comps] = await Promise.all([
        supabase.from("books").select("id", { count: "exact", head: true }).eq("creator_id", user.id),
        supabase.from("videos").select("id", { count: "exact", head: true }).eq("creator_id", user.id),
        supabase.from("mushaira_events").select("id", { count: "exact", head: true }).eq("organizer_id", user.id),
        supabase.from("competitions").select("id", { count: "exact", head: true }).eq("organizer_id", user.id),
      ]);
      setStats({
        books: books.count || 0,
        videos: videos.count || 0,
        events: events.count || 0,
        competitions: comps.count || 0,
      });
    };
    fetchStats();
  }, [user]);

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
    { icon: BookOpen, label: "Books", value: stats.books, color: "text-secondary" },
    { icon: Video, label: "Videos", value: stats.videos, color: "text-accent" },
    { icon: Mic, label: "Mushairas", value: stats.events, color: "text-secondary" },
    { icon: Trophy, label: "Competitions", value: stats.competitions, color: "text-accent" },
    { icon: Users, label: "Followers", value: profile.followers_count, color: "text-secondary" },
    { icon: Gift, label: "Gifts Received", value: profile.total_gifts_received, color: "text-accent" },
  ];

  const quickActions = [
    { icon: BookOpen, label: "Upload Book", to: "/upload-book" },
    { icon: Video, label: "Upload Video", to: "/upload-video" },
    { icon: Mic, label: "Create Mushaira", to: "/create-mushaira" },
    { icon: Trophy, label: "Create Competition", to: "/create-competition" },
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

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
          {statCards.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-5 bg-card border border-border rounded-2xl"
            >
              <s.icon className={`w-6 h-6 ${s.color} mb-2`} />
              <p className="font-display text-2xl font-bold text-foreground">{s.value}</p>
              <p className="font-body text-xs text-muted-foreground">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <h2 className="font-display text-xl font-bold text-foreground mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((a) => (
              <Link
                key={a.label}
                to={a.to}
                className="flex flex-col items-center gap-2 p-6 bg-card border border-border rounded-2xl hover:border-secondary/40 transition-colors text-center"
              >
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
