import { useSyncExternalStore, useMemo } from 'react';

export interface UserAccount {
  username: string;
  name: string;
  password?: string;
  createdAt: string;
}

const CURRENT_USER_KEY = 'rb_current_user_session';

function subscribeToAuth(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('storage', callback);
  window.addEventListener('rb_auth_change', callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('rb_auth_change', callback);
  };
}

export function useCurrentUser(): UserAccount | null {
  const sessionString = useSyncExternalStore(
    subscribeToAuth,
    () => (typeof window !== 'undefined' ? localStorage.getItem(CURRENT_USER_KEY) : null),
    () => null
  );

  return useMemo(() => {
    if (!sessionString) return null;
    try {
      return JSON.parse(sessionString);
    } catch {
      return null;
    }
  }, [sessionString]);
}

export function getCurrentUser(): UserAccount | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to get current user', e);
  }
  return null;
}

export function setCurrentUserSession(user: UserAccount | null) {
  if (typeof window === 'undefined') return;
  try {
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
    window.dispatchEvent(new Event('rb_auth_change'));
  } catch (e) {
    console.error('Failed to set current user session', e);
  }
}

export async function registerUserAsync(username: string, password: string): Promise<{ success: boolean; error?: string; user?: UserAccount }> {
  const cleanUsername = username.trim().toLowerCase();
  if (!cleanUsername || cleanUsername.length < 3) {
    return { success: false, error: 'Username minimal 3 karakter' };
  }
  if (!password || password.length < 4) {
    return { success: false, error: 'Password minimal 4 karakter' };
  }

  try {
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'register', username: cleanUsername, password })
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      return { success: false, error: data.error || 'Pendaftaran gagal' };
    }

    const newUser: UserAccount = data.user;
    setCurrentUserSession(newUser);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`rb_user_materials_${cleanUsername}`, JSON.stringify([]));
    }
    return { success: true, user: newUser };
  } catch (err: any) {
    return { success: false, error: 'Gagal terhubung ke database server' };
  }
}

export async function loginUserAsync(username: string, password: string): Promise<{ success: boolean; error?: string; user?: UserAccount }> {
  const cleanUsername = username.trim().toLowerCase();
  if (!cleanUsername) {
    return { success: false, error: 'Masukkan username' };
  }
  if (!password) {
    return { success: false, error: 'Masukkan password' };
  }

  try {
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'login', username: cleanUsername, password })
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      return { success: false, error: data.error || 'Login gagal' };
    }

    const user: UserAccount = data.user;
    setCurrentUserSession(user);
    return { success: true, user };
  } catch (err: any) {
    return { success: false, error: 'Gagal terhubung ke database server' };
  }
}

export function logoutUser() {
  setCurrentUserSession(null);
}
