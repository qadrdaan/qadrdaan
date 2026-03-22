"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  showText?: boolean;
}

const Logo = ({ className, showText = true }: LogoProps) => {
  return (
    <Link to="/" className={cn("flex items-center gap-3 group", className)}>
      <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-secondary to-accent rounded-xl rotate-6 group-hover:rotate-12 transition-transform duration-300 shadow-lg" />
        <img 
          src="/images/qadrdaan-logo.png" 
          alt="Q" 
          className="relative w-7 h-7 object-contain brightness-0 invert"
          onError={(e) => {
            // Fallback if image doesn't exist yet
            (e.target as HTMLImageElement).style.display = 'none';
            const span = (e.target as HTMLElement).nextElementSibling as HTMLElement;
            if (span) span.style.display = 'block';
          }}
        />
        <span className="relative font-display text-2xl font-bold text-white hidden">Q</span>
      </div>
      {showText && (
        <div className="flex flex-col leading-none">
          <span className="font-display text-xl font-black tracking-tighter text-foreground uppercase">
            QADR <span className="text-primary">DAAN</span>
          </span>
          <span className="font-body text-[10px] text-secondary font-bold mt-0.5 text-right dir-rtl">
            سےج جذبوں کا قدر داں
          </span>
        </div>
      )}
    </Link>
  );
};

export default Logo;