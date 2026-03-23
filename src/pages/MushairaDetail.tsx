import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Mic, Calendar, Users, Globe, Send, Heart,
  Radio, Clock, Shield, Trash2, Download, Share2, Layout, PlayCircle
} from "lucide-react";
import SendGift from "@/components/SendGift";
import ShareMushairaModal from "@/components/ShareMushairaModal";

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
  recording_url?: string;
}

const statusConfig: Record<string, { color: string; icon: any; label: string }> = {
  live: { color: "bg-red-500 text-white", icon: Radio, label: "● LIVE" },
  upcoming: { color: "bg-secondary/20 text-secondary", icon: Clock, label: "Upcoming" },
  ended: { color: "bg-muted text-muted-foreground", icon: Calendar, label: "Ended" },
  cancelled: { color: "bg-destructive/20 text-destructive", icon: Calendar, label: "Cancelled" },
};

const MushairaDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState<EventData | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const isHost = user?.id === event?.organizer_id;

  useEffect(() => {
    if (id) {
      fetchEvent();
      fetchMessages();
    }
  }, [id]);

  const fetchEvent = async () => {
    const { data } = await supabase.from("mushaira_events").select("*").eq("id", id!).single();
    setEvent(data);
    setLoading(false);
  };

  const fetchMessages = async () => {
    const { data } = await supabase.from("event_messages").select("*").eq("event_id", id!).order("created_at", { ascending: true });
    if (data) setMessages(data);
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure? This action cannot be undone.")) return;
    const { error } = await supabase.from("mushaira_events").delete().eq("id", id!);
    if (error) toast.error("Failed to delete");
    else {
      toast.success("Mushaira deleted");
      navigate("/mushairas");
    }
  };

  if (loading || !event) return null;

  const status = statusConfig[event.status] || statusConfig.upcoming;
  const hasRecording = event.status === 'ended' && event.recording_url;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {hasRecording ? (
        <div className="bg-black pt-16">
          <div className="container mx-auto max-w-5xl aspect-video bg-slate-900 flex items-center justify-center relative group">
            <video 
              src={event.recording_url} 
              controls 
              className="w-full h-full"
              poster="/images/mushaira-placeholder.jpg"
            />
            <div className="absolute top-4 left-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-white text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
              <PlayCircle className="w-3 h-3 text-secondary" /> Recording
            </div>
          </div>
        </div>
      ) : (
        <div className="h-56 bg-gradient-hero relative flex items-end">
          <div className="container mx-auto px-6 pb-6 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full ${status.color} mb-3`}>
                  <status.icon className="w-3 h-3" /> {status.label}
                </span>
                <h1 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground">{event.title}</h1>
              </div>
              
              {isHost && event.status === 'ended' && (
                <div className="flex gap-2">
                  <button onClick={() => setShareModalOpen(true)} className="p-3 bg-white/10 backdrop-blur-md text-white rounded-xl hover:bg-white/20 transition-all" title="Upload to Wall">
                    <Layout className="w-5 h-5" />
                  </button>
                  <button onClick={handleDelete} className="p-3 bg-destructive/20 backdrop-blur-md text-destructive rounded-xl hover:bg-destructive/30 transition-all" title="Delete">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-6 py-8 max-w-6xl">
        <div className="grid lg:grid-cols-[1fr_380px] gap-8">
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-3xl p-8">
              <h2 className="font-display text-2xl font-bold mb-4">About this Mushaira</h2>
              <p className="font-body text-foreground/80 text-lg leading-relaxed mb-8">{event.description}</p>
              <div className="flex flex-wrap gap-4">
                <div className="px-4 py-2 bg-muted rounded-xl flex items-center gap-2 text-sm font-bold">
                  <Calendar className="w-4 h-4 text-primary" /> {new Date(event.scheduled_at).toLocaleDateString()}
                </div>
                <div className="px-4 py-2 bg-muted rounded-xl flex items-center gap-2 text-sm font-bold">
                  <Globe className="w-4 h-4 text-secondary" /> {event.language}
                </div>
                <div className="px-4 py-2 bg-muted rounded-xl flex items-center gap-2 text-sm font-bold">
                  <Users className="w-4 h-4 text-accent" /> {event.audience_count} {event.status === 'ended' ? 'attended' : 'watching'}
                </div>
              </div>
            </div>

            {event.status === 'live' && (
              <div className="bg-secondary/5 border border-secondary/20 rounded-3xl p-8 text-center">
                <Radio className="w-12 h-12 text-secondary mx-auto mb-4 animate-pulse" />
                <h3 className="font-display text-xl font-bold mb-2">Mushaira is Live!</h3>
                <p className="font-body text-muted-foreground mb-6">Join the stage or support the poets with gifts.</p>
                <button className="px-8 py-3 bg-secondary text-white rounded-xl font-bold uppercase text-xs tracking-widest shadow-brand">Join Now</button>
              </div>
            )}
          </div>

          <div className="bg-card border border-border rounded-3xl flex flex-col h-[600px] overflow-hidden">
            <div className="p-6 border-b border-border bg-muted/30">
              <h3 className="font-display text-lg font-bold flex items-center gap-2">
                {event.status === 'ended' ? 'Chat Archive' : 'Live Chat'} <Shield className="w-4 h-4 text-secondary" />
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 ? (
                <p className="text-center font-body text-xs text-muted-foreground italic py-10">No messages yet.</p>
              ) : messages.map((msg) => (
                <div key={msg.id} className="flex flex-col">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1">User</span>
                  <p className="text-sm font-body text-foreground/90">{msg.content}</p>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            {event.status === 'live' && (
              <div className="p-4 border-t border-border">
                <div className="relative">
                  <input placeholder="Say something..." className="w-full bg-muted/50 border-none rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/20" />
                  <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-primary hover:text-secondary transition-colors">
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <ShareMushairaModal 
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        event={event}
      />
      <Footer />
    </div>
  );
};

export default MushairaDetail;