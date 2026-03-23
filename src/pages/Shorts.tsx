"use client";

import React from 'react';
import ShortsFeed from '@/components/ShortsFeed';
import Navbar from '@/components/Navbar';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Shorts = () => {
  const navigate = useNavigate();

  return (
    <div className="h-screen w-full bg-black overflow-hidden">
      {/* Minimal Overlay Navbar for Shorts */}
      <div className="absolute top-0 left-0 right-0 z-[100] p-6 flex items-center justify-between bg-gradient-to-b from-black/60 to-transparent pointer-events-none">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 rounded-full bg-white/10 backdrop-blur-md text-white pointer-events-auto hover:bg-white/20 transition-all"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="font-display text-xl font-bold text-white pointer-events-auto">Shorts</h1>
        <div className="w-10" /> {/* Spacer */}
      </div>

      <ShortsFeed />
    </div>
  );
};

export default Shorts;