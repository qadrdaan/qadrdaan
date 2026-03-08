import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import SendGift from "@/components/SendGift";
import { Heart, Eye, User, Calendar, Globe, Tag, Send, Bookmark, BookmarkPlus } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type VideoRow = Tables<"videos">;

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  display_name?: string;
}

const VideoDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [video, setVideo] = useState<VideoRow | null>(null);
  const [creatorName, setCreatorName] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLiked, setIsLiked] = useState(false);
  const [commentInput, setCommentInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    if (id) {
      fetchVideo();
      fetchComments();
    }
  }, [id]);

  useEffect(() => {
    if (user && id) { checkLikeStatus(); checkBookmark(); }
  }, [user, id]);

  const fetchVideo = async () => {
    const { data } = await supabase.from("videos").select("*").eq("id", id!).single();
    if (data) {
      setVideo(data);
      // Increment view
      await supabase.from("videos").update({ views_count: (data.views_count || 0) + 1 }).eq("id", id!);
      // Get creator name
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("user_id", data.creator_id)
        .single();
      setCreatorName(profile?.display_name || "Unknown");
    }
    setLoading(false);
  };

  const fetchComments = async () => {
    const { data } = await supabase
      .from("video_comments")
      .select("*")
      .eq("video_id", id!)
      .order("created_at", { ascending: false })
      .limit(50);

    if (data && data.length > 0) {
      const userIds = [...new Set(data.map((c) => c.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name")
        .in("user_id", userIds);
      const map = new Map(profiles?.map((p) => [p.user_id, p.display_name]) || []);
      setComments(data.map((c) => ({ ...c, display_name: map.get(c.user_id) || "User" })));
    }
  };

  const checkLikeStatus = async () => {
    const { data } = await supabase
      .from("video_likes")
      .select("id")
      .eq("video_id", id!)
      .eq("user_id", user!.id)
      .maybeSingle();
    setIsLiked(!!data);
  };

  const handleLike = async () => {
    if (!user) { toast.error("Please sign in to like"); return; }
    if (isLiked) {
      await supabase.from("video_likes").delete().eq("video_id", id!).eq("user_id", user.id);
      setIsLiked(false);
      setVideo((v) => v ? { ...v, likes_count: Math.max(v.likes_count - 1, 0) } : v);
    } else {
      await supabase.from("video_likes").insert({ video_id: id!, user_id: user.id });
      setIsLiked(true);
      setVideo((v) => v ? { ...v, likes_count: v.likes_count + 1 } : v);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast.error("Please sign in to comment"); return; }
    if (!commentInput.trim()) return;

    await supabase.from("video_comments").insert({
      video_id: id!,
      user_id: user.id,
      content: commentInput.trim(),
    });
    setCommentInput("");
    fetchComments();
  };

  const checkBookmark = async () => {
    if (!user || !id) return;
    const { data } = await supabase.from("bookmarks").select("id").eq("user_id", user.id).eq("content_type", "video").eq("content_id", id).maybeSingle();
    setIsBookmarked(!!data);
  };

  const handleBookmark = async () => {
    if (!user) { toast.error("Sign in to bookmark"); return; }
    if (isBookmarked) {
      await supabase.from("bookmarks").delete().eq("user_id", user.id).eq("content_type", "video").eq("content_id", id!);
      setIsBookmarked(false);
      toast.success("Bookmark removed");
    } else {
      await supabase.from("bookmarks").insert({ user_id: user.id, content_type: "video", content_id: id! });
      setIsBookmarked(true);
      toast.success("Bookmarked!");
    }
  };

  if (loading || !video) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 flex items-center justify-center">
          <p className="font-body text-muted-foreground">{loading ? "Loading..." : "Video not found."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-16">
        {/* Video Player */}
        <div className="bg-foreground">
          <div className="max-w-5xl mx-auto">
            <video
              src={video.video_url}
              controls
              autoPlay
              className="w-full aspect-video"
              poster={video.thumbnail_url || undefined}
            />
          </div>
        </div>

        <div className="container mx-auto px-6 max-w-5xl mt-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Title + actions */}
            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-3">
              {video.title}
            </h1>

            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <Link
                to={`/poet/${video.creator_id}`}
                className="flex items-center gap-2 text-foreground/80 hover:text-foreground transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-gold flex items-center justify-center">
                  <span className="font-display text-sm font-bold text-primary">
                    {creatorName[0]?.toUpperCase() || "?"}
                  </span>
                </div>
                <span className="font-body text-sm font-medium">{creatorName}</span>
              </Link>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleLike}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-body text-sm font-medium transition-all ${
                    isLiked
                      ? "bg-red-500/10 text-red-500 border border-red-500/30"
                      : "bg-card border border-border text-foreground hover:bg-muted"
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
                  {video.likes_count}
                </button>

                <span className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-card border border-border font-body text-sm text-foreground">
                  <Eye className="w-4 h-4" />
                  {video.views_count}
                </span>

                <SendGift
                  recipientId={video.creator_id}
                  recipientName={creatorName}
                />

                <button
                  onClick={handleBookmark}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-body text-sm font-medium transition-all ${
                    isBookmarked
                      ? "bg-secondary/10 text-secondary border border-secondary/30"
                      : "bg-card border border-border text-foreground hover:bg-muted"
                  }`}
                >
                  {isBookmarked ? <Bookmark className="w-4 h-4 fill-current" /> : <BookmarkPlus className="w-4 h-4" />}
                  {isBookmarked ? "Saved" : "Save"}
                </button>
              </div>
            </div>

            {/* Description + meta */}
            <div className="bg-card rounded-2xl border border-border p-5 mb-8">
              <div className="flex flex-wrap gap-2 mb-3">
                {video.language && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-background border border-border rounded-lg font-body text-xs text-foreground">
                    <Globe className="w-3 h-3 text-secondary" />
                    {video.language}
                  </span>
                )}
                {video.category && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-background border border-border rounded-lg font-body text-xs text-foreground capitalize">
                    <Tag className="w-3 h-3 text-secondary" />
                    {video.category}
                  </span>
                )}
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-background border border-border rounded-lg font-body text-xs text-foreground">
                  <Calendar className="w-3 h-3 text-secondary" />
                  {new Date(video.created_at).toLocaleDateString()}
                </span>
              </div>
              {video.description && (
                <p className="font-body text-foreground/80 leading-relaxed whitespace-pre-line">
                  {video.description}
                </p>
              )}
            </div>

            {/* Comments */}
            <div>
              <h2 className="font-display text-xl font-bold text-foreground mb-4">
                Comments ({comments.length})
              </h2>

              {/* Comment input */}
              <form onSubmit={handleComment} className="flex gap-3 mb-6">
                <input
                  type="text"
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  placeholder={user ? "Add a comment..." : "Sign in to comment"}
                  disabled={!user}
                  maxLength={500}
                  className="flex-1 px-4 py-3 rounded-lg bg-card border border-border text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!user || !commentInput.trim()}
                  className="p-3 rounded-lg bg-gradient-gold text-primary disabled:opacity-50 hover:opacity-90 transition-opacity"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>

              {/* Comments list */}
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                      <span className="font-display text-xs font-bold text-foreground">
                        {(comment.display_name || "?")[0].toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-body text-sm font-semibold text-foreground">
                          {comment.display_name}
                        </span>
                        <span className="font-body text-xs text-muted-foreground">
                          {new Date(comment.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="font-body text-sm text-foreground/80">{comment.content}</p>
                    </div>
                  </div>
                ))}
                {comments.length === 0 && (
                  <p className="font-body text-sm text-muted-foreground text-center py-4">
                    No comments yet. Be the first!
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default VideoDetail;
