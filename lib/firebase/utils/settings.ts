import { adminDb } from "@/lib/firebase/admin";

export interface Settings {
  id: string; // "global"
  google_meet_link: string;
  updatedAt: string;
}

const settingsCollection = adminDb.collection("settings");

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
