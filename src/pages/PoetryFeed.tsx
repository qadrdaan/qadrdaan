import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SendGift from "@/components/SendGift";
import { Heart, MessageCircle, BookmarkPlus, Bookmark, PenLine, Gift } from "lucide-react";

interface Post {
  id: string;
  creator_id: string;
  title: string;
  content: string;
  category: string | null;
  language: string | null;
  likes_count: number;
  comments_count: number;
  created_at: string;
  creator_name?: string;
  is_liked?: boolean;
  is_bookmarked?: boolean;
}

const CATEGORIES = ["ghazal", "nazm", "rubaai", "qita", "marsiya", "hamd", "naat", "quote"];

const PoetryFeed = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  const fetchPosts = async () => {
    setLoading(true);
    let query = supabase
      .from("poetry_posts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (filter) query = query.eq("category", filter);

    const { data } = await query;
    if (!data) { setLoading(false); return; }

    const creatorIds = [...new Set(data.map((p: any) => p.creator_id))];
    const { data: profiles } = await supabase.from("profiles").select("user_id, display_name").in("user_id", creatorIds);
    const nameMap = new Map(profiles?.map((p: any) => [p.user_id, p.display_name]) || []);

    let likedIds = new Set<string>();
    let bookmarkedIds = new Set<string>();
    if (user) {
      const postIds = data.map((p: any) => p.id);
      const [likes, bookmarks] = await Promise.all([
        supabase.from("post_likes").select("post_id").eq("user_id", user.id).in("post_id", postIds),
        supabase.from("bookmarks").select("content_id").eq("user_id", user.id).eq("content_type", "post").in("content_id", postIds),
      ]);
      likedIds = new Set(likes.data?.map((l: any) => l.post_id) || []);
      bookmarkedIds = new Set(bookmarks.data?.map((b: any) => b.content_id) || []);
    }

    setPosts(data.map((p: any) => ({
      ...p,
      creator_name: nameMap.get(p.creator_id) || "Unknown",
      is_liked: likedIds.has(p.id),
      is_bookmarked: bookmarkedIds.has(p.id),
    })));
    setLoading(false);
  };

  useEffect(() => { fetchPosts(); }, [filter, user]);

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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-28 pb-20 container mx-auto px-6 max-w-3xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">Poetry Feed</h1>
            <p className="font-body text-muted-foreground mt-1">Discover ghazals, nazms, and literary gems</p>
          </div>
          {user && (
            <Link to="/create-post" className="flex items-center gap-2 px-5 py-2.5 font-body font-semibold bg-gradient-gold rounded-lg text-primary shadow-gold hover:opacity-90 transition-opacity">
              <PenLine className="w-4 h-4" /> Write
            </Link>
          )}
        </div>

        <div className="flex gap-2 flex-wrap mb-8">
          <button onClick={() => setFilter("")} className={`px-3 py-1.5 rounded-full text-xs font-body font-medium transition-colors ${!filter ? "bg-secondary text-secondary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>All</button>
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setFilter(c)} className={`px-3 py-1.5 rounded-full text-xs font-body font-medium capitalize transition-colors ${filter === c ? "bg-secondary text-secondary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>{c}</button>
          ))}
        </div>

        {loading ? (
          <p className="text-center font-body text-muted-foreground py-20">Loading poetry...</p>
        ) : posts.length === 0 ? (
          <p className="text-center font-body text-muted-foreground py-20">No poetry posts yet. Be the first to share!</p>
        ) : (
          <div className="space-y-6">
            {posts.map((post, i) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="bg-card border border-border rounded-2xl p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <Link to={`/poet/${post.creator_id}`} className="w-10 h-10 rounded-full bg-gradient-gold flex items-center justify-center text-sm font-bold text-primary font-display">
                    {(post.creator_name || "?")[0].toUpperCase()}
                  </Link>
                  <div>
                    <Link to={`/poet/${post.creator_id}`} className="font-body text-sm font-semibold text-foreground hover:text-secondary transition-colors">{post.creator_name}</Link>
                    <p className="font-body text-xs text-muted-foreground">{new Date(post.created_at).toLocaleDateString()} · {post.category}</p>
                  </div>
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
                  <button onClick={() => handleBookmark(post)} className={`flex items-center gap-1.5 text-sm font-body transition-colors ${post.is_bookmarked ? "text-secondary" : "text-muted-foreground hover:text-secondary"}`}>
                    {post.is_bookmarked ? <Bookmark className="w-4 h-4 fill-current" /> : <BookmarkPlus className="w-4 h-4" />}
                  </button>
                  <div className="ml-auto">
                    <SendGift recipientId={post.creator_id} recipientName={post.creator_name || "Poet"} />
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </section>
      <Footer />
    </div>
  );
};

export default PoetryFeed;
