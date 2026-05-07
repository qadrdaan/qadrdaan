"use client";

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageCircle, Share2, Sparkles, Rocket, Eye, TrendingUp, BarChart3 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import SendGift from './SendGift';
import ReportContent from './ReportContent';
import PostContextMenu from './PostContextMenu';
import ReactionPicker, { ReactionType } from './ReactionPicker';

interface PostCardProps {
  post: any;
  onUpdate?: () => void;
  showDelete?: boolean;
}

const PostCard = ({ post, onUpdate, showDelete }: PostCardProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleReact = async (type: ReactionType | null) => {
    if (!user) { toast.error("Sign in to react"); return; }
    if (type === null) {
      await supabase.from("post_likes").delete().eq("post_id", post.id).eq("user_id", user.id);
    } else {
      await supabase.from("post_likes").upsert(
        { post_id: post.id, user_id: user.id, reaction_type: type } as any,
        { onConflict: "post_id,user_id" }
      );
    }
    onUpdate?.();
  };

  const handleShare = () => {
    const url = `${window.location.origin}/post/${post.id}`;
    if (navigator.share) {
      navigator.share({ title: post.title, url });
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Link copied!");
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
        <div className="flex items-center gap-1">
          {user?.id === post.creator_id && (
            <button
              onClick={() => navigate(`/boost-post?post=${post.id}`)}
              className="p-2 text-muted-foreground hover:text-accent transition-colors"
              title="Boost Post"
            >
              <Rocket className="w-4 h-4" />
            </button>
          )}
          <PostContextMenu postId={post.id} creatorId={post.creator_id} onUpdate={onUpdate} />
        </div>
      </div>

      <Link to={`/post/${post.id}`} className="block group">
        <h2 className="font-display text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">{post.title}</h2>
        <p className="font-body text-foreground/85 whitespace-pre-line leading-relaxed mb-5 line-clamp-6">{post.content}</p>
      </Link>

      {/* Public Stats */}
      <div className="flex items-center gap-4 py-2.5 px-3 mb-3 bg-muted/40 rounded-xl">
        <span className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground">
          <Eye className="w-3.5 h-3.5" /> {post.impressions_count || 0} Views
        </span>
        <span className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground">
          <TrendingUp className="w-3.5 h-3.5" /> {post.engagement_score || 0} Reach
        </span>
        <span className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground">
          <BarChart3 className="w-3.5 h-3.5" /> {(post.likes_count || 0) + (post.comments_count || 0) + (post.shares_count || 0)} Engagements
        </span>
      </div>

      <div className="flex items-center gap-4 pt-4 border-t border-border">
        <ReactionPicker
          active={post.is_liked ? (post.user_reaction as ReactionType) || "like" : null}
          count={post.likes_count || 0}
          onReact={handleReact}
        />
        <Link to={`/post/${post.id}`} className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-primary transition-colors">
          <MessageCircle className="w-4 h-4" /> {post.comments_count}
        </Link>
        <button onClick={handleShare} className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-accent transition-colors">
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
