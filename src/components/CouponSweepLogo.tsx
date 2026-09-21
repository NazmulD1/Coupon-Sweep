import React from 'react';

interface CouponSweepLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'image' | 'vector';
  showSubtext?: boolean;
}

export const CouponSweepLogo: React.FC<CouponSweepLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'vector',
  showSubtext = true
}) => {
  const sizeMap = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  return (
    <div className={`inline-flex items-center justify-center select-none ${className}`}>
      <svg
        viewBox="0 0 100 100"
        className={sizeMap[size]}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Modern Indigo Gradient Circle */}
        <defs>
          <linearGradient id="sweepGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#4f46e5" />
          </linearGradient>
        </defs>
        
        <circle cx="50" cy="50" r="48" fill="url(#sweepGradient)" />
        
        {/* Sweep / Sparkle Icon */}
        <path 
          d="M30 50 C30 30, 70 30, 70 50 C70 70, 30 70, 30 50" 
          stroke="white" 
          strokeWidth="4" 
          strokeLinecap="round" 
          opacity="0.2"
        />
        
        <path 
          d="M25 65 L45 75 L75 35" 
          stroke="white" 
          strokeWidth="8" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
        
        {/* Sparkles */}
        <circle cx="75" cy="25" r="4" fill="white" />
        <circle cx="85" cy="40" r="2.5" fill="white" />
      </svg>
    </div>
  );
};
