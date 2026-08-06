"use client";

import { useState } from "react";
import {
  Trophy,
  Medal,
  Star,
  Code2,
  Users,
  Rocket,
  Award,
  Lock,
  CheckCircle2,
} from "lucide-react";

const ACHIEVEMENTS = [
  {
    id: 1,
    title: "First Hack",
    description: "Participated in your first hackathon",
    icon: Rocket,
    color: "text-[#00f2fe] bg-[#00f2fe]/10 border-[#00f2fe]/20",
    earned: true,
    date: "Jul 2026",
  },
];

const SKILLS = [
  { name: "Web Development", level: 75, color: "from-[#00f2fe] to-[#4facfe]" },
];

export default function AchievementsPage() {
  const [activeTab, setActiveTab] = useState<"achievements" | "skills">("achievements");
  const earnedCount = ACHIEVEMENTS.filter((a) => a.earned).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Achievements</h1>
        <p className="text-slate-400 text-sm mt-1">
          Track your badges, milestones, and skill progress
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-400">
              <Trophy className="w-5 h-5" />
            </div>
            <span className="text-sm text-slate-400">Badges Earned</span>
          </div>
          <div className="text-3xl font-extrabold text-white">
            {earnedCount}
            <span className="text-lg text-slate-500 font-medium"> / {ACHIEVEMENTS.length}</span>
          </div>
        </div>
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-[#00f2fe]/10 border border-[#00f2fe]/20 text-[#00f2fe]">
              <Star className="w-5 h-5" />
            </div>
            <span className="text-sm text-slate-400">Skill Level</span>
          </div>
          <div className="text-3xl font-extrabold text-white">Intermediate</div>
        </div>
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-emerald-400/10 border border-emerald-400/20 text-emerald-400">
              <Award className="w-5 h-5" />
            </div>
            <span className="text-sm text-slate-400">Points</span>
          </div>
          <div className="text-3xl font-extrabold text-white">1,250</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab("achievements")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            activeTab === "achievements"
              ? "bg-gradient-to-r from-[#00f2fe] to-[#4facfe] text-slate-950 font-semibold"
              : "bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10"
          }`}
        >
          Badges
        </button>
        <button
          onClick={() => setActiveTab("skills")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            activeTab === "skills"
              ? "bg-gradient-to-r from-[#00f2fe] to-[#4facfe] text-slate-950 font-semibold"
              : "bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10"
          }`}
        >
          Skills
        </button>
      </div>

      {activeTab === "achievements" ? (
        /* Achievements Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {ACHIEVEMENTS.map((achievement) => {
            const Icon = achievement.icon;
            return (
              <div
                key={achievement.id}
                className={`relative p-6 rounded-2xl border transition-all ${
                  achievement.earned
                    ? "bg-slate-900/60 border-white/10 hover:border-[#00f2fe]/30 hover:-translate-y-1"
                    : "bg-slate-900/40 border-white/5 opacity-60"
                }`}
              >
                {!achievement.earned && (
                  <div className="absolute top-4 right-4">
                    <Lock className="w-4 h-4 text-slate-500" />
                  </div>
                )}

                <div className={`inline-flex p-3 rounded-xl border mb-4 ${achievement.color}`}>
                  <Icon className="w-6 h-6" />
                </div>

                <h3 className="font-bold text-white mb-1">{achievement.title}</h3>
                <p className="text-sm text-slate-400 mb-4">{achievement.description}</p>

                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-medium ${
                      achievement.earned ? "text-emerald-400" : "text-slate-500"
                    }`}
                  >
                    {achievement.earned ? `Earned ${achievement.date}` : "Locked"}
                  </span>
                  {achievement.earned && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Skills Section */
        <div className="rounded-2xl bg-slate-900/60 border border-white/10 p-6 sm:p-8">
          <h2 className="text-lg font-bold text-white mb-6">Skill Progress</h2>
          <div className="space-y-6">
            {SKILLS.map((skill) => (
              <div key={skill.name}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-300">{skill.name}</span>
                  <span className="text-sm font-bold text-[#00f2fe]">{skill.level}%</span>
                </div>
                <div className="h-2.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${skill.color} transition-all duration-500`}
                    style={{ width: `${skill.level}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 rounded-xl bg-[#00f2fe]/5 border border-[#00f2fe]/10 text-sm text-slate-300">
            <p className="font-semibold text-[#00f2fe] mb-1">💡 Tip</p>
            <p>
              Complete more workshops and events to level up your skills. Each event contributes to your skill progress.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}