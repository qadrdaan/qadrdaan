import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Trophy, Gift, Users, BookOpen, BadgeCheck, Crown, Medal, Star } from "lucide-react";

interface Creator {
  user_id: string;
  display_name: string | null;
  followers_count: number;
  total_gifts_received: number;
  books_count: number;
  videos_count: number;
  is_verified: boolean;
  avatar_url?: string;
}

const Leaderboard = () => {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"followers_count" | "total_gifts_received" | "books_count">("total_gifts_received");

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("profiles")
        .select("user_id, display_name, followers_count, total_gifts_received, books_count, videos_count, is_verified, avatar_url")
        .order(sortBy, { ascending: false })
        .limit(50);
      setCreators((data as Creator[]) || []);
      setLoading(false);
    };
    fetch();
  }, [sortBy]);

  const sorts = [
    { key: "total_gifts_received" as const, label: "Most Gifts", icon: Gift, color: "text-secondary" },
    { key: "followers_count" as const, label: "Most Followers", icon: Users, color: "text-primary" },
    { key: "books_count" as const, label: "Most Books", icon: BookOpen, color: "text-accent" },
  ];

  const topThree = creators.slice(0, 3);
  const rest = creators.slice(3);

  const PodiumItem = ({ creator, rank, delay }: { creator: Creator; rank: number; delay: number }) => {
    const heights = ["h-48", "h-40", "h-32"];
    const icons = [
      <Crown className="w-8 h-8 text-accent mb-2" />,
      <Medal className="w-7 h-7 text-slate-400 mb-2" />,
      <Medal className="w-6 h-6 text-secondary mb-2" />
    ];
    const order = [1, 0, 2]; // Silver, Gold, Bronze layout
    
    return (
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.6 }}
        className="flex flex-col items-center flex-1"
      >
        <Link to={`/poet/${creator.user_id}`} className="group flex flex-col items-center mb-4">
          <div className="relative">
            <div className={`w-20 h-20 rounded-full bg-gradient-brand p-1 shadow-lg group-hover:scale-110 transition-transform overflow-hidden`}>
              {creator.avatar_url ? (
                <img src={creator.avatar_url} className="w-full h-full object-cover rounded-full" alt={creator.display_name || ""} />
              ) : (
                <div className="w-full h-full bg-card rounded-full flex items-center justify-center">
                  <span className="font-display text-2xl font-bold text-primary">{(creator.display_name || "?")[0]}</span>
                </div>
              )}
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-card border-2 border-border flex items-center justify-center font-display font-bold text-sm">
              {rank + 1}
            </div>
          </div>
          <div className="mt-4 text-center">
            <div className="flex items-center justify-center gap-1">
              <p className="font-body font-bold text-foreground truncate max-w-[120px]">{creator.display_name}</p>
              {creator.is_verified && <BadgeCheck className="w-3.5 h-3.5 text-secondary" />}
            </div>
            <p className="font-display text-lg font-black text-primary">
              {sortBy === "total_gifts_received" ? creator.total_gifts_received : sortBy === "followers_count" ? creator.followers_count : creator.books_count}
            </p>
          </div>
        </Link>
        <div className={`w-full ${heights[rank]} bg-card border-x border-t border-border rounded-t-2xl flex flex-col items-center justify-center shadow-sm`}>
          {icons[rank]}
          <p className="font-body text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            {rank === 0 ? "Champion" : rank === 1 ? "Runner Up" : "Third Place"}
          </p>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-28 pb-20 container mx-auto px-6 max-w-4xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-secondary/10 mb-4">
            <Trophy className="w-8 h-8 text-secondary" />
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-3">Creator <span className="text-gradient-brand">Leaderboard</span></h1>
          <p className="font-body text-muted-foreground max-w-lg mx-auto">Celebrating the most influential and appreciated voices in the qadrdaan community.</p>
        </div>

        <div className="flex justify-center gap-2 mb-16">
          {sorts.map(s => (
            <button 
              key={s.key} 
              onClick={() => setSortBy(s.key)} 
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${sortBy === s.key ? "bg-primary text-white shadow-brand" : "bg-card border border-border text-muted-foreground hover:border-primary/30"}`}
            >
              <s.icon className={`w-4 h-4 ${sortBy === s.key ? "text-white" : s.color}`} /> {s.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Star className="w-8 h-8 animate-spin text-primary" /></div>
        ) : (
          <>
            {/* Podium */}
            <div className="flex items-end gap-2 sm:gap-4 mb-12 px-4">
              {topThree.length >= 2 && <PodiumItem creator={topThree[1]} rank={1} delay={0.2} />}
              {topThree.length >= 1 && <PodiumItem creator={topThree[0]} rank={0} delay={0} />}
              {topThree.length >= 3 && <PodiumItem creator={topThree[2]} rank={2} delay={0.4} />}
            </div>

            {/* List */}
            <div className="space-y-3">
              {rest.map((c, i) => (
                <motion.div 
                  key={c.user_id} 
                  initial={{ opacity: 0, x: -10 }} 
                  whileInView={{ opacity: 1, x: 0 }} 
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link to={`/poet/${c.user_id}`} className="flex items-center gap-4 p-4 bg-card border border-border rounded-2xl hover:border-primary/30 transition-all hover:shadow-sm group">
                    <span className="w-8 text-center font-display text-sm font-bold text-muted-foreground group-hover:text-primary">{i + 4}</span>
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden shrink-0">
                      {c.avatar_url ? (
                        <img src={c.avatar_url} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <span className="font-display text-sm font-bold text-primary">{(c.display_name || "?")[0]}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="font-body font-bold text-foreground truncate">{c.display_name || "Unknown"}</span>
                        {c.is_verified && <BadgeCheck className="w-3.5 h-3.5 text-secondary shrink-0" />}
                      </div>
                      <div className="flex gap-3 font-body text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                        <span>{c.followers_count} followers</span>
                        <span>{c.books_count} books</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-display text-lg font-black text-secondary">
                        {sortBy === "total_gifts_received" ? c.total_gifts_received : sortBy === "followers_count" ? c.followers_count : c.books_count}
                      </p>
                      <p className="font-body text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">
                        {sortBy === "total_gifts_received" ? "gifts" : sortBy === "followers_count" ? "followers" : "books"}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </section>
      <Footer />
    </div>
  );
};

export default Leaderboard;