import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { BadgeCheck, BookOpen, Users, Video, Gift, Globe, MapPin, UserPlus, UserMinus } from "lucide-react";
import SendGift from "@/components/SendGift";
import ProfileWall from "@/components/ProfileWall";

const PoetProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchProfile();
      if (user) checkFollowStatus();
    }
  }, [userId, user]);

  const fetchProfile = async () => {
    const { data } = await supabase.from("profiles").select("*").eq("user_id", userId!).single();
    setProfile(data);
    setLoading(false);
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
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="relative h-64 md:h-80 bg-gradient-hero overflow-hidden">
        {profile.cover_image_url && <img src={profile.cover_image_url} alt="Cover" className="w-full h-full object-cover" />}
      </div>

      <div className="container mx-auto px-6 max-w-5xl -mt-20 relative z-10 pb-20">
        <div className="grid lg:grid-cols-[320px_1fr] gap-8">
          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-3xl border border-border p-8 shadow-xl">
              <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-brand flex items-center justify-center border-4 border-card overflow-hidden shadow-lg">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="font-display text-4xl font-bold text-white">{(profile.display_name || "?")[0].toUpperCase()}</span>
                )}
              </div>

              <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-2">
                  <h1 className="font-display text-2xl font-bold text-foreground">{profile.display_name || "Unnamed Poet"}</h1>
                  {profile.is_verified && <BadgeCheck className="w-5 h-5 text-secondary" />}
                </div>
                <p className="font-body text-sm text-muted-foreground mt-1">{profile.language} · {profile.country}</p>
                {profile.bio && <p className="font-body text-sm text-foreground/80 mt-4 leading-relaxed">{profile.bio}</p>}
              </div>

              <div className="flex flex-col gap-3">
                {user?.id !== userId && (
                  <>
                    <button
                      onClick={handleFollow}
                      className={`w-full py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all ${isFollowing ? "bg-muted text-foreground" : "bg-primary text-white shadow-brand hover:scale-105"}`}
                    >
                      {isFollowing ? <><UserMinus className="w-4 h-4 inline mr-2" /> Unfollow</> : <><UserPlus className="w-4 h-4 inline mr-2" /> Follow</>}
                    </button>
                    <SendGift recipientId={userId!} recipientName={profile.display_name || "Poet"} />
                  </>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 mt-8">
                <div className="text-center p-3 bg-muted/30 rounded-2xl">
                  <p className="font-display text-xl font-bold text-foreground">{profile.followers_count}</p>
                  <p className="font-body text-[10px] text-muted-foreground uppercase font-bold">Followers</p>
                </div>
                <div className="text-center p-3 bg-muted/30 rounded-2xl">
                  <p className="font-display text-xl font-bold text-foreground">{profile.total_gifts_received}</p>
                  <p className="font-body text-[10px] text-muted-foreground uppercase font-bold">Gifts</p>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="space-y-8">
            <ProfileWall userId={userId!} isOwnProfile={user?.id === userId} />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PoetProfile;