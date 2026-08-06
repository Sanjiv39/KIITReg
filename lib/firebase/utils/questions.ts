import { adminDb } from "@/lib/firebase/admin";

export interface Question {
  id: string;
  text: string;
  options: string[]; // Options array
  correct_answer: number;
  quizId?: string;
  createdAt?: string;
  updatedAt: string;
}

const questionsCollection = adminDb.collection("questions");

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
        createdAt: nowIso,
        updatedAt: nowIso,
      });
    }
  }
}

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

export async function addQuestion(data: Omit<Question, "id" | "createdAt" | "updatedAt">): Promise<Question> {
  const nowIso = new Date().toISOString();
  const docRef = await questionsCollection.add({
    ...data,
    createdAt: nowIso,
    updatedAt: nowIso,
  });
  return {
    id: docRef.id,
    ...data,
    createdAt: nowIso,
    updatedAt: nowIso,
  };
}

export async function updateQuestion(id: string, data: Partial<Omit<Question, "id" | "createdAt" | "updatedAt">>): Promise<void> {
  const nowIso = new Date().toISOString();
  await questionsCollection.doc(id).update({
    ...data,
    updatedAt: nowIso,
  });
}

export async function deleteQuestion(id: string): Promise<void> {
  await questionsCollection.doc(id).delete();
}
