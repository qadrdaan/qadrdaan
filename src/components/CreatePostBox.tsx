"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Image as ImageIcon, Video, Mic, Send, Loader2, X, Upload, Tag } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface CreatePostBoxProps {
  onPostCreated: () => void;
}

const CreatePostBox = ({ onPostCreated }: CreatePostBoxProps) => {
  const { user, profile } = useAuth();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [thumbFile, setThumbFile] = useState<File | null>(null);
  const [thumbPreview, setThumbPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [showVideoSection, setShowVideoSection] = useState(false);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const thumbInputRef = useRef<HTMLInputElement>(null);

  const totalTagChars = tags.join(",").length;

  useEffect(() => {
    if (videoFile) {
      const url = URL.createObjectURL(videoFile);
      setVideoPreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [videoFile]);

  useEffect(() => {
    if (thumbFile) {
      const url = URL.createObjectURL(thumbFile);
      setThumbPreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [thumbFile]);

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().replace(/^#/, '');
      if (newTag && !tags.includes(newTag) && (totalTagChars + newTag.length + 1) <= 500) {
        setTags([...tags, newTag]);
      }
      setTagInput("");
    }
  };

  const removeTag = (idx: number) => {
    setTags(tags.filter((_, i) => i !== idx));
  };

  const handlePost = async () => {
    if (!content.trim() && !videoFile) return;
    setLoading(true);
    setUploadProgress(5);

    try {
      let videoUrl: string | null = null;
      let thumbnailUrl: string | null = null;

      if (videoFile) {
        setUploadProgress(15);
        const ext = videoFile.name.split('.').pop()?.toLowerCase();
        const videoPath = `${user?.id}/${crypto.randomUUID()}.${ext}`;
        const { error: vErr } = await supabase.storage.from("videos").upload(videoPath, videoFile);
        if (vErr) throw vErr;
        setUploadProgress(60);
        const { data: vUrl } = supabase.storage.from("videos").getPublicUrl(videoPath);
        videoUrl = vUrl.publicUrl;

        if (thumbFile) {
          const tExt = thumbFile.name.split('.').pop()?.toLowerCase();
          const tPath = `${user?.id}/${crypto.randomUUID()}.${tExt}`;
          const { error: tErr } = await supabase.storage.from("video-thumbnails").upload(tPath, thumbFile);
          if (tErr) throw tErr;
          const { data: tUrl } = supabase.storage.from("video-thumbnails").getPublicUrl(tPath);
          thumbnailUrl = tUrl.publicUrl;
        }
        setUploadProgress(80);
      }

      if (videoFile && videoUrl) {
        // Insert as video
        const { error } = await supabase.from("videos").insert({
          creator_id: user?.id,
          title: content.split('\n')[0].substring(0, 100) || "Untitled Video",
          description: content.trim() || null,
          video_url: videoUrl,
          thumbnail_url: thumbnailUrl,
          category: "recitation",
          language: profile?.language || "Urdu",
        });
        if (error) throw error;
      } else {
        // Insert as post
        const { error } = await supabase.from("poetry_posts").insert({
          creator_id: user?.id,
          content: content.trim(),
          title: content.split('\n')[0].substring(0, 50) || "Untitled Post",
          category: "quote",
          language: profile?.language || "Urdu"
        });
        if (error) throw error;
      }

      setUploadProgress(100);
      toast.success(videoFile ? "Video published!" : "Posted to your wall!");
      setContent("");
      setVideoFile(null);
      setVideoPreview(null);
      setThumbFile(null);
      setThumbPreview(null);
      setTags([]);
      setShowVideoSection(false);
      setUploadProgress(0);
      onPostCreated();
    } catch (err: any) {
      toast.error(err.message || "Failed to post");
    }
    setLoading(false);
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-4 mb-6 shadow-sm">
      <div className="flex gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-brand flex items-center justify-center shrink-0">
          <span className="font-display text-sm font-bold text-white">
            {(profile?.display_name || "?")[0].toUpperCase()}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={`What's on your mind, ${profile?.display_name?.split(' ')[0] || 'poet'}?`}
            className="w-full bg-muted/50 border-none rounded-xl p-3 text-sm font-body focus:ring-2 focus:ring-primary/20 resize-none min-h-[70px]"
          />
        </div>

        {/* Video Preview (right side) */}
        {videoPreview && (
          <div className="relative w-32 h-24 rounded-xl overflow-hidden border border-border shrink-0 hidden sm:block">
            <video src={videoPreview} className="w-full h-full object-cover" muted />
            <button
              onClick={() => { setVideoFile(null); setVideoPreview(null); }}
              className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center"
            >
              <X className="w-3 h-3 text-white" />
            </button>
          </div>
        )}
      </div>

      {/* Video & Thumbnail section */}
      {showVideoSection && (
        <div className="mt-3 p-3 bg-muted/30 rounded-xl border border-border space-y-3">
          <div className="flex gap-3">
            {/* Video upload */}
            <button
              onClick={() => videoInputRef.current?.click()}
              className="flex-1 flex items-center justify-center gap-2 py-3 border-2 border-dashed border-border rounded-xl hover:border-primary/40 transition-colors text-sm font-body text-muted-foreground"
            >
              <Upload className="w-4 h-4" />
              {videoFile ? videoFile.name.substring(0, 20) + '...' : "Select Video"}
            </button>
            <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={(e) => setVideoFile(e.target.files?.[0] || null)} />

            {/* Thumbnail upload */}
            <div className="relative">
              <button
                onClick={() => thumbInputRef.current?.click()}
                className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-border rounded-xl hover:border-secondary/40 transition-colors text-sm font-body text-muted-foreground"
              >
                {thumbPreview ? (
                  <img src={thumbPreview} alt="Thumb" className="w-10 h-10 object-cover rounded" />
                ) : (
                  <><ImageIcon className="w-4 h-4" /> Thumbnail</>
                )}
              </button>
              <input ref={thumbInputRef} type="file" accept="image/jpeg,image/png" className="hidden" onChange={(e) => setThumbFile(e.target.files?.[0] || null)} />
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground font-body">
            Thumbnail: Long videos 1280×720 (16:9) · Shorts 1080×1920 (9:16) · JPG/PNG
          </p>
        </div>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3 px-1">
          {tags.map((tag, i) => (
            <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary rounded-full text-xs font-body font-medium">
              #{tag}
              <button onClick={() => removeTag(i)} className="hover:text-destructive">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Tag input */}
      <div className="mt-2 px-1">
        <div className="flex items-center gap-2">
          <Tag className="w-3.5 h-3.5 text-muted-foreground" />
          <input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            placeholder="Add tags (press Enter)"
            className="flex-1 bg-transparent border-none text-xs font-body text-foreground placeholder:text-muted-foreground focus:outline-none"
            maxLength={50}
          />
          <span className="text-[10px] text-muted-foreground font-body">{totalTagChars}/500</span>
        </div>
      </div>

      {/* Upload progress */}
      {loading && uploadProgress > 0 && (
        <div className="mt-3">
          <Progress value={uploadProgress} className="h-1.5" />
          <p className="text-[10px] text-muted-foreground font-body mt-1">
            {uploadProgress < 60 ? "Uploading..." : uploadProgress < 100 ? "Processing..." : "Done!"}
          </p>
        </div>
      )}

      <div className="flex items-center justify-between pt-3 mt-3 border-t border-border">
        <div className="flex gap-1">
          <button className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-primary flex items-center gap-1.5 text-xs font-bold">
            <ImageIcon className="w-4 h-4 text-green-500" /> Photo
          </button>
          <button
            onClick={() => setShowVideoSection(!showVideoSection)}
            className={`p-2 hover:bg-muted rounded-lg transition-colors flex items-center gap-1.5 text-xs font-bold ${showVideoSection ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-primary'}`}
          >
            <Video className="w-4 h-4 text-secondary" /> Video
          </button>
          <button className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-primary flex items-center gap-1.5 text-xs font-bold">
            <Mic className="w-4 h-4 text-accent" /> Mushaira
          </button>
        </div>

        <button
          onClick={handlePost}
          disabled={loading || (!content.trim() && !videoFile)}
          className="px-5 py-2 bg-primary text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2"
        >
          {loading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Posting...</> : <><Send className="w-3.5 h-3.5" /> Post</>}
        </button>
      </div>
    </div>
  );
};

export default CreatePostBox;
