import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { BookOpen, Video, PenLine, Trash2 } from "lucide-react";

interface BookmarkItem {
  id: string;
  content_type: string;
  content_id: string;
  created_at: string;
  title?: string;
  subtitle?: string;
}

const Bookmarks = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<BookmarkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");

  useEffect(() => { if (!authLoading && !user) navigate("/auth"); }, [authLoading, user, navigate]);

  const fetchBookmarks = async () => {
    if (!user) return;
    setLoading(true);
    let query = supabase.from("bookmarks").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    if (tab !== "all") query = query.eq("content_type", tab);
    const { data } = await query;
    if (!data) { setLoading(false); return; }

    const enriched: BookmarkItem[] = [];
    for (const bm of data as any[]) {
      let title = "Unknown";
      let subtitle = "";
      if (bm.content_type === "post") {
        const { data: post } = await supabase.from("poetry_posts").select("title, category").eq("id", bm.content_id).maybeSingle();
        title = post?.title || "Poetry Post";
        subtitle = post?.category || "";
      } else if (bm.content_type === "book") {
        const { data: book } = await supabase.from("books").select("title, category").eq("id", bm.content_id).maybeSingle();
        title = book?.title || "Book";
        subtitle = book?.category || "";
      } else if (bm.content_type === "video") {
        const { data: vid } = await supabase.from("videos").select("title, category").eq("id", bm.content_id).maybeSingle();
        title = vid?.title || "Video";
        subtitle = vid?.category || "";
      }
      enriched.push({ ...bm, title, subtitle });
    }
    setItems(enriched);
    setLoading(false);
  };

  useEffect(() => { fetchBookmarks(); }, [user, tab]);

  const handleRemove = async (id: string) => {
    await supabase.from("bookmarks").delete().eq("id", id);
    toast.success("Bookmark removed");
    fetchBookmarks();
  };

  const getLink = (bm: BookmarkItem) => {
    if (bm.content_type === "post") return `/post/${bm.content_id}`;
    if (bm.content_type === "book") return `/book/${bm.content_id}`;
    if (bm.content_type === "video") return `/video/${bm.content_id}`;
    return "#";
  };

  const getIcon = (type: string) => {
    if (type === "post") return PenLine;
    if (type === "book") return BookOpen;
    return Video;
  };

  const tabs = [
    { key: "all", label: "All" },
    { key: "post", label: "Poetry" },
    { key: "book", label: "Books" },
    { key: "video", label: "Videos" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-28 pb-20 container mx-auto px-6 max-w-3xl">
        <h1 className="font-display text-3xl font-bold text-foreground mb-2">My Bookmarks</h1>
        <p className="font-body text-muted-foreground mb-8">Your saved poetry, books, and videos</p>

        <div className="flex gap-2 mb-8">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} className={`px-4 py-2 rounded-full text-sm font-body font-medium transition-colors ${tab === t.key ? "bg-secondary text-secondary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>{t.label}</button>
          ))}
        </div>

        {loading ? (
          <p className="text-center font-body text-muted-foreground py-20">Loading...</p>
        ) : items.length === 0 ? (
          <p className="text-center font-body text-muted-foreground py-20">No bookmarks yet. Start saving your favorites!</p>
        ) : (
          <div className="space-y-3">
            {items.map((item, i) => {
              const Icon = getIcon(item.content_type);
              return (
                <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="flex items-center gap-4 bg-card border border-border rounded-xl p-4">
                  <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-secondary" />
                  </div>
                  <Link to={getLink(item)} className="flex-1 min-w-0">
                    <p className="font-body font-semibold text-foreground truncate">{item.title}</p>
                    <p className="font-body text-xs text-muted-foreground capitalize">{item.content_type} · {item.subtitle}</p>
                  </Link>
                  <button onClick={() => handleRemove(item.id)} className="p-2 text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>
      <Footer />
    </div>
  );
};

export default Bookmarks;
