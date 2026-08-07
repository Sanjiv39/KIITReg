import { NextResponse, NextRequest } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";
import { registerUserForEvent } from "@/lib/firebase/db";

// POST: Register user for an event
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    const bearerToken = authHeader?.startsWith("Bearer ")
      ? authHeader.split("Bearer ")[1]
      : null;

    if (!bearerToken) {
      return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 401 });
    }

    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(bearerToken);
    } catch {
      return NextResponse.json({ success: false, error: "Invalid or expired token" }, { status: 401 });
    }

    const { uid } = decodedToken;
    const body = await request.json().catch(() => ({}));
    const { eventId } = body;

    if (!eventId) {
      return NextResponse.json({ success: false, error: "Missing eventId parameter" }, { status: 400 });
    }

    await registerUserForEvent(uid, eventId);

    return NextResponse.json({
      success: true,
      message: "Successfully registered for event",
    });
  } catch (error: unknown) {
    const errorDetails = error instanceof Error ? error.message : "Server error";
    return NextResponse.json(
      { success: false, error: `Server Error: ${errorDetails}` },
      { status: 500 }
    );
  }
}

export const runtime = "nodejs";
