"use client";

import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import {
  CalendarDays,
  Clock,
  MapPin,
  ArrowUpRight,
  Filter,
  Search,
  CheckCircle2,
  XCircle,
  Plus,
  X,
  Save,
  Calendar as CalendarIcon,
  Video,
  Edit3,
  Trash2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

import { Event as DbEvent } from "@/lib/firebase/db";

interface Event extends DbEvent {
  registered: boolean;
}

const CATEGORIES = ["All", "Workshop", "Quiz"];

export default function EventsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [filter, setFilter] = useState<"all" | "upcoming" | "completed">("all");
  const [isAdmin, setIsAdmin] = useState(false);
  const [eventsList, setEventsList] = useState<Event[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  // States to track completions for individual quizzes
  const [completedQuizzes, setCompletedQuizzes] = useState<Record<string, boolean>>({});
  const [loadingQuizState, setLoadingQuizState] = useState(true);

  // Modal / Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  const [eventTitle, setEventTitle] = useState("");
  const [eventCategory, setEventCategory] = useState("Workshop"); // Workshop or Quiz
  const [eventDate, setEventDate] = useState<Date | undefined>(undefined);

  // Start Time States
  const [startHour, setStartHour] = useState("02");
  const [startMinute, setStartMinute] = useState("00");
  const [startPeriod, setStartPeriod] = useState("PM");

  // End Time States
  const [endHour, setEndHour] = useState("05");
  const [endMinute, setEndMinute] = useState("00");
  const [endPeriod, setEndPeriod] = useState("PM");

  const [eventLocation, setEventLocation] = useState("");
  const [eventDescription, setEventDescription] = useState("");

  // Custom type specific fields
  const [eventLink, setEventLink] = useState("");
  const [eventQuizId, setEventQuizId] = useState("");

  const [isSaving, setIsSaving] = useState(false);

  const loadEventsData = async (token: string) => {
    try {
      setLoadingEvents(true);
      const res = await fetch("/api/events", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        const events: Event[] = data.events || [];
        setEventsList(events);

        // Fetch completion status for all quiz events
        const quizStatuses: Record<string, boolean> = {};
        for (const ev of events) {
          if (ev.category.toUpperCase() === "QUIZ" && ev.quizId) {
            try {
              const quizRes = await fetch(`/api/quiz?quizId=${ev.quizId}`, {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });
              if (quizRes.ok) {
                const quizData = await quizRes.json();
                quizStatuses[ev.quizId] = quizData.completed ?? false;
              }
            } catch (err) {
              console.error(`Failed to fetch quiz completion state for ${ev.quizId}:`, err);
            }
          }
        }
        setCompletedQuizzes(quizStatuses);
      }
    } catch (err) {
      console.error("Failed to load events:", err);
    } finally {
      setLoadingEvents(false);
      setLoadingQuizState(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const idToken = await firebaseUser.getIdToken();

          // Load events and quizzes completion status
          await loadEventsData(idToken);

          // Fetch user role
          const userRes = await fetch("/api/users/me", {
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
          });
          if (userRes.ok) {
            const userData = await userRes.json();
            setIsAdmin(userData.user?.role?.toUpperCase() === "ADMIN");
          }
        } catch (err) {
          console.error("Error fetching state:", err);
        }
      } else {
        setLoadingEvents(false);
        setLoadingQuizState(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleRegister = async (eventId: string) => {
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) return alert("Please log in first.");
      const idToken = await firebaseUser.getIdToken();

      const res = await fetch("/api/events/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ eventId }),
      });

      if (res.ok) {
        await loadEventsData(idToken);
      } else {
        const errData = await res.json();
        alert(errData.error || "Registration failed");
      }
    } catch (err) {
      console.error("Registration error:", err);
      alert("An error occurred during registration.");
    }
  };

  const handleOpenAddModal = () => {
    setEditingEventId(null);
    setEventTitle("");
    setEventCategory("Workshop");
    setEventDate(undefined);
    setStartHour("02");
    setStartMinute("00");
    setStartPeriod("PM");
    setEndHour("05");
    setEndMinute("00");
    setEndPeriod("PM");
    setEventLocation("");
    setEventDescription("");
    setEventLink("");
    setEventQuizId("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (event: Event) => {
    setEditingEventId(event.id);
    setEventTitle(event.title);
    setEventCategory(event.category);
    let parsedDate = new Date(event.date);
    if (isNaN(parsedDate.getTime())) {
      const cleaned = event.date.replace(/(\d+)(st|nd|rd|th)/g, "$1");
      parsedDate = new Date(cleaned);
    }
    setEventDate(isNaN(parsedDate.getTime()) ? new Date() : parsedDate);
    setEventLocation(event.location || "");
    setEventDescription(event.description || "");
    setEventLink(event.link || "");
    setEventQuizId(event.quizId || "");

    // Parse startTime, e.g., "02:00 PM"
    try {
      if (event.startTime) {
        const startParts = event.startTime.split(":");
        if (startParts.length === 2) {
          setStartHour(startParts[0]);
          const minPeriod = startParts[1].split(" ");
          if (minPeriod.length === 2) {
            setStartMinute(minPeriod[0]);
            setStartPeriod(minPeriod[1]);
          }
        }
      }
    } catch (err) {
      console.error("Failed to parse startTime:", err);
    }

    // Parse endTime, e.g., "05:00 PM"
    try {
      if (event.endTime) {
        const endParts = event.endTime.split(":");
        if (endParts.length === 2) {
          setEndHour(endParts[0]);
          const minPeriod = endParts[1].split(" ");
          if (minPeriod.length === 2) {
            setEndMinute(minPeriod[0]);
            setEndPeriod(minPeriod[1]);
          }
        }
      }
    } catch (err) {
      console.error("Failed to parse endTime:", err);
    }
    setIsModalOpen(true);
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event? This action cannot be undone.")) return;

    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) return;
      const idToken = await firebaseUser.getIdToken();

      const res = await fetch(`/api/events?id=${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      if (res.ok) {
        await loadEventsData(idToken);
      } else {
        const errData = await res.json();
        alert(errData.error || "Failed to delete event");
      }
    } catch (err) {
      console.error("Delete event error:", err);
      alert("An error occurred while deleting the event.");
    }
  };

  const handleSubmitEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim() || !eventDate) {
      return alert("Please fill in all general fields.");
    }

    if (eventCategory === "Workshop" && !eventLink.trim()) {
      return alert("Google meeting link is required for workshops.");
    }

    setIsSaving(true);
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) return;
      const idToken = await firebaseUser.getIdToken();

      // Format Date using date-fns PPP
      const formattedDate = format(eventDate, "PPP");

      // Format Start and End Times
      const formattedStartTime = `${startHour}:${startMinute} ${startPeriod}`;
      const formattedEndTime = `${endHour}:${endMinute} ${endPeriod}`;

      const payload = {
        id: editingEventId || undefined,
        title: eventTitle.trim(),
        category: eventCategory,
        date: formattedDate,
        startTime: formattedStartTime,
        endTime: formattedEndTime,
        location: eventCategory === "Workshop" ? undefined : (eventLocation?.trim() || undefined),
        description: eventDescription?.trim() || undefined,
        link: eventCategory === "Workshop" ? eventLink?.trim() || undefined : undefined,
      };

      const res = await fetch("/api/events", {
        method: editingEventId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const resData = await res.json().catch(() => ({}));
        setIsModalOpen(false);
        await loadEventsData(idToken);

        // Redirect to quiz edit page if it's a quiz category and this is a new event
        if (eventCategory === "Quiz" && !editingEventId) {
          const newQuizId = resData.event?.quizId || resData.event?.id;
          if (newQuizId) {
            router.push(`/dashboard/quiz/edit?quizId=${newQuizId}`);
          }
        }
      } else {
        const errData = await res.json();
        alert(errData.error || "Failed to save event");
      }
    } catch (err) {
      console.error("Failed to save event:", err);
      alert("An error occurred while saving the event.");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredEvents = eventsList.filter((event) => {
    // Search filter
    if (
      searchQuery &&
      !event.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !event.description?.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    // Category filter
    if (activeCategory !== "All" && event.category !== activeCategory) {
      return false;
    }

    // Status filter
    if (filter !== "all" && event.status !== filter) {
      return false;
    }

    return true;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Events</h1>
          <p className="text-slate-400 text-sm mt-1">
            Discover and register for upcoming K&#123;devs&#125; events
          </p>
        </div>
        {isAdmin && (
          <Button
            onClick={handleOpenAddModal}
            className="bg-gradient-to-r from-[#00f2fe] to-[#4facfe] text-slate-950 font-bold hover:shadow-[0_4px_15px_rgba(0,242,254,0.4)]"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Add Event
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {(["all", "upcoming", "completed"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filter === f
                ? "bg-gradient-to-r from-[#00f2fe] to-[#4facfe] text-slate-950 font-semibold"
                : "bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10"
                }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        <div className="relative w-full lg:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search events..."
            className="pl-10"
          />
        </div>
      </div>

      {/* Category Chips */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${activeCategory === cat
              ? "bg-[#00f2fe]/20 text-[#00f2fe] border border-[#00f2fe]/30"
              : "bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10 hover:text-white"
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Events Grid */}
      {loadingEvents ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#00f2fe]/30 border-t-[#00f2fe] animate-spin" />
          <p className="text-slate-400 text-xs font-medium">Loading events database...</p>
        </div>
      ) : filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredEvents.map((event) => {
            const isWorkshop = event.category.toUpperCase() === "WORKSHOP";
            const isQuiz = event.category.toUpperCase() === "QUIZ";
            const quizIdKey = event.quizId || "";
            const isQuizCompleted = completedQuizzes[quizIdKey] ?? false;

            return (
              <div
                key={event.id}
                className="group rounded-2xl bg-slate-900/60 border border-white/10 overflow-hidden hover:border-[#00f2fe]/30 transition-all hover:-translate-y-1 flex flex-col justify-between"
              >
                {/* Card Header */}
                <div className="p-6 pb-4">
                  <div className="flex items-start justify-between mb-3">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-[#00f2fe]/10 text-[#00f2fe] border border-[#00f2fe]/20">
                      {event.category}
                    </span>

                    <div className="flex items-center gap-2">
                      {/* Status badge */}
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${event.status === "upcoming"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-slate-500/10 text-slate-400 border border-slate-500/20"
                          }`}
                      >
                        {event.status === "upcoming" ? "Upcoming" : "Completed"}
                      </span>

                      {/* Admin action buttons */}
                      {isAdmin && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEditModal(event)}
                            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                            title="Edit Event"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteEvent(event.id)}
                            className="p-1 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
                            title="Delete Event"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#00f2fe] transition-colors">
                    {event.title}
                  </h3>
                  {event.description && (
                    <p className="text-sm text-slate-400 leading-relaxed mb-4">
                      {event.description}
                    </p>
                  )}
                </div>

                <div>
                  {/* Card Details */}
                  <div className="px-6 py-4 bg-white/5 border-t border-white/10 space-y-2">
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <CalendarDays className="w-3.5 h-3.5 text-[#00f2fe]" />
                      {event.date}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <Clock className="w-3.5 h-3.5 text-[#00f2fe]" />
                      {event.startTime} - {event.endTime}
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-2 text-xs text-slate-300">
                        <MapPin className="w-3.5 h-3.5 text-[#00f2fe]" />
                        {event.location}
                      </div>
                    )}
                  </div>

                  {/* Card Footer */}
                  <div className="px-6 py-4 border-t border-white/5 flex flex-col gap-3">
                    {isQuiz && isAdmin ? (
                      <div className="flex gap-2 w-full">
                        <Link
                          href={`/dashboard/quiz/edit?quizId=${quizIdKey}`}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-[#00f2fe]/30 bg-[#00f2fe]/5 text-[#00f2fe] text-xs font-bold hover:bg-[#00f2fe]/10 transition-all text-center"
                        >
                          Manage Questions
                        </Link>

                        {event.status === "upcoming" ? (
                          event.registered ? (
                            <div className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Registered
                            </div>
                          ) : (
                            <button
                              onClick={() => handleRegister(event.id)}
                              className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-gradient-to-r from-[#00f2fe] to-[#4facfe] text-slate-950 text-xs font-bold hover:shadow-[0_4px_15px_rgba(0,242,254,0.4)] transition-all"
                            >
                              Register <ArrowUpRight className="w-3.5 h-3.5" />
                            </button>
                          )
                        ) : (
                          <Link
                            href={
                              isQuizCompleted
                                ? `/dashboard/results?quizId=${quizIdKey}`
                                : `/dashboard/quiz?quizId=${quizIdKey}`
                            }
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-gradient-to-r from-[#00f2fe] to-[#4facfe] text-slate-950 text-xs font-bold hover:shadow-[0_4px_15px_rgba(0,242,254,0.4)] transition-all text-center"
                          >
                            {isQuizCompleted ? "Check Score" : "Attend Quiz"} <ArrowUpRight className="w-3.5 h-3.5" />
                          </Link>
                        )}
                      </div>
                    ) : (
                      event.status === "upcoming" ? (
                        event.registered ? (
                          <div className="flex flex-col gap-2 w-full">
                            <div className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-semibold">
                              <CheckCircle2 className="w-4 h-4" />
                              Registered
                            </div>
                            {isWorkshop && event.link && (
                              <a
                                href={event.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-bold hover:shadow-[0_4px_15px_rgba(99,102,241,0.4)] transition-all animate-pulse"
                              >
                                <Video className="w-4 h-4" /> Join Google Meet <ArrowUpRight className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        ) : (
                          <button
                            onClick={() => handleRegister(event.id)}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#00f2fe] to-[#4facfe] text-slate-950 text-sm font-bold hover:shadow-[0_4px_15px_rgba(0,242,254,0.4)] transition-all"
                          >
                            Register Now <ArrowUpRight className="w-4 h-4" />
                          </button>
                        )
                      ) : isQuiz ? (
                        loadingQuizState ? (
                          <div className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 text-sm font-medium">
                            Loading Quiz...
                          </div>
                        ) : (
                          <Link
                            href={
                              isQuizCompleted
                                ? `/dashboard/results?quizId=${quizIdKey}`
                                : `/dashboard/quiz?quizId=${quizIdKey}`
                            }
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#00f2fe] to-[#4facfe] text-slate-950 text-sm font-bold hover:shadow-[0_4px_15px_rgba(0,242,254,0.4)] transition-all text-center"
                          >
                            {isQuizCompleted ? "Check Score" : "Attend Quiz"} <ArrowUpRight className="w-4 h-4" />
                          </Link>
                        )
                      ) : (
                        <div className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 text-sm font-medium">
                          <XCircle className="w-4 h-4" />
                          Event Completed
                        </div>
                      )
                    )}

                    {/* Admin only: Registered Users review navigation */}
                    {isAdmin && (
                      <Link
                        href={`/dashboard/registered-users?eventId=${event.id}`}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 bg-slate-950 text-slate-300 text-xs font-bold hover:bg-white/5 hover:text-white transition-all text-center"
                      >
                        Registered Users <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5 border border-white/10 mb-4">
            <Filter className="w-8 h-8 text-slate-500" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">No events found</h3>
          <p className="text-sm text-slate-400">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}

      {/* Add / Edit Event Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-slate-950 border border-white/15 rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-900/40">
              <h3 className="font-bold text-white text-base">
                {editingEventId ? "Edit Event" : "Add New Event"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitEvent} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">

                {/* Event Type / Category */}
                <div className="col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Event Type</label>
                  <select
                    value={eventCategory}
                    onChange={(e) => setEventCategory(e.target.value)}
                    disabled={!!editingEventId}
                    className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white focus:outline-none focus:border-[#00f2fe] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="Workshop">Workshop (Meeting link required)</option>
                    <option value="Quiz">Quiz</option>
                  </select>
                </div>

                {/* Title */}
                <div className="col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Event Title</label>
                  <input
                    type="text"
                    value={eventTitle}
                    onChange={(e) => setEventTitle(e.target.value)}
                    placeholder="e.g. Next.js Hackathon"
                    required
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00f2fe] focus:ring-1 focus:ring-[#00f2fe]"
                  />
                </div>

                {/* Date Picker using Shadcn reference */}
                <div className="col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 block">Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        type="button"
                        className={cn(
                          "w-full justify-start text-left font-normal border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white px-3.5 py-2 rounded-xl h-10",
                          !eventDate && "text-slate-500"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 text-[#00f2fe]" />
                        {eventDate && !isNaN(eventDate.getTime()) ? format(eventDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={eventDate}
                        onSelect={setEventDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Start Time Selectors */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 block">Start Time</label>
                  <div className="flex items-center gap-1">
                    <select
                      value={startHour}
                      onChange={(e) => setStartHour(e.target.value)}
                      className="flex-1 rounded-xl border border-white/10 bg-slate-900 px-2 py-2 text-sm text-white focus:outline-none focus:border-[#00f2fe]"
                    >
                      {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0")).map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                    <span className="text-white text-xs font-bold">:</span>
                    <select
                      value={startMinute}
                      onChange={(e) => setStartMinute(e.target.value)}
                      className="flex-1 rounded-xl border border-white/10 bg-slate-900 px-2 py-2 text-sm text-white focus:outline-none focus:border-[#00f2fe]"
                    >
                      {["00", "15", "30", "45"].map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                    <select
                      value={startPeriod}
                      onChange={(e) => setStartPeriod(e.target.value)}
                      className="rounded-xl border border-white/10 bg-slate-900 px-2 py-2 text-sm text-white focus:outline-none focus:border-[#00f2fe]"
                    >
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>
                  </div>
                </div>

                {/* End Time Selectors */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 block">End Time</label>
                  <div className="flex items-center gap-1">
                    <select
                      value={endHour}
                      onChange={(e) => setEndHour(e.target.value)}
                      className="flex-1 rounded-xl border border-white/10 bg-slate-900 px-2 py-2 text-sm text-white focus:outline-none focus:border-[#00f2fe]"
                    >
                      {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0")).map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                    <span className="text-white text-xs font-bold">:</span>
                    <select
                      value={endMinute}
                      onChange={(e) => setEndMinute(e.target.value)}
                      className="flex-1 rounded-xl border border-white/10 bg-slate-900 px-2 py-2 text-sm text-white focus:outline-none focus:border-[#00f2fe]"
                    >
                      {["00", "15", "30", "45"].map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                    <select
                      value={endPeriod}
                      onChange={(e) => setEndPeriod(e.target.value)}
                      className="rounded-xl border border-white/10 bg-slate-900 px-2 py-2 text-sm text-white focus:outline-none focus:border-[#00f2fe]"
                    >
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>
                  </div>
                </div>

                {/* Conditional Google Meet Link for Workshops */}
                {eventCategory === "Workshop" && (
                  <div className="col-span-2 space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Google Meet Link</label>
                    <input
                      type="url"
                      value={eventLink}
                      onChange={(e) => setEventLink(e.target.value)}
                      placeholder="e.g. https://meet.google.com/abc-defg-hij"
                      required
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00f2fe] focus:ring-1 focus:ring-[#00f2fe]"
                    />
                  </div>
                )}

                {/* Location */}
                {eventCategory !== "Workshop" && (
                  <div className="col-span-2 space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Location</label>
                    <input
                      type="text"
                      value={eventLocation}
                      onChange={(e) => setEventLocation(e.target.value)}
                      placeholder="e.g. Auditorium, Block A"
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00f2fe] focus:ring-1 focus:ring-[#00f2fe]"
                    />
                  </div>
                )}

                {/* Description */}
                <div className="col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Description</label>
                  <textarea
                    value={eventDescription}
                    onChange={(e) => setEventDescription(e.target.value)}
                    placeholder="Enter the event description..."
                    rows={3}
                    className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00f2fe] focus:ring-1 focus:ring-[#00f2fe] resize-none"
                  />
                </div>

              </div>

              {/* Footer */}
              <div className="flex justify-end gap-2 pt-4 border-t border-white/5 mt-6">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 text-slate-300 hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="bg-gradient-to-r from-[#00f2fe] to-[#4facfe] text-slate-950 font-bold hover:shadow-[0_4px_15px_rgba(0,242,254,0.4)] px-5"
                >
                  <Save className="w-3.5 h-3.5 mr-1.5" />
                  {isSaving ? "Saving..." : editingEventId ? "Update Event" : "Add Event"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}