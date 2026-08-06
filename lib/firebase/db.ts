import { adminDb } from "@/lib/firebase/admin";
import fs from "fs";
import path from "path";

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
  quizId?: string;
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
  quizId?: string;
}

export interface Event {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  location?: string;
  description?: string;
  category: string;
  status: "upcoming" | "completed";
  hasQuiz: boolean;
  link?: string;
  quizId?: string;
  createdAt?: string;
}

export interface Registration {
  id: string;
  userId: string;
  eventId: string;
  registeredAt: string;
}

const usersCollection = adminDb.collection("users");
const settingsCollection = adminDb.collection("settings");
const questionsCollection = adminDb.collection("questions");
const resultsCollection = adminDb.collection("results");
const eventsCollection = adminDb.collection("events");
const registrationsCollection = adminDb.collection("registrations");

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

function checkIfAdmin(email: string): boolean {
  try {
    if (!email || !email.toLowerCase().endsWith("@kiit.ac.in")) return false;
    const prefix = email.split("@")[0].toLowerCase();
    const adminsPath = path.join(process.cwd(), "lib/data/admins.json");
    if (fs.existsSync(adminsPath)) {
      const content = fs.readFileSync(adminsPath, "utf8");
      const adminNames: string[] = JSON.parse(content);
      return adminNames.some((name) => name.toLowerCase() === prefix);
    }
  } catch (err) {
    console.error("Error reading admins.json:", err);
  }
  return false;
}

export async function syncUser(
  uid: string,
  data: { name: string; email: string; photoURL?: string; role?: "ADMIN" | "USER" }
): Promise<User> {
  const userRef = usersCollection.doc(uid);
  const doc = await userRef.get();
  const nowIso = new Date().toISOString();

  const isAdmin = checkIfAdmin(data.email);
  const roleFromParams = data.role || (isAdmin ? "ADMIN" : "USER");

  if (!doc.exists) {
    const newUser: User = {
      id: uid,
      name: data.name,
      email: data.email,
      role: roleFromParams,
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
    const finalRole = isAdmin ? "ADMIN" : (data.role ?? currentRole);
    const updatedUser: User = {
      id: uid,
      name: data.name ?? (existing?.displayName || existing?.name || ""),
      email: data.email ?? existing?.email ?? "",
      photoURL: data.photoURL ?? existing?.photoURL ?? "",
      role: finalRole,
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
export async function getQuestions(quizId?: string): Promise<Question[]> {
  await seedQuestionsIfEmpty();
  let query: any = questionsCollection;
  if (quizId) {
    query = query.where("quizId", "==", quizId);
  }
  const snapshot = await query.get();
  const list: Question[] = [];
  snapshot.forEach((doc: any) => {
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
export async function getUserResult(userId: string, quizId?: string): Promise<Result | null> {
  let query: any = resultsCollection.where("user_id", "==", userId);
  if (quizId) {
    query = query.where("quizId", "==", quizId);
  }
  const snapshot = await query.limit(1).get();
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

// --- Events CRUD ---
export async function getEvents(): Promise<Event[]> {
  const snapshot = await eventsCollection.get();
  if (snapshot.empty) {
    // Seed default completed event
    const defaultEvent = {
      title: "Web Dev Workshop",
      date: "Aug 05, 2026",
      startTime: "02:00 PM",
      endTime: "05:00 PM",
      location: "Lab 3, Block C",
      description: "Hands-on workshop covering modern web development with React and Next.js.",
      category: "Workshop",
      status: "completed" as const,
      hasQuiz: true,
      createdAt: new Date().toISOString(),
    };
    const docRef = await eventsCollection.add(defaultEvent);
    return [{ id: docRef.id, ...defaultEvent }];
  }

  const list: Event[] = [];
  snapshot.forEach((doc) => {
    list.push({ id: doc.id, ...doc.data() } as Event);
  });
  return list;
}

export async function addEvent(data: Omit<Event, "id">): Promise<Event> {
  const docRef = eventsCollection.doc();
  const id = docRef.id;
  
  const eventData = {
    ...data,
    quizId: data.category.toUpperCase() === "QUIZ" ? id : data.quizId,
    createdAt: new Date().toISOString(),
  };

  await docRef.set(eventData);

  return {
    id,
    ...eventData,
  } as Event;
}

export async function updateEvent(id: string, data: Partial<Omit<Event, "id" | "createdAt">>): Promise<void> {
  await eventsCollection.doc(id).update(data);
}

export async function deleteEvent(id: string): Promise<void> {
  await eventsCollection.doc(id).delete();
}

// --- Registrations CRUD ---
export async function getUserRegistrations(userId: string): Promise<string[]> {
  const snapshot = await registrationsCollection.where("userId", "==", userId).get();
  const list: string[] = [];
  snapshot.forEach((doc) => {
    const reg = doc.data();
    if (reg.eventId) list.push(reg.eventId);
  });
  return list;
}

export async function registerUserForEvent(userId: string, eventId: string): Promise<void> {
  const id = `${userId}_${eventId}`;
  await registrationsCollection.doc(id).set({
    userId,
    eventId,
    registeredAt: new Date().toISOString(),
  });
}
