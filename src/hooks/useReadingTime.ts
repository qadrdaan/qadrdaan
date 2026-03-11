import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Tracks reading time for a post. Records an impression when the post
 * becomes visible and periodically updates reading_time_seconds.
 */
export const useReadingTime = (postId: string | null, userId: string | null) => {
  const startTime = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!postId || !userId) return;

    startTime.current = Date.now();

    // Record initial impression (upsert)
    const recordImpression = async () => {
      await supabase
        .from("post_impressions" as any)
        .upsert(
          { post_id: postId, user_id: userId, reading_time_seconds: 0 } as any,
          { onConflict: "post_id,user_id" }
        );
    };
    recordImpression();

    // Update reading time every 10 seconds
    intervalRef.current = setInterval(async () => {
      if (!startTime.current) return;
      const seconds = Math.floor((Date.now() - startTime.current) / 1000);
      await supabase
        .from("post_impressions" as any)
        .update({ reading_time_seconds: seconds } as any)
        .eq("post_id", postId)
        .eq("user_id", userId);
    }, 10000);

    return () => {
      // Final update on unmount
      if (startTime.current) {
        const seconds = Math.floor((Date.now() - startTime.current) / 1000);
        supabase
          .from("post_impressions" as any)
          .update({ reading_time_seconds: seconds } as any)
          .eq("post_id", postId)
          .eq("user_id", userId);
        
        // Recalculate engagement score
        supabase.rpc("recalculate_engagement_score" as any, { p_post_id: postId });
      }
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [postId, userId]);
};
