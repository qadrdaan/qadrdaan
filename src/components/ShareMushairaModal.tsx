"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Layout, Send, Share2, Mic } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface ShareMushairaModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: any;
}

const ShareMushairaModal = ({ isOpen, onClose, event }: ShareMushairaModalProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState(`Live Mushaira: ${event.title}`);
  const [content, setContent] = useState(`I just hosted an amazing live mushaira! 🎤✨\n\nEvent: ${event.title}\nDate: ${new Date(event.scheduled_at).toLocaleDateString()}\n\n${event.description || ""}`);

  const handlePost = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const { error } = await supabase.from("poetry_posts").insert({
        creator_id: user.id,
        title: title.trim(),
        content: content.trim(),
        category: "mushaira",
        language: event.language || "Urdu"
      });

      if (error) throw error;

      toast.success("Mushaira shared to your wall!");
      onClose();
    } catch (error: any) {
      toast.error("Failed to share: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-card border border-border rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl"
          >
            <div className="p-6 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                  <Mic className="w-5 h-5 text-secondary" />
                </div>
                <h2 className="font-display text-xl font-bold text-foreground">Share to Wall</h2>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block font-body text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Post Title</label>
                <input 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border focus:ring-2 focus:ring-primary/20 outline-none font-body text-sm"
                />
              </div>
              <div>
                <label className="block font-body text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Description</label>
                <textarea 
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border focus:ring-2 focus:ring-primary/20 outline-none font-body text-sm resize-none"
                />
              </div>
            </div>

            <div className="p-6 bg-muted/30 border-t border-border flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-3 bg-muted text-foreground rounded-xl font-bold uppercase text-xs tracking-widest hover:bg-muted/80 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handlePost}
                disabled={loading}
                className="flex-[2] py-3 bg-primary text-white rounded-xl font-bold uppercase text-xs tracking-widest shadow-brand hover:opacity-90 transition-all flex items-center justify-center gap-2"
              >
                {loading ? "Sharing..." : <><Layout className="w-4 h-4" /> Post to Wall</>}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ShareMushairaModal;