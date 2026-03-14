import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { BadgeCheck, BookOpen, Users, Search } from "lucide-react";

type Profile = Tables<"profiles">;

const Poets = () => {
  const [poets, setPoets] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchPoets();
  }, []);

  const fetchPoets = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .order("followers_count", { ascending: false });
    setPoets(data || []);
    setLoading(false);
  };

  const filtered = poets.filter(
    (p) =>
      (p.display_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.language || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.country || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 container mx-auto px-6">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-3">
            Discover <span className="text-gradient-gold">Poets</span>
          </h1>
          <p className="font-body text-muted-foreground max-w-lg mx-auto mb-8">
            Explore poets and literary creators from around the world.
          </p>

          {/* Search */}
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name, language, or country..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-card border border-border text-foreground font-body focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </motion.div>

        {loading ? (
          <p className="text-center font-body text-muted-foreground">Loading poets...</p>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="font-body text-muted-foreground">No poets found.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((poet, i) => (
              <motion.div
                key={poet.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Link
                  to={`/poet/${poet.user_id}`}
                  className="group block bg-card rounded-2xl border border-border hover:border-secondary/30 hover:shadow-gold transition-all p-6 text-center"
                >
                  {/* Avatar */}
                  <div className="w-20 h-20 mx-auto rounded-full bg-gradient-gold flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <span className="font-display text-2xl font-bold text-primary">
                      {(poet.display_name || "?")[0].toUpperCase()}
                    </span>
                  </div>

                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <h3 className="font-display text-lg font-semibold text-foreground line-clamp-1">
                      {poet.display_name || "Unnamed"}
                    </h3>
                    {poet.is_verified && <BadgeCheck className="w-4 h-4 text-secondary" />}
                  </div>

                  <p className="font-body text-sm text-muted-foreground mb-1">
                    {[poet.language, poet.country].filter(Boolean).join(" · ") || "—"}
                  </p>

                  {poet.bio && (
                    <p className="font-body text-xs text-muted-foreground/70 line-clamp-2 mt-2 mb-3">
                      {poet.bio}
                    </p>
                  )}

                  <div className="flex items-center justify-center gap-4 text-sm font-body text-muted-foreground mt-3">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5" />
                      {poet.books_count}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {poet.followers_count}
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
};

export default Poets;
