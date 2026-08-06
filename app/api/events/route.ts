import { NextResponse, NextRequest } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";
import { getUser, getEvents, addEvent, updateEvent, deleteEvent, getUserRegistrations } from "@/lib/firebase/db";

// Helper: Calculate event status dynamically based on current time and end time
function calculateEventStatus(dateStr: string, endTimeStr: string): "upcoming" | "completed" {
  try {
    const combinedStr = `${dateStr} ${endTimeStr}`;
    const endDate = new Date(combinedStr);
    if (isNaN(endDate.getTime())) {
      return "upcoming";
    }
    const now = new Date();
    return now > endDate ? "completed" : "upcoming";
  } catch (err) {
    console.error("Error calculating event status:", err);
    return "upcoming";
  }
}

// Helper: Verify if request is made by an ADMIN
async function verifyAdmin(request: NextRequest): Promise<boolean> {
  const authHeader = request.headers.get("Authorization");
  const bearerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.split("Bearer ")[1]
    : null;

  if (!bearerToken) return false;

  try {
    const decodedToken = await adminAuth.verifyIdToken(bearerToken);
    const user = await getUser(decodedToken.uid);
    return user?.role === "ADMIN";
  } catch {
    return false;
  }
}

// GET: Fetch all events (dynamically computing status and registration)
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

    const clientEvents = eventsList.map((e) => {
      const computedStatus = calculateEventStatus(e.date, e.endTime);
      return {
        ...e,
        status: computedStatus,
        registered: registeredIds.includes(e.id),
      };
    });

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
    const { title, date, startTime, endTime, location, description, category, link, quizId } = body;

    if (!title || !date || !startTime || !endTime || !category) {
      return NextResponse.json({ success: false, error: "Missing required event fields" }, { status: 400 });
    }

    // Default status is calculated on GET, we can seed upcoming or completed but GET overrides it
    const newEvent = await addEvent({
      title,
      date,
      startTime,
      endTime,
      location: category === "Workshop" ? undefined : (location || undefined),
      description: description || undefined,
      category,
      status: "upcoming",
      hasQuiz: category === "Quiz",
      link: category === "Workshop" ? link || undefined : undefined,
      quizId: category === "Quiz" ? quizId || undefined : undefined,
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

// PUT: Edit an existing event (restricted to ADMIN)
export async function PUT(request: NextRequest) {
  try {
    const isAdmin = await verifyAdmin(request);
    if (!isAdmin) {
      return NextResponse.json({ success: false, error: "Access Denied: Admin role required" }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const { id, title, date, startTime, endTime, location, description, category, link, quizId } = body;

    if (!id || !title || !date || !startTime || !endTime || !category) {
      return NextResponse.json({ success: false, error: "Missing required fields for update" }, { status: 400 });
    }

    await updateEvent(id, {
      title,
      date,
      startTime,
      endTime,
      location: category === "Workshop" ? undefined : (location || undefined),
      description: description || undefined,
      category,
      hasQuiz: category === "Quiz",
      link: category === "Workshop" ? link || undefined : undefined,
      quizId: category === "Quiz" ? id : undefined,
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const errorDetails = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ success: false, error: errorDetails }, { status: 500 });
  }
}

// DELETE: Delete an existing event (restricted to ADMIN)
export async function DELETE(request: NextRequest) {
  try {
    const isAdmin = await verifyAdmin(request);
    if (!isAdmin) {
      return NextResponse.json({ success: false, error: "Access Denied: Admin role required" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing event ID parameter" }, { status: 400 });
    }

    await deleteEvent(id);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const errorDetails = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ success: false, error: errorDetails }, { status: 500 });
  }
}
