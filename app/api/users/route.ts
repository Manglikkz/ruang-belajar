import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, getDocs, collection } from 'firebase/firestore';

// In-memory cache for fast lookup within the container instance
const memoryUsersCache = new Map<string, any>();

export async function GET() {
  try {
    const usersCol = collection(db, 'users');
    const snapshot = await getDocs(usersCol);
    if (!snapshot.empty) {
      const users = snapshot.docs.map(d => {
        const data = d.data();
        memoryUsersCache.set(data.username.toLowerCase(), data);
        return { username: data.username, name: data.name, createdAt: data.createdAt };
      });
      return NextResponse.json({ users, source: 'firebase_firestore' });
    }
  } catch (err) {
    console.warn('[Firebase Firestore] GET users error:', err);
  }

  // Return from in-memory cache if available
  const cachedUsers = Array.from(memoryUsersCache.values()).map(u => ({
    username: u.username,
    name: u.name,
    createdAt: u.createdAt
  }));
  return NextResponse.json({ users: cachedUsers, source: 'memory_cache' });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, username, password } = body;

    const cleanUsername = (username || '').trim().toLowerCase();
    if (!cleanUsername) {
      return NextResponse.json({ success: false, error: 'Username diperlukan' }, { status: 400 });
    }

    if (action === 'register') {
      if (cleanUsername.length < 3) {
        return NextResponse.json({ success: false, error: 'Username minimal 3 karakter' }, { status: 400 });
      }
      if (!password || password.length < 4) {
        return NextResponse.json({ success: false, error: 'Password minimal 4 karakter' }, { status: 400 });
      }

      // 1. Check in memory cache first
      if (memoryUsersCache.has(cleanUsername)) {
        return NextResponse.json({
          success: false,
          error: 'Username sudah terdaftar. Silakan gunakan username lain atau login.'
        }, { status: 400 });
      }

      // 2. Check existence in Firebase Firestore
      try {
        const userDocRef = doc(db, 'users', cleanUsername);
        const userSnap = await getDoc(userDocRef);
        if (userSnap.exists()) {
          memoryUsersCache.set(cleanUsername, userSnap.data());
          return NextResponse.json({
            success: false,
            error: 'Username sudah terdaftar di database Firebase. Silakan gunakan username lain atau login.'
          }, { status: 400 });
        }
      } catch (e) {
        console.warn('[Firebase Firestore] Check user existence error:', e);
      }

      const displayName = cleanUsername.charAt(0).toUpperCase() + cleanUsername.slice(1);
      const newUser = {
        username: cleanUsername,
        name: displayName,
        password,
        createdAt: new Date().toISOString()
      };

      // 3. Persist to Firebase Firestore
      try {
        const userDocRef = doc(db, 'users', cleanUsername);
        await setDoc(userDocRef, newUser);
        console.log(`[Firebase Firestore] User ${cleanUsername} registered successfully`);
      } catch (fsErr: any) {
        console.error('[Firebase Firestore] User create error:', fsErr);
      }

      // Keep in memory cache
      memoryUsersCache.set(cleanUsername, newUser);

      return NextResponse.json({
        success: true,
        user: { username: newUser.username, name: newUser.name, createdAt: newUser.createdAt }
      });
    }

    if (action === 'login') {
      let foundUser: any = memoryUsersCache.get(cleanUsername) || null;

      // Check Firebase Firestore if not in memory
      if (!foundUser) {
        try {
          const userDocRef = doc(db, 'users', cleanUsername);
          const userSnap = await getDoc(userDocRef);
          if (userSnap.exists()) {
            foundUser = userSnap.data();
            memoryUsersCache.set(cleanUsername, foundUser);
          }
        } catch (e) {
          console.warn('[Firebase Firestore] Login getDoc error:', e);
        }
      }

      if (!foundUser) {
        return NextResponse.json({
          success: false,
          error: 'Username tidak ditemukan di database. Silakan daftar terlebih dahulu.'
        }, { status: 404 });
      }

      if (foundUser.password && foundUser.password !== password) {
        return NextResponse.json({
          success: false,
          error: 'Password salah. Silakan coba lagi.'
        }, { status: 401 });
      }

      return NextResponse.json({
        success: true,
        user: { username: foundUser.username, name: foundUser.name, createdAt: foundUser.createdAt }
      });
    }

    return NextResponse.json({ success: false, error: 'Aksi tidak valid' }, { status: 400 });
  } catch (err: any) {
    console.error('[API Users] Unhandled error:', err);
    return NextResponse.json({ success: false, error: err?.message || 'Server error' }, { status: 500 });
  }
}
