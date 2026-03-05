import React from 'react';
import { motion } from 'motion/react';

export const CustomHourglass = ({ className }: { className?: string }) => {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Frame */}
      <path 
        d="M6 2H18M6 22H18M6 2V7C6 10 8 12 12 12C16 12 18 10 18 7V2M6 22V17C6 14 8 12 12 12C16 12 18 14 18 17V22" 
        stroke="currentColor" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      
      {/* Sand Top */}
      <motion.path 
        d="M7 3.5H17C17 5 16 6.5 12 6.5C8 6.5 7 5 7 3.5Z" 
        fill="currentColor"
        animate={{ 
          opacity: [0.8, 0.4, 0.8],
          scaleY: [1, 0.8, 1]
        }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
      
      {/* Sand Bottom */}
      <motion.path 
        d="M12 17.5C16 17.5 17 19 17 20.5H7C7 19 8 17.5 12 17.5Z" 
        fill="currentColor"
        animate={{ 
          opacity: [0.3, 0.7, 0.3],
          scaleY: [0.8, 1, 0.8]
        }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Falling Sand Line */}
      <motion.line 
        x1="12" y1="12" x2="12" y2="17" 
        stroke="currentColor" 
        strokeWidth="1" 
        strokeDasharray="1 2"
        animate={{ strokeDashoffset: [0, -3] }}
        transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }}
      />
    </svg>
  );
};
