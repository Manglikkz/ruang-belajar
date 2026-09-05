import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, doc, getDocs, writeBatch } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

// Fallback local file storage for offline resilience
const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'materials_db.json');

function ensureLocalDb() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({}), 'utf-8');
  }
}

function readLocalDb(): Record<string, any[]> {
  try {
    ensureLocalDb();
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function writeLocalDb(data: Record<string, any[]>) {
  ensureLocalDb();
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get('username')?.toLowerCase() || 'default';

  try {
    // 1. Fetch from Firebase Firestore isolated user collection
    const materialsCol = collection(db, 'users', username, 'materials');
    const snapshot = await getDocs(materialsCol);

    if (!snapshot.empty) {
      const firestoreMaterials = snapshot.docs.map(d => d.data());
      // Keep local cache in sync
      const local = readLocalDb();
      local[username] = firestoreMaterials;
      writeLocalDb(local);

      return NextResponse.json({ materials: firestoreMaterials, source: 'firebase_firestore' });
    }
  } catch (err) {
    console.warn('[Firebase Firestore] GET error, fallback to local:', err);
  }

  // Fallback to local cache
  const localDb = readLocalDb();
  const userMaterials = localDb[username] || [];
  return NextResponse.json({ materials: userMaterials, source: 'local_cache' });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, materials } = body;
    if (!username) {
      return NextResponse.json({ error: 'Username required' }, { status: 400 });
    }
    const cleanUser = username.toLowerCase();
    const cleanMaterials = Array.isArray(materials) ? materials : [];

    // 1. Persist to Firebase Firestore under users/{username}/materials/{materialId}
    try {
      const materialsCol = collection(db, 'users', cleanUser, 'materials');
      const existingSnap = await getDocs(materialsCol);
      const currentIds = new Set(cleanMaterials.map(m => m.id));

      const batch = writeBatch(db);

      // Remove deleted documents
      for (const docSnap of existingSnap.docs) {
        if (!currentIds.has(docSnap.id)) {
          batch.delete(docSnap.ref);
        }
      }

      // Upsert new or updated documents
      for (const mat of cleanMaterials) {
        if (mat && mat.id) {
          const docRef = doc(db, 'users', cleanUser, 'materials', mat.id);
          batch.set(docRef, mat);
        }
      }

      await batch.commit();
      console.log(`[Firebase Firestore] Successfully synced ${cleanMaterials.length} materials for user ${cleanUser}`);
    } catch (fsErr) {
      console.error('[Firebase Firestore] Write error:', fsErr);
    }

    // 2. Persist to local cache for instant zero-latency retrieval
    const local = readLocalDb();
    local[cleanUser] = cleanMaterials;
    writeLocalDb(local);

    return NextResponse.json({ success: true, materials: cleanMaterials });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
