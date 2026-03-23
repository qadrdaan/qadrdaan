"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Share2, Music, UserPlus, Gift, Loader2, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import SendGift from './SendGift';

const ShortsFeed = () => {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("videos")
      .select("*, profiles:creator_id(display_name, avatar_url, is_verified)")
      .order("created_at", { ascending: false })
      .limit(10);
    
    setVideos(data || []);
    setLoading(false);
  };

  const handleScroll = () => {
    if (!containerRef.current) return;
    const index = Math.round(containerRef.current.scrollTop / window.innerHeight);
    if (index !== currentIndex) setCurrentIndex(index);
  };

  if (loading) return <div className="h-screen bg-black flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>;

  return (
    <div 
      ref={containerRef}
      onScroll={handleScroll}
      className="h-screen w-full bg-black overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
    >
      {videos.map((video, index) => (
        <div key={video.id} className="h-screen w-full snap-start relative flex items-center justify-center">
          <video 
            src={video.video_url}
            className="h-full w-full object-cover"
            loop
            muted={index !== currentIndex}
            autoPlay={index === currentIndex}
            playsInline
          />
          
          {/* Overlay UI */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
          
          {/* Right Side Actions */}
          <div className="absolute right-4 bottom-24 flex flex-col items-center gap-6 z-10">
            <div className="relative">
              <div className="w-12 h-12 rounded-full border-2 border-white overflow-hidden bg-muted">
                {video.profiles?.avatar_url ? <img src={video.profiles.avatar_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-gradient-brand text-white font-bold">{video.profiles?.display_name[0]}</div>}
              </div>
              <button className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-5 h-5 bg-primary rounded-full flex items-center justify-center border-2 border-black">
                <Plus className="w-3 h-3 text-white" />
              </button>
            </div>

            <div className="flex flex-col items-center">
              <button className="p-3 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 transition-all">
                <Heart className="w-6 h-6 text-white" />
              </button>
              <span className="text-white text-xs font-bold mt-1">{video.likes_count}</span>
            </div>

            <div className="flex flex-col items-center">
              <button className="p-3 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 transition-all">
                <MessageCircle className="w-6 h-6 text-white" />
              </button>
              <span className="text-white text-xs font-bold mt-1">24</span>
            </div>

            <SendGift recipientId={video.creator_id} recipientName={video.profiles?.display_name || "Poet"} />

            <button className="p-3 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 transition-all">
              <Share2 className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Bottom Info */}
          <div className="absolute left-4 bottom-8 right-20 z-10 pointer-events-none">
            <h3 className="text-white font-bold text-lg mb-1">@{video.profiles?.display_name}</h3>
            <p className="text-white/90 text-sm line-clamp-2 mb-3">{video.title}</p>
            <div className="flex items-center gap-2">
              <Music className="w-4 h-4 text-white animate-spin-slow" />
              <span className="text-white text-xs font-medium">Original Sound - {video.profiles?.display_name}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ShortsFeed;