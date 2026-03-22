import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PostCard from "@/components/PostCard";
import { TrendingUp, Sparkles, Globe, PenLine, Users, BadgeCheck } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const PoetryFeed = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [trendingPoets, setTrendingPoets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedType, setFeedType] = useState("discover");

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    let query = supabase.from("poetry_posts").select("*");

    if (feedType === "trending") {
      query = query.order("engagement_score", { ascending: false });
    } else if (feedType === "editorpicks") {
      query = query.eq("is_editor_pick", true).order("created_at", { ascending: false });
    } else {
      query = query.order("created_at", { ascending: false });
    }

    const { data: postsData } = await query.limit(20);
    
    if (postsData) {
      const creatorIds = [...new Set(postsData.map((p: any) => p.creator_id))];
      const { data: profiles } = await supabase.from("profiles").select("user_id, display_name").in("user_id", creatorIds);
      const nameMap = new Map(profiles?.map((p: any) => [p.user_id, p.display_name]) || []);
      
      let likedIds = new Set();
      if (user) {
        const { data: likes } = await supabase.from("post_likes").select("post_id").eq("user_id", user.id);
        likedIds = new Set(likes?.map((l: any) => l.post_id) || []);
      }

      setPosts(postsData.map((p: any) => ({
        ...p,
        creator_name: nameMap.get(p.creator_id) || "Unknown",
        is_liked: likedIds.has(p.id)
      })));
    }
    setLoading(false);
  }, [feedType, user]);

  const fetchTrendingPoets = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("user_id, display_name, followers_count, is_verified")
      .order("followers_count", { ascending: false })
      .limit(5);
    if (data) setTrendingPoets(data);
  };

  useEffect(() => {
    fetchPosts();
    fetchTrendingPoets();
  }, [fetchPosts]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-28 pb-20 container mx-auto px-6">
        <div className="grid lg:grid-cols-[1fr_300px] gap-10">
          {/* Main Feed */}
          <div className="max-w-2xl mx-auto w-full">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="font-display text-3xl font-bold text-foreground">Poetry Feed</h1>
                <p className="font-body text-sm text-muted-foreground mt-1">Discover the soul of literature</p>
              </div>
              {user && (
                <Link to="/create-post" className="flex items-center gap-2 px-5 py-2.5 font-body font-bold bg-primary text-white rounded-xl shadow-brand hover:opacity-90 transition-all">
                  <PenLine className="w-4 h-4" /> Write
                </Link>
              )}
            </div>

            <Tabs value={feedType} onValueChange={setFeedType} className="mb-8">
              <TabsList className="bg-muted/50 p-1 rounded-xl">
                <TabsTrigger value="discover" className="gap-2 text-xs font-bold uppercase"><Globe className="w-3.5 h-3.5" /> Discover</TabsTrigger>
                <TabsTrigger value="trending" className="gap-2 text-xs font-bold uppercase"><TrendingUp className="w-3.5 h-3.5" /> Trending</TabsTrigger>
                <TabsTrigger value="editorpicks" className="gap-2 text-xs font-bold uppercase"><Sparkles className="w-3.5 h-3.5" /> Picks</TabsTrigger>
              </TabsList>
            </Tabs>

            {loading ? (
              <div className="space-y-6">
                {[1, 2, 3].map(i => <div key={i} className="h-64 bg-muted animate-pulse rounded-2xl" />)}
              </div>
            ) : (
              <div className="space-y-6">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} onUpdate={fetchPosts} />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="hidden lg:block space-y-8">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <h3 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" /> Top Poets
              </h3>
              <div className="space-y-4">
                {trendingPoets.map((poet) => (
                  <Link key={poet.user_id} to={`/poet/${poet.user_id}`} className="flex items-center gap-3 group">
                    <div className="w-10 h-10 rounded-full bg-gradient-brand flex items-center justify-center text-xs font-bold text-white shrink-0">
                      {(poet.display_name || "?")[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <p className="font-body text-sm font-bold text-foreground group-hover:text-primary transition-colors truncate">{poet.display_name}</p>
                        {poet.is_verified && <BadgeCheck className="w-3.5 h-3.5 text-secondary" />}
                      </div>
                      <p className="font-body text-[10px] text-muted-foreground uppercase tracking-wider">{poet.followers_count} followers</p>
                    </div>
                  </Link>
                ))}
              </div>
              <Link to="/poets" className="block text-center mt-6 font-body text-xs font-bold text-primary hover:underline uppercase tracking-widest">View All Poets</Link>
            </div>

            <div className="bg-gradient-brand rounded-2xl p-6 text-white shadow-brand">
              <h3 className="font-display text-lg font-bold mb-2">Join a Mushaira</h3>
              <p className="font-body text-xs text-white/80 mb-4 leading-relaxed">Experience live poetry recitations from around the world.</p>
              <Link to="/mushairas" className="inline-block w-full text-center py-2 bg-white text-primary rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-white/90 transition-colors">Explore Events</Link>
            </div>
          </aside>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default PoetryFeed;