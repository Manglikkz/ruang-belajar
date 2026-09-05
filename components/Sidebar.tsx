'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  LayoutDashboard,
  FileText,
  CreditCard,
  HelpCircle,
  Network,
  BookOpen,
  Sparkles,
  ChevronDown,
  X,
  LogOut,
  UserCheck,
  UserPlus
} from 'lucide-react';
import { UserAccount } from '@/lib/auth';
import { AppLogo } from '@/components/AppLogo';

export type NavItemKey = 'dashboard' | 'materials' | 'flashcard' | 'quiz' | 'mindmap';

interface SidebarProps {
  currentTab: NavItemKey;
  onSelectTab: (tab: NavItemKey) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  currentUser?: UserAccount | null;
  onLogout?: () => void;
  onSwitchAccount?: () => void;
}

export function Sidebar({
  currentTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
  currentUser,
  onLogout,
  onSwitchAccount
}: SidebarProps) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { key: 'materials', label: 'Materi Saya', icon: FileText },
    { key: 'flashcard', label: 'Flashcard', icon: CreditCard },
    { key: 'quiz', label: 'Kuis', icon: HelpCircle },
    { key: 'mindmap', label: 'Mind Map', icon: Network },
  ] as const;

  const displayName = currentUser?.name || currentUser?.username || 'Siswa Hebat';
  const displayUsername = currentUser?.username ? `@${currentUser.username}` : 'siswa@ruangbelajar.id';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-slate-900/40 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-100">
          <div
            className="cursor-pointer"
            onClick={() => {
              onSelectTab('dashboard');
              onCloseMobile?.();
            }}
          >
            <AppLogo size="md" />
          </div>

          {/* Close button for mobile */}
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Main Navigation Links */}
        <nav className="flex-1 px-4 py-5 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => {
                  onSelectTab(item.key);
                  onCloseMobile?.();
                }}
                className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all text-left cursor-pointer ${
                  isActive
                    ? 'bg-sky-50 text-sky-600 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon
                  className={`w-5 h-5 transition-colors ${
                    isActive ? 'text-sky-500' : 'text-slate-400 group-hover:text-slate-600'
                  }`}
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Database Status Indicator */}
        <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/70">
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
              Firebase Firestore
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
              Cloud Sync
            </span>
          </div>
        </div>

        {/* User Profile Card (Matches Image 4, now fully interactive) */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 relative" ref={userMenuRef}>
          <div
            onClick={() => setIsUserMenuOpen((prev) => !prev)}
            className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 rounded-full bg-sky-500 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                {initial}
              </div>
              <div className="flex flex-col text-left truncate">
                <span className="text-sm font-semibold text-slate-800 truncate">{displayName}</span>
                <span className="text-xs text-slate-400 truncate max-w-[120px]">{displayUsername}</span>
              </div>
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
          </div>

          {/* User Popover Menu */}
          {isUserMenuOpen && (
            <div className="absolute bottom-full left-4 right-4 mb-2 bg-white rounded-2xl border border-slate-200 shadow-xl p-2 z-50 animate-fadeIn">
              <div className="px-3 py-2 border-b border-slate-100 mb-1">
                <p className="text-xs font-bold text-slate-800">{displayName}</p>
                <p className="text-[11px] text-slate-400 truncate">{displayUsername}</p>
              </div>

              {onSwitchAccount && (
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    onSwitchAccount();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
                >
                  <UserPlus className="w-4 h-4 text-sky-500" />
                  <span>Ganti / Masuk Akun Lain</span>
                </button>
              )}

              {onLogout && (
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    onLogout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-red-500" />
                  <span>Keluar dari Akun</span>
                </button>
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
