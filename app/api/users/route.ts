import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, getDocs, collection } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

const DB_DIR = path.join(process.cwd(), 'data');
const USERS_DB_FILE = path.join(DB_DIR, 'users_db.json');

function ensureDb() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
  if (!fs.existsSync(USERS_DB_FILE)) {
    fs.writeFileSync(USERS_DB_FILE, JSON.stringify([]), 'utf-8');
  }
}

function readUsers(): any[] {
  try {
    ensureDb();
    const raw = fs.readFileSync(USERS_DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeUsers(users: any[]) {
  ensureDb();
  fs.writeFileSync(USERS_DB_FILE, JSON.stringify(users, null, 2), 'utf-8');
}

export async function GET() {
  try {
    const usersCol = collection(db, 'users');
    const snapshot = await getDocs(usersCol);
    if (!snapshot.empty) {
      const users = snapshot.docs.map(d => {
        const data = d.data();
        return { username: data.username, name: data.name, createdAt: data.createdAt };
      });
      return NextResponse.json({ users, source: 'firebase_firestore' });
    }
  } catch (err) {
    console.warn('[Firebase Firestore] GET users error:', err);
  }

  const users = readUsers();
  const safeUsers = users.map(u => ({ username: u.username, name: u.name, createdAt: u.createdAt }));
  return NextResponse.json({ users: safeUsers, source: 'local_cache' });
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

      // Check existence in Firebase Firestore
      try {
        const userDocRef = doc(db, 'users', cleanUsername);
        const userSnap = await getDoc(userDocRef);
        if (userSnap.exists()) {
          return NextResponse.json({ success: false, error: 'Username sudah terdaftar di database Firebase. Silakan gunakan username lain atau login.' }, { status: 400 });
        }
      } catch (e) {
        console.warn('[Firebase Firestore] Check user error:', e);
      }

      // Also check local cache
      const localUsers = readUsers();
      if (localUsers.some(u => u.username.toLowerCase() === cleanUsername)) {
        return NextResponse.json({ success: false, error: 'Username sudah terdaftar. Silakan gunakan username lain atau login.' }, { status: 400 });
      }

      const displayName = cleanUsername.charAt(0).toUpperCase() + cleanUsername.slice(1);
      const newUser = {
        username: cleanUsername,
        name: displayName,
        password,
        createdAt: new Date().toISOString()
      };

      // Persist to Firebase Firestore
      try {
        const userDocRef = doc(db, 'users', cleanUsername);
        await setDoc(userDocRef, newUser);
        console.log(`[Firebase Firestore] User ${cleanUsername} created successfully`);
      } catch (fsErr) {
        console.error('[Firebase Firestore] User create error:', fsErr);
      }

      // Persist to local cache
      localUsers.push(newUser);
      writeUsers(localUsers);

      return NextResponse.json({
        success: true,
        user: { username: newUser.username, name: newUser.name, createdAt: newUser.createdAt }
      });
    }

    if (action === 'login') {
      let foundUser: any = null;

      // Check Firebase Firestore
      try {
        const userDocRef = doc(db, 'users', cleanUsername);
        const userSnap = await getDoc(userDocRef);
        if (userSnap.exists()) {
          foundUser = userSnap.data();
        }
      } catch (e) {
        console.warn('[Firebase Firestore] Login getDoc error:', e);
      }

      // Fallback to local cache if not found
      if (!foundUser) {
        const localUsers = readUsers();
        foundUser = localUsers.find(u => u.username.toLowerCase() === cleanUsername);
      }

      if (!foundUser) {
        return NextResponse.json({ success: false, error: 'Username tidak ditemukan di database. Silakan daftar terlebih dahulu.' }, { status: 404 });
      }

      if (foundUser.password && foundUser.password !== password) {
        return NextResponse.json({ success: false, error: 'Password salah. Silakan coba lagi.' }, { status: 401 });
      }

      return NextResponse.json({
        success: true,
        user: { username: foundUser.username, name: foundUser.name, createdAt: foundUser.createdAt }
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Server error' }, { status: 500 });
  }
}
