import * as fs from "fs";
import * as path from "path";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Load environment variables from .env.local or .env
function loadEnv(): void {
  const envPaths = [
    path.join(__dirname, "../.env.local"),
    path.join(__dirname, "../.env")
  ];
  let loaded = false;
  for (const envPath of envPaths) {
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf8");
      content.split(/\r?\n/).forEach((line: string) => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
          const eqIdx = trimmed.indexOf("=");
          const key = trimmed.substring(0, eqIdx).trim();
          let val = trimmed.substring(eqIdx + 1).trim();
          // Remove wrapping quotes
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.substring(1, val.length - 1);
          }
          process.env[key] = val;
        }
      });
      console.log(`Loaded environment credentials from: ${path.basename(envPath)}`);
      loaded = true;
      break;
    }
  }
  if (!loaded) {
    console.warn("Warning: No .env or .env.local file found. Relying on system environment variables.");
  }
}

loadEnv();

const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "sca-kdev";
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY
  ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
  : undefined;

if (!clientEmail || !privateKey) {
  console.error("Error: Missing FIREBASE_CLIENT_EMAIL or FIREBASE_PRIVATE_KEY in env configuration.");
  process.exit(1);
}

// Initialize Firebase Admin App
initializeApp({
  credential: cert({
    projectId,
    clientEmail,
    privateKey,
  })
});

const db = getFirestore();

// Read questions from questions.json
const questionsPath = path.join(__dirname, "../lib/data/questions.json");
if (!fs.existsSync(questionsPath)) {
  console.error("Error: questions.json not found in project root.");
  process.exit(1);
}

interface JsonQuestion {
  text: string;
  options: string[];
  correct_answer: number;
}

const questions: JsonQuestion[] = JSON.parse(fs.readFileSync(questionsPath, "utf8"));

type PushOpts = { fresh: boolean };
async function pushQuestions(opts: Partial<PushOpts> = {}): Promise<void> {
  const collection = db.collection("questions");

  if (opts?.fresh) {
    console.log("Option --fresh detected. Clearing existing questions...");
    const snapshot = await collection.get();
    const batch = db.batch();
    snapshot.docs.map((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();
    console.log("Cleared all existing questions from Firestore.");

    console.log("Clearing all existing quiz results from Firestore...");
    const resultsRef = db.collection("results");
    const resultsSnapshot = await resultsRef.get();
    const resultsBatch = db.batch();
    resultsSnapshot.docs.map((doc) => {
      resultsBatch.delete(doc.ref);
    });
    await resultsBatch.commit();
    console.log("Cleared all existing quiz results from Firestore.");
  }

  console.log(`Found ${questions.length} questions. Pushing new ones...`);

  for (const q of questions) {
    const nowIso = new Date().toISOString();
    const docData = {
      text: q.text,
      options: q.options,
      correct_answer: q.correct_answer,
      updatedAt: nowIso
    };

    const docRef = await collection.add(docData);
    console.log(`Successfully pushed: "${q.text.substring(0, 40)}..." -> ID: ${docRef.id}`);
  }

  console.log("All questions successfully synced into Firestore!");
}

const isFresh = true

pushQuestions({ fresh: isFresh }).catch((err: unknown) => {
  console.error("Script failed with error:", err);
  process.exit(1);
});
