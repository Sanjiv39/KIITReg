import { NextResponse, NextRequest } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";
import { getUser, getQuestions, addQuestion, updateQuestion, deleteQuestion } from "@/lib/firebase/db";

// Helper: Verify if the request is made by an ADMIN
async function verifyAdmin(request: NextRequest): Promise<string | null> {
  const authHeader = request.headers.get("Authorization");
  const bearerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.split("Bearer ")[1]
    : null;

  if (!bearerToken) return null;

  try {
    const decodedToken = await adminAuth.verifyIdToken(bearerToken);
    const user = await getUser(decodedToken.uid);
    if (user?.role === "ADMIN") {
      return decodedToken.uid;
    }
  } catch {
    return null;
  }
  return null;
}

// GET: Fetch all questions (with correct answers)
export async function GET(request: NextRequest) {
  try {
    const isAdmin = await verifyAdmin(request);
    if (!isAdmin) {
      return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 403 });
    }

    const questions = await getQuestions();
    return NextResponse.json({ success: true, questions });
  } catch (error: unknown) {
    const errorDetails = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ success: false, error: errorDetails }, { status: 500 });
  }
}

// POST: Add a new question
export async function POST(request: NextRequest) {
  try {
    const isAdmin = await verifyAdmin(request);
    if (!isAdmin) {
      return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const { text, options, correct_answer } = body;

    if (!text || !Array.isArray(options) || options.length !== 4 || typeof correct_answer !== "number") {
      return NextResponse.json({ success: false, error: "Invalid question structure" }, { status: 400 });
    }

    const newQuestion = await addQuestion({
      text,
      options,
      correct_answer,
    });

    return NextResponse.json({ success: true, question: newQuestion }, { status: 201 });
  } catch (error: unknown) {
    const errorDetails = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ success: false, error: errorDetails }, { status: 500 });
  }
}

// PUT: Edit an existing question
export async function PUT(request: NextRequest) {
  try {
    const isAdmin = await verifyAdmin(request);
    if (!isAdmin) {
      return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const { id, text, options, correct_answer } = body;

    if (!id || !text || !Array.isArray(options) || options.length !== 4 || typeof correct_answer !== "number") {
      return NextResponse.json({ success: false, error: "Invalid question update parameters" }, { status: 400 });
    }

    await updateQuestion(id, {
      text,
      options,
      correct_answer,
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const errorDetails = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ success: false, error: errorDetails }, { status: 500 });
  }
}

// DELETE: Remove an existing question
export async function DELETE(request: NextRequest) {
  try {
    const isAdmin = await verifyAdmin(request);
    if (!isAdmin) {
      return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing question ID parameter" }, { status: 400 });
    }

    await deleteQuestion(id);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const errorDetails = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ success: false, error: errorDetails }, { status: 500 });
  }
}
