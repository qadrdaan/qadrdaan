import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Plus, X, Eye, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { REACTIONS, ReactionType } from "./ReactionPicker";

interface Story {
  id: string;
  creator_id: string;
  media_url: string | null;
  media_type: string;
  caption: string | null;
  background_color: string | null;
  views_count: number;
  reactions_count: number;
  expires_at: string;
  created_at: string;
  creator_name?: string;
}

const StoriesBar = () => {
  const { user, profile } = useAuth();
  const [stories, setStories] = useState<Story[]>([]);
  const [active, setActive] = useState<Story | null>(null);
  const [creating, setCreating] = useState(false);
  const [caption, setCaption] = useState("");
  const [bgColor, setBgColor] = useState("#0A84FF");

  const load = async () => {
    const { data } = await supabase
      .from("stories")
      .select("*")
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false });
    if (!data) return;
    const ids = [...new Set(data.map(s => s.creator_id))];
    const { data: profs } = await supabase.from("profiles").select("user_id, display_name").in("user_id", ids);
    const map = new Map(profs?.map(p => [p.user_id, p.display_name]) || []);
    setStories(data.map(s => ({ ...s, creator_name: map.get(s.creator_id) || "User" })));
  };

  useEffect(() => { load(); }, []);

  const openStory = async (s: Story) => {
    setActive(s);
    if (user && user.id !== s.creator_id) {
      await supabase.from("story_views").insert({ story_id: s.id, user_id: user.id }).select();
    }
  };

  const reactToStory = async (type: ReactionType) => {
    if (!user || !active) return;
    await supabase.from("story_reactions").upsert(
      { story_id: active.id, user_id: user.id, reaction_type: type },
      { onConflict: "story_id,user_id" }
    );
    toast.success("Reaction sent!");
  };

  const createStory = async () => {
    if (!user || !caption.trim()) { toast.error("Add a caption"); return; }
    const { error } = await supabase.from("stories").insert({
      creator_id: user.id,
      media_type: "text",
      caption: caption.trim(),
      background_color: bgColor,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Story posted! Expires in 24 hours.");
    setCaption(""); setCreating(false);
    load();
  };

  // Group by creator (latest first per creator)
  const byCreator = new Map<string, Story>();
  stories.forEach(s => { if (!byCreator.has(s.creator_id)) byCreator.set(s.creator_id, s); });
  const heads = Array.from(byCreator.values());

  return (
    <>
      <div className="bg-card border border-border rounded-2xl p-3 mb-6 overflow-x-auto">
        <div className="flex items-center gap-3 min-w-max">
          {user && (
            <button
              onClick={() => setCreating(true)}
              className="flex flex-col items-center gap-1.5 shrink-0 group"
            >
              <div className="relative w-16 h-16 rounded-full bg-gradient-brand flex items-center justify-center text-white font-bold border-2 border-dashed border-primary/40 group-hover:scale-105 transition-transform">
                {(profile?.display_name || "?")[0].toUpperCase()}
                <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center border-2 border-card">
                  <Plus className="w-3.5 h-3.5" />
                </span>
              </div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Your Story</span>
            </button>
          )}

          {heads.map(s => (
            <button key={s.id} onClick={() => openStory(s)} className="flex flex-col items-center gap-1.5 shrink-0 group">
              <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-secondary via-primary to-accent group-hover:scale-105 transition-transform">
                <div
                  className="w-full h-full rounded-full flex items-center justify-center text-white font-bold border-2 border-card"
                  style={{ background: s.background_color || "hsl(var(--primary))" }}
                >
                  {(s.creator_name || "?")[0].toUpperCase()}
                </div>
              </div>
              <span className="text-[10px] font-bold text-foreground uppercase truncate max-w-[64px]">{s.creator_name}</span>
            </button>
          ))}

          {heads.length === 0 && !user && (
            <p className="text-xs text-muted-foreground py-4 px-2">No stories yet</p>
          )}
        </div>
      </div>

      {/* Create Story Modal */}
      <AnimatePresence>
        {creating && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
            onClick={() => setCreating(false)}
          >
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              onClick={e => e.stopPropagation()}
              className="bg-card rounded-3xl p-6 max-w-md w-full"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-xl font-bold">Create Story</h3>
                <button onClick={() => setCreating(false)}><X className="w-5 h-5" /></button>
              </div>
              <div
                className="rounded-2xl h-64 flex items-center justify-center p-6 mb-4 text-white text-center font-display text-2xl font-bold"
                style={{ background: bgColor }}
              >
                {caption || "Your story preview..."}
              </div>
              <textarea
                value={caption}
                onChange={e => setCaption(e.target.value.slice(0, 200))}
                placeholder="Write something..."
                className="w-full p-3 rounded-xl bg-muted/50 border border-border outline-none mb-3"
                rows={3}
              />
              <div className="flex gap-2 mb-4">
                {["#0A84FF","#FF8C00","#E11D48","#16A34A","#7C3AED","#0F172A"].map(c => (
                  <button key={c} onClick={() => setBgColor(c)}
                    className={`w-8 h-8 rounded-full ${bgColor===c?"ring-2 ring-offset-2 ring-primary":""}`}
                    style={{ background: c }}
                  />
                ))}
              </div>
              <button onClick={createStory} className="w-full py-3 bg-primary text-white rounded-xl font-bold uppercase text-xs tracking-widest">
                Post Story (24h)
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Story Modal */}
      <AnimatePresence>
        {active && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
            onClick={() => setActive(null)}
          >
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              onClick={e => e.stopPropagation()}
              className="relative max-w-md w-full"
            >
              <button onClick={() => setActive(null)} className="absolute -top-12 right-0 text-white"><X className="w-6 h-6" /></button>
              <div
                className="rounded-3xl h-[70vh] flex items-center justify-center p-8 text-white text-center font-display text-3xl font-bold"
                style={{ background: active.background_color || "hsl(var(--primary))" }}
              >
                {active.media_url ? (
                  active.media_type === "video"
                    ? <video src={active.media_url} controls className="rounded-2xl max-h-full" />
                    : <img src={active.media_url} alt="" className="rounded-2xl max-h-full" />
                ) : (
                  active.caption
                )}
              </div>
              <div className="flex items-center justify-between mt-3 text-white">
                <div className="flex items-center gap-3 text-xs font-bold">
                  <span className="font-display">{active.creator_name}</span>
                  <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {active.views_count}</span>
                  <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5" /> {active.reactions_count}</span>
                </div>
              </div>
              <div className="flex items-center justify-center gap-2 mt-4 bg-white/10 backdrop-blur rounded-full p-2">
                {REACTIONS.map(r => (
                  <button key={r.type} onClick={() => reactToStory(r.type)}
                    title={r.label}
                    className="text-2xl p-2 rounded-full hover:scale-150 transition-transform leading-none"
                  >
                    {r.emoji}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default StoriesBar;
