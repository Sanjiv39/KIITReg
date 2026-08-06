import { NextResponse, NextRequest } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { getUser } from "@/lib/firebase/db";

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

    // Support updating name (matching DB schema) and legacy displayName
    const updateData: Record<string, string> = {};
    if (body.displayName && typeof body.displayName === "string") {
      updateData.name = body.displayName.trim();
      updateData.displayName = body.displayName.trim();
    } else if (body.name && typeof body.name === "string") {
      updateData.name = body.name.trim();
      updateData.displayName = body.name.trim();
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

    const updatedUser = await getUser(uid);
    if (!updatedUser) {
      return NextResponse.json(
        { success: false, error: "User details could not be retrieved" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        uid: updatedUser.id,
        id: updatedUser.id,
        email: updatedUser.email,
        displayName: updatedUser.name,
        name: updatedUser.name,
        photoURL: updatedUser.photoURL,
        emailVerified: userDoc.data()?.emailVerified ?? false,
        role: updatedUser.role,
        createdAt: updatedUser.createdAt,
        lastLoginAt: updatedUser.lastLoginAt,
        updatedAt: updatedUser.updatedAt,
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

    const user = await getUser(uid);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 },
      );
    }

    // Retrieve original doc for emailVerified
    const userDoc = await adminDb.collection("users").doc(uid).get();

    return NextResponse.json({
      success: true,
      user: {
        uid: user.id,
        id: user.id,
        email: user.email,
        displayName: user.name,
        name: user.name,
        photoURL: user.photoURL,
        emailVerified: userDoc.data()?.emailVerified ?? false,
        role: user.role,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
        updatedAt: user.updatedAt,
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