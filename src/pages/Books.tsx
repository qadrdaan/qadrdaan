import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import { BookOpen, Download, User } from "lucide-react";
import { Link } from "react-router-dom";
import type { Tables } from "@/integrations/supabase/types";

type Book = Tables<"books"> & { profiles?: { display_name: string | null } | null };

const Books = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ language: "", category: "" });

  useEffect(() => {
    fetchBooks();
  }, [filter]);

  const fetchBooks = async () => {
    setLoading(true);
    let query = supabase
      .from("books")
      .select("*, profiles!books_creator_id_fkey(display_name)")
      .order("created_at", { ascending: false });

    if (filter.language) query = query.eq("language", filter.language);
    if (filter.category) query = query.eq("category", filter.category);

    const { data } = await query;
    setBooks((data as Book[]) || []);
    setLoading(false);
  };

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
            Browse <span className="text-gradient-gold">Books</span>
          </h1>
          <p className="font-body text-muted-foreground max-w-lg mx-auto">
            Discover poetry collections and literary works from creators worldwide.
          </p>
        </motion.div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-8 justify-center">
          <select
            value={filter.language}
            onChange={(e) => setFilter({ ...filter, language: e.target.value })}
            className="px-4 py-2 rounded-lg bg-card border border-border text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">All Languages</option>
            {["Urdu", "Hindi", "Punjabi", "English", "Arabic", "Persian"].map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
          <select
            value={filter.category}
            onChange={(e) => setFilter({ ...filter, category: e.target.value })}
            className="px-4 py-2 rounded-lg bg-card border border-border text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">All Categories</option>
            {["Ghazal", "Nazm", "Hamd", "Naat", "Prose", "Essay", "Novel", "Short Story"].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <p className="text-center font-body text-muted-foreground">Loading books...</p>
        ) : books.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="font-body text-muted-foreground">No books found yet.</p>
            <Link
              to="/upload-book"
              className="inline-block mt-4 px-6 py-2.5 font-body font-semibold bg-gradient-gold rounded-lg text-primary shadow-gold hover:opacity-90 transition-opacity"
            >
              Be the first to publish
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {books.map((book, i) => (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  to={`/book/${book.id}`}
                  className="group block bg-card rounded-2xl border border-border hover:border-secondary/30 transition-all hover:shadow-gold overflow-hidden"
                >
                  {/* Cover */}
                  <div className="aspect-[3/4] bg-muted flex items-center justify-center overflow-hidden">
                    {book.cover_url ? (
                      <img
                        src={book.cover_url}
                        alt={book.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <BookOpen className="w-12 h-12 text-muted-foreground/30" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h3 className="font-display text-lg font-semibold text-foreground line-clamp-1 mb-1">
                      {book.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-sm font-body text-muted-foreground mb-2">
                      <User className="w-3.5 h-3.5" />
                      <span>{(book.profiles as any)?.display_name || "Unknown"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        {book.language && (
                          <span className="px-2 py-0.5 text-xs font-body bg-muted rounded-full text-muted-foreground">
                            {book.language}
                          </span>
                        )}
                        {book.category && (
                          <span className="px-2 py-0.5 text-xs font-body bg-muted rounded-full text-muted-foreground">
                            {book.category}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Download className="w-3 h-3" />
                        <span>{book.downloads_count}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Books;
