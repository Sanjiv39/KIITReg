import { adminDb } from "@/lib/firebase/admin";

export interface Result {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  score: number;
  answers?: Record<string, number>;
  completed_at: string;
  quizId?: string;
  createdAt?: string;
  updatedAt?: string;
}

const resultsCollection = adminDb.collection("results");

export async function getUserResult(userId: string, quizId?: string): Promise<Result | null> {
  let query = resultsCollection.where("user_id", "==", userId);
  if (quizId) {
    query = query.where("quizId", "==", quizId);
  }
  const snapshot = await query.limit(1).get();
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() } as Result;
}

export async function saveResult(data: Omit<Result, "id" | "completed_at" | "createdAt" | "updatedAt">): Promise<Result> {
  const nowIso = new Date().toISOString();
  const docRef = await resultsCollection.add({
    ...data,
    completed_at: nowIso,
    createdAt: nowIso,
    updatedAt: nowIso,
  });
  return {
    id: docRef.id,
    ...data,
    completed_at: nowIso,
    createdAt: nowIso,
    updatedAt: nowIso,
  };
}

export async function getAllResults(): Promise<Result[]> {
  const snapshot = await resultsCollection.orderBy("completed_at", "desc").get();
  const list: Result[] = [];
  snapshot.forEach((doc) => {
    list.push({ id: doc.id, ...doc.data() } as Result);
  });
  return list;
}
