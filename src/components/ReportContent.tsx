import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Flag, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const REASONS = [
  { value: "spam", label: "Spam" },
  { value: "harassment", label: "Harassment / Bullying" },
  { value: "inappropriate", label: "Inappropriate Content" },
  { value: "plagiarism", label: "Plagiarism / Copyright" },
  { value: "fake_account", label: "Fake Account" },
  { value: "other", label: "Other" },
];

interface ReportContentProps {
  contentType: "post" | "video" | "book" | "profile" | "comment";
  contentId: string;
  reportedUserId: string;
}

const ReportContent = ({ contentType, contentId, reportedUserId }: ReportContentProps) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user) { toast.error("Sign in to report"); return; }
    if (!reason) { toast.error("Select a reason"); return; }
    if (user.id === reportedUserId) { toast.error("Cannot report yourself"); return; }

    setSubmitting(true);
    const { error } = await supabase.from("content_reports" as any).insert({
      reporter_id: user.id,
      content_type: contentType,
      content_id: contentId,
      reported_user_id: reportedUserId,
      reason,
      description: description.trim() || null,
    } as any);

    if (error) {
      toast.error("Failed to submit report");
    } else {
      toast.success("Report submitted. Our team will review it.");
      setOpen(false);
      setReason("");
      setDescription("");
    }
    setSubmitting(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-xs font-body text-muted-foreground hover:text-destructive transition-colors"
        title="Report"
      >
        <Flag className="w-3.5 h-3.5" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-4"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-border rounded-2xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-lg font-bold text-foreground">Report Content</h3>
                <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 mb-4">
                {REASONS.map((r) => (
                  <button
                    key={r.value}
                    onClick={() => setReason(r.value)}
                    className={`w-full text-left px-4 py-3 rounded-lg border text-sm font-body transition-colors ${
                      reason === r.value
                        ? "border-destructive bg-destructive/5 text-foreground"
                        : "border-border text-muted-foreground hover:border-muted-foreground/30"
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Additional details (optional)..."
                rows={3}
                className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring mb-4"
              />

              <button
                onClick={handleSubmit}
                disabled={submitting || !reason}
                className="w-full py-3 font-body font-semibold bg-destructive text-destructive-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Submit Report"}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ReportContent;
