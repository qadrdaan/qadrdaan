import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Clock, TrendingUp } from "lucide-react";

const MemoriesWidget = () => {
  const { user } = useAuth();
  const [memories, setMemories] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const fetchMemories = async () => {
      const now = new Date();
      const results: any[] = [];

      for (let years = 1; years <= 3; years++) {
        const targetDate = new Date(now);
        targetDate.setFullYear(now.getFullYear() - years);
        const start = new Date(targetDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(targetDate);
        end.setHours(23, 59, 59, 999);

        const { data } = await supabase
          .from("poetry_posts")
          .select("id, title, content, likes_count, created_at")
          .eq("creator_id", user.id)
          .gte("created_at", start.toISOString())
          .lte("created_at", end.toISOString())
          .limit(1);

        if (data?.length) {
          results.push({ ...data[0], yearsAgo: years });
        }
      }
      setMemories(results);
    };
    fetchMemories();
  }, [user]);

  if (memories.length === 0) return null;

  return (
    <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
      <h3 className="font-display text-sm font-bold text-foreground mb-3 flex items-center gap-2 uppercase tracking-wider">
        <Clock className="w-4 h-4 text-accent" /> On This Day
      </h3>
      <div className="space-y-3">
        {memories.map((m: any) => (
          <Link key={m.id} to={`/post/${m.id}`} className="block p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors group">
            <div className="flex items-center justify-between mb-1">
              <span className="font-body text-[10px] font-bold text-primary uppercase tracking-wider">
                {m.yearsAgo} year{m.yearsAgo > 1 ? "s" : ""} ago
              </span>
              <span className="flex items-center gap-1 font-body text-[10px] text-muted-foreground">
                <TrendingUp className="w-3 h-3" /> {m.likes_count} likes
              </span>
            </div>
            <p className="font-body text-xs text-foreground font-medium line-clamp-2 group-hover:text-primary transition-colors">
              {m.title}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MemoriesWidget;
