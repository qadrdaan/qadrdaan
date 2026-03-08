import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";
import { Trophy } from "lucide-react";

const CreateCompetition = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    theme: "",
    language: "Urdu",
    max_entries: 50,
    entry_deadline: "",
    voting_deadline: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return navigate("/auth");
    if (!form.title || !form.entry_deadline || !form.voting_deadline) {
      toast.error("Please fill in all required fields");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("competitions").insert({
      organizer_id: user.id,
      title: form.title,
      description: form.description || null,
      theme: form.theme || null,
      language: form.language || null,
      max_entries: form.max_entries,
      entry_deadline: new Date(form.entry_deadline).toISOString(),
      voting_deadline: new Date(form.voting_deadline).toISOString(),
      status: "active" as any,
    });
    setSaving(false);
    if (error) {
      toast.error("Failed to create competition");
    } else {
      toast.success("Competition created!");
      navigate("/competitions");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-6 pt-28 pb-16 max-w-2xl">
        <div className="flex items-center gap-3 mb-8">
          <Trophy className="w-8 h-8 text-accent" />
          <h1 className="font-display text-3xl font-bold text-foreground">Create Competition</h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6 bg-card rounded-xl border border-border p-8">
          <div>
            <label className="block text-sm font-body font-semibold text-foreground mb-2">Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground font-body focus:ring-2 focus:ring-accent outline-none"
              placeholder="e.g. Spring Ghazal Challenge"
            />
          </div>
          <div>
            <label className="block text-sm font-body font-semibold text-foreground mb-2">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground font-body focus:ring-2 focus:ring-accent outline-none h-28 resize-none"
              placeholder="Describe the competition rules and theme..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-body font-semibold text-foreground mb-2">Theme</label>
              <input
                type="text"
                value={form.theme}
                onChange={(e) => setForm({ ...form, theme: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground font-body focus:ring-2 focus:ring-accent outline-none"
                placeholder="e.g. Love, Nature"
              />
            </div>
            <div>
              <label className="block text-sm font-body font-semibold text-foreground mb-2">Language</label>
              <select
                value={form.language}
                onChange={(e) => setForm({ ...form, language: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground font-body focus:ring-2 focus:ring-accent outline-none"
              >
                <option>Urdu</option>
                <option>Hindi</option>
                <option>English</option>
                <option>Punjabi</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-body font-semibold text-foreground mb-2">Entry Deadline *</label>
              <input
                type="datetime-local"
                value={form.entry_deadline}
                onChange={(e) => setForm({ ...form, entry_deadline: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground font-body focus:ring-2 focus:ring-accent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-body font-semibold text-foreground mb-2">Voting Deadline *</label>
              <input
                type="datetime-local"
                value={form.voting_deadline}
                onChange={(e) => setForm({ ...form, voting_deadline: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground font-body focus:ring-2 focus:ring-accent outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-body font-semibold text-foreground mb-2">Max Entries</label>
            <input
              type="number"
              value={form.max_entries}
              onChange={(e) => setForm({ ...form, max_entries: parseInt(e.target.value) || 50 })}
              className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground font-body focus:ring-2 focus:ring-accent outline-none"
              min={2}
              max={200}
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 rounded-lg bg-gradient-gold text-primary font-body font-bold text-sm shadow-gold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {saving ? "Creating..." : "Create Competition"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateCompetition;
