import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useModeration } from "@/hooks/useModeration";
import { motion } from "framer-motion";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Mic, Calendar, Users, Globe, Send, Heart, HandMetal,
  UserPlus, Radio, Clock, Shield, Trash2, Download, Share2, Layout
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

  const handleDownload = () => {
    toast.info("Recording download started...");
  };

  if (loading || !event) return null;

  const status = statusConfig[event.status] || statusConfig.upcoming;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
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
                <button onClick={handleDownload} className="p-3 bg-white/10 backdrop-blur-md text-white rounded-xl hover:bg-white/20 transition-all" title="Download Recording">
                  <Download className="w-5 h-5" />
                </button>
                <button onClick={handleDelete} className="p-3 bg-destructive/20 backdrop-blur-md text-destructive rounded-xl hover:bg-destructive/30 transition-all" title="Delete">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-6xl">
        <div className="grid lg:grid-cols-[1fr_380px] gap-8">
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-3xl p-8">
              <p className="font-body text-foreground/80 text-lg leading-relaxed mb-8">{event.description}</p>
              <div className="flex flex-wrap gap-4">
                <div className="px-4 py-2 bg-muted rounded-xl flex items-center gap-2 text-sm font-bold">
                  <Calendar className="w-4 h-4 text-primary" /> {new Date(event.scheduled_at).toLocaleDateString()}
                </div>
                <div className="px-4 py-2 bg-muted rounded-xl flex items-center gap-2 text-sm font-bold">
                  <Globe className="w-4 h-4 text-secondary" /> {event.language}
                </div>
                <div className="px-4 py-2 bg-muted rounded-xl flex items-center gap-2 text-sm font-bold">
                  <Users className="w-4 h-4 text-accent" /> {event.audience_count} watching
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-3xl flex flex-col h-[600px] overflow-hidden">
            <div className="p-6 border-b border-border bg-muted/30">
              <h3 className="font-display text-lg font-bold flex items-center gap-2">
                Live Chat <Shield className="w-4 h-4 text-secondary" />
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className="flex flex-col">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1">User</span>
                  <p className="text-sm font-body text-foreground/90">{msg.content}</p>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
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