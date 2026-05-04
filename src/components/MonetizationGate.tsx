import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { CheckCircle2, XCircle, Trophy, Users, Clock } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const FOLLOWER_TARGET = 8000;
const MINUTES_TARGET = 400_000;
const WINDOW_DAYS = 60;

const MonetizationGate = () => {
  const { user, profile } = useAuth();
  const [readingMinutes, setReadingMinutes] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const since = new Date();
      since.setDate(since.getDate() - WINDOW_DAYS);

      // Sum reading_time on poetry posts created by this user in last 60 days
      const { data: posts } = await supabase
        .from("poetry_posts")
        .select("id")
        .eq("creator_id", user.id);

      const ids = (posts || []).map((p: any) => p.id);
      if (ids.length === 0) { setReadingMinutes(0); setLoading(false); return; }

      const { data: imps } = await supabase
        .from("post_impressions")
        .select("reading_time_seconds, created_at, post_id")
        .in("post_id", ids)
        .gte("created_at", since.toISOString());

      const totalSeconds = (imps || []).reduce((acc: number, i: any) => acc + (i.reading_time_seconds || 0), 0);
      setReadingMinutes(Math.round(totalSeconds / 60));
      setLoading(false);
    })();
  }, [user]);

  if (!profile) return null;

  const followers = profile.followers_count || 0;
  const followerOk = followers >= FOLLOWER_TARGET;
  const minutesOk = readingMinutes >= MINUTES_TARGET;
  const eligible = followerOk && minutesOk;

  const followerPct = Math.min(100, (followers / FOLLOWER_TARGET) * 100);
  const minutesPct = Math.min(100, (readingMinutes / MINUTES_TARGET) * 100);

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-5">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${eligible ? "bg-green-500/20 text-green-600" : "bg-muted text-muted-foreground"}`}>
          <Trophy className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-display text-lg font-bold">Monetization Eligibility</h3>
          <p className="text-xs text-muted-foreground">Last {WINDOW_DAYS} days</p>
        </div>
        {eligible ? (
          <span className="ml-auto px-3 py-1 rounded-full bg-green-500/20 text-green-700 text-[10px] font-bold uppercase">Eligible</span>
        ) : (
          <span className="ml-auto px-3 py-1 rounded-full bg-muted text-muted-foreground text-[10px] font-bold uppercase">Not yet</span>
        )}
      </div>

      <div className="space-y-5">
        <div>
          <div className="flex items-center justify-between mb-2 text-sm">
            <span className="flex items-center gap-2 font-bold">
              <Users className="w-4 h-4 text-primary" /> Followers
              {followerOk ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <XCircle className="w-4 h-4 text-muted-foreground" />}
            </span>
            <span className="font-display font-bold">{followers.toLocaleString()} / {FOLLOWER_TARGET.toLocaleString()}</span>
          </div>
          <Progress value={followerPct} className="h-2" />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2 text-sm">
            <span className="flex items-center gap-2 font-bold">
              <Clock className="w-4 h-4 text-secondary" /> Reading Minutes
              {minutesOk ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <XCircle className="w-4 h-4 text-muted-foreground" />}
            </span>
            <span className="font-display font-bold">
              {loading ? "…" : `${readingMinutes.toLocaleString()} / ${MINUTES_TARGET.toLocaleString()}`}
            </span>
          </div>
          <Progress value={minutesPct} className="h-2" />
        </div>
      </div>

      <p className="mt-5 text-xs text-muted-foreground leading-relaxed">
        Reach <strong>{FOLLOWER_TARGET.toLocaleString()}</strong> followers and <strong>{MINUTES_TARGET.toLocaleString()}</strong> reading minutes
        in the last {WINDOW_DAYS} days to unlock monetization (gifts payout, ad revenue share, fan club subscriptions).
      </p>
    </div>
  );
};

export default MonetizationGate;
