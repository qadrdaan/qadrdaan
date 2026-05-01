import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { Trash2, RotateCcw, AlertTriangle } from "lucide-react";

interface TrashItem {
  id: string;
  title: string;
  type: "post" | "book";
  deleted_at: string;
}

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

const Trash = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<TrashItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (user) load();
  }, [user]);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    // On-access purge: hard delete anything older than 30 days
    const cutoff = new Date(Date.now() - THIRTY_DAYS_MS).toISOString();
    await supabase.from("poetry_posts").delete().eq("creator_id", user.id).eq("is_deleted", true).lt("deleted_at", cutoff);
    await supabase.from("books").delete().eq("creator_id", user.id).eq("is_deleted", true).lt("deleted_at", cutoff);

    const [{ data: posts }, { data: books }] = await Promise.all([
      supabase.from("poetry_posts").select("id, title, deleted_at").eq("creator_id", user.id).eq("is_deleted", true).order("deleted_at", { ascending: false }),
      supabase.from("books").select("id, title, deleted_at").eq("creator_id", user.id).eq("is_deleted", true).order("deleted_at", { ascending: false }),
    ]);

    const merged: TrashItem[] = [
      ...(posts || []).map((p: any) => ({ id: p.id, title: p.title, type: "post" as const, deleted_at: p.deleted_at })),
      ...(books || []).map((b: any) => ({ id: b.id, title: b.title, type: "book" as const, deleted_at: b.deleted_at })),
    ].sort((a, b) => new Date(b.deleted_at).getTime() - new Date(a.deleted_at).getTime());

    setItems(merged);
    setLoading(false);
  };

  const restore = async (item: TrashItem) => {
    const table = item.type === "post" ? "poetry_posts" : "books";
    const { error } = await supabase.from(table).update({ is_deleted: false, deleted_at: null } as any).eq("id", item.id);
    if (error) toast.error("Restore failed");
    else { toast.success("Restored"); load(); }
  };

  const purge = async (item: TrashItem) => {
    if (!window.confirm(`Permanently delete "${item.title}"? This cannot be undone.`)) return;
    const table = item.type === "post" ? "poetry_posts" : "books";
    const { error } = await supabase.from(table).delete().eq("id", item.id);
    if (error) toast.error("Delete failed");
    else { toast.success("Permanently deleted"); load(); }
  };

  const daysLeft = (deletedAt: string) => {
    const ms = new Date(deletedAt).getTime() + THIRTY_DAYS_MS - Date.now();
    return Math.max(0, Math.ceil(ms / (24 * 60 * 60 * 1000)));
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 container mx-auto px-6 max-w-3xl">
        <div className="flex items-center gap-3 mb-2">
          <Trash2 className="w-7 h-7 text-secondary" />
          <h1 className="font-display text-3xl font-bold text-foreground">Trash</h1>
        </div>
        <p className="font-body text-sm text-muted-foreground mb-6 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" /> Items here are deleted automatically after 30 days.
        </p>

        {loading ? (
          <p className="font-body text-muted-foreground">Loading...</p>
        ) : items.length === 0 ? (
          <div className="text-center py-16 bg-card border border-border rounded-2xl">
            <Trash2 className="w-10 h-10 mx-auto mb-3 text-muted-foreground/40" />
            <p className="font-body text-muted-foreground">Trash is empty.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {items.map((item) => (
              <li key={`${item.type}-${item.id}`} className="flex items-center justify-between gap-4 p-4 bg-card border border-border rounded-xl">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 text-xs font-body uppercase tracking-wide bg-muted rounded text-muted-foreground">{item.type}</span>
                    <span className="font-body text-xs text-muted-foreground">{daysLeft(item.deleted_at)} days left</span>
                  </div>
                  <p className="font-body font-medium text-foreground truncate">{item.title}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => restore(item)} className="px-3 py-2 rounded-lg bg-secondary/10 text-secondary hover:bg-secondary/20 font-body text-sm flex items-center gap-1.5">
                    <RotateCcw className="w-4 h-4" /> Restore
                  </button>
                  <button onClick={() => purge(item)} className="px-3 py-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 font-body text-sm flex items-center gap-1.5">
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Trash;
