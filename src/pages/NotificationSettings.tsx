import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Bell, Heart, Gift, MessageCircle, UserPlus, Mic2, Trophy, Save } from "lucide-react";
import { toast } from "sonner";

const TOGGLES = [
  { key: "reactions",    label: "Reactions on your posts", icon: Heart },
  { key: "gifts",        label: "Gifts received",          icon: Gift },
  { key: "comments",     label: "Comments & replies",      icon: MessageCircle },
  { key: "follows",      label: "New followers",           icon: UserPlus },
  { key: "mushaira",     label: "Mushaira live alerts",    icon: Mic2 },
  { key: "competitions", label: "Competitions & awards",   icon: Trophy },
] as const;

const NotificationSettings = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [prefs, setPrefs] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);

  useEffect(() => { if (!loading && !user) navigate("/auth"); }, [loading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from("notification_preferences").select("*").eq("user_id", user.id).maybeSingle();
      if (data) setPrefs(data as any);
      else {
        const defaults: any = { user_id: user.id };
        TOGGLES.forEach(t => defaults[t.key] = true);
        setPrefs(defaults);
      }
    })();
    if ("Notification" in window) setPushEnabled(Notification.permission === "granted");
  }, [user]);

  const requestPush = async () => {
    if (!("Notification" in window)) { toast.error("Push not supported on this device"); return; }
    const result = await Notification.requestPermission();
    setPushEnabled(result === "granted");
    if (result === "granted") toast.success("Browser notifications enabled");
  };

  const save = async () => {
    if (!user) return;
    setBusy(true);
    const payload: any = { user_id: user.id, ...TOGGLES.reduce((acc, t) => ({ ...acc, [t.key]: !!prefs[t.key] }), {}) };
    const { error } = await supabase.from("notification_preferences").upsert(payload, { onConflict: "user_id" });
    if (error) toast.error(error.message); else toast.success("Preferences saved");
    setBusy(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-28 pb-16 container mx-auto px-6 max-w-2xl">
        <div className="flex items-center gap-3 mb-2">
          <Bell className="w-6 h-6 text-primary" />
          <h1 className="font-display text-3xl font-bold text-foreground">Notification Settings</h1>
        </div>
        <p className="font-body text-sm text-muted-foreground mb-8">
          Control which alerts reach you. Browser push is required for instant notifications.
        </p>

        <div className="bg-card border border-border rounded-2xl p-5 mb-6 flex items-center justify-between">
          <div>
            <p className="font-body text-sm font-bold text-foreground">Browser push</p>
            <p className="text-xs text-muted-foreground">{pushEnabled ? "Enabled · You'll receive alerts on this device." : "Off · Click to enable browser notifications."}</p>
          </div>
          {!pushEnabled && (
            <button onClick={requestPush} className="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-lg hover:opacity-90">
              Enable
            </button>
          )}
          {pushEnabled && <span className="text-xs font-bold text-emerald-600">ON</span>}
        </div>

        <div className="bg-card border border-border rounded-2xl divide-y divide-border">
          {TOGGLES.map(t => {
            const Icon = t.icon;
            const checked = !!prefs[t.key];
            return (
              <label key={t.key} className="flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/40 transition-colors">
                <Icon className="w-5 h-5 text-primary" />
                <span className="flex-1 font-body text-sm text-foreground">{t.label}</span>
                <button
                  type="button"
                  onClick={() => setPrefs({ ...prefs, [t.key]: !checked })}
                  className={`relative w-11 h-6 rounded-full transition-colors ${checked ? "bg-primary" : "bg-muted"}`}
                >
                  <span className={`absolute top-0.5 ${checked ? "right-0.5" : "left-0.5"} w-5 h-5 bg-white rounded-full shadow transition-all`} />
                </button>
              </label>
            );
          })}
        </div>

        <button onClick={save} disabled={busy} className="mt-6 w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50">
          <Save className="w-4 h-4" /> {busy ? "Saving..." : "Save Preferences"}
        </button>
      </section>
      <Footer />
    </div>
  );
};

export default NotificationSettings;
