'use client';

import React from 'react';
import { AppLogo } from '@/components/AppLogo';

interface NavbarProps {
  onStartLearning: () => void;
  onLogin: () => void;
  activeSection?: string;
}

export function Navbar({ onStartLearning, onLogin }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <AppLogo size="md" />
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <a href="#fitur" className="hover:text-sky-600 transition-colors">
            Fitur
          </a>
          <a href="#cara-kerja" className="hover:text-sky-600 transition-colors">
            Cara Kerja
          </a>
          <a href="#faq" className="hover:text-sky-600 transition-colors">
            FAQ
          </a>
        </nav>

        {/* CTA Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={onLogin}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-sky-600 hover:bg-slate-50 rounded-lg transition-colors"
          >
            Masuk
          </button>
          <button
            onClick={onStartLearning}
            className="px-4 py-2 text-sm font-semibold text-white bg-sky-500 hover:bg-sky-600 active:bg-sky-700 rounded-lg shadow-sm shadow-sky-200 transition-all cursor-pointer"
          >
            Mulai Belajar
          </button>
        </div>
      </div>
    </header>
  );
}
