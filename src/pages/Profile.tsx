import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { BadgeCheck, Camera, ImagePlus, Sparkles } from "lucide-react";
import ProfileWall from "@/components/ProfileWall";
import PromotionObligation from "@/components/PromotionObligation";
import ProfilePhotoDialog from "@/components/ProfilePhotoDialog";
import DPFilter from "@/components/DPFilter";

const Profile = () => {
  const { user, profile, loading, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false);
  const [currentFilter, setCurrentFilter] = useState('none');
  const [form, setForm] = useState({
    display_name: "",
    bio: "",
    language: "",
    country: "",
  });
  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
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

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update(form).eq("user_id", user.id);
    if (error) toast.error("Failed to update profile");
    else {
      toast.success("Profile updated!");
      await refreshProfile();
      setEditing(false);
    }
    setSaving(false);
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    
    setUploadingCover(true);
    const path = `${user.id}/cover-${Date.now()}`;
    const { error } = await supabase.storage.from("cover-images").upload(path, file, { upsert: true });
    
    if (error) {
      toast.error("Upload failed");
    } else {
      const { data: { publicUrl } } = supabase.storage.from("cover-images").getPublicUrl(path);
      await supabase.from("profiles").update({ cover_image_url: publicUrl }).eq("user_id", user.id);
      toast.success("Cover updated!");
      await refreshProfile();
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
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="relative h-64 md:h-80 bg-gradient-hero overflow-hidden">
        {profile.cover_image_url ? (
          <img src={profile.cover_image_url} alt="Cover" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-slate-900/50 backdrop-blur-sm flex items-center justify-center">
            <p className="font-body text-white/30 text-sm font-bold uppercase tracking-widest">No Cover Photo</p>
          </div>
        )}
        <button
          onClick={() => coverRef.current?.click()}
          disabled={uploadingCover}
          className="absolute bottom-4 right-4 px-4 py-2 rounded-xl bg-black/40 backdrop-blur-md text-white font-body text-xs font-bold flex items-center gap-2 hover:bg-black/60 transition-all border border-white/10"
        >
          <ImagePlus className="w-4 h-4" />
          {uploadingCover ? "Uploading..." : "Update Cover"}
        </button>
        <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
      </div>

      <div className="container mx-auto px-6 max-w-5xl -mt-20 relative z-10 pb-20">
        <div className="grid lg:grid-cols-[320px_1fr] gap-8">
          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-3xl border border-border p-8 shadow-xl">
              <div className="relative w-32 h-32 mx-auto mb-6 group cursor-pointer" onClick={() => setPhotoDialogOpen(true)}>
                <div className={`w-full h-full rounded-full bg-gradient-brand flex items-center justify-center border-4 border-card overflow-hidden shadow-lg transition-all ${filterClasses[currentFilter]}`}>
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-display text-4xl font-bold text-white">{(profile.display_name || "?")[0].toUpperCase()}</span>
                  )}
                </div>
                <div className="absolute inset-0 rounded-full bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="w-8 h-8 text-white" />
                </div>
              </div>

              <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-2">
                  <h1 className="font-display text-2xl font-bold text-foreground">{profile.display_name || "Unnamed Poet"}</h1>
                  {profile.is_verified && <BadgeCheck className="w-5 h-5 text-secondary" />}
                </div>
                <p className="font-body text-sm text-muted-foreground mt-1">{profile.language} · {profile.country}</p>
              </div>

              {editing ? (
                <div className="space-y-4">
                  <input value={form.display_name} onChange={e => setForm({...form, display_name: e.target.value})} className="w-full px-4 py-2 rounded-xl bg-muted border-none text-sm font-body" placeholder="Display Name" />
                  <textarea value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} className="w-full px-4 py-2 rounded-xl bg-muted border-none text-sm font-body resize-none" rows={3} placeholder="Bio" />
                  <div className="flex gap-2">
                    <button onClick={handleSave} disabled={saving} className="flex-1 py-2 bg-primary text-white rounded-xl text-xs font-bold uppercase tracking-wider">Save</button>
                    <button onClick={() => setEditing(false)} className="flex-1 py-2 bg-muted text-foreground rounded-xl text-xs font-bold uppercase tracking-wider">Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <button onClick={() => setEditing(true)} className="w-full py-3 bg-muted text-foreground rounded-2xl text-xs font-bold uppercase tracking-wider hover:bg-muted/80 transition-colors">Edit Profile</button>
                  
                  <div className="pt-6 border-t border-border">
                    <DPFilter 
                      currentFilter={currentFilter} 
                      onSelect={setCurrentFilter} 
                      avatarUrl={profile.avatar_url} 
                      displayName={profile.display_name || "P"} 
                    />
                  </div>
                </div>
              )}

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
            
            <PromotionObligation />
          </div>

          <div className="space-y-8">
            <ProfileWall userId={user.id} isOwnProfile={true} />
          </div>
        </div>
      </div>

      <ProfilePhotoDialog 
        isOpen={photoDialogOpen}
        onClose={() => setPhotoDialogOpen(false)}
        photoUrl={profile.avatar_url}
        displayName={profile.display_name || "Poet"}
        isOwnProfile={true}
        userId={user.id}
        onUpdate={refreshProfile}
      />
      <Footer />
    </div>
  );
};

export default Profile;