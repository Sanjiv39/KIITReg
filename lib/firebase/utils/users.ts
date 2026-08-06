import { adminDb } from "@/lib/firebase/admin";
import adminList from "@/lib/data/admins.json";

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

const usersCollection = adminDb.collection("users");

function checkIfAdmin(email: string): boolean {
  if (!email || !email.toLowerCase().endsWith("@kiit.ac.in")) return false;
  const prefix = email.split("@")[0].toLowerCase();
  return adminList.some((name: string) => name.toLowerCase() === prefix);
}

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
