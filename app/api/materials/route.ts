import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, doc, getDocs, writeBatch } from 'firebase/firestore';

// In-memory cache for ultra-fast response within the active container instance
const memoryMaterialsCache = new Map<string, any[]>();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get('username')?.toLowerCase() || 'default';

  try {
    // 1. Fetch from Firebase Firestore isolated user collection
    const materialsCol = collection(db, 'users', username, 'materials');
    const snapshot = await getDocs(materialsCol);

    if (!snapshot.empty) {
      const firestoreMaterials = snapshot.docs.map(d => d.data());
      // Keep memory cache updated
      memoryMaterialsCache.set(username, firestoreMaterials);

      return NextResponse.json({ materials: firestoreMaterials, source: 'firebase_firestore' });
    }
  } catch (err) {
    console.warn('[Firebase Firestore] GET error, fallback to memory cache:', err);
  }

  // Fallback to in-memory cache if Firestore is empty or cold
  const userMaterials = memoryMaterialsCache.get(username) || [];
  return NextResponse.json({ materials: userMaterials, source: 'memory_cache' });
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

    // 2. Keep in memory cache for immediate local retrieval
    memoryMaterialsCache.set(cleanUser, cleanMaterials);

    return NextResponse.json({ success: true, materials: cleanMaterials });
  } catch (err: any) {
    console.error('[API Materials] Unhandled error:', err);
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}
