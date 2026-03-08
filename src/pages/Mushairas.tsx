import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Mic, Calendar, Users, Globe, Radio, Clock } from "lucide-react";

interface MushairaEvent {
  id: string;
  title: string;
  description: string | null;
  event_type: string;
  status: string;
  language: string | null;
  theme: string | null;
  cover_url: string | null;
  scheduled_at: string;
  audience_count: number;
  max_performers: number | null;
  organizer_id: string;
  organizer_name?: string;
}

const statusColors: Record<string, string> = {
  live: "bg-red-500 text-white",
  upcoming: "bg-secondary/20 text-secondary",
  ended: "bg-muted text-muted-foreground",
  cancelled: "bg-destructive/20 text-destructive",
};

const Mushairas = () => {
  const [events, setEvents] = useState<MushairaEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"live" | "upcoming" | "past">("upcoming");

  useEffect(() => {
    fetchEvents();
  }, [tab]);

  const fetchEvents = async () => {
    setLoading(true);
    let query = supabase
      .from("mushaira_events")
      .select("*")
      .order("scheduled_at", { ascending: tab === "upcoming" });

    if (tab === "live") query = query.eq("status", "live");
    else if (tab === "upcoming") query = query.eq("status", "upcoming");
    else query = query.eq("status", "ended");

    const { data } = await query;

    if (data && data.length > 0) {
      const orgIds = [...new Set(data.map((e) => e.organizer_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name")
        .in("user_id", orgIds);
      const map = new Map(profiles?.map((p) => [p.user_id, p.display_name]) || []);
      setEvents(data.map((e) => ({ ...e, organizer_name: map.get(e.organizer_id) || "Unknown" })));
    } else {
      setEvents([]);
    }
    setLoading(false);
  };

  const tabs = [
    { key: "live" as const, label: "Live Now", icon: Radio },
    { key: "upcoming" as const, label: "Upcoming", icon: Clock },
    { key: "past" as const, label: "Past Events", icon: Calendar },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 container mx-auto px-6">
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-3">
            Digital <span className="text-gradient-gold">Mushaira</span>
          </h1>
          <p className="font-body text-muted-foreground max-w-lg mx-auto mb-6">
            Join live poetry gatherings from around the world.
          </p>

          <div className="flex justify-center gap-3 mb-2">
            <Link
              to="/create-mushaira"
              className="px-6 py-2.5 font-body font-semibold text-sm bg-gradient-gold rounded-lg text-primary shadow-gold hover:opacity-90 transition-opacity"
            >
              Host a Mushaira
            </Link>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex justify-center gap-2 mb-8">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-body text-sm font-medium transition-all ${
                tab === key
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border text-foreground hover:bg-muted"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-center font-body text-muted-foreground">Loading events...</p>
        ) : events.length === 0 ? (
          <div className="text-center py-16">
            <Mic className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="font-body text-muted-foreground">
              {tab === "live" ? "No live events right now." : tab === "upcoming" ? "No upcoming events." : "No past events."}
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event, i) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  to={`/mushaira/${event.id}`}
                  className="group block bg-card rounded-2xl border border-border hover:border-secondary/30 hover:shadow-gold transition-all overflow-hidden"
                >
                  {/* Cover */}
                  <div className="h-40 bg-gradient-hero relative flex items-center justify-center overflow-hidden">
                    {event.cover_url ? (
                      <img src={event.cover_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Mic className="w-10 h-10 text-primary-foreground/30" />
                    )}
                    <span className={`absolute top-3 right-3 px-2.5 py-1 text-xs font-body font-semibold rounded-full ${statusColors[event.status]}`}>
                      {event.status === "live" ? "● LIVE" : event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                    </span>
                  </div>

                  <div className="p-5">
                    <h3 className="font-display text-lg font-semibold text-foreground line-clamp-1 mb-1">
                      {event.title}
                    </h3>
                    <p className="font-body text-sm text-muted-foreground mb-3">
                      by {event.organizer_name}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-3">
                      {event.language && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-body bg-muted rounded-full text-muted-foreground">
                          <Globe className="w-3 h-3" />
                          {event.language}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-body bg-muted rounded-full text-muted-foreground capitalize">
                        {event.event_type}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs font-body text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(event.scheduled_at).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {event.audience_count}
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Mushairas;
