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
} from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  category: string;
  status: "upcoming" | "completed";
  hasQuiz: boolean;
  registered: boolean;
}

const CATEGORIES = ["All", "Hackathon", "Workshop", "Bootcamp", "Competition", "Seminar"];

export default function EventsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [filter, setFilter] = useState<"all" | "upcoming" | "completed">("all");
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [loadingQuizState, setLoadingQuizState] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [eventsList, setEventsList] = useState<Event[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  // Add Event Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [eventTitle, setEventTitle] = useState("");
  const [eventCategory, setEventCategory] = useState("Workshop");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventStatus, setEventStatus] = useState<"upcoming" | "completed">("upcoming");
  const [eventHasQuiz, setEventHasQuiz] = useState(false);
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
        setEventsList(data.events || []);
      }
    } catch (err) {
      console.error("Failed to load events:", err);
    } finally {
      setLoadingEvents(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const idToken = await firebaseUser.getIdToken();
          
          // Load events from database
          await loadEventsData(idToken);

          // Fetch quiz completion state
          const response = await fetch("/api/quiz", {
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
          });
          if (response.ok) {
            const data = await response.json();
            setQuizCompleted(data.completed ?? false);
          }

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
      }
      setLoadingQuizState(false);
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
        // Refresh events list
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
    setEventTitle("");
    setEventCategory("Workshop");
    setEventDate("");
    setEventTime("");
    setEventLocation("");
    setEventDescription("");
    setEventStatus("upcoming");
    setEventHasQuiz(false);
    setIsModalOpen(true);
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !eventTitle.trim() ||
      !eventDate.trim() ||
      !eventTime.trim() ||
      !eventLocation.trim() ||
      !eventDescription.trim()
    ) {
      return alert("All fields are required.");
    }

    setIsSaving(true);
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) return;
      const idToken = await firebaseUser.getIdToken();

      const res = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          title: eventTitle.trim(),
          category: eventCategory,
          date: eventDate.trim(),
          time: eventTime.trim(),
          location: eventLocation.trim(),
          description: eventDescription.trim(),
          status: eventStatus,
          hasQuiz: eventHasQuiz,
        }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        await loadEventsData(idToken);

        // Redirect to quiz configure page if quiz has been enabled
        if (eventHasQuiz) {
          router.push("/dashboard/quiz/edit");
        }
      } else {
        const errData = await res.json();
        alert(errData.error || "Failed to add event");
      }
    } catch (err) {
      console.error("Failed to add event:", err);
      alert("An error occurred while adding the event.");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredEvents = eventsList.filter((event) => {
    // Search filter
    if (
      searchQuery &&
      !event.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !event.description.toLowerCase().includes(searchQuery.toLowerCase())
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
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                filter === f
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
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              activeCategory === cat
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
          {filteredEvents.map((event) => (
            <div
              key={event.id}
              className="group rounded-2xl bg-slate-900/60 border border-white/10 overflow-hidden hover:border-[#00f2fe]/30 transition-all hover:-translate-y-1"
            >
              {/* Card Header */}
              <div className="p-6 pb-4">
                <div className="flex items-start justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-[#00f2fe]/10 text-[#00f2fe] border border-[#00f2fe]/20">
                    {event.category}
                  </span>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                      event.status === "upcoming"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-slate-500/10 text-slate-400 border border-slate-500/20"
                    }`}
                  >
                    {event.status === "upcoming" ? "Upcoming" : "Completed"}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#00f2fe] transition-colors">
                  {event.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-4">
                  {event.description}
                </p>
              </div>

              {/* Card Details */}
              <div className="px-6 py-4 bg-white/5 border-t border-white/10 space-y-2">
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <CalendarDays className="w-3.5 h-3.5 text-[#00f2fe]" />
                  {event.date}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <Clock className="w-3.5 h-3.5 text-[#00f2fe]" />
                  {event.time}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <MapPin className="w-3.5 h-3.5 text-[#00f2fe]" />
                  {event.location}
                </div>
              </div>

              {/* Card Footer */}
              <div className="px-6 py-4">
                {event.status === "upcoming" ? (
                  event.registered ? (
                    <div className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-semibold">
                      <CheckCircle2 className="w-4 h-4" />
                      Registered
                    </div>
                  ) : (
                    <button
                      onClick={() => handleRegister(event.id)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#00f2fe] to-[#4facfe] text-slate-950 text-sm font-bold hover:shadow-[0_4px_15px_rgba(0,242,254,0.4)] transition-all"
                    >
                      Register Now <ArrowUpRight className="w-4 h-4" />
                    </button>
                  )
                ) : event.hasQuiz ? (
                  loadingQuizState ? (
                    <div className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 text-sm font-medium">
                      Loading Quiz...
                    </div>
                  ) : (
                    <div className="flex gap-3">
                      {isAdmin && (
                        <Link
                          href="/dashboard/quiz/edit"
                          className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#00f2fe]/30 bg-[#00f2fe]/5 text-[#00f2fe] text-xs font-bold hover:bg-[#00f2fe]/10 transition-all shrink-0"
                        >
                          Edit Questions
                        </Link>
                      )}
                      <Link
                        href={quizCompleted ? "/dashboard/results" : "/dashboard/quiz"}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#00f2fe] to-[#4facfe] text-slate-950 text-xs font-bold hover:shadow-[0_4px_15px_rgba(0,242,254,0.4)] transition-all"
                      >
                        {quizCompleted ? "Check Score" : "Attend Quiz"} <ArrowUpRight className="w-4 h-4" />
                      </Link>
                    </div>
                  )
                ) : (
                  <div className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 text-sm font-medium">
                    <XCircle className="w-4 h-4" />
                    Event Completed
                  </div>
                )}
              </div>
            </div>
          ))}
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

      {/* Add Event Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-slate-950 border border-white/15 rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-900/40">
              <h3 className="font-bold text-white text-base">Add New Event</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAddEvent} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
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

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Category</label>
                  <select
                    value={eventCategory}
                    onChange={(e) => setEventCategory(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white focus:outline-none focus:border-[#00f2fe]"
                  >
                    {CATEGORIES.slice(1).map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Status</label>
                  <select
                    value={eventStatus}
                    onChange={(e) => setEventStatus(e.target.value as "upcoming" | "completed")}
                    className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white focus:outline-none focus:border-[#00f2fe]"
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Date</label>
                  <input
                    type="text"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    placeholder="e.g. Aug 22, 2026"
                    required
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00f2fe] focus:ring-1 focus:ring-[#00f2fe]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Time</label>
                  <input
                    type="text"
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                    placeholder="e.g. 2:00 PM - 5:00 PM"
                    required
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00f2fe] focus:ring-1 focus:ring-[#00f2fe]"
                  />
                </div>

                <div className="col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Location</label>
                  <input
                    type="text"
                    value={eventLocation}
                    onChange={(e) => setEventLocation(e.target.value)}
                    placeholder="e.g. Auditorium, Block A"
                    required
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00f2fe] focus:ring-1 focus:ring-[#00f2fe]"
                  />
                </div>

                <div className="col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Description</label>
                  <textarea
                    value={eventDescription}
                    onChange={(e) => setEventDescription(e.target.value)}
                    placeholder="Enter the event description..."
                    rows={3}
                    required
                    className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00f2fe] focus:ring-1 focus:ring-[#00f2fe] resize-none"
                  />
                </div>

                <div className="col-span-2 flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="hasQuiz"
                    checked={eventHasQuiz}
                    onChange={(e) => setEventHasQuiz(e.target.checked)}
                    className="w-4 h-4 rounded border-white/10 bg-white/5 text-[#00f2fe] focus:ring-[#00f2fe]"
                  />
                  <label htmlFor="hasQuiz" className="text-xs font-semibold text-slate-300 cursor-pointer">
                    Enable Quiz Evaluation for this event
                  </label>
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
                  {isSaving ? "Saving..." : "Add Event"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}