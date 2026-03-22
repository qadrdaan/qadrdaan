import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Bell, Heart, Gift, MessageCircle, UserPlus, Trash2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const Notifications = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [authLoading, user, navigate]);

  const fetchNotifications = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);
    setNotifications(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  const markAllRead = async () => {
    if (!user) return;
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .eq("is_read", false);
    
    if (error) toast.error("Failed to mark as read");
    else {
      toast.success("All notifications marked as read");
      fetchNotifications();
    }
  };

  const deleteNotification = async (id: string) => {
    const { error } = await supabase.from("notifications").delete().eq("id", id);
    if (error) toast.error("Failed to delete");
    else {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'like': return <Heart className="w-5 h-5 text-secondary" />;
      case 'gift': return <Gift className="w-5 h-5 text-accent" />;
      case 'comment': return <MessageCircle className="w-5 h-5 text-primary" />;
      case 'follow': return <UserPlus className="w-5 h-5 text-primary" />;
      default: return <Bell className="w-5 h-5 text-muted-foreground" />;
    }
  };

  if (authLoading) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-28 pb-20 container mx-auto px-6 max-w-2xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Notifications</h1>
            <p className="font-body text-sm text-muted-foreground mt-1">Stay updated with your community.</p>
          </div>
          {notifications.some(n => !n.is_read) && (
            <button 
              onClick={markAllRead}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider text-primary hover:bg-primary/5 rounded-xl transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" /> Mark all read
            </button>
          )}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-20 bg-muted animate-pulse rounded-2xl" />)}
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-20 bg-card border border-dashed border-border rounded-3xl">
            <Bell className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="font-body text-muted-foreground">No notifications yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((n, i) => (
              <motion.div 
                key={n.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className={`group flex items-center gap-4 p-4 rounded-2xl border transition-all ${n.is_read ? 'bg-card border-border' : 'bg-primary/5 border-primary/20 shadow-sm'}`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${n.is_read ? 'bg-muted' : 'bg-white shadow-sm'}`}>
                  {getIcon(n.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-body text-sm ${n.is_read ? 'text-foreground/80' : 'text-foreground font-bold'}`}>
                    {n.title} <span className="font-normal text-muted-foreground">{n.message}</span>
                  </p>
                  <p className="font-body text-[10px] text-muted-foreground mt-1 uppercase font-bold tracking-widest">
                    {new Date(n.created_at).toLocaleString()}
                  </p>
                </div>
                <button 
                  onClick={() => deleteNotification(n.id)}
                  className="p-2 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
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

export default Notifications;