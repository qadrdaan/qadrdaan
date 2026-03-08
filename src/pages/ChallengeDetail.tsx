import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowLeft, Clock, Send } from "lucide-react";

interface Entry {
  id: string;
  user_id: string;
  content: string;
  votes_count: number;
  created_at: string;
  display_name?: string;
}

const ChallengeDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [challenge, setChallenge] = useState<any>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [newEntry, setNewEntry] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchChallenge = async () => {
    const { data } = await supabase.from("poetry_challenges").select("*").eq("id", id).single();
    setChallenge(data);
    setLoading(false);
  };

  const fetchEntries = async () => {
    const { data } = await supabase.from("challenge_entries").select("*").eq("challenge_id", id).order("votes_count", { ascending: false });
    if (!data) return;
    const userIds = [...new Set(data.map((e: any) => e.user_id))];
    const { data: profiles } = await supabase.from("profiles").select("user_id, display_name").in("user_id", userIds);
    const nameMap = new Map(profiles?.map((p: any) => [p.user_id, p.display_name]) || []);
    setEntries(data.map((e: any) => ({ ...e, display_name: nameMap.get(e.user_id) || "Anonymous" })));
  };

  useEffect(() => { fetchChallenge(); fetchEntries(); }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast.error("Sign in to participate"); return; }
    if (!newEntry.trim()) return;
    setSubmitting(true);
    const { error } = await supabase.from("challenge_entries").insert({ challenge_id: id!, user_id: user.id, content: newEntry.trim() });
    if (error?.code === "23505") { toast.error("You already submitted"); } else if (error) { toast.error("Failed to submit"); } else { toast.success("Entry submitted!"); setNewEntry(""); fetchEntries(); }
    setSubmitting(false);
  };

  if (loading) return <div className="min-h-screen bg-background"><Navbar /><p className="pt-28 text-center font-body text-muted-foreground">Loading...</p></div>;
  if (!challenge) return <div className="min-h-screen bg-background"><Navbar /><p className="pt-28 text-center font-body text-muted-foreground">Challenge not found</p></div>;

  const isActive = challenge.status === "active" && new Date(challenge.ends_at) > new Date();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-28 pb-20 container mx-auto px-6 max-w-3xl">
        <Link to="/challenges" className="inline-flex items-center gap-2 font-body text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> All Challenges
        </Link>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-2xl p-8 mb-8">
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-3">{challenge.title}</h1>
          {challenge.description && <p className="font-body text-muted-foreground mb-4">{challenge.description}</p>}
          <div className="flex gap-4 font-body text-sm text-muted-foreground">
            {challenge.theme && <span>Theme: <span className="text-secondary">{challenge.theme}</span></span>}
            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Ends {new Date(challenge.ends_at).toLocaleDateString()}</span>
          </div>
        </motion.div>

        {isActive && user && (
          <form onSubmit={handleSubmit} className="mb-8">
            <label className="block font-body text-sm font-medium text-foreground mb-2">Your Submission</label>
            <textarea value={newEntry} onChange={e => setNewEntry(e.target.value)} rows={5} className="w-full px-4 py-3 rounded-lg bg-card border border-border text-foreground font-body focus:outline-none focus:ring-2 focus:ring-ring mb-3" placeholder="Write your poetry entry..." />
            <button type="submit" disabled={submitting} className="flex items-center gap-2 px-6 py-2.5 font-body font-semibold bg-gradient-gold rounded-lg text-primary shadow-gold hover:opacity-90 transition-opacity disabled:opacity-50">
              <Send className="w-4 h-4" /> {submitting ? "Submitting..." : "Submit Entry"}
            </button>
          </form>
        )}

        <h2 className="font-display text-xl font-bold text-foreground mb-4">Entries ({entries.length})</h2>
        <div className="space-y-4">
          {entries.map((entry, i) => (
            <motion.div key={entry.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <Link to={`/poet/${entry.user_id}`} className="font-body text-sm font-semibold text-foreground hover:text-secondary">{entry.display_name}</Link>
                <span className="font-body text-xs text-muted-foreground">{new Date(entry.created_at).toLocaleDateString()}</span>
              </div>
              <p className="font-body text-foreground/85 whitespace-pre-line leading-relaxed">{entry.content}</p>
            </motion.div>
          ))}
          {entries.length === 0 && <p className="font-body text-sm text-muted-foreground">No entries yet. Be the first!</p>}
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default ChallengeDetail;
