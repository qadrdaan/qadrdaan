import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Trophy, ThumbsUp, Award, Medal, Crown, Star, Clock, Users, PenLine } from "lucide-react";
import { format } from "date-fns";

interface Competition {
  id: string;
  organizer_id: string;
  title: string;
  description: string | null;
  theme: string | null;
  language: string | null;
  status: string;
  max_entries: number | null;
  entry_deadline: string;
  voting_deadline: string;
}

interface Entry {
  id: string;
  competition_id: string;
  user_id: string;
  title: string;
  content: string;
  votes_count: number;
  rank: number | null;
  created_at: string;
  display_name?: string;
  has_voted?: boolean;
  award_type?: string | null;
}

const awardIcons: Record<string, { icon: any; label: string; color: string }> = {
  gold: { icon: Crown, label: "Gold", color: "text-accent" },
  silver: { icon: Medal, label: "Silver", color: "text-muted-foreground" },
  bronze: { icon: Award, label: "Bronze", color: "text-secondary" },
  special: { icon: Star, label: "Special Mention", color: "text-accent" },
};

const CompetitionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [competition, setCompetition] = useState<Competition | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSubmit, setShowSubmit] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newEntry, setNewEntry] = useState({ title: "", content: "" });

  const isOrganizer = user?.id === competition?.organizer_id;
  const canSubmit = competition?.status === "active";
  const canVote = competition?.status === "voting" || competition?.status === "active";
  const isEnded = competition?.status === "ended";
  const hasSubmitted = entries.some((e) => e.user_id === user?.id);

  const fetchCompetition = async () => {
    const { data } = await supabase.from("competitions").select("*").eq("id", id!).single();
    setCompetition(data);
  };

  const fetchEntries = async () => {
    const { data: entriesData } = await supabase
      .from("competition_entries")
      .select("*")
      .eq("competition_id", id!)
      .order("votes_count", { ascending: false });

    if (!entriesData) return setEntries([]);

    // Enrich with profile names
    const userIds = [...new Set(entriesData.map((e) => e.user_id))];
    const { data: profiles } = await supabase.from("profiles").select("user_id, display_name").in("user_id", userIds);
    const profileMap = Object.fromEntries((profiles || []).map((p) => [p.user_id, p.display_name]));

    // Get user votes
    let votedEntryIds: string[] = [];
    if (user) {
      const { data: votes } = await supabase
        .from("competition_votes")
        .select("entry_id")
        .eq("user_id", user.id);
      votedEntryIds = (votes || []).map((v) => v.entry_id);
    }

    // Get awards
    const { data: awards } = await supabase.from("competition_awards").select("entry_id, award_type").eq("competition_id", id!);
    const awardMap = Object.fromEntries((awards || []).map((a) => [a.entry_id, a.award_type]));

    setEntries(
      entriesData.map((e, i) => ({
        ...e,
        display_name: profileMap[e.user_id] || "Unknown Poet",
        has_voted: votedEntryIds.includes(e.id),
        award_type: awardMap[e.id] || null,
      }))
    );
  };

  useEffect(() => {
    Promise.all([fetchCompetition(), fetchEntries()]).then(() => setLoading(false));
  }, [id]);

  const handleSubmitEntry = async () => {
    if (!user) return toast.error("Please sign in first");
    if (!newEntry.title || !newEntry.content) return toast.error("Title and poem content required");
    setSubmitting(true);
    const { error } = await supabase.from("competition_entries").insert({
      competition_id: id!,
      user_id: user.id,
      title: newEntry.title,
      content: newEntry.content,
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message.includes("duplicate") ? "You've already submitted" : "Submission failed");
    } else {
      toast.success("Poem submitted!");
      setShowSubmit(false);
      setNewEntry({ title: "", content: "" });
      fetchEntries();
    }
  };

  const handleVote = async (entryId: string, hasVoted: boolean) => {
    if (!user) return toast.error("Please sign in to vote");
    if (hasVoted) {
      await supabase.from("competition_votes").delete().eq("entry_id", entryId).eq("user_id", user.id);
    } else {
      await supabase.from("competition_votes").insert({ entry_id: entryId, user_id: user.id });
    }
    fetchEntries();
  };

  const handleGiveAward = async (entryId: string, userId: string, awardType: string) => {
    const { error } = await supabase.from("competition_awards").insert({
      competition_id: id!,
      entry_id: entryId,
      user_id: userId,
      award_type: awardType,
    });
    if (error) toast.error("Award already given or error");
    else {
      toast.success(`${awardType.charAt(0).toUpperCase() + awardType.slice(1)} award given!`);
      fetchEntries();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-6 pt-28">
          <div className="h-64 rounded-xl bg-card animate-pulse" />
        </div>
      </div>
    );
  }

  if (!competition) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-6 pt-28 text-center">
          <p className="text-muted-foreground font-body">Competition not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-6 pt-28 pb-16 max-w-4xl">
        {/* Header */}
        <div className="bg-gradient-emerald rounded-2xl p-8 mb-8 text-primary-foreground">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Trophy className="w-6 h-6 text-accent" />
                <span className="text-xs font-body font-semibold px-3 py-1 rounded-full bg-accent/20 text-accent">
                  {competition.status === "active" ? "Accepting Entries" : competition.status === "voting" ? "Voting Open" : competition.status === "ended" ? "Ended" : "Upcoming"}
                </span>
              </div>
              <h1 className="font-display text-3xl font-bold mb-2">{competition.title}</h1>
              {competition.description && <p className="font-body text-primary-foreground/80 max-w-xl">{competition.description}</p>}
            </div>
          </div>
          <div className="flex flex-wrap gap-4 mt-6 text-sm font-body text-primary-foreground/70">
            {competition.theme && <span className="flex items-center gap-1"><PenLine className="w-4 h-4" /> {competition.theme}</span>}
            <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> Entries by {format(new Date(competition.entry_deadline), "MMM d, yyyy")}</span>
            <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> Voting by {format(new Date(competition.voting_deadline), "MMM d, yyyy")}</span>
            <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {entries.length} entries</span>
          </div>
        </div>

        {/* Submit Entry */}
        {canSubmit && !hasSubmitted && (
          <div className="mb-8">
            {!showSubmit ? (
              <button
                onClick={() => setShowSubmit(true)}
                className="w-full py-4 rounded-xl border-2 border-dashed border-accent/40 text-accent font-body font-semibold hover:bg-accent/5 transition-colors"
              >
                + Submit Your Poem
              </button>
            ) : (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl border border-border p-6 space-y-4">
                <input
                  type="text"
                  placeholder="Poem title"
                  value={newEntry.title}
                  onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground font-body focus:ring-2 focus:ring-accent outline-none"
                />
                <textarea
                  placeholder="Write your poem here..."
                  value={newEntry.content}
                  onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground font-body focus:ring-2 focus:ring-accent outline-none h-40 resize-none"
                />
                <div className="flex gap-3">
                  <button
                    onClick={handleSubmitEntry}
                    disabled={submitting}
                    className="px-6 py-2.5 rounded-lg bg-gradient-gold text-primary font-body font-bold text-sm shadow-gold hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {submitting ? "Submitting..." : "Submit Poem"}
                  </button>
                  <button onClick={() => setShowSubmit(false)} className="px-6 py-2.5 rounded-lg bg-muted text-muted-foreground font-body text-sm">
                    Cancel
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* Leaderboard */}
        <h2 className="font-display text-2xl font-bold text-foreground mb-6">
          {isEnded ? "🏆 Final Leaderboard" : "Leaderboard"}
        </h2>

        <div className="space-y-4">
          <AnimatePresence>
            {entries.map((entry, i) => {
              const award = entry.award_type ? awardIcons[entry.award_type] : null;
              const AwardIcon = award?.icon;
              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={`rounded-xl border p-6 ${
                    i === 0 && entries.length > 1 ? "border-accent bg-accent/5" : "border-border bg-card"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-display font-bold text-lg ${
                        i === 0 ? "bg-gradient-gold text-primary" : i === 1 ? "bg-muted text-muted-foreground" : i === 2 ? "bg-secondary/20 text-secondary" : "bg-muted text-muted-foreground"
                      }`}>
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-display text-lg font-bold text-foreground">{entry.title}</h3>
                          {award && AwardIcon && (
                            <span className={`flex items-center gap-1 text-xs font-body font-semibold ${award.color}`}>
                              <AwardIcon className="w-4 h-4" /> {award.label}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground font-body mb-3">by {entry.display_name}</p>
                        <p className="font-body text-foreground/90 whitespace-pre-line leading-relaxed">{entry.content}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      {canVote && (
                        <button
                          onClick={() => handleVote(entry.id, !!entry.has_voted)}
                          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-body font-semibold transition-colors ${
                            entry.has_voted
                              ? "bg-accent text-accent-foreground"
                              : "bg-muted text-muted-foreground hover:bg-accent/20"
                          }`}
                        >
                          <ThumbsUp className="w-4 h-4" />
                          {entry.votes_count}
                        </button>
                      )}
                      {!canVote && (
                        <span className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-body text-muted-foreground bg-muted">
                          <ThumbsUp className="w-4 h-4" /> {entry.votes_count}
                        </span>
                      )}
                      {isOrganizer && isEnded && !entry.award_type && (
                        <div className="flex gap-1 mt-2">
                          {["gold", "silver", "bronze", "special"].map((t) => {
                            const a = awardIcons[t];
                            const Icon = a.icon;
                            return (
                              <button
                                key={t}
                                onClick={() => handleGiveAward(entry.id, entry.user_id, t)}
                                title={`Give ${a.label}`}
                                className={`p-1.5 rounded-md hover:bg-muted transition-colors ${a.color}`}
                              >
                                <Icon className="w-4 h-4" />
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {entries.length === 0 && (
          <div className="text-center py-16 text-muted-foreground font-body">
            <PenLine className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p>No entries yet. Be the first to submit!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompetitionDetail;
