import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const CreateChallenge = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", theme: "", language: "Urdu", ends_at: "" });

  useEffect(() => { if (!authLoading && !user) navigate("/auth"); }, [authLoading, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !form.title.trim() || !form.ends_at) { toast.error("Title and end date are required"); return; }
    setSubmitting(true);
    const { error } = await supabase.from("poetry_challenges").insert({
      created_by: user.id,
      title: form.title.trim(),
      description: form.description.trim() || null,
      theme: form.theme.trim() || null,
      language: form.language,
      ends_at: new Date(form.ends_at).toISOString(),
    });
    if (error) { toast.error("Failed to create challenge"); } else { toast.success("Challenge created!"); navigate("/challenges"); }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-28 pb-20 container mx-auto px-6 max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-bold text-foreground mb-8">Create Poetry Challenge</h1>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block font-body text-sm font-medium text-foreground mb-1">Challenge Title</label>
              <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full px-4 py-3 rounded-lg bg-card border border-border text-foreground font-body focus:outline-none focus:ring-2 focus:ring-ring" placeholder="e.g. Best Ghazal of the Week" />
            </div>
            <div>
              <label className="block font-body text-sm font-medium text-foreground mb-1">Description</label>
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-4 py-3 rounded-lg bg-card border border-border text-foreground font-body focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-body text-sm font-medium text-foreground mb-1">Theme</label>
                <input type="text" value={form.theme} onChange={e => setForm({ ...form, theme: e.target.value })} className="w-full px-4 py-3 rounded-lg bg-card border border-border text-foreground font-body focus:outline-none focus:ring-2 focus:ring-ring" placeholder="e.g. Love" />
              </div>
              <div>
                <label className="block font-body text-sm font-medium text-foreground mb-1">End Date</label>
                <input type="date" value={form.ends_at} onChange={e => setForm({ ...form, ends_at: e.target.value })} className="w-full px-4 py-3 rounded-lg bg-card border border-border text-foreground font-body focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
            </div>
            <button type="submit" disabled={submitting} className="w-full py-3 font-body font-semibold bg-gradient-gold rounded-lg text-primary shadow-gold hover:opacity-90 transition-opacity disabled:opacity-50">
              {submitting ? "Creating..." : "Create Challenge"}
            </button>
          </form>
        </motion.div>
      </section>
      <Footer />
    </div>
  );
};

export default CreateChallenge;
