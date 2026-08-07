import "server-only";

import {
  initializeApp,
  cert,
  applicationDefault,
  getApps,
} from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

if (!getApps().length) {
  const projectId =
    process.env.FIREBASE_PROJECT_ID ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
    "sca-kdev";
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
    : undefined;

  if (clientEmail && privateKey) {
    initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    // Support local dev via GOOGLE_APPLICATION_CREDENTIALS pointing to a service account JSON file
    initializeApp({
      credential: applicationDefault(),
      projectId,
    });
  } else {
    // Do NOT silently fall back — verifyIdToken will fail without credentials.
    // Throw a clear, actionable error instead.
    throw new Error(
      "Firebase Admin SDK requires service account credentials. " +
        "Set FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY in your environment " +
        "(or GOOGLE_APPLICATION_CREDENTIALS pointing to a service account JSON file). " +
        "See .env.local.example for reference.",
    );
  }
}

export const adminAuth = getAuth();
export const adminDb = getFirestore();
try {
  adminDb.settings({ ignoreUndefinedProperties: true });
} catch (e) {
  // Ignore settings overwrite errors during hot-reloading in dev server
}
