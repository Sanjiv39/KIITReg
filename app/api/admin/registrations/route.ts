import { NextResponse, NextRequest } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { getUser } from "@/lib/firebase/db";

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

export async function GET(request: NextRequest) {
  try {
    const isAdmin = await verifyAdmin(request);
    if (!isAdmin) {
      return NextResponse.json({ success: false, error: "Access Denied: Admin role required" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1") || 1;
    const limit = parseInt(searchParams.get("limit") || "10") || 10;

    if (!eventId) {
      return NextResponse.json({ success: false, error: "Missing required eventId" }, { status: 400 });
    }

    // Fetch the event document to make sure it exists
    const eventDoc = await adminDb.collection("events").doc(eventId).get();
    if (!eventDoc.exists) {
      return NextResponse.json({ success: false, error: "Event not found" }, { status: 404 });
    }
    const eventData = eventDoc.data()!;
    const event = {
      id: eventDoc.id,
      title: eventData.title || "",
      category: eventData.category || "",
      date: eventData.date || "",
      startTime: eventData.startTime || "",
      endTime: eventData.endTime || "",
      quizId: eventData.quizId || eventDoc.id,
    };

    // Fetch all registrations matching eventId
    const regSnapshot = await adminDb.collection("registrations")
      .where("eventId", "==", eventId)
      .get();

    const registrations: any[] = [];
    regSnapshot.forEach(doc => {
      const data = doc.data();
      registrations.push({
        id: doc.id,
        userId: data.userId,
        createdAt: data.createdAt || "",
        updatedAt: data.updatedAt || ""
      });
    });

    // If there are no registrations, return early empty pagination response
    if (registrations.length === 0) {
      return NextResponse.json({
        success: true,
        event,
        registrations: [],
        pagination: {
          total: 0,
          page,
          limit,
          pages: 0,
        }
      });
    }

    // Concurrent user fetching
    const userPromises = registrations.map(reg => adminDb.collection("users").doc(reg.userId).get());
    const userDocs = await Promise.all(userPromises);

    // If the event is a quiz, fetch quiz results for this event's quizId
    const resultsMap = new Map<string, { score: number; total: number }>();
    if (event.category === "Quiz") {
      const quizIdKey = event.quizId || event.id;
      const resultsSnapshot = await adminDb.collection("results")
        .where("quizId", "==", quizIdKey)
        .get();

      resultsSnapshot.forEach(doc => {
        const data = doc.data();
        resultsMap.set(data.userId, {
          score: data.score,
          total: data.total,
        });
      });
    }

    // Map and filter by search
    const filtered = registrations.map((reg, idx) => {
      const userDoc = userDocs[idx];
      if (!userDoc.exists) return null;
      const userData = userDoc.data()!;
      const name = userData.name || "";
      const email = userData.email || "";

      // Perform search filter if search term is provided
      if (search && !name.toLowerCase().includes(search.toLowerCase()) && !email.toLowerCase().includes(search.toLowerCase())) {
        return null;
      }

      const resultInfo = resultsMap.get(reg.userId);

      return {
        registrationId: reg.id,
        userId: reg.userId,
        name,
        email,
        registeredAt: reg.createdAt,
        createdAt: reg.createdAt,
        updatedAt: reg.updatedAt,
        quizCompleted: !!resultInfo,
        score: resultInfo ? resultInfo.score : null,
        total: resultInfo ? resultInfo.total : null,
      };
    }).filter((item): item is NonNullable<typeof item> => item !== null);

    // Apply pagination
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const paginated = filtered.slice(startIndex, startIndex + limit);

    return NextResponse.json({
      success: true,
      event,
      registrations: paginated,
      pagination: {
        total,
        page,
        limit,
        pages: totalPages,
      }
    });

  } catch (error: unknown) {
    const errorDetails = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ success: false, error: `Server Error: ${errorDetails}` }, { status: 500 });
  }
}
