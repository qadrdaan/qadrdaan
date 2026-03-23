import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

/**
 * Tracks audience demographics for content.
 * Records age group, gender, and location based on the viewer's profile.
 */
export const useAudienceTracking = (contentId: string, contentType: 'video' | 'post') => {
  const { user, profile } = useAuth();

  useEffect(() => {
    if (!user || !profile || !contentId) return;

    const recordDemographics = async () => {
      // Calculate age group
      let ageGroup = 'unknown';
      if (profile.date_of_birth) {
        const age = new Date().getFullYear() - new Date(profile.date_of_birth).getFullYear();
        if (age < 18) ageGroup = 'under_18';
        else if (age < 25) ageGroup = '18_24';
        else if (age < 35) ageGroup = '25_34';
        else if (age < 45) ageGroup = '35_44';
        else ageGroup = '45_plus';
      }

      await supabase.from('audience_analytics' as any).insert({
        content_id: contentId,
        content_type: contentType,
        viewer_id: user.id,
        country: profile.country || 'unknown',
        age_group: ageGroup,
        // Gender would be added here if included in profile
      } as any);
    };

    recordDemographics();
  }, [contentId, user, profile]);
};