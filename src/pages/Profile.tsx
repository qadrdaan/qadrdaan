import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { BadgeCheck, BookOpen, Users, Video, Gift, Camera, ImagePlus, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PromotionObligation from "@/components/PromotionObligation";

interface GiftTransaction {
  id: string;
  gift_type: string;
  amount: number;
  coin_cost: number;
  message: string | null;
  created_at: string;
  sender_id: string;
  recipient_id: string;
  sender_profile?: {
    display_name: string | null;
    avatar_url: string | null;
  };
  recipient_profile?: {
    display_name: string | null;
    avatar_url: string | null;
  };
}

const Profile = () => {
  const { user, profile, loading, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    display_name: "",
    bio: "",
    language: "",
    country: "",
  });
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [giftsReceived, setGiftsReceived] = useState<GiftTransaction[]>([]);
  const [giftsSent, setGiftsSent] = useState<GiftTransaction[]>([]);
  const [loadingGifts, setLoadingGifts] = useState(false);
  const avatarRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [loading, user, navigate]);

  useEffect(() => {
    if (profile) {
      setForm({
        display_name: profile.display_name || "",
        bio: profile.bio || "",
        language: profile.language || "",
        country: profile.country || "",
      });
    }
  }, [profile]);

  useEffect(() => {
    const fetchGiftHistory = async () => {
      if (!user) return;
      setLoadingGifts(true);

      // Fetch gifts received
      const { data: receivedData } = await supabase
        .from("gifts")
        .select("*")
        .eq("recipient_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);

      // Fetch sender profiles
      if (receivedData && receivedData.length > 0) {
        const senderIds = [...new Set(receivedData.map(g => g.sender_id))];
        const { data: senderProfiles } = await supabase
          .from("profiles")
          .select("user_id, display_name, avatar_url")
          .in("user_id", senderIds);

        const profilesMap = new Map(senderProfiles?.map(p => [p.user_id, p]) || []);
        const receivedWithProfiles = receivedData.map(gift => ({
          ...gift,
          sender_profile: profilesMap.get(gift.sender_id),
        }));
        setGiftsReceived(receivedWithProfiles);
      }

      // Fetch gifts sent
      const { data: sentData } = await supabase
        .from("gifts")
        .select("*")
        .eq("sender_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);

      // Fetch recipient profiles
      if (sentData && sentData.length > 0) {
        const recipientIds = [...new Set(sentData.map(g => g.recipient_id))];
        const { data: recipientProfiles } = await supabase
          .from("profiles")
          .select("user_id, display_name, avatar_url")
          .in("user_id", recipientIds);

        const profilesMap = new Map(recipientProfiles?.map(p => [p.user_id, p]) || []);
        const sentWithProfiles = sentData.map(gift => ({
          ...gift,
          recipient_profile: profilesMap.get(gift.recipient_id),
        }));
        setGiftsSent(sentWithProfiles);
      }

      setLoadingGifts(false);
    };

    if (user) fetchGiftHistory();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update(form)
      .eq("user_id", user.id);

    if (error) {
      toast.error("Failed to update profile");
    } else {
      toast.success("Profile updated!");
      await refreshProfile();
      setEditing(false);
    }
    setSaving(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploadingAvatar(true);
    const path = `${user.id}/avatar-${Date.now()}`;
    const { error } = await supabase.storage.from("cover-images").upload(path, file, { upsert: true });
    if (error) { toast.error("Upload failed"); setUploadingAvatar(false); return; }
    const { data: { publicUrl } } = supabase.storage.from("cover-images").getPublicUrl(path);
    await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("user_id", user.id);
    toast.success("Avatar updated!");
    await refreshProfile();
    setUploadingAvatar(false);
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploadingCover(true);
    const path = `${user.id}/cover-${Date.now()}`;
    const { error } = await supabase.storage.from("cover-images").upload(path, file, { upsert: true });
    if (error) { toast.error("Upload failed"); setUploadingCover(false); return; }
    const { data: { publicUrl } } = supabase.storage.from("cover-images").getPublicUrl(path);
    await supabase.from("profiles").update({ cover_image_url: publicUrl }).eq("user_id", user.id);
    toast.success("Cover image updated!");
    await refreshProfile();
    setUploadingCover(false);
  };

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="font-body text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Cover Image */}
      <div className="relative h-48 md:h-56 bg-gradient-hero overflow-hidden">
        {(profile as any).cover_image_url && (
          <img src={(profile as any).cover_image_url} alt="Cover" className="w-full h-full object-cover" />
        )}
        <button
          onClick={() => coverRef.current?.click()}
          disabled={uploadingCover}
          className="absolute bottom-4 right-4 px-3 py-2 rounded-lg bg-primary/70 backdrop-blur-sm text-primary-foreground font-body text-xs font-medium flex items-center gap-1.5 hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          <ImagePlus className="w-3.5 h-3.5" />
          {uploadingCover ? "Uploading..." : "Change Cover"}
        </button>
        <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
      </div>

      <div className="container mx-auto px-6 max-w-3xl -mt-14 relative z-10 pb-16">
        <motion.div
          className="bg-card rounded-2xl border border-border p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <div className="flex items-start gap-6 mb-8">
            <div className="relative shrink-0 -mt-14">
              <div className="w-24 h-24 rounded-full bg-gradient-gold flex items-center justify-center border-4 border-card overflow-hidden">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="font-display text-3xl font-bold text-primary">
                    {(profile.display_name || "?")[0].toUpperCase()}
                  </span>
                )}
              </div>
              <button
                onClick={() => avatarRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
              <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="font-display text-2xl font-bold text-foreground">
                  {profile.display_name || "Unnamed Poet"}
                </h1>
                {profile.is_verified && <BadgeCheck className="w-5 h-5 text-secondary" />}
                {profile.is_creator && (
                  <span className="px-2 py-0.5 text-xs font-body font-semibold bg-secondary/20 text-secondary rounded-full">
                    Creator
                  </span>
                )}
              </div>
              <p className="font-body text-sm text-muted-foreground mt-1">
                {profile.language && `${profile.language}`}
                {profile.country && ` · ${profile.country}`}
              </p>
              {profile.bio && (
                <p className="font-body text-foreground/80 mt-3">{profile.bio}</p>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
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

          {/* Edit Form */}
          {editing ? (
            <div className="space-y-4">
              {(["display_name", "bio", "language", "country"] as const).map((field) => (
                <div key={field}>
                  <label className="block font-body text-sm font-medium text-foreground mb-1 capitalize">
                    {field.replace("_", " ")}
                  </label>
                  {field === "bio" ? (
                    <textarea
                      value={form[field]}
                      onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground font-body focus:outline-none focus:ring-2 focus:ring-ring"
                      rows={3}
                    />
                  ) : (
                    <input
                      type="text"
                      value={form[field]}
                      onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground font-body focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  )}
                </div>
              ))}
              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-2.5 font-body font-semibold bg-gradient-gold rounded-lg text-primary shadow-gold hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="px-6 py-2.5 font-body font-semibold border border-border rounded-lg text-foreground hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="px-6 py-2.5 font-body font-semibold bg-gradient-gold rounded-lg text-primary shadow-gold hover:opacity-90 transition-opacity"
            >
              Edit Profile
            </button>
          )}

          {/* Gift History */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-secondary" />
                Gift History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="received" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="received" className="flex items-center gap-2">
                    <ArrowDownLeft className="w-4 h-4" />
                    Received ({giftsReceived.length})
                  </TabsTrigger>
                  <TabsTrigger value="sent" className="flex items-center gap-2">
                    <ArrowUpRight className="w-4 h-4" />
                    Sent ({giftsSent.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="received">
                  {loadingGifts ? (
                    <p className="text-center font-body text-muted-foreground py-8">Loading...</p>
                  ) : giftsReceived.length === 0 ? (
                    <p className="text-center font-body text-muted-foreground py-8">No gifts received yet</p>
                  ) : (
                    <div className="space-y-3">
                      {giftsReceived.map((gift) => (
                        <div
                          key={gift.id}
                          className="flex items-center gap-4 p-4 rounded-xl bg-background border border-border"
                        >
                          <div className="flex items-center gap-3 flex-1">
                            {gift.sender_profile?.avatar_url ? (
                              <img
                                src={gift.sender_profile.avatar_url}
                                alt={gift.sender_profile.display_name || "User"}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gradient-gold flex items-center justify-center text-primary font-bold text-sm">
                                {(gift.sender_profile?.display_name || "?")[0].toUpperCase()}
                              </div>
                            )}
                            <div className="flex-1">
                              <p className="font-body font-semibold text-foreground">
                                {gift.sender_profile?.display_name || "Anonymous"} sent you a gift
                              </p>
                              <p className="font-body text-sm text-muted-foreground">
                                {new Date(gift.created_at).toLocaleDateString()} • {gift.gift_type}
                              </p>
                              {gift.message && (
                                <p className="font-body text-sm text-foreground/70 mt-1 italic">
                                  "{gift.message}"
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="font-display text-lg font-bold text-secondary">
                                ×{gift.amount}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="sent">
                  {loadingGifts ? (
                    <p className="text-center font-body text-muted-foreground py-8">Loading...</p>
                  ) : giftsSent.length === 0 ? (
                    <p className="text-center font-body text-muted-foreground py-8">No gifts sent yet</p>
                  ) : (
                    <div className="space-y-3">
                      {giftsSent.map((gift) => (
                        <div
                          key={gift.id}
                          className="flex items-center gap-4 p-4 rounded-xl bg-background border border-border"
                        >
                          <div className="flex items-center gap-3 flex-1">
                            {gift.recipient_profile?.avatar_url ? (
                              <img
                                src={gift.recipient_profile.avatar_url}
                                alt={gift.recipient_profile.display_name || "User"}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gradient-gold flex items-center justify-center text-primary font-bold text-sm">
                                {(gift.recipient_profile?.display_name || "?")[0].toUpperCase()}
                              </div>
                            )}
                            <div className="flex-1">
                              <p className="font-body font-semibold text-foreground">
                                You sent a gift to {gift.recipient_profile?.display_name || "Anonymous"}
                              </p>
                              <p className="font-body text-sm text-muted-foreground">
                                {new Date(gift.created_at).toLocaleDateString()} • {gift.gift_type}
                              </p>
                              {gift.message && (
                                <p className="font-body text-sm text-foreground/70 mt-1 italic">
                                  "{gift.message}"
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="font-display text-lg font-bold text-secondary">
                                {gift.coin_cost} coins
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
