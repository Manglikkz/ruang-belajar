'use client';

import React from 'react';
import Image from 'next/image';

interface AppLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export function AppLogo({ size = 'md', showText = true, className = '' }: AppLogoProps) {
  const sizeClasses = {
    sm: 'w-7 h-7 rounded-lg',
    md: 'w-9 h-9 rounded-xl',
    lg: 'w-11 h-11 rounded-2xl',
  };

  const imageSizes = {
    sm: 28,
    md: 36,
    lg: 44,
  };

  const textClasses = {
    sm: 'text-base font-bold',
    md: 'text-lg font-bold',
    lg: 'text-xl font-black',
  };

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div
        className={`${sizeClasses[size]} overflow-hidden bg-white border border-slate-200/80 shadow-xs flex items-center justify-center relative shrink-0`}
      >
        <Image
          src="/assets/logo.jpg"
          alt="Ruang Belajar AI Logo"
          width={imageSizes[size]}
          height={imageSizes[size]}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
          priority
        />
      </div>
      {showText && (
        <span className={`${textClasses[size]} text-slate-900 tracking-tight select-none`}>
          Ruang Belajar AI
        </span>
      )}
    </div>
  );
}
