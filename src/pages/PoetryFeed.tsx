import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import FeedLayout from "@/components/layouts/FeedLayout";
import PostCard from "@/components/PostCard";
import CreatePostBox from "@/components/CreatePostBox";
import SponsoredPost from "@/components/SponsoredPost";
import { TrendingUp, Sparkles, Globe, PenLine } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const PoetryFeed = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [trendingPoets, setTrendingPoets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedType, setFeedType] = useState("discover");

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    let query = supabase.from("poetry_posts").select("*").eq("is_deleted", false).eq("is_hidden", false);

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
    <FeedLayout trendingPoets={trendingPoets}>
      {/* Unified create post + tabs area */}
      {user && <CreatePostBox onPostCreated={fetchPosts} />}

      <Tabs value={feedType} onValueChange={setFeedType} className="mb-6">
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
          {posts.map((post, index) => (
            <div key={post.id} className="space-y-6">
              <PostCard post={post} onUpdate={fetchPosts} />
              {(index + 1) % 5 === 0 && <SponsoredPost placement="feed" />}
            </div>
          ))}
        </div>
      )}
    </FeedLayout>
  );
};

export default PoetryFeed;
