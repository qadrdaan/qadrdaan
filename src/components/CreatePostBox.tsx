"use client";

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { PenLine, Image as ImageIcon, Video, Mic, Send } from 'lucide-react';

interface CreatePostBoxProps {
  onPostCreated: () => void;
}

const CreatePostBox = ({ onPostCreated }: CreatePostBoxProps) => {
  const { user, profile } = useAuth();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePost = async () => {
    if (!content.trim()) return;
    setLoading(true);
    
    const { error } = await supabase.from("poetry_posts").insert({
      creator_id: user?.id,
      content: content.trim(),
      title: content.split('\n')[0].substring(0, 50) || "Untitled Post",
      category: "quote",
      language: profile?.language || "Urdu"
    });

    if (error) {
      toast.error("Failed to post");
    } else {
      toast.success("Posted to your wall!");
      setContent("");
      onPostCreated();
    }
    setLoading(false);
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-4 mb-6 shadow-sm">
      <div className="flex gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-gradient-brand flex items-center justify-center shrink-0">
          <span className="font-display text-sm font-bold text-white">
            {(profile?.display_name || "?")[0].toUpperCase()}
          </span>
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={`What's on your mind, ${profile?.display_name?.split(' ')[0] || 'poet'}?`}
          className="w-full bg-muted/50 border-none rounded-xl p-3 text-sm font-body focus:ring-2 focus:ring-primary/20 resize-none min-h-[80px]"
        />
      </div>
      
      <div className="flex items-center justify-between pt-3 border-t border-border">
        <div className="flex gap-1">
          <button className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-primary flex items-center gap-2 text-xs font-bold">
            <ImageIcon className="w-4 h-4 text-green-500" /> Photo
          </button>
          <button className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-primary flex items-center gap-2 text-xs font-bold">
            <Video className="w-4 h-4 text-secondary" /> Video
          </button>
          <button className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-primary flex items-center gap-2 text-xs font-bold">
            <Mic className="w-4 h-4 text-accent" /> Mushaira
          </button>
        </div>
        
        <button
          onClick={handlePost}
          disabled={loading || !content.trim()}
          className="px-6 py-2 bg-primary text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2"
        >
          {loading ? "Posting..." : <><Send className="w-3.5 h-3.5" /> Post</>}
        </button>
      </div>
    </div>
  );
};

export default CreatePostBox;