import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { ShieldCheck, CheckCircle, Clock, Star } from "lucide-react";

const requirements = [
  { icon: Star, text: "Have at least 3 published books or 5 videos on the platform" },
  { icon: Clock, text: "Account must be at least 30 days old" },
  { icon: ShieldCheck, text: "Complete profile with display name, bio, and avatar" },
  { icon: CheckCircle, text: "No community guideline violations" },
];

const Verification = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [loading, user, navigate]);

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
                Your account has been verified. The verification badge is displayed on your profile and all your content.
              </p>
            </div>
          ) : (
            <>
              <p className="font-body text-muted-foreground leading-relaxed mb-10">
                Get the verified badge on your profile to build trust with your audience.
                Verified creators get increased visibility and access to premium features.
              </p>

              <div className="space-y-4 mb-10">
                <h2 className="font-display text-xl font-bold text-foreground">Requirements</h2>
                {requirements.map((r, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-4 p-4 bg-card border border-border rounded-xl"
                  >
                    <r.icon className="w-5 h-5 text-secondary mt-0.5 shrink-0" />
                    <p className="font-body text-sm text-foreground">{r.text}</p>
                  </motion.div>
                ))}
              </div>

              <div className="p-6 bg-card border border-border rounded-2xl">
                <h3 className="font-display text-lg font-bold text-foreground mb-2">How to Apply</h3>
                <p className="font-body text-sm text-muted-foreground leading-relaxed mb-4">
                  Once you meet all the requirements, contact our team with your profile link.
                  We review verification requests within 7 business days.
                </p>
                <a
                  href="/contact"
                  className="inline-flex px-6 py-3 text-sm font-body font-semibold bg-gradient-gold rounded-lg text-primary shadow-gold hover:opacity-90 transition-opacity"
                >
                  Contact Us to Apply
                </a>
              </div>
            </>
          )}
        </motion.div>
      </section>
      <Footer />
    </div>
  );
};

export default Verification;
