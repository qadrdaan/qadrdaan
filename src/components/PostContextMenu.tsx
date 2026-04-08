import { useState } from "react";
import {
  MoreHorizontal, Pin, EyeOff, Bookmark, Flag, Pencil, Trash2, BarChart3,
  ThumbsUp, ThumbsDown, Bell, BellOff, HelpCircle, Clock, UserMinus, Ban, Download, DownloadOff
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PostContextMenuProps {
  postId: string;
  creatorId: string;
  onUpdate?: () => void;
  onEdit?: () => void;
  allowDownload?: boolean;
  onToggleDownload?: () => void;
}

const PostContextMenu = ({ postId, creatorId, onUpdate, onEdit, allowDownload = true, onToggleDownload }: PostContextMenuProps) => {
  const { user } = useAuth();
  const isOwner = user?.id === creatorId;

  const handleFeature = async () => {
    if (!user) return;
    const { error } = await supabase.from("featured_posts").insert({ user_id: user.id, post_id: postId });
    if (error?.code === "23505") toast.info("Already featured");
    else if (error) toast.error("Failed to feature");
    else toast.success("Post featured on your profile!");
  };

  const handleHide = async () => {
    if (!user) return;
    const { error } = await supabase.from("hidden_posts").insert({ user_id: user.id, post_id: postId });
    if (error?.code === "23505") toast.info("Already hidden");
    else if (error) toast.error("Failed to hide");
    else { toast.success("Post hidden from feed"); onUpdate?.(); }
  };

  const handleBookmark = async () => {
    if (!user) { toast.error("Sign in to bookmark"); return; }
    const { data: existing } = await supabase.from("bookmarks").select("id").eq("user_id", user.id).eq("content_id", postId).eq("content_type", "post").single();
    if (existing) {
      await supabase.from("bookmarks").delete().eq("id", existing.id);
      toast.success("Bookmark removed");
    } else {
      await supabase.from("bookmarks").insert({ user_id: user.id, content_id: postId, content_type: "post" });
      toast.success("Post saved!");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this post permanently?")) return;
    const { error } = await supabase.from("poetry_posts").delete().eq("id", postId);
    if (error) toast.error("Failed to delete");
    else { toast.success("Post deleted"); onUpdate?.(); }
  };

  const handleUnfollow = async () => {
    if (!user) return;
    const { error } = await supabase.from("followers").delete().eq("follower_id", user.id).eq("following_id", creatorId);
    if (error) toast.error("Failed to unfollow");
    else { toast.success("Unfollowed"); onUpdate?.(); }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {isOwner ? (
          <>
            {onEdit && (
              <DropdownMenuItem onClick={onEdit} className="gap-2.5 font-body text-sm">
                <Pencil className="w-4 h-4" /> Edit Post
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={handleFeature} className="gap-2.5 font-body text-sm">
              <Pin className="w-4 h-4" /> Feature on Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast.info("Analytics coming soon")} className="gap-2.5 font-body text-sm">
              <BarChart3 className="w-4 h-4" /> View Insights
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onToggleDownload} className="gap-2.5 font-body text-sm">
              {allowDownload ? <DownloadOff className="w-4 h-4" /> : <Download className="w-4 h-4" />}
              {allowDownload ? "Disable Downloads" : "Enable Downloads"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleDelete} className="gap-2.5 font-body text-sm text-destructive focus:text-destructive">
              <Trash2 className="w-4 h-4" /> Delete Post
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem onClick={() => toast.success("You'll see more content like this")} className="gap-2.5 font-body text-sm">
              <ThumbsUp className="w-4 h-4" /> Interested
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast.success("You'll see less content like this")} className="gap-2.5 font-body text-sm">
              <ThumbsDown className="w-4 h-4" /> Not Interested
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleBookmark} className="gap-2.5 font-body text-sm">
              <Bookmark className="w-4 h-4" /> Save Post
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast.success("You'll be notified about updates")} className="gap-2.5 font-body text-sm">
              <Bell className="w-4 h-4" /> Turn on Notifications
            </DropdownMenuItem>
            {allowDownload && (
              <DropdownMenuItem onClick={() => toast.success("Download started")} className="gap-2.5 font-body text-sm">
                <Download className="w-4 h-4" /> Download
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => toast.info("Content shown based on your interests and activity")} className="gap-2.5 font-body text-sm">
              <HelpCircle className="w-4 h-4" /> Why am I seeing this?
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleHide} className="gap-2.5 font-body text-sm">
              <EyeOff className="w-4 h-4" /> Hide Post
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => { toast.success("Creator snoozed for 30 days"); }} className="gap-2.5 font-body text-sm">
              <Clock className="w-4 h-4" /> Snooze for 30 days
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleUnfollow} className="gap-2.5 font-body text-sm">
              <UserMinus className="w-4 h-4" /> Unfollow
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => toast.info("Use report button below")} className="gap-2.5 font-body text-sm text-destructive focus:text-destructive">
              <Flag className="w-4 h-4" /> Report Post
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast.info("User blocked")} className="gap-2.5 font-body text-sm text-destructive focus:text-destructive">
              <Ban className="w-4 h-4" /> Block User
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default PostContextMenu;
