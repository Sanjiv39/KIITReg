import { NextResponse, NextRequest } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";
import { getQuestions, getUserResult } from "@/lib/firebase/db";

// GET: Fetch quiz results (including user answers and correct answers)
// ONLY accessible if the user has completed the quiz
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    const bearerToken = authHeader?.startsWith("Bearer ")
      ? authHeader.split("Bearer ")[1]
      : null;

    if (!bearerToken) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Missing token" },
        { status: 401 }
      );
    }

    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(bearerToken);
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    const { uid } = decodedToken;

    // Verify user has completed the quiz
    const existingResult = await getUserResult(uid);
    if (!existingResult) {
      return NextResponse.json(
        { success: false, error: "Access Denied: Quiz not completed yet" },
        { status: 403 }
      );
    }

    // Since they completed the quiz, return questions with correct_answers
    const questions = await getQuestions();

    return NextResponse.json({
      success: true,
      completed: true,
      result: existingResult,
      questions,
      totalQuestions: questions.length,
    });
  } catch (error: unknown) {
    const errorDetails = error instanceof Error ? error.message : "Server error";
    return NextResponse.json(
      { success: false, error: `Server Error: ${errorDetails}` },
      { status: 500 }
    );
  }
}
