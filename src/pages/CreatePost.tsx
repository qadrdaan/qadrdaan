import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const CATEGORIES = ["ghazal", "nazm", "rubaai", "qita", "marsiya", "hamd", "naat", "quote"];
const LANGUAGES = ["Urdu", "Hindi", "Punjabi", "English", "Arabic", "Persian"];

const CreatePost = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", category: "ghazal", language: "Urdu" });

  useEffect(() => { if (!loading && !user) navigate("/auth"); }, [loading, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!form.title.trim() || !form.content.trim()) { toast.error("Title and content are required"); return; }
    setSubmitting(true);
    const { error } = await supabase.from("poetry_posts").insert({
      creator_id: user.id,
      title: form.title.trim(),
      content: form.content.trim(),
      category: form.category,
      language: form.language,
    });
    if (error) { toast.error("Failed to publish"); } else { toast.success("Poetry published!"); navigate("/poetry"); }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-28 pb-20 container mx-auto px-6 max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-bold text-foreground mb-8">Publish Poetry</h1>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block font-body text-sm font-medium text-foreground mb-1">Title</label>
              <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full px-4 py-3 rounded-lg bg-card border border-border text-foreground font-body focus:outline-none focus:ring-2 focus:ring-ring" placeholder="e.g. Dil Ki Baat" />
            </div>
            <div>
              <label className="block font-body text-sm font-medium text-foreground mb-1">Poetry</label>
              <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} rows={10} className="w-full px-4 py-3 rounded-lg bg-card border border-border text-foreground font-body focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Write your poetry here..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-body text-sm font-medium text-foreground mb-1">Category</label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full px-4 py-3 rounded-lg bg-card border border-border text-foreground font-body focus:outline-none focus:ring-2 focus:ring-ring">
                  {CATEGORIES.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block font-body text-sm font-medium text-foreground mb-1">Language</label>
                <select value={form.language} onChange={e => setForm({ ...form, language: e.target.value })} className="w-full px-4 py-3 rounded-lg bg-card border border-border text-foreground font-body focus:outline-none focus:ring-2 focus:ring-ring">
                  {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>
            <button type="submit" disabled={submitting} className="w-full py-3 font-body font-semibold bg-gradient-gold rounded-lg text-primary shadow-gold hover:opacity-90 transition-opacity disabled:opacity-50">
              {submitting ? "Publishing..." : "Publish Poetry"}
            </button>
          </form>
        </motion.div>
      </section>
      <Footer />
    </div>
  );
};

export default CreatePost;
