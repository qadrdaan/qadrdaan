import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Crown, Lock, Plus, Users } from "lucide-react";

interface ClubPost {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

const FanClubDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [club, setClub] = useState<any>(null);
  const [posts, setPosts] = useState<ClubPost[]>([]);
  const [hasAccess, setHasAccess] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: "", content: "" });
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    if (id) fetchClub();
  }, [id, user]);

  const fetchClub = async () => {
    const { data } = await supabase.from("fan_clubs").select("*").eq("id", id!).single();
    setClub(data);
    if (data && user) {
      setIsOwner(data.creator_id === user.id);
      if (data.creator_id === user.id) {
        setHasAccess(true);
      } else {
        const { data: sub } = await supabase.from("fan_club_subscriptions")
          .select("id").eq("fan_club_id", id!).eq("user_id", user.id).eq("status", "active").single();
        setHasAccess(!!sub);
      }
    }
    fetchPosts();
    setLoading(false);
  };

  const fetchPosts = async () => {
    const { data } = await supabase.from("fan_club_posts").select("*").eq("fan_club_id", id!).order("created_at", { ascending: false });
    setPosts((data as ClubPost[]) || []);
  };

  const handlePost = async () => {
    if (!form.title.trim() || !form.content.trim()) { toast.error("Title and content required"); return; }
    setPosting(true);
    const { error } = await supabase.from("fan_club_posts").insert({
      fan_club_id: id!,
      creator_id: user!.id,
      title: form.title.trim(),
      content: form.content.trim(),
    });
    if (error) toast.error(error.message);
    else { toast.success("Exclusive post published!"); setForm({ title: "", content: "" }); fetchPosts(); }
    setPosting(false);
  };

  if (loading) {
    return <div className="min-h-screen bg-background"><Navbar /><div className="pt-24 flex justify-center"><p className="font-body text-muted-foreground">Loading...</p></div></div>;
  }

  if (!club) {
    return <div className="min-h-screen bg-background"><Navbar /><div className="pt-24 flex justify-center"><p className="font-body text-muted-foreground">Club not found</p></div></div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="h-48 bg-gradient-hero relative flex items-end">
        <div className="container mx-auto px-6 pb-6 relative z-10">
          <h1 className="font-display text-3xl font-bold text-primary-foreground flex items-center gap-3">
            <Crown className="w-7 h-7" /> {club.name}
          </h1>
          <p className="font-body text-sm text-primary-foreground/80 flex items-center gap-2 mt-1">
            <Users className="w-3.5 h-3.5" /> {club.member_count} members
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-3xl">
        {!hasAccess && (
          <div className="bg-muted rounded-2xl p-8 text-center mb-8">
            <Lock className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="font-body text-muted-foreground">Subscribe to access exclusive content</p>
          </div>
        )}

        {/* Creator: Post form */}
        {isOwner && (
          <div className="bg-card rounded-2xl border border-border p-6 mb-6">
            <h2 className="font-display text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <Plus className="w-4 h-4" /> Post Exclusive Content
            </h2>
            <div className="space-y-3">
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Title"
                className="w-full px-4 py-2.5 rounded-lg bg-background border border-border text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Write exclusive content..." rows={6}
                className="w-full px-4 py-2.5 rounded-lg bg-background border border-border text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              <button onClick={handlePost} disabled={posting} className="px-6 py-2.5 bg-primary text-primary-foreground font-body font-semibold text-sm rounded-lg hover:opacity-90 disabled:opacity-50">
                {posting ? "Publishing..." : "Publish"}
              </button>
            </div>
          </div>
        )}

        {/* Posts */}
        {hasAccess && posts.length === 0 && (
          <p className="font-body text-muted-foreground text-center py-12">No exclusive posts yet.</p>
        )}
        {hasAccess && posts.map((post, i) => (
          <motion.div key={post.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-card rounded-2xl border border-border p-6 mb-4">
            <h3 className="font-display text-lg font-bold text-foreground">{post.title}</h3>
            <p className="font-body text-xs text-muted-foreground mb-3">{new Date(post.created_at).toLocaleDateString()}</p>
            <p className="font-body text-foreground/80 whitespace-pre-wrap">{post.content}</p>
          </motion.div>
        ))}
      </div>
      <Footer />
    </div>
  );
};

export default FanClubDetail;
