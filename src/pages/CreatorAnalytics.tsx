import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { BarChart3, TrendingUp, Users, Gift, BookOpen, Video, Eye, Heart, Clock, Share2, MessageCircle, Lightbulb } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const CreatorAnalytics = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    books: 0, videos: 0, posts: 0,
    totalViews: 0, totalLikes: 0, totalDownloads: 0,
    totalReadingTime: 0, totalShares: 0, totalComments: 0,
    avgEngagement: 0,
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [recentPosts, setRecentPosts] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (!authLoading && !user) navigate("/auth"); }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    const fetchAll = async () => {
      const [books, videos, posts, vids, bks, postsData] = await Promise.all([
        supabase.from("books").select("id", { count: "exact", head: true }).eq("creator_id", user.id),
        supabase.from("videos").select("id", { count: "exact", head: true }).eq("creator_id", user.id),
        supabase.from("poetry_posts").select("id", { count: "exact", head: true }).eq("creator_id", user.id),
        supabase.from("videos").select("id, title, views_count, likes_count, created_at").eq("creator_id", user.id).order("created_at", { ascending: false }).limit(5),
        supabase.from("books").select("id, title, downloads_count, created_at").eq("creator_id", user.id).order("created_at", { ascending: false }).limit(5),
        supabase.from("poetry_posts").select("*").eq("creator_id", user.id).order("created_at", { ascending: false }).limit(10),
      ]);

      const totalViews = (vids.data || []).reduce((s: number, v: any) => s + v.views_count, 0);
      const totalLikes = (vids.data || []).reduce((s: number, v: any) => s + v.likes_count, 0);
      const totalDownloads = (bks.data || []).reduce((s: number, b: any) => s + b.downloads_count, 0);

      const pd = postsData.data || [];
      const totalReadingTime = pd.reduce((s: number, p: any) => s + (p.total_reading_time || 0), 0);
      const totalShares = pd.reduce((s: number, p: any) => s + (p.shares_count || 0), 0);
      const totalComments = pd.reduce((s: number, p: any) => s + (p.comments_count || 0), 0);
      const avgEngagement = pd.length > 0 ? pd.reduce((s: number, p: any) => s + (p.engagement_score || 0), 0) / pd.length : 0;

      setStats({
        books: books.count || 0, videos: videos.count || 0, posts: posts.count || 0,
        totalViews, totalLikes, totalDownloads,
        totalReadingTime, totalShares, totalComments,
        avgEngagement: Math.round(avgEngagement),
      });
      setRecentPosts(pd);

      // Generate dummy chart data for the last 7 days based on real totals
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const data = days.map((day, i) => ({
        name: day,
        engagement: Math.floor(avgEngagement * (0.5 + Math.random())),
        views: Math.floor((totalViews / 7) * (0.8 + Math.random())),
      }));
      setChartData(data);

      const tips: string[] = [];
      if ((posts.count || 0) < 5) tips.push("Publish more posts to increase your visibility.");
      if (totalShares === 0) tips.push("Encourage readers to share your work.");
      if (totalReadingTime < 60) tips.push("Write longer, more engaging content to increase reading time.");
      setSuggestions(tips);
      setLoading(false);
    };
    fetchAll();
  }, [user]);

  if (authLoading || loading) return <div className="min-h-screen bg-background"><Navbar /><p className="pt-28 text-center font-body text-muted-foreground">Loading analytics...</p><Footer /></div>;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-28 pb-20 container mx-auto px-6 max-w-5xl">
        <div className="flex items-center gap-3 mb-2">
          <BarChart3 className="w-7 h-7 text-secondary" />
          <h1 className="font-display text-3xl font-bold text-foreground">Creator Analytics</h1>
        </div>
        <p className="font-body text-muted-foreground mb-8">Detailed performance & engagement overview</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Eye, label: "Total Views", value: stats.totalViews, color: "text-primary" },
            { icon: Heart, label: "Total Likes", value: stats.totalLikes, color: "text-secondary" },
            { icon: Clock, label: "Reading Time", value: `${Math.round(stats.totalReadingTime / 60)}m`, color: "text-accent" },
            { icon: TrendingUp, label: "Avg Score", value: stats.avgEngagement, color: "text-green-500" },
          ].map((c, i) => (
            <motion.div key={c.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="p-5 bg-card border border-border rounded-2xl">
              <c.icon className={`w-5 h-5 ${c.color} mb-2`} />
              <p className="font-display text-2xl font-bold text-foreground">{c.value}</p>
              <p className="font-body text-xs text-muted-foreground">{c.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Engagement Chart */}
        <Card className="mb-8 border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" /> Weekly Engagement Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorEngage" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                  />
                  <Area type="monotone" dataKey="engagement" stroke="#8B5CF6" strokeWidth={3} fillOpacity={1} fill="url(#colorEngage)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-8">
          <Card className="border-accent/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-display text-lg">
                <Lightbulb className="w-5 h-5 text-accent" /> AI Growth Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {suggestions.map((tip, i) => (
                  <li key={i} className="font-body text-sm text-foreground flex items-start gap-2">
                    <span className="text-accent mt-1">•</span> {tip}
                  </li>
                ))}
                {suggestions.length === 0 && <li className="font-body text-sm text-muted-foreground">Keep up the great work! Your engagement is steady.</li>}
              </ul>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h2 className="font-display text-lg font-bold text-foreground">Recent Posts</h2>
            {recentPosts.map((p: any) => (
              <div key={p.id} className="bg-card border border-border rounded-xl p-4 flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="font-body font-semibold text-foreground text-sm truncate">{p.title}</p>
                  <p className="font-body text-[10px] text-muted-foreground uppercase">{new Date(p.created_at).toLocaleDateString()}</p>
                </div>
                <div className="text-right ml-4">
                  <p className="font-mono text-xs font-bold text-primary">Score: {Math.round(p.engagement_score || 0)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default CreatorAnalytics;