import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Crown, Users, Star, Plus, Lock, DollarSign } from "lucide-react";

interface FanClub {
  id: string;
  creator_id: string;
  name: string;
  description: string | null;
  price_monthly: number;
  is_active: boolean;
  member_count: number;
  creator_name?: string;
  creator_avatar?: string;
}

const FanClubs = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [clubs, setClubs] = useState<FanClub[]>([]);
  const [mySubscriptions, setMySubscriptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });

  useEffect(() => {
    fetchClubs();
    if (user) fetchMySubscriptions();
  }, [user]);

  const fetchClubs = async () => {
    const { data } = await supabase.from("fan_clubs").select("*").eq("is_active", true).order("member_count", { ascending: false });
    if (data && data.length > 0) {
      const creatorIds = data.map((c: any) => c.creator_id);
      const { data: profiles } = await supabase.from("profiles").select("user_id, display_name, avatar_url").in("user_id", creatorIds);
      const map = new Map(profiles?.map((p) => [p.user_id, p]) || []);
      setClubs(data.map((c: any) => ({
        ...c,
        creator_name: (map.get(c.creator_id) as any)?.display_name || "Creator",
        creator_avatar: (map.get(c.creator_id) as any)?.avatar_url,
      })));
    }
    setLoading(false);
  };

  const fetchMySubscriptions = async () => {
    const { data } = await supabase.from("fan_club_subscriptions").select("fan_club_id").eq("user_id", user!.id).eq("status", "active");
    setMySubscriptions(data?.map((s: any) => s.fan_club_id) || []);
  };

  const canCreateClub = profile && profile.followers_count >= 1000;
  const hasClub = clubs.some((c) => c.creator_id === user?.id);

  const handleCreateClub = async () => {
    if (!user || !form.name.trim()) { toast.error("Club name is required"); return; }
    setCreating(true);
    const { error } = await supabase.from("fan_clubs").insert({
      creator_id: user.id,
      name: form.name.trim(),
      description: form.description.trim() || null,
    });
    if (error) toast.error(error.message);
    else { toast.success("Fan club created!"); setForm({ name: "", description: "" }); fetchClubs(); }
    setCreating(false);
  };

  const handleSubscribe = async (clubId: string) => {
    if (!user) { toast.error("Please sign in first"); return; }
    // Deduct coins (300 coins = $3)
    const { data: balance } = await supabase.from("user_balances").select("coins").eq("user_id", user.id).single();
    if (!balance || balance.coins < 300) {
      toast.error("Insufficient coins. Need 300 coins ($3) for monthly subscription.");
      return;
    }
    const { error: balError } = await supabase.from("user_balances").update({ coins: balance.coins - 300 }).eq("user_id", user.id);
    if (balError) { toast.error("Payment failed"); return; }

    const { error } = await supabase.from("fan_club_subscriptions").insert({
      fan_club_id: clubId,
      user_id: user.id,
    });
    if (error) {
      // Refund
      await supabase.from("user_balances").update({ coins: balance.coins }).eq("user_id", user.id);
      toast.error(error.message);
    } else {
      toast.success("Subscribed! You now have access to exclusive content.");
      fetchMySubscriptions();
      fetchClubs();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="h-48 bg-gradient-hero relative flex items-end">
        <div className="container mx-auto px-6 pb-6 relative z-10">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground flex items-center gap-3">
            <Crown className="w-8 h-8" /> Fan Clubs
          </h1>
          <p className="font-body text-primary-foreground/80 mt-1">
            Subscribe to your favorite poets' exclusive content — $3/month
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-5xl">
        {/* Create Club */}
        {user && canCreateClub && !hasClub && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl border border-border p-6 mb-8">
            <h2 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" /> Create Your Fan Club
            </h2>
            <div className="space-y-3 max-w-md">
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Club name"
                className="w-full px-4 py-2.5 rounded-lg bg-background border border-border text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Description (optional)"
                rows={3}
                className="w-full px-4 py-2.5 rounded-lg bg-background border border-border text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button onClick={handleCreateClub} disabled={creating} className="px-6 py-2.5 bg-primary text-primary-foreground font-body font-semibold text-sm rounded-lg hover:opacity-90 disabled:opacity-50">
                {creating ? "Creating..." : "Create Club"}
              </button>
            </div>
          </motion.div>
        )}

        {user && !canCreateClub && !hasClub && (
          <div className="bg-muted rounded-2xl p-4 mb-8 flex items-center gap-3">
            <Lock className="w-5 h-5 text-muted-foreground" />
            <p className="font-body text-sm text-muted-foreground">
              You need <strong>1,000+ followers</strong> to create a fan club. Current: {profile?.followers_count || 0}
            </p>
          </div>
        )}

        {/* Club List */}
        {loading ? (
          <p className="font-body text-muted-foreground text-center py-12">Loading clubs...</p>
        ) : clubs.length === 0 ? (
          <p className="font-body text-muted-foreground text-center py-12">No fan clubs yet. Be the first creator!</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {clubs.map((club, i) => {
              const isSubscribed = mySubscriptions.includes(club.id);
              const isOwner = club.creator_id === user?.id;
              return (
                <motion.div
                  key={club.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-card rounded-2xl border border-border p-5 flex flex-col"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shrink-0">
                      {club.creator_avatar ? (
                        <img src={club.creator_avatar} className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <span className="font-display text-sm font-bold text-primary-foreground">
                          {(club.creator_name || "?")[0].toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-display text-base font-bold text-foreground truncate">{club.name}</p>
                      <p className="font-body text-xs text-muted-foreground">by {club.creator_name}</p>
                    </div>
                  </div>
                  {club.description && (
                    <p className="font-body text-sm text-muted-foreground mb-3 line-clamp-2">{club.description}</p>
                  )}
                  <div className="flex items-center gap-4 mb-4 mt-auto">
                    <span className="font-body text-xs text-muted-foreground flex items-center gap-1">
                      <Users className="w-3 h-3" /> {club.member_count} members
                    </span>
                    <span className="font-body text-xs text-secondary font-semibold flex items-center gap-1">
                      <DollarSign className="w-3 h-3" /> ${club.price_monthly}/mo
                    </span>
                  </div>
                  {isOwner ? (
                    <Link to={`/fan-club/${club.id}`} className="w-full py-2 text-center bg-muted text-foreground font-body text-sm font-semibold rounded-lg hover:bg-muted/80">
                      Manage Club
                    </Link>
                  ) : isSubscribed ? (
                    <Link to={`/fan-club/${club.id}`} className="w-full py-2 text-center bg-primary text-primary-foreground font-body text-sm font-semibold rounded-lg">
                      <Star className="w-3.5 h-3.5 inline mr-1" /> View Content
                    </Link>
                  ) : (
                    <button onClick={() => handleSubscribe(club.id)} className="w-full py-2 bg-gradient-gold text-foreground font-body text-sm font-semibold rounded-lg shadow-gold hover:opacity-90">
                      Subscribe — 300 coins
                    </button>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default FanClubs;
