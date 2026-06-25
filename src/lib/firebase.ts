import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  deleteDoc,
  doc,
  updateDoc,
  Timestamp,
} from 'firebase/firestore';
import type { WordEntry } from '../types';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

const COLLECTION = 'vocab_words';

export async function saveWord(entry: Omit<WordEntry, 'id'>): Promise<string> {
  // Firestore rejects `undefined` values — strip them before writing
  const raw = { ...entry, createdAt: Timestamp.now().toMillis() };
  const data = Object.fromEntries(
    Object.entries(raw).filter(([, v]) => v !== undefined)
  );
  const docRef = await addDoc(collection(db, COLLECTION), data);
  return docRef.id;
}

export async function fetchAllWords(): Promise<WordEntry[]> {
  const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as WordEntry));
}

export async function deleteWord(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}

export async function updateWordGREStatus(id: string, isGREWord: boolean): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), { isGREWord });
}