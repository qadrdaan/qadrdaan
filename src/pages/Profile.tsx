import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { BadgeCheck, BookOpen, Users, Video, Gift } from "lucide-react";

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
      <div className="pt-24 pb-16 container mx-auto px-6 max-w-3xl">
        <motion.div
          className="bg-card rounded-2xl border border-border p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <div className="flex items-start gap-6 mb-8">
            <div className="w-24 h-24 rounded-full bg-gradient-gold flex items-center justify-center shrink-0">
              <span className="font-display text-3xl font-bold text-primary">
                {(profile.display_name || "?")[0].toUpperCase()}
              </span>
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
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
