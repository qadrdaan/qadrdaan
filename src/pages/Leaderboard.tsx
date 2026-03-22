import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Trophy, Gift, Users, BookOpen, BadgeCheck } from "lucide-react";

interface Creator {
  user_id: string;
  display_name: string | null;
  followers_count: number;
  total_gifts_received: number;
  books_count: number;
  videos_count: number;
  is_verified: boolean;
}

const Leaderboard = () => {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"followers_count" | "total_gifts_received" | "books_count">("total_gifts_received");

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const { data } = await supabase.from("profiles").select("user_id, display_name, followers_count, total_gifts_received, books_count, videos_count, is_verified").order(sortBy, { ascending: false }).limit(50);
      setCreators((data as Creator[]) || []);
      setLoading(false);
    };
    fetch();
  }, [sortBy]);

  const sorts = [
    { key: "total_gifts_received" as const, label: "Most Gifts", icon: Gift },
    { key: "followers_count" as const, label: "Most Followers", icon: Users },
    { key: "books_count" as const, label: "Most Books", icon: BookOpen },
  ];

  const getMedal = (i: number) => {
    if (i === 0) return "🥇";
    if (i === 1) return "🥈";
    if (i === 2) return "🥉";
    return `#${i + 1}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-28 pb-20 container mx-auto px-6 max-w-3xl">
        <div className="flex items-center gap-3 mb-2">
          <Trophy className="w-8 h-8 text-secondary" />
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">Creator Leaderboard</h1>
        </div>
        <p className="font-body text-muted-foreground mb-8">Top poets ranked by community engagement</p>

        <div className="flex gap-2 mb-8">
          {sorts.map(s => (
            <button key={s.key} onClick={() => setSortBy(s.key)} className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-body font-medium transition-colors ${sortBy === s.key ? "bg-secondary text-secondary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
              <s.icon className="w-3.5 h-3.5" /> {s.label}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-center font-body text-muted-foreground py-20">Loading...</p>
        ) : (
          <div className="space-y-3">
            {creators.map((c, i) => (
              <motion.div key={c.user_id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
                <Link to={`/poet/${c.user_id}`} className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${i < 3 ? "bg-secondary/5 border-secondary/20" : "bg-card border-border"} hover:border-secondary/40`}>
                  <span className="w-10 text-center font-display text-lg font-bold text-foreground">{getMedal(i)}</span>
                  <div className="w-10 h-10 rounded-full bg-gradient-gold flex items-center justify-center text-sm font-bold text-primary font-display shrink-0">
                    {(c.display_name || "?")[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-body font-semibold text-foreground truncate">{c.display_name || "Unknown"}</span>
                      {c.is_verified && <BadgeCheck className="w-4 h-4 text-secondary shrink-0" />}
                    </div>
                    <div className="flex gap-3 font-body text-xs text-muted-foreground">
                      <span>{c.followers_count} followers</span>
                      <span>{c.books_count} books</span>
                      <span>{c.videos_count} videos</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-display text-lg font-bold text-secondary">{sortBy === "total_gifts_received" ? c.total_gifts_received : sortBy === "followers_count" ? c.followers_count : c.books_count}</p>
                    <p className="font-body text-xs text-muted-foreground">{sortBy === "total_gifts_received" ? "gifts" : sortBy === "followers_count" ? "followers" : "books"}</p>
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

export default Leaderboard;
