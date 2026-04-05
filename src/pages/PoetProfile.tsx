import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { toast } from "sonner";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { BadgeCheck, UserPlus, UserMinus } from "lucide-react";
import SendGift from "@/components/SendGift";
import ProfileWall from "@/components/ProfileWall";

const PoetProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [suggestedUsers, setSuggestedUsers] = useState<any[]>([]);

  useEffect(() => {
    if (userId) { fetchProfile(); if (user) checkFollowStatus(); }
  }, [userId, user]);

  useEffect(() => {
    const fetchSuggested = async () => {
      const { data } = await supabase.from("profiles").select("user_id, display_name, is_verified, followers_count").order("followers_count", { ascending: false }).limit(5);
      if (data) setSuggestedUsers(data.filter((u: any) => u.user_id !== userId));
    };
    fetchSuggested();
  }, [userId]);

  const fetchProfile = async () => {
    const { data } = await supabase.from("profiles").select("*").eq("user_id", userId!).single();
    setProfile(data); setLoading(false);
  };

  const checkFollowStatus = async () => {
    const { data } = await supabase.from("followers").select("id").eq("follower_id", user!.id).eq("following_id", userId!).maybeSingle();
    setIsFollowing(!!data);
  };

  const handleFollow = async () => {
    if (!user) { toast.error("Please sign in to follow"); return; }
    if (isFollowing) {
      await supabase.from("followers").delete().eq("follower_id", user.id).eq("following_id", userId!);
      setIsFollowing(false);
    } else {
      await supabase.from("followers").insert({ follower_id: user.id, following_id: userId! });
      setIsFollowing(true);
    }
    fetchProfile();
  };

  if (loading || !profile) return null;

  return (
    <DashboardLayout profileData={profile} isOwnProfile={user?.id === userId} suggestedUsers={suggestedUsers}>
      {/* Cover */}
      <div className="relative h-48 sm:h-64 md:h-72 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl overflow-hidden mb-6">
        {profile.cover_image_url && <img src={profile.cover_image_url} alt="Cover" className="w-full h-full object-cover" />}
      </div>

      {/* Profile header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-2xl border border-border p-6 sm:p-8 shadow-sm -mt-16 relative z-10 mb-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6">
          <div className="w-24 h-24 sm:w-28 sm:h-28 -mt-16 sm:-mt-20 rounded-full bg-gradient-brand flex items-center justify-center border-4 border-card overflow-hidden shadow-lg">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="font-display text-3xl font-bold text-white">{(profile.display_name || "?")[0].toUpperCase()}</span>
            )}
          </div>

          <div className="flex-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground">{profile.display_name || "Unnamed Poet"}</h1>
              {profile.is_verified && <BadgeCheck className="w-5 h-5 text-secondary" />}
            </div>
            <p className="font-body text-sm text-muted-foreground">{profile.language} · {profile.country}</p>
            {profile.bio && <p className="font-body text-sm text-foreground/80 mt-2 leading-relaxed max-w-lg">{profile.bio}</p>}
          </div>

          {user?.id !== userId && (
            <div className="flex gap-3">
              <button onClick={handleFollow}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${isFollowing ? "bg-muted text-foreground" : "bg-primary text-white shadow-brand hover:scale-105"}`}>
                {isFollowing ? <><UserMinus className="w-4 h-4 inline mr-2" />Unfollow</> : <><UserPlus className="w-4 h-4 inline mr-2" />Follow</>}
              </button>
              <SendGift recipientId={userId!} recipientName={profile.display_name || "Poet"} />
            </div>
          )}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-border">
          {[
            { label: "Followers", value: profile.followers_count },
            { label: "Following", value: profile.following_count },
            { label: "Gifts", value: profile.total_gifts_received },
            { label: "Books", value: profile.books_count },
          ].map(s => (
            <div key={s.label} className="text-center p-3 bg-muted/30 rounded-xl">
              <p className="font-display text-lg font-bold text-foreground">{s.value}</p>
              <p className="font-body text-[10px] text-muted-foreground uppercase font-bold">{s.label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      <ProfileWall userId={userId!} isOwnProfile={user?.id === userId} />
    </DashboardLayout>
  );
};

export default PoetProfile;
