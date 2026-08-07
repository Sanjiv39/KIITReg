"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { auth, googleProvider } from "@/lib/firebase/config";
import {
  onAuthStateChanged,
  signOut,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  type User as FirebaseUser,
} from "firebase/auth";
import {
  LayoutDashboard,
  User,
  CalendarDays,
  Award,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  ShieldCheck,
  ArrowLeft,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Profile", href: "/dashboard/profile", icon: User },
  { label: "Events", href: "/dashboard/events", icon: CalendarDays },
  { label: "Achievements", href: "/dashboard/achievements", icon: Award },
  // { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const path = window.location.pathname;
      const matched = NAV_ITEMS.find((item) => {
        if (item.href === "/dashboard") {
          return path === "/dashboard";
        }
        return path.startsWith(item.href);
      });
      if (matched) return matched.href;
      if (
        path.startsWith("/dashboard/quiz") ||
        path.startsWith("/dashboard/results") ||
        path.startsWith("/dashboard/registered-users")
      ) {
        return "/dashboard/events";
      }
    }
    return "/dashboard";
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const matched = NAV_ITEMS.find((item) => {
      if (item.href === "/dashboard") {
        return pathname === "/dashboard";
      }
      return pathname.startsWith(item.href);
    });

    if (matched) {
      setActiveTab(matched.href);
    } else {
      if (
        pathname.startsWith("/dashboard/quiz") ||
        pathname.startsWith("/dashboard/results") ||
        pathname.startsWith("/dashboard/registered-users")
      ) {
        setActiveTab("/dashboard/events");
      }
    }
  }, [pathname]);
  const [user, setUser] = useState<{
    displayName: string;
    email: string;
    photoURL: string;
    role?: string;
  } | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log("AUTH State changed :", firebaseUser);
      if (firebaseUser) {
        // Initial fallback state
        setUser({
          displayName:
            firebaseUser.displayName ||
            firebaseUser.email?.split("@")[0] ||
            "Member",
          email: firebaseUser.email || "",
          photoURL: firebaseUser.photoURL || "",
        });

        try {
          const idToken = await firebaseUser.getIdToken();
          const response = await fetch("/api/users/me", {
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            if (data.success && data.user) {
              setUser({
                displayName:
                  data.user.displayName ||
                  data.user.name ||
                  firebaseUser.displayName ||
                  firebaseUser.email?.split("@")[0] ||
                  "Member",
                email: data.user.email || firebaseUser.email || "",
                photoURL: data.user.photoURL || firebaseUser.photoURL || "",
                role: data.user.role,
              });
            }
          }
        } catch (err) {
          console.error("Failed to load user profile:", err);
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Resolve redirect-based sign-in result on app startup (canonical Firebase flow).
  // When the user returns from the Google redirect page, getRedirectResult
  // retrieves the saved token exchange result and returns the signed-in user.
  useEffect(() => {
    getRedirectResult(auth)
      .then(async (result) => {
        console.log("Got redirect result :", result);
        if (result?.user) {
          // Came back from redirect-based sign-in fallback
          setIsRedirecting(false);
          await syncUserWithBackend(result.user);
        }
      })
      .catch((error) => {
        console.error("Redirect sign-in error:", error);
        setAuthError(getAuthErrorMessage(error));
        setIsRedirecting(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getAuthErrorMessage = (error: unknown): string => {
    if (error instanceof Error) {
      const code = (error as { code?: string }).code;
      switch (code) {
        case "auth/popup-blocked":
          return "Popup was blocked by your browser. Redirecting to Google sign-in...";
        case "auth/popup-closed-by-user":
          return "Sign-in popup was closed before completing. Please try again.";
        case "auth/cancelled-popup-request":
          return "Sign-in was cancelled. Please try again.";
        case "auth/unauthorized-domain":
          return "This domain is not authorized for sign-in. Please contact the administrator.";
        case "auth/operation-not-supported-in-this-environment":
          return "Popup sign-in is not supported in this environment. Redirecting to Google sign-in...";
        case "auth/account-exists-with-different-credential":
          return "An account already exists with the same email but a different sign-in method.";
        case "auth/network-request-failed":
          return "Network error. Please check your connection and try again.";
        case "auth/too-many-requests":
          return "Too many sign-in attempts. Please try again later.";
        default:
          return error.message || "Sign in failed";
      }
    }
    return "Sign in failed";
  };

  const syncUserWithBackend = useCallback(
    async (firebaseUser: FirebaseUser) => {
      // Initial fallback state
      setUser({
        displayName:
          firebaseUser.displayName ||
          firebaseUser.email?.split("@")[0] ||
          "Member",
        email: firebaseUser.email || "",
        photoURL: firebaseUser.photoURL || "",
      });

      try {
        const idToken = await firebaseUser.getIdToken();
        const authRes = await fetch("/api/users/auth", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({
            user: {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              emailVerified: firebaseUser.emailVerified,
            },
          }),
        });

        let role = "USER";
        if (authRes.ok) {
          const authData = await authRes.json();
          if (authData.success && authData.user) {
            role = authData.user.role || "USER";
          }
        }

        setUser({
          displayName:
            firebaseUser.displayName ||
            firebaseUser.email?.split("@")[0] ||
            "Member",
          email: firebaseUser.email || "",
          photoURL: firebaseUser.photoURL || "",
          role: role,
        });
      } catch (err) {
        console.error("Failed to sync user with backend:", err);
      }
    },
    [],
  );

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    setAuthError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await syncUserWithBackend(result.user);
    } catch (error: unknown) {
      const code = (error as { code?: string })?.code;
      const popupBlockedCodes = [
        "auth/popup-blocked",
        "auth/operation-not-supported-in-this-environment",
        "auth/unauthorized-domain",
      ];

      if (popupBlockedCodes.includes(code || "")) {
        // Fall back to redirect-based sign-in when popup is blocked/unavailable
        setIsRedirecting(true);
        setAuthError(
          code === "auth/unauthorized-domain"
            ? "This domain is not authorized for popup sign-in. Redirecting to Google sign-in..."
            : "Popup was blocked by your browser. Redirecting to Google sign-in...",
        );
        try {
          await signInWithRedirect(auth, googleProvider);
          // Page will redirect to Google; getRedirectResult resolves the
          // result on app startup when the user returns.
        } catch (redirectError) {
          console.error("Redirect sign-in error:", redirectError);
          setAuthError(getAuthErrorMessage(redirectError));
          setIsRedirecting(false);
        }
      } else {
        setAuthError(getAuthErrorMessage(error));
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-[#00f2fe]/30 border-t-[#00f2fe] animate-spin" />
          <p className="text-slate-400 text-sm font-medium">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  // Show sign-in screen if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-[#0b0f19] text-white flex flex-col">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-md border-b border-white/10 px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-9 h-9 transition-transform group-hover:scale-105">
              <Image
                src="/Kdevs.png"
                alt="K{devs} Logo"
                fill
                className="object-contain"
              />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">
              K
              <span className="text-[#00f2fe] font-extrabold">
                &#123;devs&#125;
              </span>
            </h1>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-300 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </header>

        {/* Sign In Content */}
        <div className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="w-full max-w-md">
            <div className="p-8 rounded-2xl bg-slate-900/80 border border-white/10 shadow-2xl backdrop-blur-xl">
              <div className="text-center mb-8">
                <div className="relative w-20 h-20 mx-auto mb-4">
                  <Image
                    src="/Kdevs.png"
                    alt="K{devs} Logo"
                    fill
                    className="object-contain"
                  />
                </div>
                <h1 className="text-2xl font-extrabold text-white mb-2">
                  K&#123;devs&#125; Dashboard
                </h1>
                <p className="text-slate-400 text-sm">
                  Sign in with your official KIIT email to access your dashboard
                </p>
              </div>

              {authError && (
                <div
                  className={`mb-6 px-4 py-3 rounded-xl text-sm ${
                    isRedirecting
                      ? "bg-[#00f2fe]/10 border border-[#00f2fe]/30 text-[#00f2fe]"
                      : "bg-red-500/10 border border-red-500/30 text-red-400"
                  }`}
                >
                  {authError}
                </div>
              )}

              <button
                onClick={handleGoogleSignIn}
                disabled={isSigningIn || isRedirecting}
                className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl bg-white text-slate-900 font-semibold text-sm hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSigningIn || isRedirecting ? (
                  <>
                    <div className="w-5 h-5 rounded-full border-2 border-slate-900/30 border-t-slate-900 animate-spin" />
                    {isRedirecting
                      ? "Redirecting to Google..."
                      : "Signing in..."}
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Sign in with Google
                  </>
                )}
              </button>

              <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500">
                <ShieldCheck className="w-4 h-4 text-[#00f2fe]" />
                Only @kiit.ac.in email addresses are permitted
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] text-white">
      {/* Sidebar Overlay (Mobile) */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-72 bg-slate-950/95 border-r border-white/10 z-50 transition-transform duration-300 lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-9 h-9 transition-transform group-hover:scale-105">
              <Image
                src="/Kdevs.png"
                alt="K{devs} Logo"
                fill
                className="object-contain"
              />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">
              K
              <span className="text-[#00f2fe] font-extrabold">
                &#123;devs&#125;
              </span>
            </h1>
          </Link>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-[#00f2fe]/20 to-[#4facfe]/10 text-[#00f2fe] border border-[#00f2fe]/30"
                    : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span className="flex-1">{item.label}</span>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </Link>
            );
          })}
        </nav>

        {/* User Card & Sign Out */}
        <div className="px-4 py-5 border-t border-white/10">
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/5 border border-white/10 mb-3">
            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-slate-800 shrink-0">
              {user?.photoURL ? (
                <Image
                  src={user.photoURL}
                  alt={user.displayName}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#00f2fe] font-bold text-lg">
                  {user?.displayName?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white truncate flex items-center gap-1.5">
                <span>{user?.displayName}</span>
                {user?.role === "ADMIN" && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-[#00f2fe]/10 text-[#00f2fe] border border-[#00f2fe]/20 shrink-0">
                    ADMIN
                  </span>
                )}
              </p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-72">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-md border-b border-white/10 px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden p-2 text-slate-300 hover:text-white rounded-lg bg-white/5 border border-white/10"
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="hidden lg:block">
            <h2 className="text-lg font-bold text-white">
              {user?.role === "ADMIN" ? "Admin Dashboard" : "Member Dashboard"}
            </h2>
            <p className="text-xs text-slate-400">
              Welcome back, {user?.displayName}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
            >
              Back to Home
            </Link>
            <div className="relative w-9 h-9 rounded-full overflow-hidden bg-slate-800 border border-white/10">
              {user?.photoURL ? (
                <Image
                  src={user.photoURL}
                  alt={user.displayName}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#00f2fe] font-bold">
                  {user?.displayName?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="px-4 sm:px-6 lg:px-8 py-8">{children}</main>
      </div>
    </div>
  );
}
