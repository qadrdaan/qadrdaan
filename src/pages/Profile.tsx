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
import DPFilter from "@/components/DPFilter";
import ProfileAboutSection from "@/components/ProfileAboutSection";
import FeaturedPosts from "@/components/FeaturedPosts";

const Profile = () => {
  const { user, profile, loading, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false);
  const [currentFilter, setCurrentFilter] = useState('none');
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

  if (loading || !profile) return null;

  const filterClasses: Record<string, string> = {
    none: '',
    gold: 'ring-4 ring-accent ring-offset-4',
    silver: 'ring-4 ring-muted-foreground/30 ring-offset-4',
    poetry: 'border-4 border-double border-primary p-1.5',
  };

  return (
    <DashboardLayout profileData={profile} isOwnProfile={true} suggestedUsers={suggestedUsers}>
      {/* Cover */}
      <div className="relative h-48 sm:h-64 md:h-72 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl overflow-hidden mb-6">
        {profile.cover_image_url ? (
          <img src={profile.cover_image_url} alt="Cover" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <p className="font-body text-muted-foreground/40 text-sm font-bold uppercase tracking-widest">No Cover Photo</p>
          </div>
        )}
        <button onClick={() => coverRef.current?.click()} disabled={uploadingCover}
          className="absolute bottom-3 right-3 px-4 py-2 rounded-xl bg-background/60 backdrop-blur-md text-foreground font-body text-xs font-bold flex items-center gap-2 hover:bg-background/80 transition-all border border-border">
          <ImagePlus className="w-4 h-4" />
          {uploadingCover ? "Uploading..." : "Update Cover"}
        </button>
        <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
      </div>

      {/* Profile card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-2xl border border-border p-6 sm:p-8 shadow-sm -mt-16 relative z-10 mb-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6">
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 group cursor-pointer -mt-16 sm:-mt-20" onClick={() => setPhotoDialogOpen(true)}>
            <div className={`w-full h-full rounded-full bg-gradient-brand flex items-center justify-center border-4 border-card overflow-hidden shadow-lg transition-all ${filterClasses[currentFilter]}`}>
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="font-display text-3xl font-bold text-white">{(profile.display_name || "?")[0].toUpperCase()}</span>
              )}
            </div>
            <div className="absolute inset-0 rounded-full bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera className="w-6 h-6 text-white" />
            </div>
          </div>

          <div className="flex-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground">{profile.display_name || "Unnamed"}</h1>
              {profile.is_verified && <BadgeCheck className="w-5 h-5 text-secondary" />}
            </div>
            <p className="font-body text-sm text-muted-foreground">{profile.language} · {profile.country}</p>
            {profile.bio && <p className="font-body text-sm text-foreground/80 mt-2 leading-relaxed max-w-lg">{profile.bio}</p>}
          </div>

          <div className="flex gap-3">
            <button onClick={() => navigate("/settings")} className="p-2 bg-muted text-foreground rounded-xl hover:bg-muted/80 transition-colors">
              <Settings className="w-4 h-4" />
            </button>
            {editing ? (
              <>
                <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold">Save</button>
                <button onClick={() => setEditing(false)} className="px-4 py-2 bg-muted text-foreground rounded-xl text-xs font-bold">Cancel</button>
              </>
            ) : (
              <button onClick={() => setEditing(true)} className="px-5 py-2 bg-muted text-foreground rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-muted/80 transition-colors">Edit Profile</button>
            )}
          </div>
        </div>

        {editing && (
          <div className="mt-6 space-y-3 max-w-md">
            <input value={form.display_name} onChange={e => setForm({ ...form, display_name: e.target.value })} className="w-full px-4 py-2 rounded-xl bg-muted border-none text-sm font-body" placeholder="Display Name" />
            <textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} className="w-full px-4 py-2 rounded-xl bg-muted border-none text-sm font-body resize-none" rows={3} placeholder="Bio" />
          </div>
        )}

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

      <ProfileAboutSection profile={profile} isOwnProfile={true} onUpdate={refreshProfile} />

      <FeaturedPosts userId={user.id} isOwnProfile={true} />

      <DPFilter currentFilter={currentFilter} onSelect={setCurrentFilter} avatarUrl={profile.avatar_url} displayName={profile.display_name || "P"} />
      <div className="mt-6">
        <PromotionObligation />
      </div>

      <div className="mt-8">
        <ProfileWall userId={user.id} isOwnProfile={true} />
      </div>

      <ProfilePhotoDialog isOpen={photoDialogOpen} onClose={() => setPhotoDialogOpen(false)} photoUrl={profile.avatar_url} displayName={profile.display_name || "Poet"} isOwnProfile={true} userId={user.id} onUpdate={refreshProfile} />
    </DashboardLayout>
  );
};

export default Profile;
