import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  showText?: boolean;
}

const Logo = ({ className, showText = true }: LogoProps) => {
  return (
    <Link to="/" className={cn("flex items-center gap-2.5 group", className)}>
      <div className="relative w-9 h-9 shrink-0">
        <img
          src="/images/qadrdaan-logo.png"
          alt="Qadrdaan"
          className="w-full h-full object-contain"
        />
      </div>
      {showText && (
        <div className="flex flex-col leading-none">
          <span className="font-display text-lg font-black tracking-tight text-foreground">
            QADR<span className="text-primary">DAAN</span>
          </span>
          <span className="font-body text-[9px] text-secondary font-semibold mt-0.5 dir-rtl text-right">
            سےج جذبوں کا قدر داں
          </span>
        </div>
      )}
    </Link>
  );
};

export default Logo;
