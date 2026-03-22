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
    <Link to="/" className={cn("flex items-center gap-2 group", className)}>
      <div className="relative w-8 h-8 flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-brand rounded-lg rotate-6 group-hover:rotate-12 transition-transform duration-300" />
        <span className="relative font-display text-xl font-bold text-white">q</span>
      </div>
      {showText && (
        <span className="font-display text-2xl font-bold tracking-tight text-foreground">
          qadr<span className="text-primary">daan</span>
        </span>
      )}
    </Link>
  );
};

export default Logo;