"use client";

import { useState } from "react";
import {
  CalendarDays,
  Clock,
  MapPin,
  ArrowUpRight,
  Filter,
  Search,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";

const EVENTS = [
  {
    id: 1,
    title: "Web Dev Workshop",
    date: "Aug 05, 2026",
    time: "2:00 PM - 5:00 PM",
    location: "Lab 3, Block C",
    description: "Hands-on workshop covering modern web development with React and Next.js.",
    category: "Workshop",
    status: "completed",
    registered: true,
    hasQuiz: true,
  },
];

const CATEGORIES = ["All", "Hackathon", "Workshop", "Bootcamp", "Competition", "Seminar"];

export default function EventsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [filter, setFilter] = useState<"all" | "upcoming" | "completed">("all");

  const filteredEvents = EVENTS.filter((event) => {
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
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Events</h1>
        <p className="text-slate-400 text-sm mt-1">
          Discover and register for upcoming K&#123;devs&#125; events
        </p>
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
      {filteredEvents.length > 0 ? (
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
                    <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#00f2fe] to-[#4facfe] text-slate-950 text-sm font-bold hover:shadow-[0_4px_15px_rgba(0,242,254,0.4)] transition-all">
                      Register Now <ArrowUpRight className="w-4 h-4" />
                    </button>
                  )
                ) : event.hasQuiz ? (
                  <Link
                    href="/dashboard/quiz"
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#00f2fe] to-[#4facfe] text-slate-950 text-sm font-bold hover:shadow-[0_4px_15px_rgba(0,242,254,0.4)] transition-all"
                  >
                    Attend Quiz <ArrowUpRight className="w-4 h-4" />
                  </Link>
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
    </div>
  );
}