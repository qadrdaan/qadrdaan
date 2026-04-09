import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";
import { Trophy, UserPlus, X } from "lucide-react";

const CreateCompetition = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [inviteInput, setInviteInput] = useState("");
  const [invitedUsers, setInvitedUsers] = useState<string[]>([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    theme: "",
    language: "Urdu",
    max_entries: 50,
    entry_deadline: "",
    voting_deadline: "",
  });

  const addInvite = () => {
    const val = inviteInput.trim();
    if (val && !invitedUsers.includes(val)) {
      setInvitedUsers([...invitedUsers, val]);
    }
    setInviteInput("");
  };

  const removeInvite = (idx: number) => {
    setInvitedUsers(invitedUsers.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return navigate("/auth");
    if (!form.title || !form.entry_deadline || !form.voting_deadline) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (form.max_entries < 2) {
      toast.error("Minimum 2 participants required");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("competitions").insert({
      organizer_id: user.id,
      title: form.title,
      description: form.description || null,
      theme: form.theme || null,
      language: form.language || null,
      max_entries: Math.max(form.max_entries, 2),
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
            <label className="block text-sm font-body font-semibold text-foreground mb-2">Max Entries (min 2)</label>
            <input
              type="number"
              value={form.max_entries}
              onChange={(e) => setForm({ ...form, max_entries: parseInt(e.target.value) || 2 })}
              className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground font-body focus:ring-2 focus:ring-accent outline-none"
              min={2}
              max={200}
            />
          </div>

          {/* Invite Users */}
          <div>
            <label className="block text-sm font-body font-semibold text-foreground mb-2">
              <UserPlus className="w-4 h-4 inline mr-1" /> Invite Users (optional)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={inviteInput}
                onChange={(e) => setInviteInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addInvite(); } }}
                className="flex-1 px-4 py-3 rounded-lg bg-background border border-border text-foreground font-body focus:ring-2 focus:ring-accent outline-none"
                placeholder="Enter username or email"
              />
              <button type="button" onClick={addInvite} className="px-4 py-3 bg-primary text-white rounded-lg text-sm font-bold">
                Invite
              </button>
            </div>
            {invitedUsers.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {invitedUsers.map((u, i) => (
                  <span key={i} className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-body font-medium">
                    {u}
                    <button onClick={() => removeInvite(i)}><X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 rounded-lg bg-primary text-white font-body font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {saving ? "Creating..." : "Create Competition"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateCompetition;
