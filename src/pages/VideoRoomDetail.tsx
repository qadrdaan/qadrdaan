import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import SendGift from "@/components/SendGift";
import {
  Video, Mic, MicOff, Hand, Trophy, Users, Crown,
  UserPlus, UserMinus, Radio, Send, Gift, Sparkles
} from "lucide-react";

interface Seat {
  id: string;
  user_id: string;
  seat_number: number;
  is_muted: boolean;
  score: number;
  display_name?: string;
}

const VideoRoomDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [room, setRoom] = useState<any>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSpeaker, setActiveSpeaker] = useState<string | null>(null);

  useEffect(() => {
    if (id) { fetchRoom(); fetchSeats(); }
  }, [id]);

  const fetchRoom = async () => {
    const { data } = await supabase.from("video_mushaira_rooms").select("*").eq("id", id!).single();
    setRoom(data);
    setLoading(false);
  };

  const fetchSeats = async () => {
    const { data } = await supabase.from("room_seats").select("*").eq("room_id", id!).order("seat_number");
    if (data && data.length > 0) {
      const uids = data.map((s: any) => s.user_id);
      const { data: profiles } = await supabase.from("profiles").select("user_id, display_name").in("user_id", uids);
      const map = new Map(profiles?.map((p) => [p.user_id, p.display_name]) || []);
      setSeats(data.map((s: any) => ({ ...s, display_name: map.get(s.user_id) || "Poet" })));
      
      // Simulate active speaker for UI demo
      if (!activeSpeaker && data.length > 0) setActiveSpeaker(data[0].user_id);
    } else {
      setSeats([]);
    }
  };

  if (loading || !room) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      
      <div className="pt-20 pb-10 container mx-auto px-6 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="font-display text-3xl font-bold">{room.title}</h1>
              <span className="px-2 py-0.5 bg-red-500 text-[10px] font-bold rounded-full animate-pulse">LIVE</span>
            </div>
            <p className="font-body text-sm text-white/60 flex items-center gap-2">
              <Users className="w-4 h-4" /> {room.audience_count} watching · {room.competition_mode ? "Competition Mode" : "Open Mic"}
            </p>
          </div>
          <div className="flex gap-3">
            <button className="px-6 py-2.5 bg-white/10 backdrop-blur-md rounded-xl font-bold text-sm hover:bg-white/20 transition-all">
              <Hand className="w-4 h-4 inline mr-2" /> Raise Hand
            </button>
          </div>
        </div>

        {/* The Stage */}
        <div className="relative bg-slate-900 rounded-[40px] border border-white/10 p-8 mb-8 overflow-hidden shadow-2xl">
          {/* Spotlight Effect */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
          
          <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {seats.map((seat) => {
              const isSpeaking = activeSpeaker === seat.user_id;
              return (
                <motion.div
                  key={seat.id}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="relative group"
                >
                  <div className={`relative aspect-square rounded-3xl overflow-hidden border-2 transition-all duration-500 ${isSpeaking ? "border-primary shadow-[0_0_30px_rgba(139,92,246,0.4)] scale-105" : "border-white/10"}`}>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                      <span className="font-display text-4xl font-bold text-white/20">{(seat.display_name || "?")[0]}</span>
                    </div>
                    
                    {isSpeaking && (
                      <div className="absolute top-3 right-3">
                        <div className="flex gap-1">
                          {[1, 2, 3].map(i => (
                            <motion.div 
                              key={i}
                              animate={{ height: [4, 12, 4] }}
                              transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                              className="w-1 bg-primary rounded-full"
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="absolute bottom-3 left-3 right-3">
                      <p className="font-body text-xs font-bold truncate">{seat.display_name}</p>
                      {room.competition_mode && (
                        <p className="font-body text-[10px] text-primary font-bold uppercase tracking-wider">{seat.score} Points</p>
                      )}
                    </div>
                  </div>

                  {/* Quick Gift Overlay */}
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                    <SendGift recipientId={seat.user_id} recipientName={seat.display_name || "Poet"} eventId={id} />
                  </div>
                </motion.div>
              );
            })}
            
            {/* Empty Seats */}
            {Array.from({ length: Math.max(0, 5 - seats.length) }).map((_, i) => (
              <div key={i} className="aspect-square rounded-3xl border-2 border-dashed border-white/5 flex items-center justify-center text-white/10">
                <UserPlus className="w-8 h-8" />
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="grid lg:grid-cols-[1fr_350px] gap-8">
          <div className="space-y-6">
            <div className="bg-white/5 rounded-3xl p-6 border border-white/10">
              <h3 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-accent" /> Live Reactions
              </h3>
              <div className="flex gap-4">
                {['👏', '🌹', '🔥', '❤️', '✨'].map(emoji => (
                  <button key={emoji} className="w-14 h-14 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95">
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white/5 rounded-3xl border border-white/10 flex flex-col h-[400px] overflow-hidden">
            <div className="p-4 border-b border-white/10 bg-white/5">
              <p className="font-display font-bold text-sm uppercase tracking-widest">Audience Chat</p>
            </div>
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              <p className="text-xs font-body text-white/40 text-center italic">Welcome to the Mushaira! Be respectful.</p>
            </div>
            <div className="p-4 border-t border-white/10">
              <div className="relative">
                <input placeholder="Say something..." className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-primary hover:text-white transition-colors">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoRoomDetail;