import { NextResponse, NextRequest } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";
import { getUser, getEvents, addEvent, getUserRegistrations } from "@/lib/firebase/db";

// GET: Fetch all events
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    const bearerToken = authHeader?.startsWith("Bearer ")
      ? authHeader.split("Bearer ")[1]
      : null;

    let uid: string | null = null;
    if (bearerToken) {
      try {
        const decodedToken = await adminAuth.verifyIdToken(bearerToken);
        uid = decodedToken.uid;
      } catch {
        // Token is invalid/expired, ignore user verification but allow public read
      }
    }

    const eventsList = await getEvents();
    let registeredIds: string[] = [];

    if (uid) {
      registeredIds = await getUserRegistrations(uid);
    }

    const clientEvents = eventsList.map((e) => ({
      ...e,
      registered: registeredIds.includes(e.id),
    }));

    return NextResponse.json({
      success: true,
      events: clientEvents,
    });
  } catch (error: unknown) {
    const errorDetails = error instanceof Error ? error.message : "Server error";
    return NextResponse.json(
      { success: false, error: `Server Error: ${errorDetails}` },
      { status: 500 }
    );
  }
}

// POST: Add a new event (restricted to ADMIN)
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

    const user = await getUser(decodedToken.uid);
    if (user?.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Access Denied: Admin role required" }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const { title, date, time, location, description, category, status, hasQuiz } = body;

    if (!title || !date || !time || !location || !description || !category || !status) {
      return NextResponse.json({ success: false, error: "Missing required event fields" }, { status: 400 });
    }

    const newEvent = await addEvent({
      title,
      date,
      time,
      location,
      description,
      category,
      status: status === "completed" ? "completed" : "upcoming",
      hasQuiz: !!hasQuiz,
    });

    return NextResponse.json({
      success: true,
      event: newEvent,
    }, { status: 201 });
  } catch (error: unknown) {
    const errorDetails = error instanceof Error ? error.message : "Server error";
    return NextResponse.json(
      { success: false, error: `Server Error: ${errorDetails}` },
      { status: 500 }
    );
  }
}
