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
        <Logo className="scale-150 mb-8" />
        <div className="w-48 h-1 bg-muted rounded-full overflow-hidden relative">
          <motion.div
            className="absolute inset-y-0 left-0 bg-gradient-brand"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
          />
        </div>
        <p className="mt-4 font-body text-sm text-muted-foreground animate-pulse">
          Preparing your literary stage...
        </p>
      </motion.div>
    </div>
  );
};

export default LoadingScreen;