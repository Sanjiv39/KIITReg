import { adminDb } from "@/lib/firebase/admin";

export interface User {
  id: string; // Firebase Auth UID
  name: string;
  email: string;
  role: "ADMIN" | "USER";
  photoURL?: string;
  createdAt: string;
  lastLoginAt: string;
  updatedAt: string;
}

export interface Settings {
  id: string; // "global"
  google_meet_link: string;
  updatedAt: string;
}

export interface Question {
  id: string;
  text: string;
  options: string[]; // Options array
  correct_answer: number;
  updatedAt: string;
}

export interface Result {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  score: number;
  answers?: Record<string, number>;
  completed_at: string;
}

const usersCollection = adminDb.collection("users");
const settingsCollection = adminDb.collection("settings");
const questionsCollection = adminDb.collection("questions");
const resultsCollection = adminDb.collection("results");

// --- User CRUD ---
export async function getUser(uid: string): Promise<User | null> {
  const doc = await usersCollection.doc(uid).get();
  if (!doc.exists) return null;
  const data = doc.data();
  return {
    id: uid,
    name: data?.displayName || data?.name || "",
    email: data?.email || "",
    role: data?.role === "admin" || data?.role === "ADMIN" ? "ADMIN" : "USER",
    photoURL: data?.photoURL || "",
    createdAt: data?.createdAt || "",
    lastLoginAt: data?.lastLoginAt || "",
    updatedAt: data?.updatedAt || "",
  };
}

export async function syncUser(
  uid: string,
  data: { name: string; email: string; photoURL?: string; role?: "ADMIN" | "USER" }
): Promise<User> {
  const userRef = usersCollection.doc(uid);
  const doc = await userRef.get();
  const nowIso = new Date().toISOString();

  if (!doc.exists) {
    const newUser: User = {
      id: uid,
      name: data.name,
      email: data.email,
      role: data.role || "USER",
      photoURL: data.photoURL || "",
      createdAt: nowIso,
      lastLoginAt: nowIso,
      updatedAt: nowIso,
    };
    await userRef.set(newUser);
    return newUser;
  } else {
    const existing = doc.data();
    // Normalize role string format to uppercase
    const currentRole = existing?.role === "admin" || existing?.role === "ADMIN" ? "ADMIN" : "USER";
    const updatedUser: User = {
      id: uid,
      name: data.name ?? (existing?.displayName || existing?.name || ""),
      email: data.email ?? existing?.email ?? "",
      photoURL: data.photoURL ?? existing?.photoURL ?? "",
      role: data.role ?? currentRole,
      createdAt: existing?.createdAt || nowIso,
      lastLoginAt: nowIso,
      updatedAt: nowIso,
    };
    await userRef.set(updatedUser, { merge: true });
    return updatedUser;
  }
}

// --- Settings CRUD ---
export async function getSettings(): Promise<Settings | null> {
  const doc = await settingsCollection.doc("global").get();
  if (!doc.exists) return null;
  return doc.data() as Settings;
}

export async function updateGoogleMeetLink(link: string): Promise<Settings> {
  const settingsRef = settingsCollection.doc("global");
  const nowIso = new Date().toISOString();
  const newSettings = {
    id: "global",
    google_meet_link: link,
    updatedAt: nowIso,
  };
  await settingsRef.set(newSettings, { merge: true });
  return newSettings;
}

export async function seedQuestionsIfEmpty(): Promise<void> {
  const snapshot = await questionsCollection.limit(1).get();
  if (snapshot.empty) {
    const dummyQuestions = [
      {
        text: "What does HTML stand for?",
        options: ["Hyper Text Markup Language", "High Text Markup Language", "Hyper Tabular Markup Language", "None of the above"],
        correct_answer: 0,
      },
      {
        text: "Which of the following is a CSS framework?",
        options: ["React JS", "Django", "Tailwind CSS", "Express JS"],
        correct_answer: 2,
      },
      {
        text: "What is the purpose of Next.js 'use client' directive?",
        options: [
          "To run code exclusively on the client side",
          "To run code exclusively on the server side",
          "To register client libraries",
          "To optimize images",
        ],
        correct_answer: 0,
      },
    ];
    for (const q of dummyQuestions) {
      const nowIso = new Date().toISOString();
      await questionsCollection.add({
        ...q,
        updatedAt: nowIso,
      });
    }
  }
}

// --- Question CRUD ---
export async function getQuestions(): Promise<Question[]> {
  await seedQuestionsIfEmpty();
  const snapshot = await questionsCollection.get();
  const list: Question[] = [];
  snapshot.forEach((doc) => {
    list.push({ id: doc.id, ...doc.data() } as Question);
  });
  return list;
}

export async function addQuestion(data: Omit<Question, "id" | "updatedAt">): Promise<Question> {
  const nowIso = new Date().toISOString();
  const docRef = await questionsCollection.add({
    ...data,
    updatedAt: nowIso,
  });
  return {
    id: docRef.id,
    ...data,
    updatedAt: nowIso,
  };
}

export async function updateQuestion(id: string, data: Partial<Omit<Question, "id" | "updatedAt">>): Promise<void> {
  const nowIso = new Date().toISOString();
  await questionsCollection.doc(id).update({
    ...data,
    updatedAt: nowIso,
  });
}

export async function deleteQuestion(id: string): Promise<void> {
  await questionsCollection.doc(id).delete();
}

// --- Result CRUD ---
export async function getUserResult(userId: string): Promise<Result | null> {
  const snapshot = await resultsCollection.where("user_id", "==", userId).limit(1).get();
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() } as Result;
}

export async function saveResult(data: Omit<Result, "id" | "completed_at">): Promise<Result> {
  const nowIso = new Date().toISOString();
  const docRef = await resultsCollection.add({
    ...data,
    completed_at: nowIso,
  });
  return {
    id: docRef.id,
    ...data,
    completed_at: nowIso,
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
