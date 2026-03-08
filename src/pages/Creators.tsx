import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { BookOpen, Users, BadgeCheck } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Profile = Tables<"profiles">;

const Creators = () => {
  const [creators, setCreators] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("is_creator", true)
        .order("followers_count", { ascending: false });
      setCreators(data || []);
      setLoading(false);
    };
    fetch();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-28 pb-20 container mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-3">
            Featured <span className="text-gradient-gold">Creators</span>
          </h1>
          <p className="font-body text-muted-foreground mb-10 max-w-2xl">
            Discover talented poets and writers who are shaping the future of literary expression on Qadrdaan.
          </p>
        </motion.div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-muted animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : creators.length === 0 ? (
          <p className="font-body text-muted-foreground text-center py-20">No creators found yet. Be the first!</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {creators.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  to={`/poet/${c.user_id}`}
                  className="block p-6 bg-card border border-border rounded-2xl hover:border-secondary/40 transition-colors"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-gold flex items-center justify-center text-xl font-bold text-primary font-display">
                      {(c.display_name || "?")[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-display font-bold text-foreground">{c.display_name || "Anonymous"}</h3>
                        {c.is_verified && <BadgeCheck className="w-4 h-4 text-secondary" />}
                      </div>
                      <p className="font-body text-xs text-muted-foreground">
                        {[c.language, c.country].filter(Boolean).join(" · ") || "Global"}
                      </p>
                    </div>
                  </div>
                  {c.bio && (
                    <p className="font-body text-sm text-muted-foreground line-clamp-2 mb-4">{c.bio}</p>
                  )}
                  <div className="flex gap-4 text-xs font-body text-muted-foreground">
                    <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" /> {c.books_count} books</span>
                    <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {c.followers_count} followers</span>
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

export default Creators;
