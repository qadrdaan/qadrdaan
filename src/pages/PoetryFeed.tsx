import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SendGift from "@/components/SendGift";
import { Heart, MessageCircle, BookmarkPlus, Bookmark, PenLine, Share2, TrendingUp, Sparkles, Globe, Rocket } from "lucide-react";
import ReportContent from "@/components/ReportContent";
import SponsoredPost from "@/components/SponsoredPost";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Post {
  id: string;
  creator_id: string;
  title: string;
  content: string;
  category: string | null;
  language: string | null;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  impressions_count: number;
  engagement_score: number;
  is_editor_pick: boolean;
  created_at: string;
  creator_name?: string;
  is_liked?: boolean;
  is_bookmarked?: boolean;
}

const CATEGORIES = ["ghazal", "nazm", "naat", "rubaai", "qita", "marsiya", "hamd", "research", "essay", "story", "quote"];
const LANGUAGES = ["Urdu", "Punjabi", "Hindi", "Saraiki", "Persian", "English"];

const PoetryFeed = () => {
  const { user, profile } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [langFilter, setLangFilter] = useState("");
  const [feedType, setFeedType] = useState("discover");

  const fetchPosts = useCallback(async () => {
    setLoading(true);

    let query = supabase.from("poetry_posts").select("*");

    if (filter) query = query.eq("category", filter);
    if (langFilter) query = query.eq("language", langFilter);

    // Different ordering based on feed type
    if (feedType === "trending") {
      query = query.order("engagement_score" as any, { ascending: false }).limit(50);
    } else if (feedType === "editorpicks") {
      query = (query as any).eq("is_editor_pick", true).order("created_at", { ascending: false }).limit(50);
    } else {
      // Discovery feed: mix of new posts (equal start reach) and engagement-ranked
      // Get recent posts with <300 impressions for equal exposure + top engagement posts
      query = query.order("created_at", { ascending: false }).limit(100);
    }

    const { data } = await query;
    if (!data) { setLoading(false); return; }

    // For discovery feed, apply fair rotation algorithm
    let processedData = data as any[];
    if (feedType === "discover") {
      const newPosts = processedData.filter((p: any) => (p.impressions_count || 0) < 300);
      const establishedPosts = processedData.filter((p: any) => (p.impressions_count || 0) >= 300);
      
      // Sort established by engagement score
      establishedPosts.sort((a: any, b: any) => (b.engagement_score || 0) - (a.engagement_score || 0));
      
      // Interleave: every 3rd post is a new/low-impression post for equal start reach
      const merged: any[] = [];
      let newIdx = 0, estIdx = 0;
      for (let i = 0; i < processedData.length; i++) {
        if (i % 3 === 0 && newIdx < newPosts.length) {
          merged.push(newPosts[newIdx++]);
        } else if (estIdx < establishedPosts.length) {
          merged.push(establishedPosts[estIdx++]);
        } else if (newIdx < newPosts.length) {
          merged.push(newPosts[newIdx++]);
        }
      }
      // Add remaining
      while (newIdx < newPosts.length) merged.push(newPosts[newIdx++]);
      while (estIdx < establishedPosts.length) merged.push(establishedPosts[estIdx++]);
      processedData = merged;
    }

    // Fetch creator names
    const creatorIds = [...new Set(processedData.map((p: any) => p.creator_id))];
    const { data: profiles } = await supabase.from("profiles").select("user_id, display_name").in("user_id", creatorIds);
    const nameMap = new Map(profiles?.map((p: any) => [p.user_id, p.display_name]) || []);

    let likedIds = new Set<string>();
    let bookmarkedIds = new Set<string>();
    if (user) {
      const postIds = processedData.map((p: any) => p.id);
      const [likes, bookmarks] = await Promise.all([
        supabase.from("post_likes").select("post_id").eq("user_id", user.id).in("post_id", postIds),
        supabase.from("bookmarks").select("content_id").eq("user_id", user.id).eq("content_type", "post").in("content_id", postIds),
      ]);
      likedIds = new Set(likes.data?.map((l: any) => l.post_id) || []);
      bookmarkedIds = new Set(bookmarks.data?.map((b: any) => b.content_id) || []);
    }

    setPosts(processedData.map((p: any) => ({
      ...p,
      shares_count: p.shares_count || 0,
      impressions_count: p.impressions_count || 0,
      engagement_score: p.engagement_score || 0,
      is_editor_pick: p.is_editor_pick || false,
      creator_name: nameMap.get(p.creator_id) || "Unknown",
      is_liked: likedIds.has(p.id),
      is_bookmarked: bookmarkedIds.has(p.id),
    })));
    setLoading(false);
  }, [filter, langFilter, feedType, user]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  // Record impression when posts are viewed
  useEffect(() => {
    if (!user || posts.length === 0) return;
    // Record impressions for visible posts (batch)
    const recordImpressions = async () => {
      for (const post of posts.slice(0, 10)) {
        await supabase
          .from("post_impressions" as any)
          .upsert(
            { post_id: post.id, user_id: user.id, reading_time_seconds: 0 } as any,
            { onConflict: "post_id,user_id" }
          );
      }
    };
    recordImpressions();
  }, [posts, user]);

  const handleLike = async (post: Post) => {
    if (!user) { toast.error("Sign in to like"); return; }
    if (post.is_liked) {
      await supabase.from("post_likes").delete().eq("post_id", post.id).eq("user_id", user.id);
    } else {
      await supabase.from("post_likes").insert({ post_id: post.id, user_id: user.id });
    }
    fetchPosts();
  };

  const handleBookmark = async (post: Post) => {
    if (!user) { toast.error("Sign in to bookmark"); return; }
    if (post.is_bookmarked) {
      await supabase.from("bookmarks").delete().eq("user_id", user.id).eq("content_type", "post").eq("content_id", post.id);
      toast.success("Bookmark removed");
    } else {
      await supabase.from("bookmarks").insert({ user_id: user.id, content_type: "post", content_id: post.id });
      toast.success("Bookmarked!");
    }
    fetchPosts();
  };

  const handleShare = async (post: Post) => {
    if (!user) { toast.error("Sign in to share"); return; }
    await supabase.from("post_shares" as any).insert({ post_id: post.id, user_id: user.id } as any);
    // Copy link
    await navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
    toast.success("Link copied & shared!");
    fetchPosts();
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-28 pb-20 container mx-auto px-6 max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">Poetry Feed</h1>
            <p className="font-body text-muted-foreground mt-1">Fair discovery for every voice</p>
          </div>
          {user && (
            <Link to="/create-post" className="flex items-center gap-2 px-5 py-2.5 font-body font-semibold bg-gradient-gold rounded-lg text-primary shadow-gold hover:opacity-90 transition-opacity">
              <PenLine className="w-4 h-4" /> Write
            </Link>
          )}
        </div>

        {/* Feed Type Tabs */}
        <Tabs value={feedType} onValueChange={setFeedType} className="mb-6">
          <TabsList className="bg-muted">
            <TabsTrigger value="discover" className="gap-1.5"><Globe className="w-3.5 h-3.5" /> Discover</TabsTrigger>
            <TabsTrigger value="trending" className="gap-1.5"><TrendingUp className="w-3.5 h-3.5" /> Trending</TabsTrigger>
            <TabsTrigger value="editorpicks" className="gap-1.5"><Sparkles className="w-3.5 h-3.5" /> Editor Picks</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Language Filter */}
        <div className="flex gap-2 flex-wrap mb-3">
          <span className="text-xs font-body text-muted-foreground self-center mr-1">Language:</span>
          <button onClick={() => setLangFilter("")} className={`px-3 py-1 rounded-full text-xs font-body font-medium transition-colors ${!langFilter ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>All</button>
          {LANGUAGES.map(l => (
            <button key={l} onClick={() => setLangFilter(l)} className={`px-3 py-1 rounded-full text-xs font-body font-medium transition-colors ${langFilter === l ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>{l}</button>
          ))}
        </div>

        {/* Genre Filter */}
        <div className="flex gap-2 flex-wrap mb-8">
          <span className="text-xs font-body text-muted-foreground self-center mr-1">Genre:</span>
          <button onClick={() => setFilter("")} className={`px-3 py-1 rounded-full text-xs font-body font-medium transition-colors ${!filter ? "bg-secondary text-secondary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>All</button>
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setFilter(c)} className={`px-3 py-1 rounded-full text-xs font-body font-medium capitalize transition-colors ${filter === c ? "bg-secondary text-secondary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>{c}</button>
          ))}
        </div>

        {loading ? (
          <p className="text-center font-body text-muted-foreground py-20">Loading poetry...</p>
        ) : posts.length === 0 ? (
          <p className="text-center font-body text-muted-foreground py-20">No poetry posts yet. Be the first to share!</p>
        ) : (
          <div className="space-y-6">
            {posts.map((post, i) => (
              <div key={post.id}>
                {/* Show sponsored post every 6 posts */}
                {i > 0 && i % 6 === 0 && <SponsoredPost placement="feed" />}
                <motion.article
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="bg-card border border-border rounded-2xl p-6"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <Link to={`/poet/${post.creator_id}`} className="w-10 h-10 rounded-full bg-gradient-gold flex items-center justify-center text-sm font-bold text-primary font-display">
                      {(post.creator_name || "?")[0].toUpperCase()}
                    </Link>
                    <div className="flex-1">
                      <Link to={`/poet/${post.creator_id}`} className="font-body text-sm font-semibold text-foreground hover:text-secondary transition-colors">{post.creator_name}</Link>
                      <p className="font-body text-xs text-muted-foreground">{new Date(post.created_at).toLocaleDateString()} · {post.category} {post.language ? `· ${post.language}` : ""}</p>
                    </div>
                    {post.is_editor_pick && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/20 text-accent text-xs font-body">
                        <Sparkles className="w-3 h-3" /> Pick
                      </span>
                    )}
                  </div>

                  <h2 className="font-display text-xl font-bold text-foreground mb-3">{post.title}</h2>
                  <p className="font-body text-foreground/85 whitespace-pre-line leading-relaxed mb-5">{post.content}</p>

                  <div className="flex items-center gap-4 pt-3 border-t border-border">
                    <button onClick={() => handleLike(post)} className={`flex items-center gap-1.5 text-sm font-body transition-colors ${post.is_liked ? "text-destructive" : "text-muted-foreground hover:text-destructive"}`}>
                      <Heart className={`w-4 h-4 ${post.is_liked ? "fill-current" : ""}`} /> {post.likes_count}
                    </button>
                    <Link to={`/post/${post.id}`} className="flex items-center gap-1.5 text-sm font-body text-muted-foreground hover:text-foreground transition-colors">
                      <MessageCircle className="w-4 h-4" /> {post.comments_count}
                    </Link>
                    <button onClick={() => handleShare(post)} className="flex items-center gap-1.5 text-sm font-body text-muted-foreground hover:text-secondary transition-colors">
                      <Share2 className="w-4 h-4" /> {post.shares_count}
                    </button>
                    <button onClick={() => handleBookmark(post)} className={`flex items-center gap-1.5 text-sm font-body transition-colors ${post.is_bookmarked ? "text-secondary" : "text-muted-foreground hover:text-secondary"}`}>
                      {post.is_bookmarked ? <Bookmark className="w-4 h-4 fill-current" /> : <BookmarkPlus className="w-4 h-4" />}
                    </button>
                    <div className="ml-auto flex items-center gap-3">
                      {user && post.creator_id === user.id && (
                        <Link to={`/boost-post?post=${post.id}`} className="p-1.5 rounded-lg text-muted-foreground hover:text-accent hover:bg-muted transition-colors" title="Boost post">
                          <Rocket className="w-4 h-4" />
                        </Link>
                      )}
                      <ReportContent contentType="post" contentId={post.id} reportedUserId={post.creator_id} />
                      <SendGift recipientId={post.creator_id} recipientName={post.creator_name || "Poet"} />
                    </div>
                  </div>
                </motion.article>
              </div>
            ))}
          </div>
        )}
      </section>
      <Footer />
    </div>
  );
};

export default PoetryFeed;
