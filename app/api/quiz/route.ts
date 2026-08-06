import { NextResponse, NextRequest } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";
import { getUser, getQuestions, getUserResult, saveResult } from "@/lib/firebase/db";

// GET: Fetch quiz questions (omitting correct answers)
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

    // Check if user already took the quiz
    const existingResult = await getUserResult(uid);
    if (existingResult) {
      const questions = await getQuestions();
      return NextResponse.json({
        success: true,
        completed: true,
        result: existingResult,
        totalQuestions: questions.length,
      });
    }

    // Otherwise fetch questions
    const questions = await getQuestions();
    
    // Scrub the correct answers to prevent inspection cheats
    const clientQuestions = questions.map((q) => ({
      id: q.id,
      text: q.text,
      options: q.options,
    }));

    return NextResponse.json({
      success: true,
      completed: false,
      questions: clientQuestions,
    });
  } catch (error: unknown) {
    const errorDetails = error instanceof Error ? error.message : "Server error";
    return NextResponse.json(
      { success: false, error: `Server Error: ${errorDetails}` },
      { status: 500 }
    );
  }
}

// POST: Submit quiz answers and auto-grade on the server side
export async function POST(request: NextRequest) {
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

    // Check double submission
    const existingResult = await getUserResult(uid);
    if (existingResult) {
      return NextResponse.json(
        { success: false, error: "Quiz already attempted. Retakes are not allowed." },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const userAnswers: Record<string, number> = body.answers || {};

    // Get database questions (with correct answers)
    const questions = await getQuestions();
    let score = 0;

    questions.forEach((q) => {
      const userAnswer = userAnswers[q.id];
      if (userAnswer !== undefined && userAnswer === q.correct_answer) {
        score++;
      }
    });

    // Get user details to associate with the score record
    const userProfile = await getUser(uid);
    const userName = userProfile?.name || "Anonymous Member";
    const userEmail = userProfile?.email || "";

    const threshold = Math.ceil(questions.length * 0.6); // 60% passing threshold
    const passed = score >= threshold;

    const savedResult = await saveResult({
      user_id: uid,
      user_name: userName,
      user_email: userEmail,
      score,
      answers: userAnswers,
    });

    return NextResponse.json({
      success: true,
      score,
      totalQuestions: questions.length,
      passed,
      result: savedResult,
      questions, // Send full questions for review
    });
  } catch (error: unknown) {
    const errorDetails = error instanceof Error ? error.message : "Server error";
    return NextResponse.json(
      { success: false, error: `Server Error: ${errorDetails}` },
      { status: 500 }
    );
  }
}
