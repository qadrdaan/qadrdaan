import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { LinkIcon, Copy, Users, CheckCircle, Clock } from "lucide-react";

const Referrals = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [referrals, setReferrals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => { if (!authLoading && !user) navigate("/auth"); }, [authLoading, user, navigate]);

  const fetchReferrals = async () => {
    if (!user) return;
    const { data } = await supabase.from("referrals").select("*").eq("inviter_id", user.id).order("created_at", { ascending: false });
    setReferrals(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchReferrals(); }, [user]);

  const generateCode = () => Math.random().toString(36).substring(2, 10).toUpperCase();

  const handleCreate = async () => {
    if (!user) return;
    setCreating(true);
    const code = generateCode();
    const { error } = await supabase.from("referrals").insert({ inviter_id: user.id, invite_code: code });
    if (error) { toast.error("Failed to generate link"); } else { toast.success("Invite link created!"); fetchReferrals(); }
    setCreating(false);
  };

  const copyLink = (code: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/auth?ref=${code}`);
    toast.success("Link copied!");
  };

  const accepted = referrals.filter(r => r.status === "accepted").length;
  const pending = referrals.filter(r => r.status === "pending").length;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-28 pb-20 container mx-auto px-6 max-w-3xl">
        <div className="flex items-center gap-3 mb-2">
          <LinkIcon className="w-7 h-7 text-secondary" />
          <h1 className="font-display text-3xl font-bold text-foreground">Invite Poets</h1>
        </div>
        <p className="font-body text-muted-foreground mb-8">Invite fellow poets to join Qadrdaan and grow the community</p>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-card border border-border rounded-xl p-4 text-center">
            <Users className="w-5 h-5 mx-auto mb-2 text-secondary" />
            <p className="font-display text-xl font-bold text-foreground">{referrals.length}</p>
            <p className="font-body text-xs text-muted-foreground">Total Invites</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 text-center">
            <CheckCircle className="w-5 h-5 mx-auto mb-2 text-secondary" />
            <p className="font-display text-xl font-bold text-foreground">{accepted}</p>
            <p className="font-body text-xs text-muted-foreground">Accepted</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 text-center">
            <Clock className="w-5 h-5 mx-auto mb-2 text-accent" />
            <p className="font-display text-xl font-bold text-foreground">{pending}</p>
            <p className="font-body text-xs text-muted-foreground">Pending</p>
          </div>
        </div>

        <button onClick={handleCreate} disabled={creating} className="mb-8 px-6 py-3 font-body font-semibold bg-gradient-gold rounded-lg text-primary shadow-gold hover:opacity-90 transition-opacity disabled:opacity-50">
          {creating ? "Generating..." : "Generate Invite Link"}
        </button>

        {loading ? (
          <p className="font-body text-muted-foreground">Loading...</p>
        ) : referrals.length === 0 ? (
          <p className="font-body text-muted-foreground">No invitations yet. Generate your first invite link above!</p>
        ) : (
          <div className="space-y-3">
            {referrals.map((r, i) => (
              <motion.div key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="flex items-center gap-4 bg-card border border-border rounded-xl p-4">
                <div className="flex-1">
                  <p className="font-body text-sm font-medium text-foreground font-mono">{r.invite_code}</p>
                  <p className="font-body text-xs text-muted-foreground capitalize">{r.status} · {new Date(r.created_at).toLocaleDateString()}</p>
                </div>
                <button onClick={() => copyLink(r.invite_code)} className="p-2 text-muted-foreground hover:text-secondary transition-colors">
                  <Copy className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </section>
      <Footer />
    </div>
  );
};

export default Referrals;
