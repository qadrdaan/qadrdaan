import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { BookOpen, Download, User, Calendar, Tag, Globe, Bookmark, BookmarkPlus } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Book = Tables<"books"> & { creator_profile?: { display_name: string | null; is_verified: boolean } | null };

const BookDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (id) fetchBook();
  }, [id]);

  const fetchBook = async () => {
    const { data } = await supabase
      .from("books")
      .select("*")
      .eq("id", id!)
      .single();
    
    if (data) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name, is_verified")
        .eq("user_id", data.creator_id)
        .single();
      setBook({ ...data, creator_profile: profile } as Book);
    }
    setLoading(false);
  };

  const handleDownload = async () => {
    if (!user) {
      toast.error("Please sign in to download");
      return;
    }
    if (!book?.file_url) return;

    setDownloading(true);
    const { data, error } = await supabase.storage
      .from("book-files")
      .download(book.file_url);

    if (error) {
      toast.error("Download failed");
    } else {
      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${book.title}.${book.file_format || "pdf"}`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Download started!");
    }
    setDownloading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 flex items-center justify-center">
          <p className="font-body text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 flex items-center justify-center">
          <p className="font-body text-muted-foreground">Book not found.</p>
        </div>
      </div>
    );
  }

  const creator = book.creator_profile;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 container mx-auto px-6 max-w-4xl">
        <motion.div
          className="grid md:grid-cols-[300px_1fr] gap-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Cover */}
          <div className="aspect-[3/4] bg-card rounded-2xl border border-border overflow-hidden flex items-center justify-center">
            {book.cover_url ? (
              <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
            ) : (
              <BookOpen className="w-16 h-16 text-muted-foreground/30" />
            )}
          </div>

          {/* Details */}
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
              {book.title}
            </h1>

            <div className="flex items-center gap-2 mb-4">
              <User className="w-4 h-4 text-secondary" />
              <span className="font-body text-foreground/80">
                {creator?.display_name || "Unknown Author"}
              </span>
            </div>

            {book.description && (
              <p className="font-body text-muted-foreground mb-6 leading-relaxed">
                {book.description}
              </p>
            )}

            {/* Meta */}
            <div className="flex flex-wrap gap-3 mb-6">
              {book.language && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-card border border-border rounded-lg font-body text-sm text-foreground">
                  <Globe className="w-3.5 h-3.5 text-secondary" />
                  {book.language}
                </span>
              )}
              {book.category && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-card border border-border rounded-lg font-body text-sm text-foreground">
                  <Tag className="w-3.5 h-3.5 text-secondary" />
                  {book.category}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-card border border-border rounded-lg font-body text-sm text-foreground">
                <Calendar className="w-3.5 h-3.5 text-secondary" />
                {new Date(book.created_at).toLocaleDateString()}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-card border border-border rounded-lg font-body text-sm text-foreground">
                <Download className="w-3.5 h-3.5 text-secondary" />
                {book.downloads_count} downloads
              </span>
            </div>

            {/* Format badge */}
            {book.file_format && (
              <p className="font-body text-xs uppercase tracking-wider text-muted-foreground mb-6">
                Format: {book.file_format}
              </p>
            )}

            {/* Download / Price button */}
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="px-8 py-3.5 font-body font-semibold bg-gradient-gold rounded-xl text-primary shadow-gold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
            >
              <Download className="w-5 h-5" />
              {downloading
                ? "Downloading..."
                : book.is_free
                  ? "Download Free"
                  : `Buy for $${Number(book.price).toFixed(2)}`}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default BookDetail;
