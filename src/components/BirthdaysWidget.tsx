import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Cake, PartyPopper } from "lucide-react";
import { toast } from "sonner";

const BirthdaysWidget = () => {
  const { user } = useAuth();
  const [birthdays, setBirthdays] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const fetchBirthdays = async () => {
      const today = new Date();
      const mmdd = `${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

      // Get people user follows
      const { data: following } = await supabase
        .from("followers")
        .select("following_id")
        .eq("follower_id", user.id);

      if (!following?.length) return;
      const ids = following.map((f: any) => f.following_id);

      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url, date_of_birth")
        .in("user_id", ids)
        .not("date_of_birth", "is", null);

      if (profiles) {
        const todayBdays = profiles.filter((p: any) => {
          if (!p.date_of_birth) return false;
          const dob = p.date_of_birth.substring(5); // MM-DD
          return dob === mmdd;
        });
        setBirthdays(todayBdays);
      }
    };
    fetchBirthdays();
  }, [user]);

  const handleWish = (name: string) => {
    toast.success(`Birthday wish sent to ${name}! 🎂`);
  };

  if (birthdays.length === 0) return null;

  return (
    <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
      <h3 className="font-display text-sm font-bold text-foreground mb-3 flex items-center gap-2 uppercase tracking-wider">
        <Cake className="w-4 h-4 text-secondary" /> Birthdays
      </h3>
      <div className="space-y-3">
        {birthdays.map((b: any) => (
          <div key={b.user_id} className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-brand flex items-center justify-center text-xs font-bold text-primary-foreground shrink-0 overflow-hidden">
              {b.avatar_url ? (
                <img src={b.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                (b.display_name || "?")[0].toUpperCase()
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-body text-xs font-bold text-foreground truncate">{b.display_name}</p>
              <p className="font-body text-[10px] text-muted-foreground">Birthday today 🎂</p>
            </div>
            <button
              onClick={() => handleWish(b.display_name)}
              className="px-3 py-1 bg-secondary/10 text-secondary text-[10px] font-bold rounded-lg hover:bg-secondary/20 transition-colors"
            >
              <PartyPopper className="w-3 h-3 inline mr-1" />
              Wish
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BirthdaysWidget;
