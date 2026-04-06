import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Pin, X } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

interface FeaturedPostsProps {
  userId: string;
  isOwnProfile: boolean;
}

const FeaturedPosts = ({ userId, isOwnProfile }: FeaturedPostsProps) => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);

  const fetchFeatured = async () => {
    const { data: featured } = await supabase
      .from("featured_posts")
      .select("post_id, display_order")
      .eq("user_id", userId)
      .order("display_order", { ascending: true });
    if (!featured?.length) { setPosts([]); return; }

    const postIds = featured.map((f) => f.post_id);
    const { data: postData } = await supabase
      .from("poetry_posts")
      .select("id, title, content, likes_count, comments_count, created_at")
      .in("id", postIds);

    if (postData) {
      const ordered = postIds.map((id) => postData.find((p) => p.id === id)).filter(Boolean);
      setPosts(ordered);
    }
  };

  useEffect(() => { fetchFeatured(); }, [userId]);

  const handleRemove = async (postId: string) => {
    await supabase.from("featured_posts").delete().eq("user_id", user?.id).eq("post_id", postId);
    toast.success("Removed from featured");
    fetchFeatured();
  };

  if (posts.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Pin className="w-4 h-4 text-primary" />
        <h3 className="font-display text-sm font-bold text-foreground uppercase tracking-wider">Featured</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {posts.map((post) => (
          <div key={post.id} className="relative bg-card border border-border rounded-xl p-4 hover:shadow-sm transition-shadow group">
            <Link to={`/post/${post.id}`}>
              <h4 className="font-display text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">{post.title}</h4>
              <p className="font-body text-xs text-muted-foreground line-clamp-2 mt-1">{post.content}</p>
              <div className="flex gap-3 mt-2 font-body text-[10px] text-muted-foreground">
                <span>❤ {post.likes_count}</span>
                <span>💬 {post.comments_count}</span>
              </div>
            </Link>
            {isOwnProfile && (
              <button onClick={() => handleRemove(post.id)} className="absolute top-2 right-2 p-1 rounded-full bg-muted text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeaturedPosts;
