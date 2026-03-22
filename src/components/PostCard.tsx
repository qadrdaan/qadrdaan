"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Share2, Bookmark, BookmarkPlus, Trash2, Sparkles } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import SendGift from './SendGift';
import ReportContent from './ReportContent';

interface PostCardProps {
  post: any;
  onUpdate?: () => void;
  showDelete?: boolean;
}

const PostCard = ({ post, onUpdate, showDelete }: PostCardProps) => {
  const { user } = useAuth();

  const handleLike = async () => {
    if (!user) { toast.error("Sign in to like"); return; }
    if (post.is_liked) {
      await supabase.from("post_likes").delete().eq("post_id", post.id).eq("user_id", user.id);
    } else {
      await supabase.from("post_likes").insert({ post_id: post.id, user_id: user.id });
    }
    onUpdate?.();
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    const { error } = await supabase.from("poetry_posts").delete().eq("id", post.id);
    if (error) toast.error("Failed to delete post");
    else {
      toast.success("Post deleted");
      onUpdate?.();
    }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-center gap-3 mb-4">
        <Link to={`/poet/${post.creator_id}`} className="w-10 h-10 rounded-full bg-gradient-brand flex items-center justify-center text-sm font-bold text-white font-display shrink-0">
          {(post.creator_name || "?")[0].toUpperCase()}
        </Link>
        <div className="flex-1 min-w-0">
          <Link to={`/poet/${post.creator_id}`} className="font-body text-sm font-bold text-foreground hover:text-primary transition-colors truncate block">
            {post.creator_name}
          </Link>
          <p className="font-body text-[10px] text-muted-foreground uppercase tracking-wider">
            {new Date(post.created_at).toLocaleDateString()} · {post.category} {post.language ? `· ${post.language}` : ""}
          </p>
        </div>
        {post.is_editor_pick && (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/20 text-accent text-[10px] font-bold uppercase">
            <Sparkles className="w-3 h-3" /> Pick
          </span>
        )}
        {showDelete && user?.id === post.creator_id && (
          <button onClick={handleDelete} className="p-2 text-muted-foreground hover:text-destructive transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      <Link to={`/post/${post.id}`} className="block group">
        <h2 className="font-display text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">{post.title}</h2>
        <p className="font-body text-foreground/85 whitespace-pre-line leading-relaxed mb-5 line-clamp-6">{post.content}</p>
      </Link>

      <div className="flex items-center gap-4 pt-4 border-t border-border">
        <button onClick={handleLike} className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${post.is_liked ? "text-secondary" : "text-muted-foreground hover:text-secondary"}`}>
          <Heart className={`w-4 h-4 ${post.is_liked ? "fill-current" : ""}`} /> {post.likes_count}
        </button>
        <Link to={`/post/${post.id}`} className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-primary transition-colors">
          <MessageCircle className="w-4 h-4" /> {post.comments_count}
        </Link>
        <button className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-accent transition-colors">
          <Share2 className="w-4 h-4" /> {post.shares_count || 0}
        </button>
        
        <div className="ml-auto flex items-center gap-2">
          <ReportContent contentType="post" contentId={post.id} reportedUserId={post.creator_id} />
          <SendGift recipientId={post.creator_id} recipientName={post.creator_name || "Poet"} />
        </div>
      </div>
    </motion.article>
  );
};

export default PostCard;