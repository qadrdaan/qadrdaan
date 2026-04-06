import { useState } from "react";
import { Globe, Link2, Plus, X, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ExternalLink {
  label: string;
  url: string;
}

interface ProfileAboutSectionProps {
  profile: any;
  isOwnProfile: boolean;
  onUpdate?: () => void;
}

const categories = ["Creator", "Poet", "Writer", "Artist", "Business", "Educator", "Publisher", "Journalist", "Other"];

const ProfileAboutSection = ({ profile, isOwnProfile, onUpdate }: ProfileAboutSectionProps) => {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [category, setCategory] = useState(profile.category || "Creator");
  const [links, setLinks] = useState<ExternalLink[]>(() => {
    try {
      return Array.isArray(profile.external_links) ? profile.external_links : JSON.parse(profile.external_links || "[]");
    } catch {
      return [];
    }
  });
  const [newLabel, setNewLabel] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [saving, setSaving] = useState(false);

  const addLink = () => {
    if (!newLabel.trim() || !newUrl.trim()) return;
    setLinks((prev) => [...prev, { label: newLabel.trim(), url: newUrl.trim() }]);
    setNewLabel("");
    setNewUrl("");
  };

  const removeLink = (idx: number) => setLinks((prev) => prev.filter((_, i) => i !== idx));

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ category, external_links: links })
      .eq("user_id", user.id);
    if (error) toast.error("Failed to save");
    else { toast.success("Profile updated!"); onUpdate?.(); setEditing(false); }
    setSaving(false);
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg font-bold text-foreground">About</h3>
        {isOwnProfile && !editing && (
          <button onClick={() => setEditing(true)} className="font-body text-xs font-bold text-primary hover:text-primary/80 transition-colors">
            Edit
          </button>
        )}
      </div>

      {/* Category badge */}
      {editing ? (
        <div className="mb-4">
          <label className="font-body text-xs font-bold text-muted-foreground block mb-1">Category</label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c} value={c.toLowerCase()}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary font-body text-xs font-bold capitalize mb-4">
          {profile.category || "Creator"}
        </span>
      )}

      {/* Bio */}
      {profile.bio && (
        <p className="font-body text-sm text-foreground/80 leading-relaxed mb-4">{profile.bio}</p>
      )}

      {/* External links */}
      <div className="space-y-2">
        <h4 className="font-body text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
          <Globe className="w-3 h-3" /> Links
        </h4>
        {links.length === 0 && !editing && (
          <p className="font-body text-xs text-muted-foreground">No links added yet</p>
        )}
        {links.map((link, i) => (
          <div key={i} className="flex items-center gap-2">
            <Link2 className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <a href={link.url} target="_blank" rel="noopener noreferrer" className="font-body text-sm text-primary hover:underline truncate">
              {link.label}
            </a>
            {editing && (
              <button onClick={() => removeLink(i)} className="ml-auto p-1 text-muted-foreground hover:text-destructive">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}
        {editing && (
          <>
            <div className="flex gap-2 mt-2">
              <input value={newLabel} onChange={(e) => setNewLabel(e.target.value)} placeholder="Label" className="flex-1 px-3 py-1.5 rounded-lg bg-muted font-body text-xs border-none" />
              <input value={newUrl} onChange={(e) => setNewUrl(e.target.value)} placeholder="https://..." className="flex-1 px-3 py-1.5 rounded-lg bg-muted font-body text-xs border-none" />
              <button onClick={addLink} className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="flex gap-2 mt-3">
              <button onClick={handleSave} disabled={saving} className="px-4 py-1.5 bg-primary text-primary-foreground rounded-lg font-body text-xs font-bold flex items-center gap-1">
                <Save className="w-3 h-3" /> {saving ? "Saving..." : "Save"}
              </button>
              <button onClick={() => setEditing(false)} className="px-4 py-1.5 bg-muted text-foreground rounded-lg font-body text-xs font-bold">Cancel</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProfileAboutSection;
