import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import {
  Mic, Calendar, Users, Globe, Send, Heart, HandMetal,
  UserPlus, Radio, Clock,
} from "lucide-react";
import SendGift from "@/components/SendGift";
import { Gift } from "lucide-react";

interface EventData {
  id: string;
  title: string;
  description: string | null;
  event_type: string;
  status: string;
  language: string | null;
  theme: string | null;
  scheduled_at: string;
  audience_count: number;
  max_performers: number | null;
  organizer_id: string;
}

interface Message {
  id: string;
  content: string;
  message_type: string;
  created_at: string;
  user_id: string;
  display_name?: string;
}

interface Registration {
  id: string;
  user_id: string;
  role: string;
  status: string;
  display_name?: string;
}

const statusConfig: Record<string, { color: string; icon: any; label: string }> = {
  live: { color: "bg-red-500 text-white", icon: Radio, label: "● LIVE" },
  upcoming: { color: "bg-secondary/20 text-secondary", icon: Clock, label: "Upcoming" },
  ended: { color: "bg-muted text-muted-foreground", icon: Calendar, label: "Ended" },
  cancelled: { color: "bg-destructive/20 text-destructive", icon: Calendar, label: "Cancelled" },
};

const MushairaDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [event, setEvent] = useState<EventData | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [isRegistered, setIsRegistered] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [loading, setLoading] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) {
      fetchEvent();
      fetchMessages();
      fetchRegistrations();
    }
  }, [id]);

  // Realtime messages
  useEffect(() => {
    if (!id) return;
    const channel = supabase
      .channel(`event-${id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "event_messages", filter: `event_id=eq.${id}` },
        async (payload) => {
          const msg = payload.new as any;
          const { data: profile } = await supabase
            .from("profiles")
            .select("display_name")
            .eq("user_id", msg.user_id)
            .single();
          setMessages((prev) => [...prev, { ...msg, display_name: profile?.display_name || "User" }]);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (user && registrations.length > 0) {
      setIsRegistered(registrations.some((r) => r.user_id === user.id));
    }
  }, [user, registrations]);

  const fetchEvent = async () => {
    const { data } = await supabase
      .from("mushaira_events")
      .select("*")
      .eq("id", id!)
      .single();
    setEvent(data);
    setLoading(false);
  };

  const fetchMessages = async () => {
    const { data } = await supabase
      .from("event_messages")
      .select("*")
      .eq("event_id", id!)
      .order("created_at", { ascending: true })
      .limit(200);

    if (data && data.length > 0) {
      const userIds = [...new Set(data.map((m) => m.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name")
        .in("user_id", userIds);
      const map = new Map(profiles?.map((p) => [p.user_id, p.display_name]) || []);
      setMessages(data.map((m) => ({ ...m, display_name: map.get(m.user_id) || "User" })));
    }
  };

  const fetchRegistrations = async () => {
    const { data } = await supabase
      .from("event_registrations")
      .select("*")
      .eq("event_id", id!);

    if (data && data.length > 0) {
      const userIds = data.map((r) => r.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name")
        .in("user_id", userIds);
      const map = new Map(profiles?.map((p) => [p.user_id, p.display_name]) || []);
      setRegistrations(data.map((r) => ({ ...r, display_name: map.get(r.user_id) || "User" })));
    } else {
      setRegistrations([]);
    }
  };

  const handleRegister = async (role: "performer" | "audience") => {
    if (!user) { toast.error("Please sign in first"); return; }
    const { error } = await supabase.from("event_registrations").insert({
      event_id: id!,
      user_id: user.id,
      role,
    });
    if (error) toast.error(error.message);
    else {
      toast.success(`Registered as ${role}!`);
      fetchRegistrations();
    }
  };

  const handleSendMessage = async (type: string = "chat", content?: string) => {
    if (!user) { toast.error("Please sign in to chat"); return; }
    const text = content || chatInput.trim();
    if (!text) return;

    await supabase.from("event_messages").insert({
      event_id: id!,
      user_id: user.id,
      content: text,
      message_type: type,
    });
    setChatInput("");
  };

  if (loading || !event) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 flex items-center justify-center">
          <p className="font-body text-muted-foreground">{loading ? "Loading..." : "Event not found."}</p>
        </div>
      </div>
    );
  }

  const status = statusConfig[event.status] || statusConfig.upcoming;
  const performers = registrations.filter((r) => r.role === "performer");
  const isLiveOrUpcoming = event.status === "live" || event.status === "upcoming";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <div className="h-56 bg-gradient-hero relative flex items-end">
        <div className="container mx-auto px-6 pb-6 relative z-10">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-body font-semibold rounded-full ${status.color} mb-3`}>
            <status.icon className="w-3 h-3" />
            {status.label}
          </span>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground">
            {event.title}
          </h1>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-6xl">
        <div className="grid lg:grid-cols-[1fr_380px] gap-8">
          {/* Main content */}
          <div>
            {/* Event info */}
            <div className="bg-card rounded-2xl border border-border p-6 mb-6">
              {event.description && (
                <p className="font-body text-foreground/80 mb-4 leading-relaxed">{event.description}</p>
              )}

              <div className="flex flex-wrap gap-3 mb-6">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-background border border-border rounded-lg font-body text-sm text-foreground">
                  <Calendar className="w-3.5 h-3.5 text-secondary" />
                  {new Date(event.scheduled_at).toLocaleString(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </span>
                {event.language && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-background border border-border rounded-lg font-body text-sm text-foreground">
                    <Globe className="w-3.5 h-3.5 text-secondary" />
                    {event.language}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-background border border-border rounded-lg font-body text-sm text-foreground capitalize">
                  <Mic className="w-3.5 h-3.5 text-secondary" />
                  {event.event_type}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-background border border-border rounded-lg font-body text-sm text-foreground">
                  <Users className="w-3.5 h-3.5 text-secondary" />
                  {event.audience_count} watching
                </span>
              </div>

              {/* Registration buttons */}
              {isLiveOrUpcoming && !isRegistered && user && (
                <div className="flex gap-3">
                  <button
                    onClick={() => handleRegister("performer")}
                    className="px-5 py-2.5 font-body font-semibold text-sm bg-gradient-gold rounded-lg text-primary shadow-gold hover:opacity-90 transition-opacity flex items-center gap-2"
                  >
                    <Mic className="w-4 h-4" />
                    Register as Performer
                  </button>
                  <button
                    onClick={() => handleRegister("audience")}
                    className="px-5 py-2.5 font-body font-semibold text-sm border border-border rounded-lg text-foreground hover:bg-muted transition-colors flex items-center gap-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    Join as Audience
                  </button>
                </div>
              )}
              {isRegistered && (
                <p className="font-body text-sm text-secondary font-semibold">✓ You are registered for this event</p>
              )}
            </div>

            {/* Performers list */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <h2 className="font-display text-xl font-bold text-foreground mb-4">
                Performers ({performers.length})
              </h2>
              {performers.length === 0 ? (
                <p className="font-body text-sm text-muted-foreground">No performers registered yet.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {performers.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center gap-3 p-3 bg-background rounded-xl border border-border"
                    >
                      <div className="w-9 h-9 rounded-full bg-gradient-gold flex items-center justify-center shrink-0">
                        <span className="font-display text-sm font-bold text-primary">
                          {(p.display_name || "?")[0].toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-body text-sm font-medium text-foreground truncate">
                          {p.display_name}
                        </p>
                        <p className="font-body text-xs text-muted-foreground capitalize">{p.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Live chat sidebar */}
          <div className="bg-card rounded-2xl border border-border flex flex-col h-[600px]">
            <div className="px-4 py-3 border-b border-border">
              <h3 className="font-display text-lg font-semibold text-foreground">Live Chat</h3>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {messages.length === 0 ? (
                <p className="font-body text-sm text-muted-foreground text-center mt-8">
                  No messages yet. Be the first!
                </p>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id}>
                    {msg.message_type === "chat" ? (
                      <div>
                        <span className="font-body text-xs font-semibold text-secondary">
                          {msg.display_name}
                        </span>
                        <p className="font-body text-sm text-foreground">{msg.content}</p>
                      </div>
                    ) : (
                      <p className="font-body text-xs text-center text-muted-foreground">
                        {msg.display_name} {msg.message_type === "applause" ? "👏" : "❤️"}
                      </p>
                    )}
                  </div>
                ))
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Reactions */}
            <div className="px-4 py-2 border-t border-border flex gap-2">
              <button
                onClick={() => handleSendMessage("applause", "👏")}
                className="px-3 py-1.5 rounded-lg bg-muted text-foreground text-sm hover:bg-secondary/20 transition-colors flex items-center gap-1"
                disabled={!user}
              >
                <HandMetal className="w-3.5 h-3.5" /> Applause
              </button>
              <button
                onClick={() => handleSendMessage("reaction", "❤️")}
                className="px-3 py-1.5 rounded-lg bg-muted text-foreground text-sm hover:bg-secondary/20 transition-colors flex items-center gap-1"
                disabled={!user}
              >
                <Heart className="w-3.5 h-3.5" /> Love
              </button>
            </div>

            {/* Chat input */}
            <div className="px-4 py-3 border-t border-border">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={user ? "Type a message..." : "Sign in to chat"}
                  disabled={!user}
                  maxLength={500}
                  className="flex-1 px-3 py-2 rounded-lg bg-background border border-border text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!user || !chatInput.trim()}
                  className="p-2 rounded-lg bg-gradient-gold text-primary disabled:opacity-50 hover:opacity-90 transition-opacity"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MushairaDetail;
