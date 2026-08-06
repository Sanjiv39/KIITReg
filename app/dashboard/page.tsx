"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { auth } from "@/lib/firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import {
  User,
  CalendarDays,
  Award,
  Clock,
  ShieldCheck,
  Mail,
  ChevronRight,
  Sparkles,
  Code2,
  Users,
  Trophy,
  ArrowUpRight,
} from "lucide-react";

interface UserData {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  emailVerified: boolean;
  role: string;
  createdAt: string;
  lastLoginAt: string;
  updatedAt: string;
}

const STATS = [
  { label: "Workshops Attended", value: "5", icon: Code2, color: "text-[#00f2fe]" },
  { label: "Quiz Attended", value: "2", icon: Award, color: "text-amber-400" },
];

const UPCOMING_WORKSHOPS_QUIZZES: any[] = [];

export default function DashboardPage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setIsLoading(false);
        return;
      }

      try {
        const idToken = await firebaseUser.getIdToken();
        const response = await fetch("/api/users/me", {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUserData(data.user);
        } else {
          // Fallback to Firebase user data
          setUserData({
            uid: firebaseUser.uid,
            email: firebaseUser.email || "",
            displayName: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "Member",
            photoURL: firebaseUser.photoURL || "",
            emailVerified: firebaseUser.emailVerified,
            role: "member",
            createdAt: "",
            lastLoginAt: "",
            updatedAt: "",
          });
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-[#00f2fe]/30 border-t-[#00f2fe] animate-spin" />
          <p className="text-slate-400 text-sm">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const formatDate = (isoString: string) => {
    if (!isoString) return "N/A";
    return new Date(isoString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#00f2fe]/20 via-[#4facfe]/10 to-transparent border border-[#00f2fe]/20 p-6 sm:p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#00f2fe]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-slate-800 border-2 border-[#00f2fe]/30 shrink-0">
            {userData?.photoURL ? (
              <Image
                src={userData.photoURL}
                alt={userData.displayName}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-[#00f2fe]">
                {userData?.displayName?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-[#00f2fe]" />
              <span className="text-xs font-semibold text-[#00f2fe] uppercase tracking-wider">
                Member since {formatDate(userData?.createdAt || "")}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
              Welcome back, {userData?.displayName?.split(" ")[0]}!
            </h1>
            <p className="text-slate-300 text-sm sm:text-base max-w-xl font-medium">
              {userData?.role?.toUpperCase() === "ADMIN"
                ? "You have administrator privileges. You can manage settings, view registrations, and handle events."
                : "You're part of the K{devs} community. Stay updated with events, track your progress, and grow with us."}
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-semibold">
            <ShieldCheck className="w-4 h-4" />
            {userData?.role?.toUpperCase() === "ADMIN" ? "Admin" : "Active Member"}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {STATS.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 hover:border-[#00f2fe]/30 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 rounded-xl bg-white/5 border border-white/10 ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-500" />
              </div>
              <div className="text-3xl font-extrabold text-white">{stat.value}</div>
              <div className="text-sm text-slate-400 mt-1">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* Main Grid: Upcoming Workshops & Quizzes */}
      <div className="grid grid-cols-1 gap-6">
        {/* Upcoming Workshops & Quizzes */}
        <div className="rounded-2xl bg-slate-900/60 border border-white/10 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-[#00f2fe]" />
              <h2 className="font-bold text-white">Upcoming Workshops & Quizzes</h2>
            </div>
            <Link
              href="/dashboard/events"
              className="text-xs font-medium text-[#00f2fe] hover:text-[#4facfe] flex items-center gap-1"
            >
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-white/5">
            {UPCOMING_WORKSHOPS_QUIZZES.length > 0 ? (
              UPCOMING_WORKSHOPS_QUIZZES.map((item) => (
                <div key={item.title} className="px-6 py-4 hover:bg-white/5 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-white text-sm mb-1">{item.title}</h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <CalendarDays className="w-3 h-3" /> {item.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {item.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" /> {item.location}
                        </span>
                      </div>
                    </div>
                    <span className="shrink-0 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-[#00f2fe]/10 text-[#00f2fe] border border-[#00f2fe]/20">
                      {item.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center text-slate-500 text-sm">
                No upcoming events scheduled. Check back later!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}