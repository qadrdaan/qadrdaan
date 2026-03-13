import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Video, Users, Plus, Trophy, Radio } from "lucide-react";

interface Room {
  id: string;
  host_id: string;
  title: string;
  description: string | null;
  status: string;
  max_seats: number;
  competition_mode: boolean;
  audience_count: number;
  created_at: string;
  host_name?: string;
  seat_count?: number;
}

const VideoRooms = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", competition_mode: false, max_seats: 30 });

  useEffect(() => { fetchRooms(); }, []);

  const fetchRooms = async () => {
    const { data } = await supabase.from("video_mushaira_rooms").select("*")
      .in("status", ["waiting", "live"]).order("created_at", { ascending: false });
    if (data && data.length > 0) {
      const hostIds = [...new Set(data.map((r: any) => r.host_id))];
      const { data: profiles } = await supabase.from("profiles").select("user_id, display_name").in("user_id", hostIds);
      const map = new Map(profiles?.map((p) => [p.user_id, p.display_name]) || []);

      // Get seat counts
      const roomIds = data.map((r: any) => r.id);
      const { data: seats } = await supabase.from("room_seats").select("room_id").in("room_id", roomIds);
      const seatCounts = new Map<string, number>();
      seats?.forEach((s: any) => seatCounts.set(s.room_id, (seatCounts.get(s.room_id) || 0) + 1));

      setRooms(data.map((r: any) => ({
        ...r,
        host_name: map.get(r.host_id) || "Host",
        seat_count: seatCounts.get(r.id) || 0,
      })));
    }
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!user) { toast.error("Please sign in"); return; }
    if (!form.title.trim()) { toast.error("Title required"); return; }
    setCreating(true);
    const { data, error } = await supabase.from("video_mushaira_rooms").insert({
      host_id: user.id,
      title: form.title.trim(),
      description: form.description.trim() || null,
      competition_mode: form.competition_mode,
      max_seats: Math.min(Math.max(form.max_seats, 2), 30),
    }).select("id").single();
    if (error) toast.error(error.message);
    else { toast.success("Room created!"); navigate(`/video-room/${data.id}`); }
    setCreating(false);
  };

  const statusColors: Record<string, string> = {
    live: "bg-red-500 text-white",
    waiting: "bg-secondary/20 text-secondary",
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="h-48 bg-gradient-hero relative flex items-end">
        <div className="container mx-auto px-6 pb-6 relative z-10">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground flex items-center gap-3">
            <Video className="w-8 h-8" /> Video Mushaira Rooms
          </h1>
          <p className="font-body text-primary-foreground/80 mt-1">Live poetry rooms with up to 30 poets and unlimited audience</p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-5xl">
        {/* Create Room Button */}
        {user && (
          <div className="mb-8">
            {!showForm ? (
              <button onClick={() => setShowForm(true)} className="px-5 py-2.5 bg-primary text-primary-foreground font-body font-semibold text-sm rounded-lg flex items-center gap-2 hover:opacity-90">
                <Plus className="w-4 h-4" /> Create Room
              </button>
            ) : (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl border border-border p-6">
                <h2 className="font-display text-lg font-bold text-foreground mb-4">New Video Mushaira Room</h2>
                <div className="space-y-3 max-w-md">
                  <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Room title"
                    className="w-full px-4 py-2.5 rounded-lg bg-background border border-border text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description (optional)" rows={3}
                    className="w-full px-4 py-2.5 rounded-lg bg-background border border-border text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                  <div className="flex items-center gap-4">
                    <label className="font-body text-sm text-foreground flex items-center gap-2">
                      <input type="checkbox" checked={form.competition_mode} onChange={(e) => setForm({ ...form, competition_mode: e.target.checked })} className="rounded" />
                      <Trophy className="w-3.5 h-3.5 text-secondary" /> Competition Mode
                    </label>
                    <div>
                      <label className="font-body text-xs text-muted-foreground">Max seats</label>
                      <input type="number" min={2} max={30} value={form.max_seats} onChange={(e) => setForm({ ...form, max_seats: parseInt(e.target.value) || 30 })}
                        className="w-16 ml-2 px-2 py-1 rounded-lg bg-background border border-border text-foreground font-body text-sm focus:outline-none" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleCreate} disabled={creating} className="px-6 py-2.5 bg-primary text-primary-foreground font-body font-semibold text-sm rounded-lg hover:opacity-90 disabled:opacity-50">
                      {creating ? "Creating..." : "Create & Enter"}
                    </button>
                    <button onClick={() => setShowForm(false)} className="px-4 py-2.5 border border-border text-foreground font-body text-sm rounded-lg hover:bg-muted">Cancel</button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* Room List */}
        {loading ? (
          <p className="font-body text-muted-foreground text-center py-12">Loading rooms...</p>
        ) : rooms.length === 0 ? (
          <p className="font-body text-muted-foreground text-center py-12">No active rooms. Create one to start!</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {rooms.map((room, i) => (
              <motion.div key={room.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Link to={`/video-room/${room.id}`} className="block bg-card rounded-2xl border border-border p-5 hover:shadow-blue transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-body font-semibold rounded-full ${statusColors[room.status] || "bg-muted text-muted-foreground"}`}>
                      {room.status === "live" ? <Radio className="w-3 h-3" /> : null}
                      {room.status === "live" ? "● LIVE" : "Waiting"}
                    </span>
                    {room.competition_mode && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-body font-semibold bg-secondary/20 text-secondary rounded-full">
                        <Trophy className="w-3 h-3" /> Competition
                      </span>
                    )}
                  </div>
                  <h3 className="font-display text-base font-bold text-foreground mb-1 truncate">{room.title}</h3>
                  <p className="font-body text-xs text-muted-foreground mb-3">Hosted by {room.host_name}</p>
                  <div className="flex items-center gap-4 font-body text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Video className="w-3 h-3" /> {room.seat_count}/{room.max_seats} poets</span>
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {room.audience_count} watching</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default VideoRooms;
