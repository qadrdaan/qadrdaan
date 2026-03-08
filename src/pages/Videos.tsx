import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Video, Eye, Heart, User } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type VideoRow = Tables<"videos"> & { creator_name?: string };

const CATEGORIES = [
  { value: "", label: "All Categories" },
  { value: "recitation", label: "Recitation" },
  { value: "lecture", label: "Lecture" },
  { value: "mushaira", label: "Mushaira" },
  { value: "interview", label: "Interview" },
  { value: "discussion", label: "Discussion" },
];

const Videos = () => {
  const [videos, setVideos] = useState<VideoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ language: "", category: "" });

  useEffect(() => {
    fetchVideos();
  }, [filter]);

  const fetchVideos = async () => {
    setLoading(true);
    let query = supabase
      .from("videos")
      .select("*")
      .order("created_at", { ascending: false });

    if (filter.language) query = query.eq("language", filter.language);
    if (filter.category) query = query.eq("category", filter.category);

    const { data } = await query;

    if (data && data.length > 0) {
      const creatorIds = [...new Set(data.map((v) => v.creator_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name")
        .in("user_id", creatorIds);
      const map = new Map(profiles?.map((p) => [p.user_id, p.display_name]) || []);
      setVideos(data.map((v) => ({ ...v, creator_name: map.get(v.creator_id) || "Unknown" })));
    } else {
      setVideos([]);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 container mx-auto px-6">
        <motion.div className="text-center mb-10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-3">
            Poetry <span className="text-gradient-gold">Videos</span>
          </h1>
          <p className="font-body text-muted-foreground max-w-lg mx-auto mb-6">
            Watch poetry recitations, mushaira performances, and literary discussions.
          </p>
          <Link
            to="/upload-video"
            className="inline-block px-6 py-2.5 font-body font-semibold text-sm bg-gradient-gold rounded-lg text-primary shadow-gold hover:opacity-90 transition-opacity"
          >
            Upload Video
          </Link>
        </motion.div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-8 justify-center">
          <select
            value={filter.language}
            onChange={(e) => setFilter({ ...filter, language: e.target.value })}
            className="px-4 py-2 rounded-lg bg-card border border-border text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">All Languages</option>
            {["Urdu", "Hindi", "Punjabi", "English", "Arabic", "Persian"].map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
          <select
            value={filter.category}
            onChange={(e) => setFilter({ ...filter, category: e.target.value })}
            className="px-4 py-2 rounded-lg bg-card border border-border text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>

        {loading ? (
          <p className="text-center font-body text-muted-foreground">Loading videos...</p>
        ) : videos.length === 0 ? (
          <div className="text-center py-16">
            <Video className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="font-body text-muted-foreground">No videos found yet.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video, i) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  to={`/video/${video.id}`}
                  className="group block bg-card rounded-2xl border border-border hover:border-secondary/30 hover:shadow-gold transition-all overflow-hidden"
                >
                  {/* Thumbnail */}
                  <div className="aspect-video bg-muted flex items-center justify-center overflow-hidden relative">
                    {video.thumbnail_url ? (
                      <img src={video.thumbnail_url} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <Video className="w-10 h-10 text-muted-foreground/30" />
                    )}
                    <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-primary/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-l-[14px] border-l-primary-foreground ml-1" />
                      </div>
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="font-display text-base font-semibold text-foreground line-clamp-2 mb-1">
                      {video.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-sm font-body text-muted-foreground mb-2">
                      <User className="w-3.5 h-3.5" />
                      <span>{video.creator_name}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-body text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {video.views_count}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        {video.likes_count}
                      </span>
                      {video.category && (
                        <span className="px-2 py-0.5 bg-muted rounded-full capitalize">{video.category}</span>
                      )}
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

export default Videos;
