import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import { Trophy, Calendar, Users, Clock, Plus } from "lucide-react";
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
  created_at: string;
}

const statusConfig: Record<string, { label: string; class: string }> = {
  upcoming: { label: "Upcoming", class: "bg-secondary/20 text-secondary-foreground" },
  active: { label: "Accepting Entries", class: "bg-accent/20 text-accent-foreground" },
  voting: { label: "Voting Open", class: "bg-primary/20 text-primary-foreground" },
  ended: { label: "Ended", class: "bg-muted text-muted-foreground" },
};

const Competitions = () => {
  const { user } = useAuth();
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<string>("active");

  useEffect(() => {
    const fetchCompetitions = async () => {
      const statusFilter = tab === "active" ? ["active", "voting"] : tab === "upcoming" ? ["upcoming"] : ["ended"];
      const { data } = await supabase
        .from("competitions")
        .select("*")
        .in("status", statusFilter)
        .order("created_at", { ascending: false });
      setCompetitions(data || []);
      setLoading(false);
    };
    fetchCompetitions();
  }, [tab]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-6 pt-28 pb-16">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="font-display text-4xl font-bold text-foreground">Poetry Competitions</h1>
            <p className="text-muted-foreground mt-2 font-body">Submit your poetry, vote for the best, and win digital awards.</p>
          </div>
          {user && (
            <a
              href="/create-competition"
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-body font-semibold bg-gradient-gold rounded-lg text-primary shadow-gold hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" /> Create Competition
            </a>
          )}
        </div>

        <div className="flex gap-2 mb-8">
          {["active", "upcoming", "ended"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-body font-medium transition-colors ${
                tab === t ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-muted"
              }`}
            >
              {t === "active" ? "Live & Voting" : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 rounded-xl bg-card animate-pulse" />
            ))}
          </div>
        ) : competitions.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground font-body">
            <Trophy className="w-12 h-12 mx-auto mb-4 opacity-40" />
            <p>No competitions found in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {competitions.map((comp, i) => (
              <motion.a
                key={comp.id}
                href={`/competition/${comp.id}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="block rounded-xl border border-border bg-card p-6 hover:shadow-emerald transition-shadow group"
              >
                <div className="flex items-start justify-between mb-4">
                  <Trophy className="w-8 h-8 text-accent" />
                  <span className={`px-3 py-1 rounded-full text-xs font-body font-semibold ${statusConfig[comp.status]?.class}`}>
                    {statusConfig[comp.status]?.label}
                  </span>
                </div>
                <h3 className="font-display text-xl font-bold text-foreground group-hover:text-accent transition-colors mb-2">
                  {comp.title}
                </h3>
                {comp.description && (
                  <p className="text-sm text-muted-foreground font-body line-clamp-2 mb-4">{comp.description}</p>
                )}
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground font-body">
                  {comp.theme && (
                    <span className="flex items-center gap-1 bg-muted px-2 py-1 rounded-md">{comp.theme}</span>
                  )}
                  {comp.language && (
                    <span className="flex items-center gap-1 bg-muted px-2 py-1 rounded-md">{comp.language}</span>
                  )}
                </div>
                <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground font-body">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {comp.status === "ended" ? "Ended" : `Entries by ${format(new Date(comp.entry_deadline), "MMM d")}`}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {`Voting by ${format(new Date(comp.voting_deadline), "MMM d")}`}
                  </span>
                </div>
              </motion.a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Competitions;
