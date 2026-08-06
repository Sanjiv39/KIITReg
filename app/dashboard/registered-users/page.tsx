"use client";

import { useEffect, useState, useRef } from "react";
import { auth } from "@/lib/firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import {
  ArrowLeft,
  Search,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  Users,
  Award,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { Event } from "@/lib/firebase/db";

interface RegisteredUser {
  registrationId: string;
  userId: string;
  name: string;
  email: string;
  registeredAt: string;
  createdAt: string;
  updatedAt: string;
  quizCompleted: boolean;
  score: number | null;
  total: number | null;
}

export default function RegisteredUsersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = searchParams.get("eventId");

  const [isAdmin, setIsAdmin] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [userToken, setUserToken] = useState<string | null>(null);

  // Registration data states
  const [event, setEvent] = useState<Event | null>(null);
  const [registrations, setRegistrations] = useState<RegisteredUser[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRegistrations, setTotalRegistrations] = useState(0);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1); // Reset to page 1 on new search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Auth check on mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/users/login");
        return;
      }
      try {
        const idToken = await user.getIdToken();
        setUserToken(idToken);

        const res = await fetch("/api/users/me", {
          headers: { Authorization: `Bearer ${idToken}` },
        });
        const data = await res.json();
        if (data.success && data.user.role === "ADMIN") {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (err) {
        console.error("Auth state fetch failed:", err);
      } finally {
        setLoadingAuth(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Load registration list from backend
  useEffect(() => {
    if (!isAdmin || !userToken || !eventId) return;

    const loadData = async () => {
      setLoadingData(true);
      try {
        const searchParam = debouncedSearch ? `&search=${encodeURIComponent(debouncedSearch)}` : "";
        const url = `/api/admin/registrations?eventId=${eventId}&page=${page}&limit=${limit}${searchParam}`;

        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${userToken}` },
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setEvent(data.event);
            setRegistrations(data.registrations);
            setTotalRegistrations(data.pagination.total);
            setTotalPages(data.pagination.pages);
          }
        } else {
          console.error("Failed to load registration details");
        }
      } catch (err) {
        console.error("Error loading registration details:", err);
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, [isAdmin, userToken, eventId, page, limit, debouncedSearch]);

  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#00f2fe] animate-spin mb-4" />
        <p className="text-slate-400 text-sm font-medium">Verifying admin credentials...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mb-4">
          <XCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
        <p className="text-slate-400 text-sm max-w-md mb-6">
          You do not have the required administrative privileges to view registration logs.
        </p>
        <Link
          href="/dashboard"
          className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-semibold hover:bg-white/10 transition-all text-sm"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  if (!eventId) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-xl font-bold text-white mb-2">Missing Event ID</h2>
        <p className="text-slate-400 text-sm mb-6">Please specify a valid event identifier.</p>
        <Link
          href="/dashboard/events"
          className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-semibold hover:bg-white/10 transition-all text-sm"
        >
          Back to Events
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-[#00f2fe]/30">
      {/* Background gradients */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#4facfe]/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#00f2fe]/5 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Navigation / Header */}
        <div className="mb-8">
          <Link
            href="/dashboard/events"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm font-semibold transition-colors mb-4 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Events
          </Link>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-[#00f2fe]/10 text-[#00f2fe] border border-[#00f2fe]/20">
                  Admin Log
                </span>
                {event && (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-white/5 text-slate-400 border border-white/10">
                    {event.category}
                  </span>
                )}
              </div>
              <h1 className="pt-2 text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                {event ? event.title : "Event Registration Details"}
              </h1>
            </div>

            {/* Event Summary Details */}
            {event && (
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 bg-white/5 border border-white/10 rounded-2xl p-4">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#00f2fe]" />
                  {event.date}
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#00f2fe]" />
                  {event.startTime} - {event.endTime}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Dashboard Grid Container */}
        <div className="bg-slate-900/40 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl shadow-2xl">
          {/* Controls Bar */}
          <div className="p-6 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#00f2fe]/15 border border-[#00f2fe]/25 flex items-center justify-center text-[#00f2fe]">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Registrations List</h3>
                <p className="text-xs text-slate-400">
                  {totalRegistrations} total {totalRegistrations === 1 ? "user" : "users"} registered
                </p>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative max-w-sm w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-white/10 bg-slate-950/60 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00f2fe] focus:ring-1 focus:ring-[#00f2fe] transition-all"
              />
            </div>
          </div>

          {/* Table / Loading Overlay */}
          <div className="relative min-h-[300px]">
            {loadingData ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/20 backdrop-blur-[1px]">
                <Loader2 className="w-8 h-8 text-[#00f2fe] animate-spin mb-2" />
                <p className="text-slate-400 text-xs">Loading registration data...</p>
              </div>
            ) : registrations.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/5 text-slate-400 font-medium">
                      <th className="px-6 py-4">User</th>
                      <th className="px-6 py-4">Email</th>
                      <th className="px-6 py-4">Registered On</th>
                      {event?.category === "Quiz" && <th className="px-6 py-4">Quiz Status / Score</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 bg-slate-900/10">
                    {registrations.map((reg) => {
                      const dateValue = reg.registeredAt || reg.createdAt;
                      let formattedDate = "N/A";
                      if (dateValue) {
                        const d = new Date(dateValue);
                        if (!isNaN(d.getTime())) {
                          formattedDate = format(d, "PPP p");
                        }
                      }

                      return (
                        <tr key={reg.registrationId} className="hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4 font-semibold text-white">{reg.name}</td>
                          <td className="px-6 py-4 text-slate-300">{reg.email}</td>
                          <td className="px-6 py-4 text-slate-400">
                            {formattedDate}
                          </td>
                          {event?.category === "Quiz" && (
                            <td className="px-6 py-4">
                              {reg.quizCompleted ? (
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                  <Award className="w-3.5 h-3.5" />
                                  {reg.score} / {reg.total}
                                </div>
                              ) : (
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                  <XCircle className="w-3.5 h-3.5" />
                                  Pending
                                </div>
                              )}
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 mb-4">
                  <Users className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">No registration logs</h3>
                <p className="text-sm text-slate-400 max-w-sm px-6">
                  {debouncedSearch
                    ? "No registered users match your search criteria. Try a different query."
                    : "No users have registered for this event yet."}
                </p>
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between gap-4 bg-slate-950/20">
              <p className="text-xs text-slate-400">
                Showing Page <span className="font-semibold text-white">{page}</span> of{" "}
                <span className="font-semibold text-white">{totalPages}</span>
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-white hover:text-[#00f2fe] transition-all"
                  title="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-white hover:text-[#00f2fe] transition-all"
                  title="Next Page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
