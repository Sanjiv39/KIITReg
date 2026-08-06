import { adminDb } from "@/lib/firebase/admin";

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
  updatedAt?: string;
}

const eventsCollection = adminDb.collection("events");

export async function getEvents(): Promise<Event[]> {
  const snapshot = await eventsCollection.get();
  const list: Event[] = [];
  snapshot.forEach((doc) => {
    list.push({ id: doc.id, ...doc.data() } as Event);
  });
  return list;
}

export async function addEvent(data: Omit<Event, "id" | "createdAt" | "updatedAt">): Promise<Event> {
  const docRef = eventsCollection.doc();
  const id = docRef.id;
  const nowIso = new Date().toISOString();
  
  const eventData = {
    ...data,
    quizId: data.category.toUpperCase() === "QUIZ" ? id : data.quizId,
    createdAt: nowIso,
    updatedAt: nowIso,
  };

  await docRef.set(eventData);

  return {
    id,
    ...eventData,
  } as Event;
}

export async function updateEvent(id: string, data: Partial<Omit<Event, "id" | "createdAt" | "updatedAt">>): Promise<void> {
  const nowIso = new Date().toISOString();
  await eventsCollection.doc(id).update({
    ...data,
    updatedAt: nowIso,
  });
}

export async function deleteEvent(id: string): Promise<void> {
  await eventsCollection.doc(id).delete();
}
