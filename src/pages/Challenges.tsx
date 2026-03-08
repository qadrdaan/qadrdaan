import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Flame, Clock, Plus } from "lucide-react";

interface Challenge {
  id: string;
  title: string;
  description: string | null;
  theme: string | null;
  language: string | null;
  status: string;
  starts_at: string;
  ends_at: string;
}

const Challenges = () => {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("poetry_challenges").select("*").order("created_at", { ascending: false }).limit(50);
      setChallenges((data as Challenge[]) || []);
      setLoading(false);
    };
    fetch();
  }, []);

  const getStatusColor = (s: string) => {
    if (s === "active") return "bg-green-500/10 text-green-600";
    if (s === "ended") return "bg-muted text-muted-foreground";
    return "bg-secondary/10 text-secondary";
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-28 pb-20 container mx-auto px-6 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Flame className="w-7 h-7 text-accent" />
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">Poetry Challenges</h1>
            </div>
            <p className="font-body text-muted-foreground">Weekly themes to inspire your creativity</p>
          </div>
          {user && (
            <Link to="/create-challenge" className="flex items-center gap-2 px-5 py-2.5 font-body font-semibold bg-gradient-gold rounded-lg text-primary shadow-gold hover:opacity-90 transition-opacity">
              <Plus className="w-4 h-4" /> New Challenge
            </Link>
          )}
        </div>

        {loading ? (
          <p className="text-center font-body text-muted-foreground py-20">Loading...</p>
        ) : challenges.length === 0 ? (
          <p className="text-center font-body text-muted-foreground py-20">No challenges yet. Create the first one!</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-5">
            {challenges.map((ch, i) => (
              <motion.div key={ch.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Link to={`/challenge/${ch.id}`} className="block bg-card border border-border rounded-2xl p-6 hover:border-secondary/30 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-body font-semibold capitalize ${getStatusColor(ch.status)}`}>{ch.status}</span>
                    {ch.language && <span className="font-body text-xs text-muted-foreground">{ch.language}</span>}
                  </div>
                  <h2 className="font-display text-xl font-bold text-foreground mb-2">{ch.title}</h2>
                  {ch.description && <p className="font-body text-sm text-muted-foreground line-clamp-2 mb-3">{ch.description}</p>}
                  {ch.theme && <p className="font-body text-xs text-secondary">Theme: {ch.theme}</p>}
                  <div className="flex items-center gap-1.5 mt-3 font-body text-xs text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" />
                    Ends {new Date(ch.ends_at).toLocaleDateString()}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </section>
      <Footer />
    </div>
  );
};

export default Challenges;
