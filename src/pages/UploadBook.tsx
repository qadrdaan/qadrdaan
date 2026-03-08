import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { Upload, BookOpen, Image } from "lucide-react";

const CATEGORIES = ["Ghazal", "Nazm", "Hamd", "Naat", "Prose", "Essay", "Novel", "Short Story", "Other"];
const LANGUAGES = ["Urdu", "Hindi", "Punjabi", "English", "Arabic", "Persian", "Other"];

const UploadBook = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [bookFile, setBookFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    language: "",
    category: "",
  });

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [loading, user, navigate]);

  useEffect(() => {
    if (coverFile) {
      const url = URL.createObjectURL(coverFile);
      setCoverPreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [coverFile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !bookFile) {
      toast.error("Please upload a book file");
      return;
    }
    setSubmitting(true);

    try {
      const fileExt = bookFile.name.split(".").pop()?.toLowerCase();
      if (fileExt !== "pdf" && fileExt !== "epub") {
        toast.error("Only PDF and ePub files are supported");
        setSubmitting(false);
        return;
      }

      // Upload book file
      const bookPath = `${user.id}/${crypto.randomUUID()}.${fileExt}`;
      const { error: bookErr } = await supabase.storage
        .from("book-files")
        .upload(bookPath, bookFile);
      if (bookErr) throw bookErr;

      // Upload cover if provided
      let coverUrl: string | null = null;
      if (coverFile) {
        const coverExt = coverFile.name.split(".").pop()?.toLowerCase();
        const coverPath = `${user.id}/${crypto.randomUUID()}.${coverExt}`;
        const { error: coverErr } = await supabase.storage
          .from("book-covers")
          .upload(coverPath, coverFile);
        if (coverErr) throw coverErr;

        const { data: publicUrl } = supabase.storage
          .from("book-covers")
          .getPublicUrl(coverPath);
        coverUrl = publicUrl.publicUrl;
      }

      // Insert book record
      const { error: insertErr } = await supabase.from("books").insert({
        creator_id: user.id,
        title: form.title,
        description: form.description || null,
        language: form.language || null,
        category: form.category || null,
        cover_url: coverUrl,
        file_url: bookPath,
        file_format: fileExt,
        is_free: true,
        price: 0,
      });
      if (insertErr) throw insertErr;

      toast.success("Book published successfully!");
      navigate("/books");
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    }
    setSubmitting(false);
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 container mx-auto px-6 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">
            Publish a Book
          </h1>
          <p className="font-body text-muted-foreground mb-8">
            Share your poetry or literary work with the world.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Cover Upload */}
            <div>
              <label className="block font-body text-sm font-medium text-foreground mb-2">
                Book Cover
              </label>
              <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-secondary transition-colors bg-card overflow-hidden">
                {coverPreview ? (
                  <img src={coverPreview} alt="Cover preview" className="h-full object-contain" />
                ) : (
                  <div className="flex flex-col items-center text-muted-foreground">
                    <Image className="w-8 h-8 mb-2" />
                    <span className="font-body text-sm">Click to upload cover image</span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                />
              </label>
            </div>

            {/* Title */}
            <div>
              <label className="block font-body text-sm font-medium text-foreground mb-1.5">
                Title *
              </label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground font-body focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Enter book title"
                maxLength={200}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block font-body text-sm font-medium text-foreground mb-1.5">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground font-body focus:outline-none focus:ring-2 focus:ring-ring"
                rows={4}
                placeholder="What is this book about?"
                maxLength={2000}
              />
            </div>

            {/* Language & Category */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-body text-sm font-medium text-foreground mb-1.5">
                  Language
                </label>
                <select
                  value={form.language}
                  onChange={(e) => setForm({ ...form, language: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground font-body focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Select</option>
                  {LANGUAGES.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-body text-sm font-medium text-foreground mb-1.5">
                  Category
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground font-body focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Select</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Book File */}
            <div>
              <label className="block font-body text-sm font-medium text-foreground mb-2">
                Book File (PDF or ePub) *
              </label>
              <label className="flex items-center gap-3 px-4 py-3 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-secondary transition-colors bg-card">
                <Upload className="w-5 h-5 text-muted-foreground" />
                <span className="font-body text-sm text-muted-foreground">
                  {bookFile ? bookFile.name : "Click to select file"}
                </span>
                <input
                  type="file"
                  accept=".pdf,.epub"
                  className="hidden"
                  onChange={(e) => setBookFile(e.target.files?.[0] || null)}
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 font-body font-semibold bg-gradient-gold rounded-lg text-primary shadow-gold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <BookOpen className="w-5 h-5" />
              {submitting ? "Publishing..." : "Publish Book"}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default UploadBook;
