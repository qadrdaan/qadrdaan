import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { Mic, Calendar } from "lucide-react";

const LANGUAGES = ["Urdu", "Hindi", "Punjabi", "English", "Arabic", "Persian", "Other"];
const EVENT_TYPES = [
  { value: "open", label: "Open Mushaira" },
  { value: "curated", label: "Curated Mushaira" },
  { value: "themed", label: "Themed Mushaira" },
  { value: "international", label: "International Mushaira" },
];

const CreateMushaira = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    event_type: "open",
    language: "",
    theme: "",
    scheduled_at: "",
    max_performers: 20,
  });

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [loading, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!form.scheduled_at) {
      toast.error("Please select a date and time");
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from("mushaira_events").insert({
      organizer_id: user.id,
      title: form.title,
      description: form.description || null,
      event_type: form.event_type as any,
      language: form.language || null,
      theme: form.theme || null,
      scheduled_at: new Date(form.scheduled_at).toISOString(),
      max_performers: form.max_performers,
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Mushaira event created!");
      navigate("/mushairas");
    }
    setSubmitting(false);
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 container mx-auto px-6 max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">
            Host a Mushaira
          </h1>
          <p className="font-body text-muted-foreground mb-8">
            Create a live poetry gathering for poets and audiences worldwide.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block font-body text-sm font-medium text-foreground mb-1.5">Title *</label>
              <input
                type="text"
                required
                maxLength={200}
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground font-body focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="e.g. Evening of Ghazals"
              />
            </div>

            <div>
              <label className="block font-body text-sm font-medium text-foreground mb-1.5">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground font-body focus:outline-none focus:ring-2 focus:ring-ring"
                rows={3}
                maxLength={2000}
                placeholder="Tell attendees what to expect..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-body text-sm font-medium text-foreground mb-1.5">Event Type</label>
                <select
                  value={form.event_type}
                  onChange={(e) => setForm({ ...form, event_type: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground font-body focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {EVENT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-body text-sm font-medium text-foreground mb-1.5">Language</label>
                <select
                  value={form.language}
                  onChange={(e) => setForm({ ...form, language: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground font-body focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Select</option>
                  {LANGUAGES.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-body text-sm font-medium text-foreground mb-1.5">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Date & Time *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={form.scheduled_at}
                  onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground font-body focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="block font-body text-sm font-medium text-foreground mb-1.5">Max Performers</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={form.max_performers}
                  onChange={(e) => setForm({ ...form, max_performers: parseInt(e.target.value) || 20 })}
                  className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground font-body focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            {form.event_type === "themed" && (
              <div>
                <label className="block font-body text-sm font-medium text-foreground mb-1.5">Theme</label>
                <input
                  type="text"
                  value={form.theme}
                  onChange={(e) => setForm({ ...form, theme: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground font-body focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="e.g. Love & Loss"
                  maxLength={100}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 font-body font-semibold bg-gradient-gold rounded-lg text-primary shadow-gold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Mic className="w-5 h-5" />
              {submitting ? "Creating..." : "Create Mushaira"}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default CreateMushaira;
