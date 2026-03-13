import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import SendGift from "@/components/SendGift";
import {
  Video, Mic, MicOff, Hand, Trophy, Users, Crown,
  UserPlus, UserMinus, Radio, Send, Gift,
} from "lucide-react";

interface Seat {
  id: string;
  user_id: string;
  seat_number: number;
  is_muted: boolean;
  score: number;
  display_name?: string;
}

interface QueueItem {
  id: string;
  user_id: string;
  position: number;
  status: string;
  display_name?: string;
}

const VideoRoomDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [room, setRoom] = useState<any>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  const isHost = room?.host_id === user?.id;
  const isSeated = seats.some((s) => s.user_id === user?.id);
  const isInQueue = queue.some((q) => q.user_id === user?.id);

  useEffect(() => {
    if (id) { fetchRoom(); fetchSeats(); fetchQueue(); }
  }, [id]);

  // Realtime for seats and queue
  useEffect(() => {
    if (!id) return;
    const ch = supabase.channel(`room-${id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "room_seats", filter: `room_id=eq.${id}` }, () => fetchSeats())
      .on("postgres_changes", { event: "*", schema: "public", table: "room_queue", filter: `room_id=eq.${id}` }, () => fetchQueue())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [id]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatMessages]);

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
    } else {
      setSeats([]);
    }
  };

  const fetchQueue = async () => {
    const { data } = await supabase.from("room_queue").select("*").eq("room_id", id!).order("position");
    if (data && data.length > 0) {
      const uids = data.map((q: any) => q.user_id);
      const { data: profiles } = await supabase.from("profiles").select("user_id, display_name").in("user_id", uids);
      const map = new Map(profiles?.map((p) => [p.user_id, p.display_name]) || []);
      setQueue(data.map((q: any) => ({ ...q, display_name: map.get(q.user_id) || "User" })));
    } else {
      setQueue([]);
    }
  };

  const joinQueue = async () => {
    if (!user) { toast.error("Sign in first"); return; }
    const pos = queue.length + 1;
    const { error } = await supabase.from("room_queue").insert({ room_id: id!, user_id: user.id, position: pos });
    if (error) toast.error(error.message);
    else toast.success("Added to queue!");
  };

  const takeSeat = async (userId: string) => {
    const nextSeat = seats.length > 0 ? Math.max(...seats.map((s) => s.seat_number)) + 1 : 1;
    if (nextSeat > (room?.max_seats || 30)) { toast.error("All seats are full"); return; }
    const { error } = await supabase.from("room_seats").insert({ room_id: id!, user_id: userId, seat_number: nextSeat });
    if (error) toast.error(error.message);
    else {
      // Remove from queue
      await supabase.from("room_queue").delete().eq("room_id", id!).eq("user_id", userId);
      toast.success("Seated!");
    }
  };

  const removeSeat = async (userId: string) => {
    await supabase.from("room_seats").delete().eq("room_id", id!).eq("user_id", userId);
    toast.success("Removed from seat");
  };

  const toggleMute = async (seatId: string, currentMuted: boolean) => {
    await supabase.from("room_seats").update({ is_muted: !currentMuted }).eq("id", seatId);
  };

  const updateScore = async (seatId: string, delta: number) => {
    const seat = seats.find((s) => s.id === seatId);
    if (seat) {
      await supabase.from("room_seats").update({ score: Math.max(0, seat.score + delta) }).eq("id", seatId);
    }
  };

  const goLive = async () => {
    await supabase.from("video_mushaira_rooms").update({ status: "live" }).eq("id", id!);
    setRoom((r: any) => ({ ...r, status: "live" }));
    toast.success("Room is now LIVE!");
  };

  const endRoom = async () => {
    await supabase.from("video_mushaira_rooms").update({ status: "ended", ended_at: new Date().toISOString() }).eq("id", id!);
    toast.success("Room ended");
    setRoom((r: any) => ({ ...r, status: "ended" }));
  };

  if (loading || !room) {
    return <div className="min-h-screen bg-background"><Navbar /><div className="pt-24 flex justify-center"><p className="font-body text-muted-foreground">{loading ? "Loading..." : "Room not found"}</p></div></div>;
  }

  const sortedSeats = room.competition_mode ? [...seats].sort((a, b) => b.score - a.score) : seats;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      {/* Hero */}
      <div className="h-40 bg-gradient-hero relative flex items-end">
        <div className="container mx-auto px-6 pb-4 relative z-10">
          <div className="flex items-center gap-3">
            {room.status === "live" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-body font-semibold bg-red-500 text-white rounded-full">
                <Radio className="w-3 h-3" /> ● LIVE
              </span>
            )}
            {room.competition_mode && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-body font-semibold bg-secondary/20 text-secondary rounded-full">
                <Trophy className="w-3 h-3" /> Competition
              </span>
            )}
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-primary-foreground mt-1">{room.title}</h1>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6 max-w-6xl">
        <div className="grid lg:grid-cols-[1fr_320px] gap-6">
          {/* Main area */}
          <div>
            {/* Host controls */}
            {isHost && room.status !== "ended" && (
              <div className="bg-card rounded-2xl border border-border p-4 mb-4 flex items-center gap-3">
                <Crown className="w-5 h-5 text-secondary" />
                <span className="font-body text-sm font-semibold text-foreground">Host Controls</span>
                <div className="ml-auto flex gap-2">
                  {room.status === "waiting" && (
                    <button onClick={goLive} className="px-4 py-1.5 bg-red-500 text-white font-body text-sm font-semibold rounded-lg hover:opacity-90">
                      Go Live
                    </button>
                  )}
                  <button onClick={endRoom} className="px-4 py-1.5 bg-muted text-foreground font-body text-sm rounded-lg hover:bg-muted/80">
                    End Room
                  </button>
                </div>
              </div>
            )}

            {/* Poet seats grid */}
            <div className="bg-card rounded-2xl border border-border p-6 mb-4">
              <h2 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <Video className="w-5 h-5 text-primary" />
                Poet Seats ({seats.length}/{room.max_seats})
                {room.competition_mode && <span className="text-xs font-body text-muted-foreground ml-2">Ranked by score</span>}
              </h2>

              {seats.length === 0 ? (
                <p className="font-body text-sm text-muted-foreground text-center py-8">No poets seated yet.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {sortedSeats.map((seat, i) => (
                    <motion.div key={seat.id} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: i * 0.05 }}
                      className="bg-background rounded-xl border border-border p-3 text-center relative">
                      {room.competition_mode && i < 3 && (
                        <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gradient-gold flex items-center justify-center text-xs font-bold text-foreground shadow-gold">
                          {i + 1}
                        </span>
                      )}
                      <div className={`w-12 h-12 mx-auto rounded-full ${seat.is_muted ? "bg-muted" : "bg-primary"} flex items-center justify-center mb-2`}>
                        <span className="font-display text-lg font-bold text-primary-foreground">
                          {(seat.display_name || "?")[0].toUpperCase()}
                        </span>
                      </div>
                      <p className="font-body text-xs font-medium text-foreground truncate">{seat.display_name}</p>
                      {seat.is_muted && <MicOff className="w-3 h-3 text-destructive mx-auto mt-1" />}
                      {room.competition_mode && (
                        <p className="font-body text-xs text-secondary font-bold mt-1">{seat.score} pts</p>
                      )}

                      {/* Host actions */}
                      {isHost && (
                        <div className="flex justify-center gap-1 mt-2">
                          <button onClick={() => toggleMute(seat.id, seat.is_muted)} className="p-1 rounded bg-muted hover:bg-muted/70">
                            {seat.is_muted ? <Mic className="w-3 h-3 text-foreground" /> : <MicOff className="w-3 h-3 text-destructive" />}
                          </button>
                          <button onClick={() => removeSeat(seat.user_id)} className="p-1 rounded bg-muted hover:bg-muted/70">
                            <UserMinus className="w-3 h-3 text-destructive" />
                          </button>
                          {room.competition_mode && (
                            <>
                              <button onClick={() => updateScore(seat.id, 1)} className="p-1 rounded bg-muted hover:bg-muted/70 text-xs font-bold text-foreground">+1</button>
                              <button onClick={() => updateScore(seat.id, -1)} className="p-1 rounded bg-muted hover:bg-muted/70 text-xs font-bold text-foreground">-1</button>
                            </>
                          )}
                        </div>
                      )}

                      {/* Send gift to seated poet */}
                      {user && user.id !== seat.user_id && (
                        <div className="mt-2">
                          <SendGift recipientId={seat.user_id} recipientName={seat.display_name || "poet"} eventId={id} />
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Join as poet */}
              {user && !isSeated && !isInQueue && room.status !== "ended" && (
                <div className="mt-4 flex gap-2">
                  {seats.length < room.max_seats ? (
                    <button onClick={() => takeSeat(user.id)} className="px-4 py-2 bg-primary text-primary-foreground font-body text-sm font-semibold rounded-lg hover:opacity-90 flex items-center gap-2">
                      <Video className="w-4 h-4" /> Take a Seat
                    </button>
                  ) : (
                    <button onClick={joinQueue} className="px-4 py-2 bg-secondary/20 text-secondary font-body text-sm font-semibold rounded-lg hover:bg-secondary/30 flex items-center gap-2">
                      <Hand className="w-4 h-4" /> Join Queue
                    </button>
                  )}
                </div>
              )}
              {isInQueue && <p className="font-body text-sm text-secondary mt-3">✋ You're in the queue</p>}
              {isSeated && (
                <button onClick={() => removeSeat(user!.id)} className="mt-3 px-4 py-2 border border-border text-foreground font-body text-sm rounded-lg hover:bg-muted">
                  Leave Seat
                </button>
              )}
            </div>

            {/* Queue */}
            {queue.length > 0 && (
              <div className="bg-card rounded-2xl border border-border p-6">
                <h3 className="font-display text-base font-bold text-foreground mb-3 flex items-center gap-2">
                  <Hand className="w-4 h-4 text-secondary" /> Queue ({queue.length})
                </h3>
                <div className="space-y-2">
                  {queue.map((q) => (
                    <div key={q.id} className="flex items-center justify-between p-2 bg-background rounded-lg border border-border">
                      <span className="font-body text-sm text-foreground">{q.display_name}</span>
                      {isHost && (
                        <button onClick={() => takeSeat(q.user_id)} className="px-3 py-1 bg-primary text-primary-foreground font-body text-xs font-semibold rounded-lg">
                          <UserPlus className="w-3 h-3 inline mr-1" /> Invite to Seat
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar: Scoreboard (competition) or Info */}
          <div className="space-y-4">
            {room.competition_mode && seats.length > 0 && (
              <div className="bg-card rounded-2xl border border-border p-4">
                <h3 className="font-display text-base font-bold text-foreground mb-3 flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-secondary" /> Live Scoreboard
                </h3>
                <div className="space-y-2">
                  {sortedSeats.map((seat, i) => (
                    <div key={seat.id} className={`flex items-center justify-between p-2 rounded-lg ${i === 0 ? "bg-gradient-gold shadow-gold" : "bg-background border border-border"}`}>
                      <div className="flex items-center gap-2">
                        <span className="font-display text-sm font-bold text-foreground w-5">{i + 1}</span>
                        <span className="font-body text-sm text-foreground">{seat.display_name}</span>
                      </div>
                      <span className="font-display text-sm font-bold text-foreground">{seat.score}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-card rounded-2xl border border-border p-4">
              <h3 className="font-display text-base font-bold text-foreground mb-2">Room Info</h3>
              {room.description && <p className="font-body text-sm text-muted-foreground mb-3">{room.description}</p>}
              <div className="space-y-2 font-body text-sm text-muted-foreground">
                <p className="flex items-center gap-2"><Video className="w-3.5 h-3.5" /> {seats.length}/{room.max_seats} poet seats</p>
                <p className="flex items-center gap-2"><Users className="w-3.5 h-3.5" /> {room.audience_count} audience</p>
                <p className="flex items-center gap-2"><Gift className="w-3.5 h-3.5" /> 65% gifts to poets / 35% platform</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoRoomDetail;
