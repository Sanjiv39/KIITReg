"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import {
  HelpCircle,
  Trophy,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Question {
  id: string;
  text: string;
  options: string[];
  correct_answer: number;
}

interface ResultData {
  score: number;
  completed_at: string;
  answers: Record<string, number>;
}

export default function QuizResultsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [result, setResult] = useState<ResultData | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [scoreResult, setScoreResult] = useState<{
    score: number;
    totalQuestions: number;
    passed: boolean;
  } | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const idToken = await firebaseUser.getIdToken();
          const response = await fetch("/api/quiz/results", {
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            if (data.completed) {
              setResult(data.result);
              setQuestions(data.questions || []);
              const totalQ = data.totalQuestions || 10;
              setScoreResult({
                score: data.result.score,
                totalQuestions: totalQ,
                passed: data.result.score >= Math.ceil(totalQ * 0.6),
              });
            } else {
              // Redirect back if they haven't taken the quiz yet
              router.replace("/dashboard/quiz");
            }
          } else {
            router.replace("/dashboard/events");
          }
        } catch (err) {
          console.error("Failed to load quiz results:", err);
          router.replace("/dashboard/events");
        } finally {
          setIsLoading(false);
        }
      } else {
        router.push("/dashboard");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx((prev) => prev - 1);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <div className="w-10 h-10 rounded-full border-2 border-[#00f2fe]/30 border-t-[#00f2fe] animate-spin" />
        <p className="text-slate-400 text-sm font-medium animate-pulse">Loading quiz details...</p>
      </div>
    );
  }

  if (!result || !scoreResult || questions.length === 0) return null;

  const currentQuestion = questions[currentIdx];
  const totalQuestions = questions.length;
  const progressPercent = totalQuestions > 0 ? ((currentIdx + 1) / totalQuestions) * 100 : 0;
  const userSelectedIdx = result.answers?.[currentQuestion.id];
  const correctIdx = currentQuestion.correct_answer;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header Info */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/events"
          className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Events
        </Link>
        <span className="text-xs font-semibold text-[#00f2fe] uppercase tracking-wider">
          Results Review
        </span>
      </div>

      {/* Compact Score Header Card */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
            {scoreResult.passed ? (
              <Trophy className="w-6 h-6 text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]" />
            ) : (
              <Award className="w-6 h-6 text-slate-400" />
            )}
          </div>
          <div className="text-left">
            <h2 className="text-base font-bold text-white">Quiz Performance</h2>
            <p className="text-xs text-slate-400">
              {scoreResult.passed ? "Passed (60%+ score)" : "Failed (Below 60% score)"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-6 shrink-0 w-full sm:w-auto justify-between sm:justify-end">
          <div className="text-left sm:text-right">
            <div className="text-[10px] text-slate-500 uppercase font-semibold">Your Score</div>
            <div className="text-xl font-extrabold text-white">
              <span className={scoreResult.passed ? "text-emerald-400" : "text-red-400"}>
                {scoreResult.score}
              </span>{" "}
              / {scoreResult.totalQuestions}
            </div>
          </div>
          <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-4">
            Download Certificate (PDF)
          </Button>
        </div>
      </div>

      {/* Main Review Wizard */}
      <div className="p-8 rounded-2xl bg-slate-900/60 border border-white/10 shadow-2xl backdrop-blur-xl space-y-6">
        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Reviewing Question {currentIdx + 1} of {totalQuestions}</span>
            <span>{Math.round(progressPercent)}% Explored</span>
          </div>
          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#00f2fe] to-[#4facfe] transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Question Text */}
        <div className="space-y-4 pt-2">
          <div className="flex items-start gap-3">
            <HelpCircle className="w-5 h-5 text-[#00f2fe] shrink-0 mt-0.5" />
            <h2 className="text-lg font-bold text-white leading-relaxed">
              {currentQuestion.text}
            </h2>
          </div>

          {/* Options List (Disabled clicking, styled by correctness) */}
          <div className="grid grid-cols-1 gap-3 pt-3 pointer-events-none">
            {currentQuestion.options.map((option, idx) => {
              const isUserSelected = userSelectedIdx === idx;
              const isCorrect = correctIdx === idx;

              let borderClass = "border-white/10 bg-white/5";
              let textClass = "text-slate-300";
              let pillBorder = "border-slate-500 text-slate-400";

              if (isUserSelected) {
                if (isCorrect) {
                  borderClass = "border-emerald-500 bg-emerald-500/10";
                  textClass = "text-white font-semibold";
                  pillBorder = "border-emerald-400 bg-emerald-500 text-slate-950 font-bold";
                } else {
                  borderClass = "border-red-500 bg-red-500/10";
                  textClass = "text-white font-semibold";
                  pillBorder = "border-red-400 bg-red-500 text-white font-bold";
                }
              } else if (isCorrect) {
                borderClass = "border-emerald-500/40 bg-emerald-500/5";
                textClass = "text-emerald-300";
                pillBorder = "border-emerald-500 text-emerald-400";
              }

              return (
                <div
                  key={idx}
                  className={`w-full text-left p-4 rounded-xl border text-sm transition-all flex items-center justify-between ${borderClass} ${textClass}`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs shrink-0 ${pillBorder}`}
                    >
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{option}</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold shrink-0">
                    {isCorrect && (
                      <span className="text-emerald-400 flex items-center gap-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                      </span>
                    )}
                    {isUserSelected && !isCorrect && (
                      <span className="text-red-400 flex items-center gap-0.5">
                        <XCircle className="w-3.5 h-3.5" /> Your Choice
                      </span>
                    )}
                    {isUserSelected && isCorrect && (
                      <span className="text-emerald-400 ml-2">
                        (Your Choice)
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-white/5">
          <Button
            variant="ghost"
            onClick={handlePrev}
            disabled={currentIdx === 0}
            className="gap-1 px-4 text-slate-300 hover:text-white"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </Button>

          <Button
            variant="ghost"
            onClick={handleNext}
            disabled={currentIdx === totalQuestions - 1}
            className="gap-1 px-4 text-slate-300 hover:text-white"
          >
            Next <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
