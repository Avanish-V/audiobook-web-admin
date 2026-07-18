import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { getDb } from "./firebase";

export interface Chapter {
  title: string;
  audioUrl: string;
  duration?: string; // e.g. "12:34"
}

export interface Audiobook {
  id: string;
  title: string;
  author: string;
  narrator?: string;
  description?: string;
  coverUrl?: string;
  language?: string;
  published: boolean;
  chapters: Chapter[];
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
}

export type AudiobookInput = Omit<Audiobook, "id" | "createdAt" | "updatedAt">;

const COL = "audiobooks";

export async function listAudiobooks(): Promise<Audiobook[]> {
  const snap = await getDocs(query(collection(getDb(), COL), orderBy("createdAt", "desc")));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Audiobook, "id">) }));
}

export async function getAudiobook(id: string): Promise<Audiobook | null> {
  const s = await getDoc(doc(getDb(), COL, id));
  return s.exists() ? ({ id: s.id, ...(s.data() as Omit<Audiobook, "id">) }) : null;
}

export async function createAudiobook(data: AudiobookInput): Promise<string> {
  const ref = await addDoc(collection(getDb(), COL), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateAudiobook(id: string, data: Partial<AudiobookInput>): Promise<void> {
  await updateDoc(doc(getDb(), COL, id), { ...data, updatedAt: serverTimestamp() });
}

export async function deleteAudiobook(id: string): Promise<void> {
  await deleteDoc(doc(getDb(), COL, id));
}
