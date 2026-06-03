import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { toast } from "sonner";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { BadgeCheck, Camera, ImagePlus, Settings } from "lucide-react";
import ProfileWall from "@/components/ProfileWall";
import PromotionObligation from "@/components/PromotionObligation";
import ProfilePhotoDialog from "@/components/ProfilePhotoDialog";
import ProfileAboutSection from "@/components/ProfileAboutSection";
import FeaturedPosts from "@/components/FeaturedPosts";


const Profile = () => {
  const { user, profile, loading, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false);
  
  const [form, setForm] = useState({ display_name: "", bio: "", language: "", country: "" });
  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [suggestedUsers, setSuggestedUsers] = useState<any[]>([]);
  const coverRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (!loading && !user) navigate("/auth"); }, [loading, user, navigate]);
  useEffect(() => {
    if (profile) setForm({ display_name: profile.display_name || "", bio: profile.bio || "", language: profile.language || "", country: profile.country || "" });
  }, [profile]);

  useEffect(() => {
    const fetchSuggested = async () => {
      const { data } = await supabase.from("profiles").select("user_id, display_name, is_verified, followers_count").order("followers_count", { ascending: false }).limit(4);
      if (data) setSuggestedUsers(data.filter((u: any) => u.user_id !== user?.id));
    };
    if (user) fetchSuggested();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update(form).eq("user_id", user.id);
    if (error) toast.error("Failed to update profile");
    else { toast.success("Profile updated!"); await refreshProfile(); setEditing(false); }
    setSaving(false);
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate
    const img = new window.Image();
    const url = URL.createObjectURL(file);
    img.onload = async () => {
      URL.revokeObjectURL(url);
      if (!["image/jpeg", "image/png"].includes(file.type)) { toast.error("Only JPG/PNG allowed"); return; }
      if (img.width < 500 || img.height < 500) { toast.error("Min size: 500×500px"); return; }
      if (img.width > 5000 || img.height > 5000) { toast.error("Max size: 5000×5000px"); return; }

      setUploadingCover(true);
      const path = `${user.id}/cover-${Date.now()}`;
      const { error } = await supabase.storage.from("cover-images").upload(path, file, { upsert: true });
      if (error) { toast.error("Upload failed"); }
      else {
        const { data: { publicUrl } } = supabase.storage.from("cover-images").getPublicUrl(path);
        await supabase.from("profiles").update({ cover_image_url: publicUrl }).eq("user_id", user.id);
        toast.success("Cover updated!"); await refreshProfile();
      }
      setUploadingCover(false);
    };
    img.src = url;
  };

  if (loading || !profile) return null;

  return (
    <DashboardLayout profileData={profile} isOwnProfile={true} suggestedUsers={suggestedUsers}>
      {/* Cover */}
      <div className="relative h-48 sm:h-64 md:h-72 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl overflow-hidden mb-6 group">
        {profile.cover_image_url ? (
          <img src={profile.cover_image_url} alt="Cover" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
            <p className="font-body text-muted-foreground/40 text-sm font-bold uppercase tracking-widest">Add Cover Photo</p>
          </div>
        )}
        <button onClick={() => coverRef.current?.click()} disabled={uploadingCover}
          className="absolute top-3 right-3 px-4 py-2 rounded-xl bg-card/80 backdrop-blur-md text-foreground font-body text-xs font-bold flex items-center gap-2 hover:bg-card transition-all border border-border opacity-0 group-hover:opacity-100">
          <ImagePlus className="w-4 h-4" />
          {uploadingCover ? "Uploading..." : "Edit Cover"}
        </button>
        <input ref={coverRef} type="file" accept="image/jpeg,image/png" className="hidden" onChange={handleCoverUpload} />
      </div>

      {/* Profile card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-2xl border border-border p-6 sm:p-8 shadow-sm -mt-16 relative z-10 mb-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6">
          {/* Avatar with LIVE badge */}
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 group cursor-pointer -mt-16 sm:-mt-20" onClick={() => setPhotoDialogOpen(true)}>
            <div className="w-full h-full rounded-full bg-gradient-brand flex items-center justify-center border-4 border-card overflow-hidden shadow-lg">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="font-display text-3xl font-bold text-primary-foreground">{(profile.display_name || "?")[0].toUpperCase()}</span>
              )}
            </div>
            <div className="absolute inset-0 rounded-full bg-foreground/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1 font-body text-[9px] font-bold text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Edit DP
            </span>
          </div>

          <div className="flex-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground">{profile.display_name || "Unnamed"}</h1>
              {profile.is_verified && <BadgeCheck className="w-5 h-5 text-primary" />}
            </div>
            {profile.username && <p className="font-body text-sm text-muted-foreground">@{profile.username}</p>}
            {profile.bio && <p className="font-body text-sm text-foreground/80 mt-1 leading-relaxed max-w-lg">{profile.bio}</p>}

            {/* Horizontal stats */}
            <div className="flex items-center justify-center sm:justify-start gap-6 mt-3">
              <div className="text-center">
                <span className="font-display text-lg font-bold text-foreground">{profile.followers_count}</span>
                <span className="font-body text-xs text-muted-foreground ml-1">Followers</span>
              </div>
              <div className="text-center">
                <span className="font-display text-lg font-bold text-foreground">{profile.following_count}</span>
                <span className="font-body text-xs text-muted-foreground ml-1">Following</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => navigate("/settings")} className="p-2 bg-muted text-foreground rounded-xl hover:bg-muted/80 transition-colors">
              <Settings className="w-4 h-4" />
            </button>
            {editing ? (
              <>
                <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-bold">Save</button>
                <button onClick={() => setEditing(false)} className="px-4 py-2 bg-muted text-foreground rounded-xl text-xs font-bold">Cancel</button>
              </>
            ) : (
              <button onClick={() => setEditing(true)} className="px-5 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity">Edit Profile</button>
            )}
          </div>
        </div>

        {editing && (
          <div className="mt-6 space-y-3 max-w-md">
            <input value={form.display_name} onChange={e => setForm({ ...form, display_name: e.target.value })} className="w-full px-4 py-2 rounded-xl bg-muted border-none text-sm font-body" placeholder="Display Name" />
            <textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} className="w-full px-4 py-2 rounded-xl bg-muted border-none text-sm font-body resize-none" rows={3} placeholder="Bio" />
          </div>
        )}
      </motion.div>

      <div className="space-y-6">
        <ProfileAboutSection profile={profile} isOwnProfile={true} onUpdate={refreshProfile} />
        <FeaturedPosts userId={user!.id} isOwnProfile={true} />
        <PromotionObligation />
        <ProfileWall userId={user!.id} isOwnProfile={true} />
      </div>

      <ProfilePhotoDialog isOpen={photoDialogOpen} onClose={() => setPhotoDialogOpen(false)} photoUrl={profile.avatar_url} displayName={profile.display_name || "Poet"} isOwnProfile={true} userId={user!.id} onUpdate={refreshProfile} />
    </DashboardLayout>
  );
};

export default Profile;
