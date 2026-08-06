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
  { label: "Events Attended", value: "3", icon: CalendarDays, color: "text-[#00f2fe]" },
  { label: "Workshops", value: "5", icon: Code2, color: "text-[#4facfe]" },
  { label: "Network", value: "12", icon: Users, color: "text-emerald-400" },
  { label: "Achievements", value: "2", icon: Trophy, color: "text-amber-400" },
];

const UPCOMING_EVENTS = [
  {
    title: "Hackathon 2026",
    date: "Aug 15, 2026",
    time: "10:00 AM",
    location: "KIIT SCA Auditorium",
    status: "Upcoming",
  },
  {
    title: "Web Dev Workshop",
    date: "Aug 22, 2026",
    time: "2:00 PM",
    location: "Lab 3, Block C",
    status: "Upcoming",
  },
  {
    title: "AI/ML Bootcamp",
    date: "Sep 05, 2026",
    time: "11:00 AM",
    location: "Online (Zoom)",
    status: "Upcoming",
  },
];

const RECENT_ACTIVITY = [
  {
    title: "Registered for Hackathon 2026",
    time: "2 days ago",
    icon: CalendarDays,
    color: "text-[#00f2fe] bg-[#00f2fe]/10 border-[#00f2fe]/20",
  },
  {
    title: "Completed Web Dev Workshop",
    time: "1 week ago",
    icon: Code2,
    color: "text-[#4facfe] bg-[#4facfe]/10 border-[#4facfe]/20",
  },
  {
    title: "Earned 'First Hack' Badge",
    time: "2 weeks ago",
    icon: Award,
    color: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  },
  {
    title: "Joined K{devs} Community",
    time: "1 month ago",
    icon: Users,
    color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  },
];

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
            <p className="text-slate-300 text-sm sm:text-base max-w-xl">
              You're part of the K&#123;devs&#125; community. Stay updated with events, track your progress, and grow with us.
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-semibold">
            <ShieldCheck className="w-4 h-4" />
            {userData?.role === "admin" ? "Admin" : "Active Member"}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

      {/* Main Grid: Upcoming Events + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Events */}
        <div className="rounded-2xl bg-slate-900/60 border border-white/10 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-[#00f2fe]" />
              <h2 className="font-bold text-white">Upcoming Events</h2>
            </div>
            <Link
              href="/dashboard/events"
              className="text-xs font-medium text-[#00f2fe] hover:text-[#4facfe] flex items-center gap-1"
            >
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-white/5">
            {UPCOMING_EVENTS.map((event) => (
              <div key={event.title} className="px-6 py-4 hover:bg-white/5 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-white text-sm mb-1">{event.title}</h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <CalendarDays className="w-3 h-3" /> {event.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {event.time}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" /> {event.location}
                      </span>
                    </div>
                  </div>
                  <span className="shrink-0 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-[#00f2fe]/10 text-[#00f2fe] border border-[#00f2fe]/20">
                    {event.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-2xl bg-slate-900/60 border border-white/10 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#00f2fe]" />
              <h2 className="font-bold text-white">Recent Activity</h2>
            </div>
          </div>
          <div className="divide-y divide-white/5">
            {RECENT_ACTIVITY.map((activity, idx) => {
              const Icon = activity.icon;
              return (
                <div key={idx} className="px-6 py-4 flex items-center gap-4 hover:bg-white/5 transition-colors">
                  <div className={`p-2.5 rounded-xl border ${activity.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{activity.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{activity.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Profile Summary Card */}
      <div className="rounded-2xl bg-slate-900/60 border border-white/10 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-[#00f2fe]" />
            <h2 className="font-bold text-white">Profile Summary</h2>
          </div>
          <Link
            href="/dashboard/profile"
            className="text-xs font-medium text-[#00f2fe] hover:text-[#4facfe] flex items-center gap-1"
          >
            Edit profile <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
              <Mail className="w-3.5 h-3.5" /> Email
            </div>
            <p className="text-sm font-medium text-white truncate">{userData?.email}</p>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Role
            </div>
            <p className="text-sm font-medium text-white capitalize">{userData?.role || "Member"}</p>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
              <Clock className="w-3.5 h-3.5" /> Last Login
            </div>
            <p className="text-sm font-medium text-white">{formatDate(userData?.lastLoginAt || "")}</p>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
              <Award className="w-3.5 h-3.5" /> Status
            </div>
            <p className="text-sm font-medium text-emerald-400">
              {userData?.emailVerified ? "Verified" : "Pending"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}