import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { TrendingUp, Star, Search, BadgeCheck, BookOpen, Video, Users, Sparkles, Globe } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Discover = () => {
  const [search, setSearch] = useState("");
  const [trendingPoets, setTrendingPoets] = useState<any[]>([]);
  const [risingPoets, setRisingPoets] = useState<any[]>([]);
  const [trendingBooks, setTrendingBooks] = useState<any[]>([]);
  const [trendingVideos, setTrendingVideos] = useState<any[]>([]);
  const [trendingPosts, setTrendingPosts] = useState<any[]>([]);
  const [editorPicks, setEditorPicks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [tp, rp, tb, tv, trPosts, ep] = await Promise.all([
        supabase.from("profiles").select("user_id, display_name, followers_count, is_verified").order("followers_count", { ascending: false }).limit(6),
        supabase.from("profiles").select("user_id, display_name, followers_count, is_verified, created_at").order("created_at", { ascending: false }).limit(6),
        supabase.from("books").select("id, title, downloads_count, cover_url").order("downloads_count", { ascending: false }).limit(6),
        supabase.from("videos").select("id, title, views_count, thumbnail_url").order("views_count", { ascending: false }).limit(6),
        supabase.from("poetry_posts").select("id, title, creator_id, engagement_score, likes_count, comments_count, category, language").order("engagement_score" as any, { ascending: false }).limit(6),
        supabase.from("poetry_posts").select("id, title, creator_id, engagement_score, likes_count, category").eq("is_editor_pick" as any, true).order("created_at", { ascending: false }).limit(6),
      ]);
      setTrendingPoets(tp.data || []);
      setRisingPoets(rp.data || []);
      setTrendingBooks(tb.data || []);
      setTrendingVideos(tv.data || []);
      setTrendingPosts(trPosts.data || []);
      setEditorPicks(ep.data || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  const handleSearch = async () => {
    if (!search.trim()) { setSearchResults([]); return; }
    setSearching(true);
    const { data } = await supabase.from("profiles").select("user_id, display_name, followers_count, is_verified, language, country").ilike("display_name", `%${search}%`).limit(20);
    setSearchResults(data || []);
    setSearching(false);
  };

  useEffect(() => {
    const t = setTimeout(handleSearch, 300);
    return () => clearTimeout(t);
  }, [search]);

  const PoetCard = ({ p }: { p: any }) => (
    <Link to={`/poet/${p.user_id}`} className="bg-card border border-border rounded-xl p-4 hover:border-secondary/30 transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-gold flex items-center justify-center text-sm font-bold text-primary">{(p.display_name || "?")[0].toUpperCase()}</div>
        <div>
          <div className="flex items-center gap-1"><span className="font-body font-semibold text-foreground text-sm">{p.display_name}</span>{p.is_verified && <BadgeCheck className="w-3.5 h-3.5 text-secondary" />}</div>
          <p className="font-body text-xs text-muted-foreground">{p.followers_count} followers{p.language ? ` · ${p.language}` : ""}{p.country ? ` · ${p.country}` : ""}</p>
        </div>
      </div>
    </Link>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-28 pb-20 container mx-auto px-6 max-w-5xl">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">Discover</h1>
        <p className="font-body text-muted-foreground mb-8">Find trending poets, books, videos & literary gems</p>

        <div className="relative mb-10">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search poets by name..." className="w-full pl-12 pr-4 py-3 rounded-xl bg-card border border-border text-foreground font-body focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>

        {search.trim() ? (
          <div>
            <h2 className="font-display text-xl font-bold text-foreground mb-4">Search Results</h2>
            {searching ? <p className="font-body text-muted-foreground">Searching...</p> : searchResults.length === 0 ? <p className="font-body text-muted-foreground">No results found.</p> : (
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                {searchResults.map((p: any) => <PoetCard key={p.user_id} p={p} />)}
              </div>
            )}
          </div>
        ) : loading ? (
          <p className="text-center font-body text-muted-foreground py-20">Loading...</p>
        ) : (
          <>
            {/* Trending Posts */}
            {trendingPosts.length > 0 && (
              <div className="mb-12">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-secondary" />
                  <h2 className="font-display text-xl font-bold text-foreground">Trending Poetry</h2>
                </div>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {trendingPosts.map((p: any) => (
                    <Link key={p.id} to={`/post/${p.id}`} className="bg-card border border-border rounded-xl p-4 hover:border-secondary/30 transition-colors">
                      <p className="font-body font-semibold text-foreground text-sm truncate">{p.title}</p>
                      <p className="font-body text-xs text-muted-foreground capitalize">{p.category} · {p.likes_count} likes · {p.comments_count} comments</p>
                      <p className="font-mono text-xs text-accent mt-1">Score: {Math.round(p.engagement_score || 0)}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Editor Picks */}
            {editorPicks.length > 0 && (
              <div className="mb-12">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-accent" />
                  <h2 className="font-display text-xl font-bold text-foreground">Editor Picks</h2>
                </div>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {editorPicks.map((p: any) => (
                    <Link key={p.id} to={`/post/${p.id}`} className="bg-card border border-accent/20 rounded-xl p-4 hover:border-accent/40 transition-colors">
                      <div className="flex items-center gap-1 mb-1">
                        <Sparkles className="w-3 h-3 text-accent" />
                        <span className="text-xs font-body text-accent">Editor Pick</span>
                      </div>
                      <p className="font-body font-semibold text-foreground text-sm truncate">{p.title}</p>
                      <p className="font-body text-xs text-muted-foreground capitalize">{p.category}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Trending Poets */}
            <div className="mb-12">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-secondary" />
                <h2 className="font-display text-xl font-bold text-foreground">Trending Poets</h2>
              </div>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                {trendingPoets.map((p: any) => <PoetCard key={p.user_id} p={p} />)}
              </div>
            </div>

            {/* Rising Poets */}
            <div className="mb-12">
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-5 h-5 text-accent" />
                <h2 className="font-display text-xl font-bold text-foreground">Rising Voices</h2>
              </div>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                {risingPoets.map((p: any) => <PoetCard key={p.user_id} p={p} />)}
              </div>
            </div>

            {/* Trending Books */}
            <div className="mb-12">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="w-5 h-5 text-secondary" />
                <h2 className="font-display text-xl font-bold text-foreground">Popular Books</h2>
              </div>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                {trendingBooks.map((b: any) => (
                  <Link key={b.id} to={`/book/${b.id}`} className="bg-card border border-border rounded-xl p-4 hover:border-secondary/30 transition-colors">
                    <p className="font-body font-semibold text-foreground text-sm truncate">{b.title}</p>
                    <p className="font-body text-xs text-muted-foreground">{b.downloads_count} downloads</p>
                  </Link>
                ))}
              </div>
            </div>

            {/* Trending Videos */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Video className="w-5 h-5 text-accent" />
                <h2 className="font-display text-xl font-bold text-foreground">Popular Videos</h2>
              </div>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                {trendingVideos.map((v: any) => (
                  <Link key={v.id} to={`/video/${v.id}`} className="bg-card border border-border rounded-xl p-4 hover:border-secondary/30 transition-colors">
                    <p className="font-body font-semibold text-foreground text-sm truncate">{v.title}</p>
                    <p className="font-body text-xs text-muted-foreground">{v.views_count} views</p>
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}
      </section>
      <Footer />
    </div>
  );
};

export default Discover;
