import { NextResponse, NextRequest } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";

export async function PATCH(request: NextRequest) {
  try {
    // Extract Authorization header token
    const authHeader = request.headers.get("Authorization");
    const bearerToken = authHeader?.startsWith("Bearer ")
      ? authHeader.split("Bearer ")[1]
      : null;

    if (!bearerToken) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Missing token" },
        { status: 401 },
      );
    }

    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(bearerToken);
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid or expired token" },
        { status: 401 },
      );
    }

    const { uid } = decodedToken;
    const body = await request.json().catch(() => ({}));

    // Only allow updating displayName for now
    const updateData: Record<string, string> = {};
    if (body.displayName && typeof body.displayName === "string") {
      updateData.displayName = body.displayName.trim();
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, error: "No valid fields to update" },
        { status: 400 },
      );
    }

    updateData.updatedAt = new Date().toISOString();

    const userRef = adminDb.collection("users").doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 },
      );
    }

    await userRef.update(updateData);

    const updatedData = {
      ...userDoc.data(),
      ...updateData,
    };

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        uid: updatedData?.uid || uid,
        email: updatedData?.email || "",
        displayName: updatedData?.displayName || "",
        photoURL: updatedData?.photoURL || "",
        emailVerified: updatedData?.emailVerified ?? false,
        role: updatedData?.role || "member",
        createdAt: updatedData?.createdAt || "",
        lastLoginAt: updatedData?.lastLoginAt || "",
        updatedAt: updatedData?.updatedAt || "",
      },
    });
  } catch (error: unknown) {
    const errorDetails =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { success: false, error: `Server Error: ${errorDetails}` },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Extract Authorization header token
    const authHeader = request.headers.get("Authorization");
    const bearerToken = authHeader?.startsWith("Bearer ")
      ? authHeader.split("Bearer ")[1]
      : null;

    if (!bearerToken) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Missing token" },
        { status: 401 },
      );
    }

    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(bearerToken);
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid or expired token" },
        { status: 401 },
      );
    }

    const { uid } = decodedToken;

    // Fetch user document from Firestore
    const userRef = adminDb.collection("users").doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 },
      );
    }

    const userData = userDoc.data();

    return NextResponse.json({
      success: true,
      user: {
        uid: userData?.uid || uid,
        email: userData?.email || "",
        displayName: userData?.displayName || "",
        photoURL: userData?.photoURL || "",
        emailVerified: userData?.emailVerified ?? false,
        role: userData?.role || "member",
        createdAt: userData?.createdAt || "",
        lastLoginAt: userData?.lastLoginAt || "",
        updatedAt: userData?.updatedAt || "",
      },
    });
  } catch (error: unknown) {
    const errorDetails =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { success: false, error: `Server Error: ${errorDetails}` },
      { status: 500 },
    );
  }
}