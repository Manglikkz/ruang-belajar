'use client';

import React, { useState, useEffect, useSyncExternalStore, useMemo } from 'react';
import { Material } from '@/lib/types';
import { useCurrentUser, logoutUser, UserAccount } from '@/lib/auth';
import { LandingPage } from '@/components/LandingPage';
import { Sidebar, NavItemKey } from '@/components/Sidebar';
import { Dashboard } from '@/components/Dashboard';
import { MaterialWorkspace, WorkspaceTabKey } from '@/components/MaterialWorkspace';
import { MaterialsListView } from '@/components/MaterialsListView';
import { UploadModal } from '@/components/UploadModal';
import { AuthModal } from '@/components/AuthModal';
import { CreditCard, HelpCircle, Network, UploadCloud } from 'lucide-react';

function subscribeToMaterials(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('storage', callback);
  window.addEventListener('rb_materials_change', callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('rb_materials_change', callback);
  };
}

export default function Home() {
  const currentUser = useCurrentUser();

  // Auth modal state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  // App navigation state
  const [currentNav, setCurrentNav] = useState<NavItemKey>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Fetch materials from server database on mount or user change
  useEffect(() => {
    if (currentUser?.username) {
      fetch(`/api/materials?username=${encodeURIComponent(currentUser.username)}`)
        .then(res => res.json())
        .then(data => {
          if (data && Array.isArray(data.materials)) {
            const storageKey = `rb_user_materials_${currentUser.username.toLowerCase()}`;
            localStorage.setItem(storageKey, JSON.stringify(data.materials));
            window.dispatchEvent(new Event('rb_materials_change'));
          }
        })
        .catch(err => console.error('Failed to load materials from database', err));
    }
  }, [currentUser?.username]);

  // Materials data subscribed from localStorage for the active user
  const materialsRaw = useSyncExternalStore(
    subscribeToMaterials,
    () => {
      if (!currentUser || typeof window === 'undefined') return '[]';
      return localStorage.getItem(`rb_user_materials_${currentUser.username.toLowerCase()}`) || '[]';
    },
    () => '[]'
  );

  const materials: Material[] = useMemo(() => {
    try {
      const parsed = JSON.parse(materialsRaw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [materialsRaw]);

  const [activeMaterialId, setActiveMaterialId] = useState<string | null>(null);
  const [workspaceTab, setWorkspaceTab] = useState<WorkspaceTabKey>('flashcard');

  // Upload modal
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Save to local storage and server database on update for the active user
  const saveMaterials = (updated: Material[]) => {
    if (!currentUser || typeof window === 'undefined') return;
    try {
      const storageKey = `rb_user_materials_${currentUser.username.toLowerCase()}`;
      localStorage.setItem(storageKey, JSON.stringify(updated));
      window.dispatchEvent(new Event('rb_materials_change'));

      // Save to server database API
      fetch('/api/materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: currentUser.username, materials: updated })
      }).catch(err => console.error('Failed to sync materials with database', err));
    } catch (e) {
      console.error('Failed to save materials', e);
    }
  };

  const handleAuthSuccess = (_user: UserAccount, isNewUser: boolean) => {
    if (isNewUser && typeof window !== 'undefined') {
      try {
        localStorage.setItem(`rb_user_materials_${_user.username.toLowerCase()}`, JSON.stringify([]));
        window.dispatchEvent(new Event('rb_materials_change'));
      } catch {
        // ignore
      }
    }
    setActiveMaterialId(null);
    setCurrentNav('dashboard');
  };

  const handleLogout = () => {
    logoutUser();
    setActiveMaterialId(null);
  };

  const handleSwitchAccount = () => {
    setAuthModalMode('login');
    setIsAuthModalOpen(true);
  };

  const handleOpenMaterial = (materialId: string, initialTab: WorkspaceTabKey = 'flashcard') => {
    setActiveMaterialId(materialId);
    setWorkspaceTab(initialTab);
    if (initialTab === 'flashcard' || initialTab === 'quiz' || initialTab === 'mindmap') {
      setCurrentNav(initialTab);
    } else {
      setCurrentNav('materials');
    }
  };

  const handleUpdateActiveMaterial = (updated: Material) => {
    const nextList = materials.map((m) => (m.id === updated.id ? updated : m));
    saveMaterials(nextList);
  };

  const handleMaterialCreated = (newMat: Material) => {
    const nextList = [newMat, ...materials];
    saveMaterials(nextList);
    setActiveMaterialId(newMat.id);
    setWorkspaceTab('flashcard');
    setCurrentNav('flashcard');
  };

  const handleDeleteMaterial = (id: string) => {
    const nextList = materials.filter((m) => m.id !== id);
    saveMaterials(nextList);
    if (activeMaterialId === id) {
      setActiveMaterialId(null);
    }
  };

  // Find active material object
  const activeMaterial = (activeMaterialId && materials.find((m) => m.id === activeMaterialId)) || materials[0] || null;

  // If user is not logged in: show Landing Page
  if (!currentUser) {
    return (
      <>
        <LandingPage
          onStartLearning={() => {
            setAuthModalMode('register');
            setIsAuthModalOpen(true);
          }}
          onLogin={() => {
            setAuthModalMode('login');
            setIsAuthModalOpen(true);
          }}
          onOpenSampleMaterial={() => {
            setAuthModalMode('register');
            setIsAuthModalOpen(true);
          }}
        />

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onAuthSuccess={handleAuthSuccess}
          initialMode={authModalMode}
        />
      </>
    );
  }

  // Logged-in App View with Sidebar
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex text-slate-800 selection:bg-sky-100 selection:text-sky-800">
      {/* Persistent Left Sidebar */}
      <Sidebar
        currentTab={currentNav}
        currentUser={currentUser}
        onLogout={handleLogout}
        onSwitchAccount={handleSwitchAccount}
        onSelectTab={(tab) => {
          setCurrentNav(tab);

          if (tab === 'dashboard' || tab === 'materials') {
            setActiveMaterialId(null);
          } else if (tab === 'flashcard' || tab === 'quiz' || tab === 'mindmap') {
            setWorkspaceTab(tab);
            if (materials.length > 0) {
              const targetMat = (activeMaterialId && materials.find((m) => m.id === activeMaterialId)) || materials[0];
              setActiveMaterialId(targetMat.id);
            } else {
              setActiveMaterialId(null);
            }
          }
        }}
        isOpenMobile={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        {/* If user is inside a specific material workspace */}
        {activeMaterialId && activeMaterial ? (
          <MaterialWorkspace
            key={activeMaterial.id}
            material={activeMaterial}
            activeTab={workspaceTab}
            onTabChange={(tab) => {
              setWorkspaceTab(tab);
              if (tab === 'flashcard' || tab === 'quiz' || tab === 'mindmap') {
                setCurrentNav(tab);
              }
            }}
            onBackToDashboard={() => {
              setActiveMaterialId(null);
              setCurrentNav('dashboard');
            }}
            onUpdateMaterial={handleUpdateActiveMaterial}
          />
        ) : (
          <>
            {/* 1. Dashboard View */}
            {currentNav === 'dashboard' && (
              <Dashboard
                materials={materials}
                currentUser={currentUser}
                onLogout={handleLogout}
                onSwitchAccount={handleSwitchAccount}
                onOpenMaterial={(id) => handleOpenMaterial(id, 'flashcard')}
                onOpenUploadModal={() => setIsUploadModalOpen(true)}
                onViewAllMaterials={() => setCurrentNav('materials')}
                onOpenMobileMenu={() => setMobileMenuOpen(true)}
              />
            )}

            {/* 2. Materi Saya View */}
            {currentNav === 'materials' && (
              <MaterialsListView
                materials={materials}
                onOpenMaterial={(id) => handleOpenMaterial(id, 'flashcard')}
                onOpenUploadModal={() => setIsUploadModalOpen(true)}
                onDeleteMaterial={handleDeleteMaterial}
              />
            )}

            {/* 3. Flashcard Empty State (when user has no materials yet) */}
            {currentNav === 'flashcard' && materials.length === 0 && (
              <div className="flex-1 min-h-screen flex items-center justify-center p-6">
                <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-xs max-w-md w-full text-center">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-sky-50 text-sky-500 flex items-center justify-center mb-4 shadow-xs">
                    <CreditCard className="w-8 h-8" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">Belum Ada Flashcard</h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
                    Kamu belum memiliki materi belajar. Unggah materi pertama kamu agar AI otomatis membuat kumpulan flashcard tanya-jawab pintar!
                  </p>
                  <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="mt-6 px-6 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-xs shadow-sky-200 transition-colors inline-flex items-center gap-2 cursor-pointer"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>Upload Materi Sekarang</span>
                  </button>
                </div>
              </div>
            )}

            {/* 4. Kuis Empty State (when user has no materials yet) */}
            {currentNav === 'quiz' && materials.length === 0 && (
              <div className="flex-1 min-h-screen flex items-center justify-center p-6">
                <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-xs max-w-md w-full text-center">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-sky-50 text-sky-500 flex items-center justify-center mb-4 shadow-xs">
                    <HelpCircle className="w-8 h-8" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">Belum Ada Kuis</h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
                    Kamu belum memiliki materi belajar. Unggah materi pertama kamu agar AI otomatis membuat kuis pilihan ganda lengkap dengan pembahasannya!
                  </p>
                  <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="mt-6 px-6 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-xs shadow-sky-200 transition-colors inline-flex items-center gap-2 cursor-pointer"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>Upload Materi Sekarang</span>
                  </button>
                </div>
              </div>
            )}

            {/* 5. Mind Map Empty State (when user has no materials yet) */}
            {currentNav === 'mindmap' && materials.length === 0 && (
              <div className="flex-1 min-h-screen flex items-center justify-center p-6">
                <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-xs max-w-md w-full text-center">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-sky-50 text-sky-500 flex items-center justify-center mb-4 shadow-xs">
                    <Network className="w-8 h-8" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">Belum Ada Mind Map</h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
                    Kamu belum memiliki materi belajar. Unggah materi pertamamu agar AI otomatis merangkum bagan konsep interaktif!
                  </p>
                  <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="mt-6 px-6 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-xs shadow-sky-200 transition-colors inline-flex items-center gap-2 cursor-pointer"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>Upload Materi Sekarang</span>
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Global Upload Modal */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onMaterialCreated={handleMaterialCreated}
      />

      {/* Auth Modal (Login / Register with Username & Password only) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        initialMode={authModalMode}
      />
    </div>
  );
}
