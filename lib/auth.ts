import { useSyncExternalStore, useMemo } from 'react';

export interface UserAccount {
  username: string;
  name: string;
  password?: string;
  createdAt: string;
}

const USERS_STORAGE_KEY = 'rb_registered_users';
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

export function getStoredUsers(): UserAccount[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to get users', e);
  }
  return [];
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

export function registerUser(username: string, password: string): { success: boolean; error?: string; user?: UserAccount } {
  const cleanUsername = username.trim().toLowerCase();
  if (!cleanUsername || cleanUsername.length < 3) {
    return { success: false, error: 'Username minimal 3 karakter' };
  }
  if (!password || password.length < 4) {
    return { success: false, error: 'Password minimal 4 karakter' };
  }

  const users = getStoredUsers();
  const existing = users.find((u) => u.username.toLowerCase() === cleanUsername);
  if (existing) {
    return { success: false, error: 'Username sudah digunakan, silakan gunakan username lain' };
  }

  const displayName = username.trim().charAt(0).toUpperCase() + username.trim().slice(1);
  const newUser: UserAccount = {
    username: cleanUsername,
    name: displayName,
    password,
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    // Set user's materials as strictly empty array [] for every new user!
    localStorage.setItem(`rb_user_materials_${cleanUsername}`, JSON.stringify([]));
    setCurrentUserSession(newUser);
  } catch (e) {
    return { success: false, error: 'Gagal menyimpan data akun' };
  }

  return { success: true, user: newUser };
}

export function loginUser(username: string, password: string): { success: boolean; error?: string; user?: UserAccount } {
  const cleanUsername = username.trim().toLowerCase();
  if (!cleanUsername) {
    return { success: false, error: 'Masukkan username' };
  }
  if (!password) {
    return { success: false, error: 'Masukkan password' };
  }

  const users = getStoredUsers();
  const found = users.find((u) => u.username.toLowerCase() === cleanUsername);

  if (!found) {
    return { success: false, error: 'Username tidak ditemukan. Silakan daftar terlebih dahulu.' };
  }

  if (found.password && found.password !== password) {
    return { success: false, error: 'Password salah. Silakan coba lagi.' };
  }

  setCurrentUserSession(found);
  return { success: true, user: found };
}

export function logoutUser() {
  setCurrentUserSession(null);
}
