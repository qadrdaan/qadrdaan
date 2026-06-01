import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [cnic, setCnic] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetEmailConfirm, setResetEmailConfirm] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const navigate = useNavigate();
  const { session } = useAuth();

  useEffect(() => {
    if (session) navigate("/");
  }, [session, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLogin) {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Welcome back!");
        navigate("/");
      }
      setLoading(false);
      return;
    }

    // Signup
    if (!agreedToTerms) {
      toast.error("You must read and agree to the Terms of Service and Privacy Policy");
      return;
    }

    const cnicClean = cnic.replace(/[^0-9]/g, "");
    if (cnicClean.length !== 13) {
      toast.error("CNIC must be exactly 13 digits");
      return;
    }
    if (!dateOfBirth) {
      toast.error("Date of birth is required");
      return;
    }
    const dob = new Date(dateOfBirth);
    const age = Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    if (age < 18) {
      toast.error("You must be at least 18 years old to create an account");
      return;
    }

    setLoading(true);
    const { data: exists } = await supabase.rpc("cnic_exists" as any, { _cnic: cnicClean });
    if (exists) {
      toast.error("An account with this CNIC already exists. Only one account per CNIC is allowed.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName, cnic: cnicClean, date_of_birth: dateOfBirth },
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) toast.error(error.message);
    else toast.success("Account created! Check your email to confirm.");
    setLoading(false);
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    const a = resetEmail.trim().toLowerCase();
    const b = resetEmailConfirm.trim().toLowerCase();
    if (!a) { toast.error("Enter your email"); return; }
    if (a !== b) { toast.error("Emails do not match. Please confirm your email."); return; }
    setResetLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(a, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setResetLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("If an account exists for this email, a reset link has been sent. Check inbox & spam.");
    setShowReset(false);
    setResetEmail("");
    setResetEmailConfirm("");
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center px-6 py-10">
      <motion.div
        className="w-full max-w-md bg-card rounded-2xl p-8 shadow-emerald border border-border"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-center mb-8">
          <a href="/" className="font-display text-3xl font-bold text-foreground">Qadrdaan</a>
          <p className="font-body text-muted-foreground mt-2">
            {showReset ? "Reset your password" : isLogin ? "Welcome back." : "Join the global stage."}
          </p>
        </div>

        {showReset ? (
          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <label className="block font-body text-sm font-medium text-foreground mb-1.5">Email</label>
              <input
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground font-body focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block font-body text-sm font-medium text-foreground mb-1.5">Confirm Email</label>
              <input
                type="email"
                value={resetEmailConfirm}
                onChange={(e) => setResetEmailConfirm(e.target.value)}
                required
                placeholder="Re-enter your email"
                className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground font-body focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <p className="font-body text-xs text-muted-foreground mt-1">
                We'll send a secure reset link. Check Spam/Promotions if you don't see it within a minute.
              </p>
            </div>
            <button
              type="submit"
              disabled={resetLoading}
              className="w-full py-3 font-body font-semibold bg-gradient-gold rounded-lg text-primary shadow-gold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {resetLoading ? "Sending..." : "Send Reset Link"}
            </button>
            <button
              type="button"
              onClick={() => setShowReset(false)}
              className="w-full font-body text-sm text-muted-foreground hover:text-secondary transition-colors"
            >
              Back to sign in
            </button>
          </form>
        ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div>
                <label className="block font-body text-sm font-medium text-foreground mb-1.5">Display Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground font-body focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Your pen name"
                  required
                />
              </div>
              <div>
                <label className="block font-body text-sm font-medium text-foreground mb-1.5">CNIC Number</label>
                <input
                  type="text"
                  value={cnic}
                  onChange={(e) => setCnic(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground font-body focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="3520112345678"
                  required
                  maxLength={15}
                />
                <p className="font-body text-xs text-muted-foreground mt-1">13-digit CNIC. One account per CNIC.</p>
              </div>
              <div>
                <label className="block font-body text-sm font-medium text-foreground mb-1.5">Date of Birth</label>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground font-body focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                  max={new Date().toISOString().split("T")[0]}
                />
              </div>
            </>
          )}

          <div>
            <label className="block font-body text-sm font-medium text-foreground mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground font-body focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="block font-body text-sm font-medium text-foreground mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 rounded-lg bg-background border border-border text-foreground font-body focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="••••••••"
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword(s => !s)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {!isLogin && (
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-1 w-4 h-4 accent-secondary"
                required
              />
              <span className="font-body text-xs text-muted-foreground leading-relaxed">
                I have read and agree to the{" "}
                <a href="/terms" target="_blank" rel="noreferrer" className="text-secondary hover:underline font-semibold">Terms</a>,{" "}
                <a href="/privacy" target="_blank" rel="noreferrer" className="text-secondary hover:underline font-semibold">Privacy</a>, and{" "}
                <a href="/refund" target="_blank" rel="noreferrer" className="text-secondary hover:underline font-semibold">Refund Policy</a> of Qadrdaan.
              </span>
            </label>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 font-body font-semibold bg-gradient-gold rounded-lg text-primary shadow-gold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
          </button>

          {isLogin && (
            <button
              type="button"
              onClick={() => { setResetEmail(email); setShowReset(true); }}
              className="w-full font-body text-xs text-muted-foreground hover:text-secondary transition-colors"
            >
              Forgot password?
            </button>
          )}
        </form>
        )}

        {!showReset && (
          <p className="text-center font-body text-sm text-muted-foreground mt-6">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-secondary hover:text-accent font-semibold transition-colors"
            >
              {isLogin ? "Sign Up" : "Sign In"}
            </button>
          </p>
        )}
      </motion.div>
    </div>
  );
};

export default Auth;
