import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useModeration = () => {
  const [moderating, setModerating] = useState(false);

  const checkContent = async (
    content: string,
    contentType: "post" | "comment" | "live_chat"
  ): Promise<boolean> => {
    if (!content.trim()) return true;
    
    setModerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("moderate-content", {
        body: { content: content.trim(), content_type: contentType },
      });

      if (error) {
        console.error("Moderation error:", error);
        // Fail-open: allow if service is down
        return true;
      }

      if (!data.allowed) {
        if (data.action === "permanent_ban") {
          toast.error(data.reason, { duration: 10000 });
        } else if (data.action === "temp_suspension") {
          toast.error(data.reason, { duration: 8000 });
        } else {
          toast.warning(data.reason, { duration: 6000 });
        }
        return false;
      }

      return true;
    } catch (err) {
      console.error("Moderation check failed:", err);
      return true; // fail-open
    } finally {
      setModerating(false);
    }
  };

  return { checkContent, moderating };
};
