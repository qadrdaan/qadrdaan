import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { BarChart3, TrendingUp, Users, Gift, BookOpen, Video, Eye, Heart } from "lucide-react";

const CreatorAnalytics = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ books: 0, videos: 0, posts: 0, totalViews: 0, totalLikes: 0, totalDownloads: 0 });
  const [recentVideos, setRecentVideos] = useState<any[]>([]);
  const [recentBooks, setRecentBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (!authLoading && !user) navigate("/auth"); }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const [books, videos, posts, vids, bks] = await Promise.all([
        supabase.from("books").select("id", { count: "exact", head: true }).eq("creator_id", user.id),
        supabase.from("videos").select("id", { count: "exact", head: true }).eq("creator_id", user.id),
        supabase.from("poetry_posts").select("id", { count: "exact", head: true }).eq("creator_id", user.id),
        supabase.from("videos").select("id, title, views_count, likes_count, created_at").eq("creator_id", user.id).order("created_at", { ascending: false }).limit(5),
        supabase.from("books").select("id, title, downloads_count, created_at").eq("creator_id", user.id).order("created_at", { ascending: false }).limit(5),
      ]);

      const totalViews = (vids.data || []).reduce((s: number, v: any) => s + v.views_count, 0);
      const totalLikes = (vids.data || []).reduce((s: number, v: any) => s + v.likes_count, 0);
      const totalDownloads = (bks.data || []).reduce((s: number, b: any) => s + b.downloads_count, 0);

      setStats({ books: books.count || 0, videos: videos.count || 0, posts: posts.count || 0, totalViews, totalLikes, totalDownloads });
      setRecentVideos(vids.data || []);
      setRecentBooks(bks.data || []);
      setLoading(false);
    };
    fetch();
  }, [user]);

  if (authLoading || loading) return <div className="min-h-screen bg-background"><Navbar /><p className="pt-28 text-center font-body text-muted-foreground">Loading analytics...</p><Footer /></div>;

  const cards = [
    { icon: BookOpen, label: "Books", value: stats.books, color: "text-secondary" },
    { icon: Video, label: "Videos", value: stats.videos, color: "text-accent" },
    { icon: BarChart3, label: "Posts", value: stats.posts, color: "text-secondary" },
    { icon: Users, label: "Followers", value: profile?.followers_count || 0, color: "text-accent" },
    { icon: Eye, label: "Total Views", value: stats.totalViews, color: "text-secondary" },
    { icon: Heart, label: "Total Likes", value: stats.totalLikes, color: "text-accent" },
    { icon: TrendingUp, label: "Downloads", value: stats.totalDownloads, color: "text-secondary" },
    { icon: Gift, label: "Gifts Received", value: profile?.total_gifts_received || 0, color: "text-accent" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-28 pb-20 container mx-auto px-6 max-w-5xl">
        <div className="flex items-center gap-3 mb-2">
          <BarChart3 className="w-7 h-7 text-secondary" />
          <h1 className="font-display text-3xl font-bold text-foreground">Creator Analytics</h1>
        </div>
        <p className="font-body text-muted-foreground mb-8">Detailed performance overview</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {cards.map((c, i) => (
            <motion.div key={c.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="p-5 bg-card border border-border rounded-2xl">
              <c.icon className={`w-5 h-5 ${c.color} mb-2`} />
              <p className="font-display text-2xl font-bold text-foreground">{c.value}</p>
              <p className="font-body text-xs text-muted-foreground">{c.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="font-display text-lg font-bold text-foreground mb-4">Recent Videos</h2>
            {recentVideos.length === 0 ? <p className="font-body text-sm text-muted-foreground">No videos yet</p> : (
              <div className="space-y-3">
                {recentVideos.map((v: any) => (
                  <div key={v.id} className="bg-card border border-border rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <p className="font-body font-semibold text-foreground text-sm truncate">{v.title}</p>
                      <p className="font-body text-xs text-muted-foreground">{new Date(v.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-body text-sm text-foreground">{v.views_count} views</p>
                      <p className="font-body text-xs text-muted-foreground">{v.likes_count} likes</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            <h2 className="font-display text-lg font-bold text-foreground mb-4">Recent Books</h2>
            {recentBooks.length === 0 ? <p className="font-body text-sm text-muted-foreground">No books yet</p> : (
              <div className="space-y-3">
                {recentBooks.map((b: any) => (
                  <div key={b.id} className="bg-card border border-border rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <p className="font-body font-semibold text-foreground text-sm truncate">{b.title}</p>
                      <p className="font-body text-xs text-muted-foreground">{new Date(b.created_at).toLocaleDateString()}</p>
                    </div>
                    <p className="font-body text-sm text-foreground">{b.downloads_count} downloads</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default CreatorAnalytics;
