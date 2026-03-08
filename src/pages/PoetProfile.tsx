import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { Link } from "react-router-dom";
import {
  BadgeCheck, BookOpen, Users, Video, Gift, Globe, MapPin,
  UserPlus, UserMinus, Download,
} from "lucide-react";
import SendGift from "@/components/SendGift";
import type { Tables } from "@/integrations/supabase/types";

type Profile = Tables<"profiles">;
type Book = Tables<"books">;
type VideoRow = Tables<"videos">;

const PoetProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [videos, setVideos] = useState<VideoRow[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchProfile();
      fetchBooks();
      fetchVideos();
      if (user) checkFollowStatus();
    }
  }, [userId, user]);

  const fetchProfile = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId!)
      .single();
    setProfile(data);
    setLoading(false);
  };

  const fetchBooks = async () => {
    const { data } = await supabase
      .from("books")
      .select("*")
      .eq("creator_id", userId!)
      .order("created_at", { ascending: false });
    setBooks(data || []);
  };

  const fetchVideos = async () => {
    const { data } = await supabase
      .from("videos")
      .select("*")
      .eq("creator_id", userId!)
      .order("created_at", { ascending: false });
    setVideos(data || []);
  };

  const checkFollowStatus = async () => {
    const { data } = await supabase
      .from("followers")
      .select("id")
      .eq("follower_id", user!.id)
      .eq("following_id", userId!)
      .maybeSingle();
    setIsFollowing(!!data);
  };

  const handleFollow = async () => {
    if (!user) {
      toast.error("Please sign in to follow poets");
      return;
    }
    if (user.id === userId) return;

    setFollowLoading(true);
    if (isFollowing) {
      await supabase
        .from("followers")
        .delete()
        .eq("follower_id", user.id)
        .eq("following_id", userId!);
      setIsFollowing(false);
      setProfile((p) => p ? { ...p, followers_count: Math.max(p.followers_count - 1, 0) } : p);
    } else {
      await supabase
        .from("followers")
        .insert({ follower_id: user.id, following_id: userId! });
      setIsFollowing(true);
      setProfile((p) => p ? { ...p, followers_count: p.followers_count + 1 } : p);
    }
    setFollowLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 flex items-center justify-center">
          <p className="font-body text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 flex items-center justify-center">
          <p className="font-body text-muted-foreground">Poet not found.</p>
        </div>
      </div>
    );
  }

  const isOwnProfile = user?.id === userId;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero banner */}
      <div className="h-48 bg-gradient-hero overflow-hidden">
        {(profile as any).cover_image_url && (
          <img src={(profile as any).cover_image_url} alt="Cover" className="w-full h-full object-cover" />
        )}
      </div>

      <div className="container mx-auto px-6 max-w-4xl -mt-16 relative z-10 pb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Profile header */}
          <div className="bg-card rounded-2xl border border-border p-6 md:p-8 mb-8">
            <div className="flex flex-col sm:flex-row items-start gap-6">
              {/* Avatar */}
              <div className="w-28 h-28 rounded-full bg-gradient-gold flex items-center justify-center shrink-0 border-4 border-card -mt-16 sm:-mt-20">
                <span className="font-display text-4xl font-bold text-primary">
                  {(profile.display_name || "?")[0].toUpperCase()}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                    {profile.display_name || "Unnamed Poet"}
                  </h1>
                  {profile.is_verified && <BadgeCheck className="w-6 h-6 text-secondary" />}
                  {profile.is_creator && (
                    <span className="px-2.5 py-0.5 text-xs font-body font-semibold bg-secondary/20 text-secondary rounded-full">
                      Creator
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 mt-2 font-body text-sm text-muted-foreground">
                  {profile.language && (
                    <span className="flex items-center gap-1">
                      <Globe className="w-3.5 h-3.5" />
                      {profile.language}
                    </span>
                  )}
                  {profile.country && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {profile.country}
                    </span>
                  )}
                </div>

                {profile.bio && (
                  <p className="font-body text-foreground/80 mt-3 leading-relaxed max-w-2xl">
                    {profile.bio}
                  </p>
                )}

                {/* Follow + Gift buttons */}
                {!isOwnProfile && (
                  <div className="flex items-center gap-3 mt-4">
                    <button
                      onClick={handleFollow}
                      disabled={followLoading}
                      className={`px-6 py-2.5 rounded-lg font-body font-semibold text-sm flex items-center gap-2 transition-all disabled:opacity-50 ${
                        isFollowing
                          ? "border border-border text-foreground hover:bg-muted"
                          : "bg-gradient-gold text-primary shadow-gold hover:opacity-90"
                      }`}
                    >
                      {isFollowing ? (
                        <>
                          <UserMinus className="w-4 h-4" />
                          Following
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4" />
                          Follow
                        </>
                      )}
                    </button>
                    <SendGift
                      recipientId={userId!}
                      recipientName={profile.display_name || "this poet"}
                      onGiftSent={() => fetchProfile()}
                    />
                  </div>
                )}

                {isOwnProfile && (
                  <Link
                    to="/profile"
                    className="mt-4 inline-block px-6 py-2.5 rounded-lg font-body font-semibold text-sm bg-gradient-gold text-primary shadow-gold hover:opacity-90 transition-opacity"
                  >
                    Edit Profile
                  </Link>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
              {[
                { icon: BookOpen, label: "Books", value: profile.books_count },
                { icon: Video, label: "Videos", value: profile.videos_count },
                { icon: Users, label: "Followers", value: profile.followers_count },
                { icon: Gift, label: "Gifts", value: profile.total_gifts_received },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="bg-background rounded-xl p-4 text-center border border-border">
                  <Icon className="w-5 h-5 mx-auto mb-2 text-secondary" />
                  <p className="font-display text-xl font-bold text-foreground">{value}</p>
                  <p className="font-body text-xs text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Books section */}
          <div className="mb-8">
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">
              Published Books
            </h2>
            {books.length === 0 ? (
              <div className="bg-card rounded-xl border border-border p-8 text-center">
                <BookOpen className="w-10 h-10 mx-auto mb-3 text-muted-foreground/40" />
                <p className="font-body text-muted-foreground">No books published yet.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {books.map((book) => (
                  <Link
                    key={book.id}
                    to={`/book/${book.id}`}
                    className="group bg-card rounded-xl border border-border hover:border-secondary/30 hover:shadow-gold transition-all overflow-hidden"
                  >
                    <div className="aspect-[3/4] bg-muted flex items-center justify-center overflow-hidden">
                      {book.cover_url ? (
                        <img
                          src={book.cover_url}
                          alt={book.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <BookOpen className="w-10 h-10 text-muted-foreground/30" />
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-display text-base font-semibold text-foreground line-clamp-1">
                        {book.title}
                      </h3>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex gap-2">
                          {book.language && (
                            <span className="px-2 py-0.5 text-xs font-body bg-muted rounded-full text-muted-foreground">
                              {book.language}
                            </span>
                          )}
                        </div>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Download className="w-3 h-3" />
                          {book.downloads_count}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Videos */}
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">Videos</h2>
            {videos.length === 0 ? (
              <div className="bg-card rounded-xl border border-border p-8 text-center">
                <Video className="w-10 h-10 mx-auto mb-3 text-muted-foreground/40" />
                <p className="font-body text-muted-foreground">No videos uploaded yet.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {videos.map((vid) => (
                  <Link
                    key={vid.id}
                    to={`/video/${vid.id}`}
                    className="group block bg-card rounded-xl border border-border hover:border-secondary/30 hover:shadow-gold transition-all overflow-hidden"
                  >
                    <div className="aspect-video bg-muted flex items-center justify-center overflow-hidden">
                      {vid.thumbnail_url ? (
                        <img src={vid.thumbnail_url} alt={vid.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <Video className="w-8 h-8 text-muted-foreground/30" />
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="font-display text-sm font-semibold text-foreground line-clamp-1">{vid.title}</h3>
                      <p className="font-body text-xs text-muted-foreground mt-1">
                        {vid.views_count} views · {vid.likes_count} likes
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PoetProfile;
