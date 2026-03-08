import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { Upload, Video, Image } from "lucide-react";

const CATEGORIES = [
  { value: "recitation", label: "Poetry Recitation" },
  { value: "lecture", label: "Lecture" },
  { value: "mushaira", label: "Mushaira Performance" },
  { value: "interview", label: "Interview" },
  { value: "discussion", label: "Literary Discussion" },
  { value: "other", label: "Other" },
];
const LANGUAGES = ["Urdu", "Hindi", "Punjabi", "English", "Arabic", "Persian", "Other"];

const UploadVideo = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbFile, setThumbFile] = useState<File | null>(null);
  const [thumbPreview, setThumbPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [form, setForm] = useState({
    title: "",
    description: "",
    language: "",
    category: "recitation",
  });

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [loading, user, navigate]);

  useEffect(() => {
    if (thumbFile) {
      const url = URL.createObjectURL(thumbFile);
      setThumbPreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [thumbFile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !videoFile) {
      toast.error("Please select a video file");
      return;
    }

    if (videoFile.size > 500 * 1024 * 1024) {
      toast.error("Video must be under 500MB");
      return;
    }

    setSubmitting(true);
    setUploadProgress(10);

    try {
      const ext = videoFile.name.split(".").pop()?.toLowerCase();
      const videoPath = `${user.id}/${crypto.randomUUID()}.${ext}`;

      setUploadProgress(20);
      const { error: videoErr } = await supabase.storage
        .from("videos")
        .upload(videoPath, videoFile);
      if (videoErr) throw videoErr;

      setUploadProgress(70);

      const { data: videoPublicUrl } = supabase.storage
        .from("videos")
        .getPublicUrl(videoPath);

      let thumbnailUrl: string | null = null;
      if (thumbFile) {
        const thumbExt = thumbFile.name.split(".").pop()?.toLowerCase();
        const thumbPath = `${user.id}/${crypto.randomUUID()}.${thumbExt}`;
        const { error: thumbErr } = await supabase.storage
          .from("video-thumbnails")
          .upload(thumbPath, thumbFile);
        if (thumbErr) throw thumbErr;

        const { data: thumbPublicUrl } = supabase.storage
          .from("video-thumbnails")
          .getPublicUrl(thumbPath);
        thumbnailUrl = thumbPublicUrl.publicUrl;
      }

      setUploadProgress(90);

      const { error: insertErr } = await supabase.from("videos").insert({
        creator_id: user.id,
        title: form.title,
        description: form.description || null,
        language: form.language || null,
        category: form.category || null,
        video_url: videoPublicUrl.publicUrl,
        thumbnail_url: thumbnailUrl,
      });
      if (insertErr) throw insertErr;

      setUploadProgress(100);
      toast.success("Video published!");
      navigate("/videos");
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    }
    setSubmitting(false);
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 container mx-auto px-6 max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">Upload Video</h1>
          <p className="font-body text-muted-foreground mb-8">
            Share your poetry recitations, mushaira performances, and literary content.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Thumbnail */}
            <div>
              <label className="block font-body text-sm font-medium text-foreground mb-2">Thumbnail</label>
              <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-secondary transition-colors bg-card overflow-hidden">
                {thumbPreview ? (
                  <img src={thumbPreview} alt="Thumbnail" className="h-full object-contain" />
                ) : (
                  <div className="flex flex-col items-center text-muted-foreground">
                    <Image className="w-8 h-8 mb-2" />
                    <span className="font-body text-sm">Upload thumbnail image</span>
                  </div>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={(e) => setThumbFile(e.target.files?.[0] || null)} />
              </label>
            </div>

            {/* Title */}
            <div>
              <label className="block font-body text-sm font-medium text-foreground mb-1.5">Title *</label>
              <input
                type="text"
                required
                maxLength={200}
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground font-body focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Enter video title"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block font-body text-sm font-medium text-foreground mb-1.5">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground font-body focus:outline-none focus:ring-2 focus:ring-ring"
                rows={3}
                maxLength={2000}
                placeholder="Describe your video..."
              />
            </div>

            {/* Language & Category */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-body text-sm font-medium text-foreground mb-1.5">Language</label>
                <select
                  value={form.language}
                  onChange={(e) => setForm({ ...form, language: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground font-body focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Select</option>
                  {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="block font-body text-sm font-medium text-foreground mb-1.5">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground font-body focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
            </div>

            {/* Video file */}
            <div>
              <label className="block font-body text-sm font-medium text-foreground mb-2">Video File *</label>
              <label className="flex items-center gap-3 px-4 py-3 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-secondary transition-colors bg-card">
                <Upload className="w-5 h-5 text-muted-foreground" />
                <span className="font-body text-sm text-muted-foreground">
                  {videoFile ? `${videoFile.name} (${(videoFile.size / 1024 / 1024).toFixed(1)}MB)` : "Select video file (max 500MB)"}
                </span>
                <input
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                />
              </label>
            </div>

            {/* Progress */}
            {submitting && (
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-gold transition-all duration-500"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 font-body font-semibold bg-gradient-gold rounded-lg text-primary shadow-gold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Video className="w-5 h-5" />
              {submitting ? `Uploading... ${uploadProgress}%` : "Publish Video"}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default UploadVideo;
