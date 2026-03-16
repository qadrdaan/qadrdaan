import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Bell } from "lucide-react";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string | null;
  reference_id: string | null;
  reference_type: string | null;
  is_read: boolean;
  created_at: string;
}

const NotificationBell = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);
      const items = (data as Notification[]) || [];
      setNotifications(items);
      setUnreadCount(items.filter((n) => !n.is_read).length);
    };
    fetch();

    // Realtime subscription
    const channel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        (payload) => {
          const n = payload.new as Notification;
          setNotifications((prev) => [n, ...prev].slice(0, 20));
          setUnreadCount((c) => c + 1);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const markAllRead = async () => {
    if (!user) return;
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .eq("is_read", false);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  const getLink = (n: Notification) => {
    if (n.reference_type === "post" && n.reference_id) return `/post/${n.reference_id}`;
    if (n.reference_type === "profile" && n.reference_id) return `/poet/${n.reference_id}`;
    return "#";
  };

  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => { setOpen(!open); if (!open && unreadCount > 0) markAllRead(); }}
        className="relative p-2 text-primary-foreground/80 hover:text-accent transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 flex items-center justify-center text-[10px] font-bold bg-destructive text-destructive-foreground rounded-full min-w-[18px] h-[18px] px-1">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto bg-card border border-border rounded-xl shadow-lg z-50">
            <div className="p-3 border-b border-border flex items-center justify-between">
              <span className="font-display text-sm font-bold text-foreground">Notifications</span>
              {unreadCount > 0 && (
                <button onClick={markAllRead} className="font-body text-xs text-secondary hover:underline">
                  Mark all read
                </button>
              )}
            </div>
            {notifications.length === 0 ? (
              <p className="p-6 text-center font-body text-sm text-muted-foreground">No notifications</p>
            ) : (
              notifications.map((n) => (
                <Link
                  key={n.id}
                  to={getLink(n)}
                  onClick={() => setOpen(false)}
                  className={`block px-4 py-3 border-b border-border last:border-0 hover:bg-muted/50 transition-colors ${!n.is_read ? "bg-accent/5" : ""}`}
                >
                  <p className="font-body text-sm font-medium text-foreground">{n.title}</p>
                  {n.message && <p className="font-body text-xs text-muted-foreground mt-0.5">{n.message}</p>}
                  <p className="font-body text-[10px] text-muted-foreground mt-1">
                    {new Date(n.created_at).toLocaleString()}
                  </p>
                </Link>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;
