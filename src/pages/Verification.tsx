import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ShieldCheck, CheckCircle, Clock, Star, Award, Users } from "lucide-react";

const requirements = [
  { icon: Star, text: "Have at least 3 published books or 5 videos on the platform" },
  { icon: Clock, text: "Account must be at least 30 days old" },
  { icon: ShieldCheck, text: "Complete profile with display name, bio, and avatar" },
  { icon: CheckCircle, text: "No community guideline violations" },
  { icon: Users, text: "OR refer 100 users to earn free Blue Badge" },
];

const Verification = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: "", reason: "", portfolioLinks: "" });
  const [submitting, setSubmitting] = useState(false);
  const [existingRequest, setExistingRequest] = useState<any>(null);
  const [referralCount, setReferralCount] = useState(0);
  const [checkingEligibility, setCheckingEligibility] = useState(true);

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const [reqRes, refRes] = await Promise.all([
        supabase.from("verification_requests" as any).select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1),
        supabase.from("referrals").select("id", { count: "exact", head: true }).eq("inviter_id", user.id).eq("status", "accepted"),
      ]);
      if ((reqRes.data as any[])?.length) setExistingRequest((reqRes.data as any[])[0]);
      setReferralCount(refRes.count || 0);
      setCheckingEligibility(false);
    };
    fetchData();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!form.fullName.trim() || !form.reason.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from("verification_requests" as any).insert({
      user_id: user.id,
      full_name: form.fullName.trim(),
      reason: form.reason.trim(),
      portfolio_links: form.portfolioLinks.trim() || null,
    } as any);

    if (error) {
      if (error.code === "23505") toast.error("You already have a pending request");
      else toast.error("Failed to submit request");
    } else {
      toast.success("Verification request submitted! We'll review within 7 days.");
      setExistingRequest({ status: "pending" });
    }
    setSubmitting(false);
  };

  const isVerified = profile?.is_verified;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-28 pb-20 container mx-auto px-6 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            Creator <span className="text-gradient-gold">Verification</span>
          </h1>

          {isVerified ? (
            <div className="mt-8 p-8 bg-card border border-secondary/30 rounded-2xl text-center">
              <ShieldCheck className="w-16 h-16 text-secondary mx-auto mb-4" />
              <h2 className="font-display text-2xl font-bold text-foreground mb-2">You're Verified!</h2>
              <p className="font-body text-muted-foreground">
                Your Blue Badge is displayed on your profile and all your content.
              </p>
            </div>
          ) : checkingEligibility ? (
            <p className="font-body text-muted-foreground py-10">Checking eligibility...</p>
          ) : existingRequest ? (
            <div className="mt-8 p-8 bg-card border border-border rounded-2xl text-center">
              <Award className="w-12 h-12 text-secondary mx-auto mb-4" />
              <h2 className="font-display text-xl font-bold text-foreground mb-2">
                Request {existingRequest.status === "pending" ? "Pending" : existingRequest.status === "approved" ? "Approved" : "Rejected"}
              </h2>
              <p className="font-body text-muted-foreground">
                {existingRequest.status === "pending"
                  ? "Your verification request is being reviewed. This usually takes 3-7 business days."
                  : existingRequest.status === "rejected"
                  ? existingRequest.admin_notes || "Your request was not approved. You may reapply after addressing the feedback."
                  : "Congratulations! Your badge will appear shortly."}
              </p>
            </div>
          ) : (
            <>
              <p className="font-body text-muted-foreground leading-relaxed mb-6">
                Get the Blue Badge to build trust. Verified creators get increased visibility and premium features.
              </p>

              {/* Referral progress */}
              <div className="p-4 bg-card border border-border rounded-xl mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-body text-sm font-medium text-foreground">Referral Progress</span>
                  <span className="font-body text-sm text-secondary font-bold">{referralCount}/100</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-secondary rounded-full transition-all" style={{ width: `${Math.min((referralCount / 100) * 100, 100)}%` }} />
                </div>
                <p className="font-body text-xs text-muted-foreground mt-1">
                  {referralCount >= 100 ? "🎉 You qualify for free Blue Badge!" : `Refer ${100 - referralCount} more users for free badge`}
                </p>
              </div>

              <div className="space-y-4 mb-8">
                <h2 className="font-display text-xl font-bold text-foreground">Requirements</h2>
                {requirements.map((r, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-4 p-4 bg-card border border-border rounded-xl">
                    <r.icon className="w-5 h-5 text-secondary mt-0.5 shrink-0" />
                    <p className="font-body text-sm text-foreground">{r.text}</p>
                  </motion.div>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="p-6 bg-card border border-border rounded-2xl space-y-4">
                <h3 className="font-display text-lg font-bold text-foreground">Apply for Verification</h3>
                <div>
                  <label className="block font-body text-sm font-medium text-foreground mb-1">Full Name *</label>
                  <input type="text" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground font-body focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="As on your ID document" />
                </div>
                <div>
                  <label className="block font-body text-sm font-medium text-foreground mb-1">Why should you be verified? *</label>
                  <textarea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} rows={4}
                    className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground font-body focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Describe your contributions to poetry/literature..." />
                </div>
                <div>
                  <label className="block font-body text-sm font-medium text-foreground mb-1">Portfolio / Social Links</label>
                  <input type="text" value={form.portfolioLinks} onChange={(e) => setForm({ ...form, portfolioLinks: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground font-body focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Your website, YouTube, Facebook, etc." />
                </div>
                <button type="submit" disabled={submitting}
                  className="w-full py-3 font-body font-semibold bg-gradient-gold rounded-lg text-primary shadow-gold hover:opacity-90 transition-opacity disabled:opacity-50">
                  {submitting ? "Submitting..." : "Submit Verification Request"}
                </button>
              </form>
            </>
          )}
        </motion.div>
      </section>
      <Footer />
    </div>
  );
};

export default Verification;
