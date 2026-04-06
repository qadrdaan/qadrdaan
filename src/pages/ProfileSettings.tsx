import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { motion } from "framer-motion";
import { Eye, EyeOff, Bell, BellOff, Shield, MessageCircle, Save } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ProfileSettingsData {
  followers_visibility: string;
  following_visibility: string;
  notify_likes: boolean;
  notify_comments: boolean;
  notify_follows: boolean;
  notify_gifts: boolean;
  notify_messages: boolean;
  notify_mentions: boolean;
  allow_messages_from: string;
  show_activity_status: boolean;
}

const defaultSettings: ProfileSettingsData = {
  followers_visibility: "visible",
  following_visibility: "visible",
  notify_likes: true,
  notify_comments: true,
  notify_follows: true,
  notify_gifts: true,
  notify_messages: true,
  notify_mentions: true,
  allow_messages_from: "everyone",
  show_activity_status: true,
};

const ProfileSettings = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [settings, setSettings] = useState<ProfileSettingsData>(defaultSettings);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [loading, user, navigate]);

  useEffect(() => {
    const fetch = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("profile_settings")
        .select("*")
        .eq("user_id", user.id)
        .single();
      if (data) {
        setSettings({
          followers_visibility: data.followers_visibility,
          following_visibility: data.following_visibility,
          notify_likes: data.notify_likes,
          notify_comments: data.notify_comments,
          notify_follows: data.notify_follows,
          notify_gifts: data.notify_gifts,
          notify_messages: data.notify_messages,
          notify_mentions: data.notify_mentions,
          allow_messages_from: data.allow_messages_from,
          show_activity_status: data.show_activity_status,
        });
      }
      setLoaded(true);
    };
    fetch();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profile_settings")
      .upsert({ user_id: user.id, ...settings, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
    if (error) toast.error("Failed to save settings");
    else toast.success("Settings saved!");
    setSaving(false);
  };

  const toggle = (key: keyof ProfileSettingsData) =>
    setSettings((s) => ({ ...s, [key]: !s[key] }));

  if (loading || !loaded) return null;

  return (
    <DashboardLayout profileData={profile} isOwnProfile={true}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-2xl">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold text-foreground">Settings</h1>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>

        {/* Privacy Section */}
        <section className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <Shield className="w-5 h-5 text-primary" />
            <h2 className="font-display text-lg font-bold text-foreground">Privacy</h2>
          </div>
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-body text-sm font-bold text-foreground">Followers List</Label>
                <p className="font-body text-xs text-muted-foreground">Who can see your followers</p>
              </div>
              <Select value={settings.followers_visibility} onValueChange={(v) => setSettings((s) => ({ ...s, followers_visibility: v }))}>
                <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="visible">Everyone</SelectItem>
                  <SelectItem value="followers_only">Followers Only</SelectItem>
                  <SelectItem value="hidden">Hidden</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-body text-sm font-bold text-foreground">Following List</Label>
                <p className="font-body text-xs text-muted-foreground">Who can see who you follow</p>
              </div>
              <Select value={settings.following_visibility} onValueChange={(v) => setSettings((s) => ({ ...s, following_visibility: v }))}>
                <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="visible">Everyone</SelectItem>
                  <SelectItem value="followers_only">Followers Only</SelectItem>
                  <SelectItem value="hidden">Hidden</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-body text-sm font-bold text-foreground">Activity Status</Label>
                <p className="font-body text-xs text-muted-foreground">Show when you're online</p>
              </div>
              <Switch checked={settings.show_activity_status} onCheckedChange={() => toggle("show_activity_status")} />
            </div>
          </div>
        </section>

        {/* Notification Preferences */}
        <section className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <Bell className="w-5 h-5 text-primary" />
            <h2 className="font-display text-lg font-bold text-foreground">Notifications</h2>
          </div>
          <div className="space-y-4">
            {([
              { key: "notify_likes" as const, label: "Likes", desc: "When someone likes your post" },
              { key: "notify_comments" as const, label: "Comments", desc: "When someone comments" },
              { key: "notify_follows" as const, label: "Follows", desc: "When someone follows you" },
              { key: "notify_gifts" as const, label: "Gifts", desc: "When you receive a gift" },
              { key: "notify_messages" as const, label: "Messages", desc: "New direct messages" },
              { key: "notify_mentions" as const, label: "Mentions", desc: "When you're mentioned" },
            ]).map((item) => (
              <div key={item.key} className="flex items-center justify-between">
                <div>
                  <Label className="font-body text-sm font-bold text-foreground">{item.label}</Label>
                  <p className="font-body text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <Switch checked={settings[item.key] as boolean} onCheckedChange={() => toggle(item.key)} />
              </div>
            ))}
          </div>
        </section>

        {/* Messaging */}
        <section className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <MessageCircle className="w-5 h-5 text-primary" />
            <h2 className="font-display text-lg font-bold text-foreground">Messaging</h2>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-body text-sm font-bold text-foreground">Who can message you</Label>
              <p className="font-body text-xs text-muted-foreground">Control who can start conversations</p>
            </div>
            <Select value={settings.allow_messages_from} onValueChange={(v) => setSettings((s) => ({ ...s, allow_messages_from: v }))}>
              <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="everyone">Everyone</SelectItem>
                <SelectItem value="followers">Followers Only</SelectItem>
                <SelectItem value="nobody">Nobody</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </section>
      </motion.div>
    </DashboardLayout>
  );
};

export default ProfileSettings;
