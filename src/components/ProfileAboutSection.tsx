import { useState } from "react";
import { Globe, Link2, Plus, X, Save, Briefcase, GraduationCap, MapPin, Home, Calendar, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface ExternalLink { label: string; url: string; }

interface ProfileAboutSectionProps {
  profile: any;
  isOwnProfile: boolean;
  onUpdate?: () => void;
}

const CATEGORY_GROUPS = [
  {
    group: "🏢 Business & Services",
    items: ["Local Business", "Small Business", "Entrepreneur", "Consulting Agency", "Marketing Agency", "Digital Creator", "E-commerce", "Website", "Software Company", "IT Services", "Startup"],
  },
  {
    group: "🛍️ Shops & Stores",
    items: ["Shopping & Retail", "Clothing Brand", "Beauty Store", "Electronics Store", "Grocery Store", "Book Store", "Mobile Store", "Furniture Store", "Jewelry/Watches", "Online Shopping"],
  },
  {
    group: "🎨 Creative & Personal",
    items: ["Artist", "Graphic Designer", "Photographer", "Video Creator", "Blogger", "Writer", "Gamer", "Public Figure", "Influencer", "Poet"],
  },
  {
    group: "🍔 Food & Hospitality",
    items: ["Restaurant", "Fast Food Restaurant", "Cafe", "Bakery", "Catering Service", "Food Delivery Service"],
  },
  {
    group: "🎓 Education",
    items: ["Education", "School", "College & University", "Tutor/Teacher", "Training Center"],
  },
  {
    group: "📰 Media & News",
    items: ["News & Media Website", "TV Channel", "Radio Station", "Magazine", "Podcast"],
  },
  {
    group: "🏋️ Lifestyle & Health",
    items: ["Gym/Physical Fitness Center", "Health & Wellness Website", "Beauty, Cosmetic & Personal Care", "Medical & Health"],
  },
];

const LANGUAGES = [
  "Urdu", "Punjabi (Pakistani)", "Punjabi (Gurmukhi - India)", "Hindi", "Saraiki", "Balochi", "Sindhi",
  "English", "Arabic", "Persian", "Turkish", "Pashto", "Bengali", "Tamil", "Telugu", "Marathi",
  "Gujarati", "Kannada", "Malayalam", "Odia", "Assamese", "Maithili", "Kashmiri",
  "Spanish", "French", "German", "Portuguese", "Italian", "Russian", "Japanese",
  "Korean", "Chinese (Mandarin)", "Chinese (Cantonese)", "Thai", "Vietnamese", "Indonesian", "Malay",
  "Swahili", "Hausa", "Yoruba", "Amharic", "Somali", "Dutch", "Swedish", "Norwegian",
  "Polish", "Czech", "Greek", "Romanian", "Hungarian", "Filipino", "Nepali",
];

const ProfileAboutSection = ({ profile, isOwnProfile, onUpdate }: ProfileAboutSectionProps) => {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [category, setCategory] = useState(profile.category || "Digital Creator");
  const [links, setLinks] = useState<ExternalLink[]>(() => {
    try { return Array.isArray(profile.external_links) ? profile.external_links : JSON.parse(profile.external_links || "[]"); }
    catch { return []; }
  });
  const [work, setWork] = useState("");
  const [education, setEducation] = useState("");
  const [hometown, setHometown] = useState("");
  const [currentCity, setCurrentCity] = useState(profile.country || "");
  const [dob, setDob] = useState(profile.date_of_birth || "");
  const [dobPublic, setDobPublic] = useState(true);
  const [selectedLangs, setSelectedLangs] = useState<string[]>(() => {
    try { return Array.isArray(profile.preferred_languages) ? profile.preferred_languages : []; }
    catch { return []; }
  });
  const [langVisibility, setLangVisibility] = useState<Record<string, boolean>>({});
  const [newLabel, setNewLabel] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [saving, setSaving] = useState(false);

  const addLink = () => {
    if (!newLabel.trim() || !newUrl.trim()) return;
    setLinks(prev => [...prev, { label: newLabel.trim(), url: newUrl.trim() }]);
    setNewLabel(""); setNewUrl("");
  };
  const removeLink = (idx: number) => setLinks(prev => prev.filter((_, i) => i !== idx));

  const toggleLang = (lang: string) => {
    if (selectedLangs.includes(lang)) {
      setSelectedLangs(prev => prev.filter(l => l !== lang));
    } else if (selectedLangs.length < 5) {
      setSelectedLangs(prev => [...prev, lang]);
    } else {
      toast.error("Max 5 languages allowed");
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      category,
      external_links: JSON.parse(JSON.stringify(links)),
      country: currentCity,
      date_of_birth: dob || null,
      preferred_languages: selectedLangs,
    }).eq("user_id", user.id);
    if (error) toast.error("Failed to save");
    else { toast.success("Profile updated!"); onUpdate?.(); setEditing(false); }
    setSaving(false);
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-base font-bold text-foreground">About</h3>
        {isOwnProfile && !editing && (
          <button onClick={() => setEditing(true)} className="font-body text-xs font-bold text-primary hover:text-primary/80 transition-colors">Edit</button>
        )}
      </div>

      {/* Category */}
      {editing ? (
        <div>
          <label className="font-body text-xs font-bold text-muted-foreground mb-1 block">Category</label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent className="max-h-60">
              {CATEGORY_GROUPS.map(g => (
                <div key={g.group}>
                  <div className="px-2 py-1.5 font-display text-xs font-bold text-muted-foreground">{g.group}</div>
                  {g.items.map(item => (
                    <SelectItem key={item} value={item.toLowerCase()}>{item}</SelectItem>
                  ))}
                </div>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary font-body text-xs font-bold capitalize">
          {profile.category || "Digital Creator"}
        </span>
      )}

      {/* Bio */}
      {profile.bio && <p className="font-body text-sm text-foreground/80 leading-relaxed">{profile.bio}</p>}

      {/* About fields */}
      {editing ? (
        <div className="space-y-3">
          <div>
            <label className="font-body text-xs font-bold text-muted-foreground flex items-center gap-1 mb-1"><Briefcase className="w-3 h-3" />Work</label>
            <input value={work} onChange={e => setWork(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-muted font-body text-sm border-none" placeholder="Company or role" />
          </div>
          <div>
            <label className="font-body text-xs font-bold text-muted-foreground flex items-center gap-1 mb-1"><GraduationCap className="w-3 h-3" />Education</label>
            <input value={education} onChange={e => setEducation(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-muted font-body text-sm border-none" placeholder="School or university" />
          </div>
          <div>
            <label className="font-body text-xs font-bold text-muted-foreground flex items-center gap-1 mb-1"><Home className="w-3 h-3" />Hometown</label>
            <input value={hometown} onChange={e => setHometown(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-muted font-body text-sm border-none" placeholder="Where you're from" />
          </div>
          <div>
            <label className="font-body text-xs font-bold text-muted-foreground flex items-center gap-1 mb-1"><MapPin className="w-3 h-3" />Current City</label>
            <input value={currentCity} onChange={e => setCurrentCity(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-muted font-body text-sm border-none" placeholder="Where you live" />
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="font-body text-xs font-bold text-muted-foreground flex items-center gap-1 mb-1"><Calendar className="w-3 h-3" />Date of Birth</label>
              <input type="date" value={dob} onChange={e => setDob(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-muted font-body text-sm border-none" />
            </div>
            <div className="flex items-center gap-1.5 pt-5">
              <Switch checked={dobPublic} onCheckedChange={setDobPublic} />
              <span className="font-body text-[10px] text-muted-foreground">{dobPublic ? "Public" : "Private"}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {currentCity && (
            <div className="flex items-center gap-2 font-body text-sm text-foreground/70">
              <MapPin className="w-3.5 h-3.5 text-muted-foreground" /> {currentCity}
            </div>
          )}
          {dob && dobPublic && (
            <div className="flex items-center gap-2 font-body text-sm text-foreground/70">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground" /> {new Date(dob).toLocaleDateString()}
            </div>
          )}
        </div>
      )}

      {/* Languages */}
      <div>
        <h4 className="font-body text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1 mb-2">
          <Globe className="w-3 h-3" /> Languages
        </h4>
        {editing ? (
          <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
            {LANGUAGES.map(lang => {
              const active = selectedLangs.includes(lang);
              return (
                <button key={lang} onClick={() => toggleLang(lang)}
                  className={`px-2.5 py-1 rounded-full font-body text-[11px] font-medium transition-all ${
                    active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}>
                  {lang}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {selectedLangs.length > 0 ? selectedLangs.map(l => (
              <span key={l} className="px-2.5 py-1 rounded-full bg-muted text-muted-foreground font-body text-[11px] font-medium">{l}</span>
            )) : (
              <span className="font-body text-xs text-muted-foreground">No languages selected</span>
            )}
          </div>
        )}
      </div>

      {/* Links */}
      <div className="space-y-2">
        <h4 className="font-body text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
          <Link2 className="w-3 h-3" /> Links
        </h4>
        {links.length === 0 && !editing && <p className="font-body text-xs text-muted-foreground">No links added</p>}
        {links.map((link, i) => (
          <div key={i} className="flex items-center gap-2">
            <Link2 className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <a href={link.url} target="_blank" rel="noopener noreferrer" className="font-body text-sm text-primary hover:underline truncate">{link.label}</a>
            {editing && <button onClick={() => removeLink(i)} className="ml-auto p-1 text-muted-foreground hover:text-destructive"><X className="w-3.5 h-3.5" /></button>}
          </div>
        ))}
        {editing && (
          <>
            <div className="flex gap-2 mt-2">
              <input value={newLabel} onChange={e => setNewLabel(e.target.value)} placeholder="Label" className="flex-1 px-3 py-1.5 rounded-lg bg-muted font-body text-xs border-none" />
              <input value={newUrl} onChange={e => setNewUrl(e.target.value)} placeholder="https://..." className="flex-1 px-3 py-1.5 rounded-lg bg-muted font-body text-xs border-none" />
              <button onClick={addLink} className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20"><Plus className="w-4 h-4" /></button>
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
