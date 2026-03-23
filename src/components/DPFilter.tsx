"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';

const FILTERS = [
  { id: 'none', name: 'Original', class: '' },
  { id: 'gold', name: 'Gold Frame', class: 'ring-4 ring-accent ring-offset-2' },
  { id: 'silver', name: 'Silver Frame', class: 'ring-4 ring-muted-foreground/30 ring-offset-2' },
  { id: 'poetry', name: 'Poet Border', class: 'border-4 border-double border-primary p-1' },
];

interface DPFilterProps {
  currentFilter: string;
  onSelect: (filterId: string) => void;
  avatarUrl: string | null;
  displayName: string;
}

const DPFilter = ({ currentFilter, onSelect, avatarUrl, displayName }: DPFilterProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-4 h-4 text-accent" />
        <h3 className="font-display text-sm font-bold text-foreground uppercase tracking-wider">Profile Frames</h3>
      </div>
      
      <div className="grid grid-cols-4 gap-3">
        {FILTERS.map((filter) => (
          <button
            key={filter.id}
            onClick={() => onSelect(filter.id)}
            className="flex flex-col items-center gap-2 group"
          >
            <div className="relative">
              <div className={`w-12 h-12 rounded-full overflow-hidden bg-muted transition-all ${filter.id === currentFilter ? 'scale-110' : 'opacity-70 group-hover:opacity-100'}`}>
                <div className={`w-full h-full rounded-full ${filter.class}`}>
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-brand text-white text-xs font-bold">
                      {displayName[0]}
                    </div>
                  )}
                </div>
              </div>
              {filter.id === currentFilter && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center shadow-sm">
                  <Check className="w-2.5 h-2.5 text-white" />
                </div>
              )}
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-tighter ${filter.id === currentFilter ? 'text-primary' : 'text-muted-foreground'}`}>
              {filter.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default DPFilter;