"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Logo from './Logo';

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center"
      >
        <Logo className="scale-150 mb-12" />
        <div className="w-64 h-1.5 bg-muted rounded-full overflow-hidden relative shadow-inner">
          <motion.div
            className="absolute inset-y-0 left-0 bg-gradient-brand"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
          />
        </div>
        <p className="mt-6 font-body text-sm font-semibold text-muted-foreground tracking-widest uppercase animate-pulse">
          سےج جذبوں کا قدر داں
        </p>
      </motion.div>
    </div>
  );
};

export default LoadingScreen;