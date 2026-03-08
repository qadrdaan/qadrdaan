import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SendGift from "@/components/SendGift";
import { Heart, ArrowLeft } from "lucide-react";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  display_name?: string;
}

const PostDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [creatorName, setCreatorName] = useState("");

  const fetchPost = async () => {
    const { data } = await supabase.from("poetry_posts").select("*").eq("id", id).single();
    if (!data) { setLoading(false); return; }
    setPost(data);
    const { data: profile } = await supabase.from("profiles").select("display_name").eq("user_id", data.creator_id).single();
    setCreatorName(profile?.display_name || "Unknown");
    setLoading(false);
  };

  const fetchComments = async () => {
    const { data } = await supabase.from("post_comments").select("*").eq("post_id", id).order("created_at", { ascending: true }).limit(100);
    if (!data) return;
    const userIds = [...new Set(data.map((c: any) => c.user_id))];
    const { data: profiles } = await supabase.from("profiles").select("user_id, display_name").in("user_id", userIds);
    const nameMap = new Map(profiles?.map((p: any) => [p.user_id, p.display_name]) || []);
    setComments(data.map((c: any) => ({ ...c, display_name: nameMap.get(c.user_id) || "Anonymous" })));
  };

  const checkLike = async () => {
    if (!user || !id) return;
    const { data } = await supabase.from("post_likes").select("id").eq("post_id", id).eq("user_id", user.id).maybeSingle();
    setIsLiked(!!data);
  };

  useEffect(() => { fetchPost(); fetchComments(); }, [id]);
  useEffect(() => { checkLike(); }, [user, id]);

  const handleLike = async () => {
    if (!user) { toast.error("Sign in to like"); return; }
    if (isLiked) {
      await supabase.from("post_likes").delete().eq("post_id", id).eq("user_id", user.id);
    } else {
      await supabase.from("post_likes").insert({ post_id: id!, user_id: user.id });
    }
    setIsLiked(!isLiked);
    fetchPost();
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast.error("Sign in to comment"); return; }
    if (!newComment.trim()) return;
    await supabase.from("post_comments").insert({ post_id: id!, user_id: user.id, content: newComment.trim() });
    setNewComment("");
    fetchComments();
    fetchPost();
  };

  if (loading) return <div className="min-h-screen bg-background"><Navbar /><p className="pt-28 text-center font-body text-muted-foreground">Loading...</p></div>;
  if (!post) return <div className="min-h-screen bg-background"><Navbar /><p className="pt-28 text-center font-body text-muted-foreground">Post not found</p></div>;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-28 pb-20 container mx-auto px-6 max-w-3xl">
        <Link to="/poetry" className="inline-flex items-center gap-2 font-body text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Feed
        </Link>
        <motion.article initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <Link to={`/poet/${post.creator_id}`} className="w-12 h-12 rounded-full bg-gradient-gold flex items-center justify-center text-lg font-bold text-primary font-display">
              {creatorName[0]?.toUpperCase() || "?"}
            </Link>
            <div>
              <Link to={`/poet/${post.creator_id}`} className="font-body font-semibold text-foreground hover:text-secondary">{creatorName}</Link>
              <p className="font-body text-xs text-muted-foreground">{new Date(post.created_at).toLocaleDateString()} · {post.category}</p>
            </div>
          </div>

          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">{post.title}</h1>
          <p className="font-body text-foreground/85 whitespace-pre-line leading-loose text-lg mb-6">{post.content}</p>

          <div className="flex items-center gap-4 pt-4 border-t border-border">
            <button onClick={handleLike} className={`flex items-center gap-1.5 font-body text-sm ${isLiked ? "text-destructive" : "text-muted-foreground hover:text-destructive"}`}>
              <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} /> {post.likes_count} likes
            </button>
            <span className="font-body text-sm text-muted-foreground">{post.comments_count} comments</span>
            <div className="ml-auto">
              <SendGift recipientId={post.creator_id} recipientName={creatorName} />
            </div>
          </div>
        </motion.article>

        {/* Comments */}
        <div className="mt-8">
          <h2 className="font-display text-xl font-bold text-foreground mb-4">Comments</h2>
          {user && (
            <form onSubmit={handleComment} className="flex gap-3 mb-6">
              <input value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Write a comment..." className="flex-1 px-4 py-3 rounded-lg bg-card border border-border text-foreground font-body focus:outline-none focus:ring-2 focus:ring-ring" />
              <button type="submit" className="px-5 py-3 font-body font-semibold bg-gradient-gold rounded-lg text-primary shadow-gold hover:opacity-90 transition-opacity">Post</button>
            </form>
          )}
          <div className="space-y-4">
            {comments.map(c => (
              <div key={c.id} className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-body text-sm font-semibold text-foreground">{c.display_name}</span>
                  <span className="font-body text-xs text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</span>
                </div>
                <p className="font-body text-foreground/80 text-sm">{c.content}</p>
              </div>
            ))}
            {comments.length === 0 && <p className="font-body text-sm text-muted-foreground">No comments yet.</p>}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default PostDetail;
