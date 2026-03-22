"use client";

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, Trash2, Eye, Upload, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ProfilePhotoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  photoUrl: string | null;
  displayName: string;
  isOwnProfile: boolean;
  userId: string;
  onUpdate: () => void;
}

const ProfilePhotoDialog = ({ isOpen, onClose, photoUrl, displayName, isOwnProfile, userId, onUpdate }: ProfilePhotoDialogProps) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file");
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}/avatar-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('user_id', userId);

      if (updateError) throw updateError;

      toast.success("Profile photo updated!");
      onUpdate();
      onClose();
    } catch (error: any) {
      toast.error("Upload failed: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    if (!window.confirm("Remove profile photo?")) return;
    
    setUploading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('user_id', userId);

      if (error) throw error;

      toast.success("Profile photo removed");
      onUpdate();
      onClose();
    } catch (error: any) {
      toast.error("Failed to remove photo");
    } finally {
      setUploading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative w-full max-w-lg flex flex-col items-center"
          >
            <button onClick={onClose} className="absolute -top-12 right-0 p-2 text-white/60 hover:text-white transition-colors">
              <X className="w-8 h-8" />
            </button>

            <div className="w-full aspect-square rounded-3xl overflow-hidden bg-muted flex items-center justify-center shadow-2xl border border-white/10">
              {photoUrl ? (
                <img src={photoUrl} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                <span className="font-display text-9xl font-bold text-muted-foreground/20">
                  {displayName[0]?.toUpperCase()}
                </span>
              )}
              
              {uploading && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <Loader2 className="w-12 h-12 animate-spin text-white" />
                </div>
              )}
            </div>

            {isOwnProfile && (
              <div className="mt-8 flex gap-4 w-full">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex-1 py-4 bg-white text-black rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-white/90 transition-all"
                >
                  <Upload className="w-5 h-5" /> Change Photo
                </button>
                <button
                  onClick={handleRemove}
                  disabled={uploading || !photoUrl}
                  className="px-6 py-4 bg-destructive/20 text-destructive rounded-2xl font-bold hover:bg-destructive/30 transition-all border border-destructive/20"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                <input 
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleUpload}
                />
              </div>
            )}
            
            <p className="mt-6 font-display text-xl font-bold text-white">{displayName}</p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ProfilePhotoDialog;