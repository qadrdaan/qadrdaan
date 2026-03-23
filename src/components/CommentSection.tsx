import React, { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useModeration } from "@/hooks/useModeration";
import { toast } from "sonner";
import { Send, Loader2 } from "lucide-react";

interface CommentSectionProps {
  contentId: string;
  contentType: 'post' | 'video';
  onCommentAdded?: () => void;
}

const CommentSection = ({ contentId, contentType, onCommentAdded }: CommentSectionProps) => {
  const { user } = useAuth();
  const { checkContent, moderating } = useModeration();
  const [comments, setComments] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);

  const table = contentType === 'post' ? 'post_comments' : 'video_comments';
  const foreignKey = contentType === 'post' ? 'post_id' : 'video_id';

  const fetchComments = async () => {
    const { data } = await supabase
      .from(table as any)
      .select("*, profiles:user_id(display_name)")
      .eq(foreignKey, contentId)
      .order("created_at", { ascending: false });
    setComments(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchComments(); }, [contentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !input.trim()) return;

    const isAllowed = await checkContent(input, "comment");
    if (!isAllowed) return;

    const { error } = await supabase.from(table as any).insert({
      [foreignKey]: contentId,
      user_id: user.id,
      content: input.trim()
    } as any);

    if (!error) {
      setInput("");
      fetchComments();
      onCommentAdded?.();
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 bg-muted/50 border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <button disabled={moderating || !input.trim()} className="p-2 bg-primary text-white rounded-xl disabled:opacity-50">
          {moderating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </form>

      <div className="space-y-4">
        {comments.map((c) => (
          <div key={c.id} className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-brand flex items-center justify-center text-[10px] font-bold text-white shrink-0">
              {(c.profiles?.display_name || "?")[0].toUpperCase()}
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">{c.profiles?.display_name}</p>
              <p className="text-sm text-foreground/80">{c.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommentSection;