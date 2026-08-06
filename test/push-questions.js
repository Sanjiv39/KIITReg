const fs = require("fs");
const path = require("path");

// Load environment variables from .env.local or .env
function loadEnv() {
  const envPaths = [
    path.join(__dirname, "../.env.local"),
    path.join(__dirname, "../.env")
  ];
  let loaded = false;
  for (const envPath of envPaths) {
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf8");
      content.split(/\r?\n/).forEach((line) => {
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

const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

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
const questionsPath = path.join(__dirname, "../questions.json");
if (!fs.existsSync(questionsPath)) {
  console.error("Error: questions.json not found in project root.");
  process.exit(1);
}

const questions = JSON.parse(fs.readFileSync(questionsPath, "utf8"));

async function pushQuestions() {
  const collection = db.collection("questions");
  console.log(`Found ${questions.length} questions. Clearing existing questions or pushing new ones...`);
  
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

pushQuestions().catch((err) => {
  console.error("Script failed with error:", err);
  process.exit(1);
});
