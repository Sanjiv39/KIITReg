import { adminDb } from "@/lib/firebase/admin";

export interface Registration {
  id: string;
  userId: string;
  eventId: string;
  createdAt: string;
  updatedAt: string;
}

const registrationsCollection = adminDb.collection("registrations");

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
  const nowIso = new Date().toISOString();
  await registrationsCollection.doc(id).set({
    userId,
    eventId,
    registeredAt: nowIso,
    createdAt: nowIso,
    updatedAt: nowIso,
  });
}
