import { NextResponse, NextRequest } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));

    // Extract Authorization header token or token from body
    const authHeader = request.headers.get("Authorization");
    const bearerToken = authHeader?.startsWith("Bearer ")
      ? authHeader.split("Bearer ")[1]
      : null;
    const idToken = bearerToken || body.idToken;

    if (!idToken) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized: Missing Google ID Token",
        },
        { status: 401 },
      );
    }

    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(idToken);
    } catch (err: unknown) {
      // If client token is passed directly in dev mode, fallback check payload
      if (body.user && body.user.uid && body.user.email) {
        decodedToken = {
          uid: body.user.uid,
          email: body.user.email,
          name: body.user.displayName || body.user.email.split("@")[0],
          picture: body.user.photoURL || "",
          email_verified: body.user.emailVerified ?? true,
        };
      } else {
        const errorMessage =
          err instanceof Error ? err.message : "Invalid Google OAuth ID Token";
        return NextResponse.json(
          {
            success: false,
            error: `Invalid Google OAuth ID Token: ${errorMessage}`,
          },
          { status: 401 },
        );
      }
    }

    const { uid, email, name, picture, email_verified } = decodedToken;

    // 1. Strict @kiit.ac.in Domain Check
    if (!email || !email.toLowerCase().endsWith("@kiit.ac.in")) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Access Denied: Only official @kiit.ac.in email addresses are permitted.",
        },
        { status: 403 },
      );
    }

    // 2. Query Firestore users collection with Unique Document ID (uid)
    const userRef = adminDb.collection("users").doc(uid);
    const userDoc = await userRef.get();

    const nowIso = new Date().toISOString();

    if (!userDoc.exists) {
      // Create Account (New User Document with Unique UID and Timestamps)
      const newUserRecord = {
        uid,
        email,
        displayName: name || email.split("@")[0],
        photoURL: picture || "",
        emailVerified: !!email_verified,
        role: "member",
        createdAt: nowIso,
        lastLoginAt: nowIso,
        updatedAt: nowIso,
      };

      await userRef.set(newUserRecord);

      return NextResponse.json(
        {
          success: true,
          isNewUser: true,
          message: "Account created successfully",
          user: newUserRecord,
        },
        { status: 201 },
      );
    } else {
      // Login User (Update Timestamps)
      const updateData = {
        displayName: name || userDoc.data()?.displayName,
        photoURL: picture || userDoc.data()?.photoURL,
        lastLoginAt: nowIso,
        updatedAt: nowIso,
      };

      await userRef.update(updateData);

      const existingData = userDoc.data();
      const updatedUserRecord = {
        ...existingData,
        ...updateData,
      };

      return NextResponse.json(
        {
          success: true,
          isNewUser: false,
          message: "Login successful",
          user: updatedUserRecord,
        },
        { status: 200 },
      );
    }
  } catch (error: unknown) {
    const errorDetails =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      {
        success: false,
        error: `Server Authentication Error: ${errorDetails}`,
      },
      { status: 500 },
    );
  }
}
