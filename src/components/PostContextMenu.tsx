import { useState } from "react";
import {
  MoreHorizontal, Pin, EyeOff, Bookmark, Flag, Pencil, Trash2, BarChart3,
  ThumbsUp, ThumbsDown, Bell, BellOff, HelpCircle, Clock, UserMinus, Ban, Download, XCircle,
  MessageSquare, Code2, CalendarClock, Eye
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PostContextMenuProps {
  postId: string;
  creatorId: string;
  isHidden?: boolean;
  commentPermission?: "everyone" | "followers" | "nobody";
  notificationsOff?: boolean;
  onUpdate?: () => void;
  onEdit?: () => void;
  allowDownload?: boolean;
  onToggleDownload?: () => void;
}

const PostContextMenu = ({
  postId, creatorId, isHidden = false, commentPermission = "everyone",
  notificationsOff = false, onUpdate, onEdit, allowDownload = true, onToggleDownload,
}: PostContextMenuProps) => {
  const { user } = useAuth();
  const isOwner = user?.id === creatorId;
  const [embedOpen, setEmbedOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const [newDate, setNewDate] = useState("");

  const updatePost = async (patch: Record<string, any>, successMsg: string) => {
    const { error } = await supabase.from("poetry_posts").update(patch as any).eq("id", postId);
    if (error) toast.error("Update failed");
    else { toast.success(successMsg); onUpdate?.(); }
  };

  const handleFeature = async () => {
    if (!user) return;
    const { error } = await supabase.from("featured_posts").insert({ user_id: user.id, post_id: postId });
    if (error?.code === "23505") toast.info("Already featured");
    else if (error) toast.error("Failed to feature");
    else toast.success("Post featured on your profile!");
  };

  const handleHideFeed = async () => {
    if (!user) return;
    const { error } = await supabase.from("hidden_posts").insert({ user_id: user.id, post_id: postId });
    if (error?.code === "23505") toast.info("Already hidden");
    else if (error) toast.error("Failed to hide");
    else { toast.success("Post hidden from feed"); onUpdate?.(); }
  };

  const handleBookmark = async () => {
    if (!user) { toast.error("Sign in to bookmark"); return; }
    const { data: existing } = await supabase.from("bookmarks").select("id").eq("user_id", user.id).eq("content_id", postId).eq("content_type", "post").maybeSingle();
    if (existing) {
      await supabase.from("bookmarks").delete().eq("id", existing.id);
      toast.success("Bookmark removed");
    } else {
      await supabase.from("bookmarks").insert({ user_id: user.id, content_id: postId, content_type: "post" });
      toast.success("Post saved!");
    }
  };

  const handleSoftDelete = async () => {
    if (!window.confirm("Move this post to Trash? You can restore it within 30 days.")) return;
    const { error } = await supabase
      .from("poetry_posts")
      .update({ is_deleted: true, deleted_at: new Date().toISOString() } as any)
      .eq("id", postId);
    if (error) toast.error("Failed to move to trash");
    else { toast.success("Moved to Trash"); onUpdate?.(); }
  };

  const handleUnfollow = async () => {
    if (!user) return;
    const { error } = await supabase.from("followers").delete().eq("follower_id", user.id).eq("following_id", creatorId);
    if (error) toast.error("Failed to unfollow");
    else { toast.success("Unfollowed"); onUpdate?.(); }
  };

  const embedCode = `<iframe src="${window.location.origin}/post/${postId}" width="100%" height="500" frameborder="0" allowfullscreen></iframe>`;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-60">
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
              <DropdownMenuItem
                onClick={() => updatePost({ is_hidden: !isHidden }, isHidden ? "Post is now public" : "Post is now hidden")}
                className="gap-2.5 font-body text-sm"
              >
                {isHidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                {isHidden ? "Make Public" : "Hide Post"}
              </DropdownMenuItem>

              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="gap-2.5 font-body text-sm">
                  <MessageSquare className="w-4 h-4" /> Who can comment
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {(["everyone", "followers", "nobody"] as const).map((opt) => (
                    <DropdownMenuItem
                      key={opt}
                      onClick={() => updatePost({ comment_permission: opt }, `Comments: ${opt}`)}
                      className="gap-2 font-body text-sm capitalize"
                    >
                      {commentPermission === opt ? "✓" : "  "} {opt}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>

              <DropdownMenuItem
                onClick={() => updatePost({ notifications_off: !notificationsOff }, notificationsOff ? "Notifications on" : "Notifications off")}
                className="gap-2.5 font-body text-sm"
              >
                {notificationsOff ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                {notificationsOff ? "Turn on Notifications" : "Turn off Notifications"}
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => setEmbedOpen(true)} className="gap-2.5 font-body text-sm">
                <Code2 className="w-4 h-4" /> Embed
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setDateOpen(true)} className="gap-2.5 font-body text-sm">
                <CalendarClock className="w-4 h-4" /> Edit Post Date
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => toast.info("Analytics coming soon")} className="gap-2.5 font-body text-sm">
                <BarChart3 className="w-4 h-4" /> View Insights
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onToggleDownload} className="gap-2.5 font-body text-sm">
                {allowDownload ? <XCircle className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                {allowDownload ? "Disable Downloads" : "Enable Downloads"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSoftDelete} className="gap-2.5 font-body text-sm text-destructive focus:text-destructive">
                <Trash2 className="w-4 h-4" /> Move to Trash
              </DropdownMenuItem>
            </>
          ) : (
            <>
              <DropdownMenuItem onClick={() => toast.success("You'll see more like this")} className="gap-2.5 font-body text-sm">
                <ThumbsUp className="w-4 h-4" /> Interested
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast.success("You'll see less like this")} className="gap-2.5 font-body text-sm">
                <ThumbsDown className="w-4 h-4" /> Not Interested
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleBookmark} className="gap-2.5 font-body text-sm">
                <Bookmark className="w-4 h-4" /> Save Post
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast.success("Notifications on")} className="gap-2.5 font-body text-sm">
                <Bell className="w-4 h-4" /> Turn on Notifications
              </DropdownMenuItem>
              {allowDownload && (
                <DropdownMenuItem onClick={() => toast.success("Download started")} className="gap-2.5 font-body text-sm">
                  <Download className="w-4 h-4" /> Download
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => setEmbedOpen(true)} className="gap-2.5 font-body text-sm">
                <Code2 className="w-4 h-4" /> Embed
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => toast.info("Content shown based on your interests")} className="gap-2.5 font-body text-sm">
                <HelpCircle className="w-4 h-4" /> Why am I seeing this?
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleHideFeed} className="gap-2.5 font-body text-sm">
                <EyeOff className="w-4 h-4" /> Hide Post
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast.success("Snoozed for 30 days")} className="gap-2.5 font-body text-sm">
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

      {/* Embed dialog */}
      <Dialog open={embedOpen} onOpenChange={setEmbedOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Embed this post</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Copy the iframe below to embed this post on any website.</p>
          <textarea
            readOnly
            value={embedCode}
            className="w-full h-28 p-3 text-xs font-mono bg-muted rounded-md border border-border"
            onFocus={(e) => e.currentTarget.select()}
          />
          <DialogFooter>
            <Button onClick={() => { navigator.clipboard.writeText(embedCode); toast.success("Embed code copied"); }}>
              Copy code
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit date dialog */}
      <Dialog open={dateOpen} onOpenChange={setDateOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit post date</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Display a custom date on this post (does not change creation order).</p>
          <Input type="datetime-local" value={newDate} onChange={(e) => setNewDate(e.target.value)} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setDateOpen(false)}>Cancel</Button>
            <Button
              onClick={async () => {
                if (!newDate) { toast.error("Pick a date"); return; }
                await updatePost({ display_date: new Date(newDate).toISOString() }, "Display date updated");
                setDateOpen(false);
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PostContextMenu;
